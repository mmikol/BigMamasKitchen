// create checks for:
// "Function does not contain serve",
// "Can only increment the iterator"

import { Type, Variable, Function, FunctionType, ArrayType } from "./ast.js"
//import * as stdlib from "./stdlib.js"

export default function analyze(node) {
  Boolean.prototype.type = Type.BOOLEAN
  Number.prototype.type = Type.NUMBER
  String.prototype.type = Type.STRING
  //Type.prototype.type = ast.Type.TYPE
  //     const initialContext = new Context()

  // Add in all the predefined identifiers from the stdlib module
  //const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  //for (const [name, type] of Object.entries(library)) {

  const initialContext = new Context()

  initialContext.add("spicy", Type.BOOLEAN)
  initialContext.add("bitter", Type.NUMBER)
  initialContext.add("salty", Type.STRING)
  initialContext.add("bland", Type.NULL)
  initialContext.add("empty", Type.VOID)

  // Add in all the predefined identifiers from the stdlib module
  // const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  // for (const [name, type] of Object.entries(library)) {
  //     initialContext.add(name, type)
  // }
  return initialContext.analyze(node)
}

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

const check = (self) => ({
  isSameVariable(other) {
    must(
      self.name === other.name && self.type.isEquivalentTo(other.type),
      `Expected ${self.name} and ${other.name} to be the same variable, but they are not`
    )
  },
  isNumeric() {
    must(
      [Type.NUMBER].includes(self.type),
      `Expected a number, found ${self.type.name}`
    )
  },
  isNumericOrString() {
    must(
      [Type.NUMBER, Type.STRING].includes(self.type),
      `Expected a number or string, found ${self.type.name}`
    )
  },
  isBoolean() {
    must(
      self.type === Type.BOOLEAN,
      `Expected a boolean, found ${self.type.name}`
    )
  },
  isNumber() {
    must(
      self.type === Type.NUMBER,
      `Expected a number, found ${self.type.name}`
    )
  },
  isAType() {
    must([Type].includes(self.constructor), "Type expected")
  },
  isAnArray() {
    must(self.type.constructor === ArrayType, "Array expected")
  },
  hasSameTypeAs(other) {
    must(
      self.type.isEquivalentTo(other.type),
      "Operands do not have the same type"
    )
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type === self[0].type),
      "Not all elements have the same type"
    )
  },
  isAssignableTo(type) {
    must(
      self.type === type,
      `Cannot assign a ${self.type.name} to a ${type.name}`
    )
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`)
  },
  areAllDistinct() {
    must(
      new Set(self.map((f) => f.name)).size === self.length,
      "Fields must be distinct"
    )
  },
  isInTheObject(object) {
    must(object.type.fields.map((f) => f.name).includes(self), "No such field")
  },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop")
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function")
  },
  isCallable() {
    must(
      self.type.constructor === FunctionType,
      "Call of non-function or non-constructor"
    )
  },
  returnsNothing() {
    must(
      self.type.returnType === Type.VOID,
      "Something should be returned here"
    )
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, "Cannot return a value here")
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType)
  },
  match(targetTypes) {
    // self is the array of arguments
    must(
      targetTypes.length === self.length,
      `${targetTypes.length} argument(s) required but ${self.length} passed`
    )
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type))
  },
  matchParametersOf(calleeType) {
    check(self).match(calleeType.parameterTypes)
  },
})

class Context {
  constructor(parent = null, configuration = {}) {
    // Parent (enclosing scope) for static scope analysis
    this.parent = parent
    // All local declarations. Names map to variable declarations, types, and
    // function declarations
    this.locals = new Map()
    // Whether we are in a loop, so that we know whether breaks and continues
    // are legal here
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    // Whether we are in a function, so that we know whether a return
    // statement can appear here, and if so, how we typecheck it
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain!
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`)
    }
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    throw new Error(`Identifier ${name} not declared`)
  }
  newChild(configuration = {}) {
    // Create new (nested) context, which is just like the current context
    // except that certain fields can be overridden
    return new Context(this, configuration)
  }
  analyze(node) {
    //console.log("analyze", this[node.constructor.name])
    return this[node.constructor.name](node)
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  ArrayType(t) {
    // has
    t.type = this.analyze(t.type)
    return t
  }
  VariableDeclaration(d) {
    // Declarations generate brand new variable objects
    d.initializer = this.analyze(d.initializer)
    d.type = this.analyze(d.type)
    console.log("d.type", d.type)
    console.log("d.initializer", d.initializer)
    console.log("d", d)
    if (d.type.constructor === ArrayType) {
      check(d.initializer.type).isAssignableTo(d.type.type)
    } else {
      check(d.initializer).isAssignableTo(d.type)
    }
    d.variable = new Variable(d.initializer.type, d.name)
    this.add(d.variable.name, d.variable)
    return d
  }
  Field(f) {
    f.type = this.analyze(f.type)
    return f
  }
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes)
    t.returnType = this.analyze(t.returnType)
    return t
  }
  FunctionDeclaration(d) {
    d.type = this.analyze(d.type)
    //we need to analyze for the return if its not void and do a check

    // Declarations generate brand new function objects
    const f = (d.function = new Function(d.id))
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, forFunction: f })
    //are we checking to see if we use the parameters here why are we doing this
    d.parameters = childContext.analyze(d.parameters)
    //adding functiontype back in so we can check params function calls
    f.type = new FunctionType(
      d.parameters.map((p) => p.type),
      d.type
    )
    // Add before analyzing the body to allow recursion
    this.add(f.name, f)
    d.body = childContext.analyze(d.body)
    // How do we throw an error if they dont write a return statement????
    return d
  }
  Parameter(p) {
    p.type = this.analyze(p.type)
    this.add(p.id, p)
    return p
  }
  Increment(s) {
    s.target = this.analyze(s.target)
    check(s.target).isNumber()
    s.type = s.target.type
    return s
  }
  Decrement(s) {
    s.target = this.analyze(s.target)
    check(s.target).isNumber()
    s.type = s.target.type
    return s
  }
  Assignment(s) {
    s.source = this.analyze(s.source)
    s.target = this.analyze(s.target)
    check(s.source).isAssignableTo(s.target.type)
    check(s.target).isNotReadOnly()
    return s
  }
  Break(s) {
    check(this).isInsideALoop()
    return s
  }
  Return(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsSomething()
    s.returnValue = this.analyze(s.returnValue)
    check(s.returnValue).isReturnableFrom(this.function)
    return s
  }
  ShortReturnStatement(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsNothing()
    return s
  }
  IfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      s.alternate = this.newChild().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context what does this mean lol
      s.alternate = this.analyze(s.alternate)
    }
    return s
  }
  ElseIfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      s.alternate = this.newChild().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context what does this mean lol
      s.alternate = this.analyze(s.alternate)
    }
    return s
  }
  ShortIfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    return s
  }
  ShortElseIfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    return s
  }
  WhileLoop(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  ForLoop(s) {
    s.iterator = this.analyze(s.iterator)
    check(s.iterator).isNumber()
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.increment = this.analyze(s.increment)
    check(s.increment).isNumber()
    check(
      s.iterator.variable ? s.iterator.variable : s.iterator
    ).isSameVariable(s.increment.target)
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  OrExpression(e) {
    e.expressions = this.analyze(e.expressions)
    e.expressions.forEach((expression) => check(expression).isBoolean())
    e.type = Type.BOOLEAN
    return e
  }
  AndExpression(e) {
    e.expressions = this.analyze(e.expressions)
    e.expressions.forEach((expression) => check(expression).isBoolean())
    e.type = Type.BOOLEAN
    return e
  }
  BinaryExpression(e) {
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    if (["+"].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (["-", "*", "/", "%", "^"].includes(e.op)) {
      check(e.left).isNumeric()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (["<", "<=", ">", ">="].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    } else if (["==", "!="].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    }
    return e
  }
  UnaryExpression(e) {
    e.expression = this.analyze(e.expression)
    if (e.prefix === "-") {
      check(e.expression).isNumeric()
      e.type = e.expression.type
    } else if (e.prefix === "!") {
      check(e.expression).isBoolean()
      e.type = Type.BOOLEAN
    }
    return e
  }
  ArrayLiteral(a) {
    a.elements = this.analyze(a.elements)
    console.log("a.elements", a.elements)
    check(a.elements).allHaveSameType()
    const newArrayType = new ArrayType(a.elements[0].type)
    console.log("newarrayType.name", newArrayType.name)
    const existingArrayType = this.sees(newArrayType.name)
    console.log("existingArrayType", existingArrayType)
    if (existingArrayType) {
      a.type = this.lookup(newArrayType.name)
    } else {
      a.type = newArrayType
      this.add(newArrayType.name, newArrayType)
    }
    console.log(this)
    return a
  }
  EmptyArray(e) {
    e.type = this.analyze(e.type)
    e.type = new ArrayType(e.type)
    return e
  }
  MemberExpression(e) {
    e.object = this.analyze(e.object)
    check(e.field).isInTheObject(e.object)
    e.type = e.object.type.fields.find((f) => f.name === e.field).type
    return e
  }
  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee.type)
    c.type = c.callee.type.returnType
    return c
  }
  IdentifierExpression(e) {
    // Id expressions get "replaced" with the variables they refer to
    return this.lookup(e.id)
  }
  TypeIdentifier(t) {
    t = this.lookup(t.name)
    check(t).isAType()
    return t
  }
  Block(s) {
    s.statements = this.analyze(s.statements)
    return s
  }
  PrintStatement(s) {
    s.argument = this.analyze(s.argument)
    return s
  }
  Number(e) {
    return e
  }
  Boolean(e) {
    return e
  }
  String(e) {
    return e
  }
  Array(a) {
    return a.map((item) => this.analyze(item))
  }
  NullLiteral(e) {
    e.type = Type.NULL
    return e
  }
}
