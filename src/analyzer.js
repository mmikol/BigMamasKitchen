import {
  Type,
  Variable,
  Function,
  FunctionType,
  ArrayType,
  DictionaryType,
  Return,
  ShortReturnStatement,
} from "./ast.js"
//import * as stdlib from "./stdlib.js"

export default function analyze(node) {
  Boolean.prototype.type = Type.BOOLEAN
  Number.prototype.type = Type.NUMBER
  String.prototype.type = Type.STRING

  const initialContext = new Context()

  initialContext.add("spicy", Type.BOOLEAN)
  initialContext.add("bitter", Type.NUMBER)
  initialContext.add("salty", Type.STRING)
  initialContext.add("bland", Type.NULL)
  initialContext.add("empty", Type.VOID)

  return initialContext.analyze(node)
}

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

const check = (self) => ({
  hasAReturnStatement() {
    must(
      self.find(
        (item) =>
          item.constructor === Return ||
          item.constructor === ShortReturnStatement
      ),
      `Function must have a return statement`
    )
  },
  isArrayOrType() {
    must(
      self.type?.constructor === ArrayType ||
        [Type.NUMBER, Type.BOOLEAN, Type.STRING, Type.NULL].includes(self.type),
      `Expected a type or an array type`
    )
  },
  isDictionaryOrType() {
    must(
      self.type?.constructor === DictionaryType ||
        [Type.NUMBER, Type.BOOLEAN, Type.STRING, Type.NULL].includes(self.type),
      `Expected a type or a dictionary type`
    )
  },
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
  isString() {
    must(
      self.type === Type.STRING,
      `Expected a string, found ${self.type.name}`
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
  hasSameTypeAs(other) {
    must(
      self.type.isEquivalentTo(other.type),
      "Operands do not have the same type"
    )
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type.isEquivalentTo(self[0].type)),
      "Not all elements have the same type"
    )
  },
  isAssignableTo(type) {
    must(
      self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    )
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`)
  },
  areAllDistinct() {
    must(
      new Set(self.map((f) => f.key)).size === self.length,
      "No duplicate keys"
    )
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
    this.parent = parent
    this.locals = new Map()
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
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
    return new Context(this, configuration)
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  VariableDeclaration(d) {
    d.initializer = this.analyze(d.initializer)
    d.type = this.analyze(d.type)
    check(d.initializer).isAssignableTo(d.type)
    d.variable = new Variable(d.initializer.type, d.name)
    this.add(d.variable.name, d.variable)
    return d
  }
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes)
    t.returnType = this.analyze(t.returnType)
    return t
  }
  FunctionDeclaration(d) {
    d.type = this.analyze(d.type)
    const f = (d.function = new Function(d.id))
    const childContext = this.newChild({ inLoop: false, forFunction: f })
    d.parameters = childContext.analyze(d.parameters)
    f.type = new FunctionType(
      d.parameters.map((p) => p.type),
      d.type
    )
    this.add(f.name, f)
    d.body = childContext.analyze(d.body)
    check(d.body.statements).hasAReturnStatement()
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
    s.alternate = this.newChild().analyze(s.alternate)
    return s
  }
  ElseIfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    s.alternate = this.newChild().analyze(s.alternate)
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
  DictionaryType(t) {
    t.type = this.analyze(t.type)
    return t
  }
  DictionaryLiteral(d) {
    d.entries = this.analyze(d.entries)
    //no duplicate keys and keys must be strings
    check(d.entries).areAllDistinct()
    const newDictionaryType = new DictionaryType(d.entries[0].type)
    d.type = newDictionaryType
    return d
  }
  DictionaryEl(e) {
    e.key = this.analyze(e.key)
    check(e.key).isString()
    e.value = this.analyze(e.value)
    e.type = e.value.type
    return e
  }
  EmptyDictionary(e) {
    e.type = this.analyze(e.type)
    e.type = new DictionaryType(e.type)
    return e
  }
  DictionaryAccess(e) {
    e.dictionary = this.analyze(e.dictionary)
    check(e.dictionary.type).isDictionaryOrType()
    e.type = e.dictionary.type.type
    e.key = this.analyze(e.key)
    check(e.key).isString()
    return e
  }
  ArrayType(t) {
    t.type = this.analyze(t.type)
    return t
  }
  ArrayLiteral(a) {
    a.elements = this.analyze(a.elements)
    check(a.elements).allHaveSameType()
    const newArrayType = new ArrayType(a.elements[0].type)
    a.type = newArrayType
    return a
  }
  EmptyArray(e) {
    e.type = this.analyze(e.type)
    e.type = new ArrayType(e.type)
    return e
  }
  ArrayAccess(e) {
    e.array = this.analyze(e.array)
    check(e.array.type).isArrayOrType()
    e.type = e.array.type.type
    e.index = this.analyze(e.index)
    check(e.index).isNumber()
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
