import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
  [util.inspect.custom]() {
    return prettied(this)
  }
}

export class Expression {
  constructor(expression) {
    this.expression = expression
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class Increment {
  constructor(target, increment) {
    Object.assign(this, { target, increment })
  }
}

export class VariableDeclaration {
  constructor(type, name, initializer) {
    Object.assign(this, { type, name, initializer })
  }
}

export class Variable {
  constructor(type, name) {
    Object.assign(this, { type, name })
  }
}

export class ArrayType {
  constructor(type) {
    Object.assign(this, { type })
  }
}

export class DictType {
  constructor(type) {
    Object.assign(this, { type })
  }
}

export class ArrayLiteral {
  constructor(elements) {
    this.elements = elements
  }
}

export class DictLiteral {
  constructor(expression) {
    this.expression = expression
  }
}

export class ArrayAccess {
  constructor(name, indices) {
    Object.assign(this, { name, indices })
  }
}

export class DictAccess {
  constructor(name, keys) {
    Object.assign(this, { name, keys })
  }
}

export class TypeIdentifier {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class Type {
  constructor(name) {
    this.name = name
  }

  static BOOLEAN = new Type("boolean")
  static NUMBER = new Type("number")
  static STRING = new Type("string")
  static NULL = new Type("nulltype")
  static VOID = new Type("void")

  isEquivalentTo(target) {
    return this == target
  }
}

export class NullLiteral {
  //intentionally empty
}

export class FunctionDeclaration {
  constructor(type, id, parameters, body) {
    Object.assign(this, { type, id, parameters, body })
  }
}

export class Function {
  constructor(name) {
    this.name = name
    // Other properties set after construction
  }
}

// export class FunctionType extends Type {
//   // Example: (boolean,[string]?)->float
//   constructor(parameterTypes, returnType) {
//     super(
//       `(${parameterTypes.map((t) => t.name).join(",")})->${returnType.name}`
//     )
//     Object.assign(this, { parameterTypes, returnType })
//   }
//   //function place(): string {          // function declaration
//   //  return "world";
//   //}
//   isAssignableTo(target) {
//     return (
//       target.constructor === FunctionType &&
//       this.returnType.isAssignableTo(target.returnType) &&
//       this.parameterTypes.length === target.parameterTypes.length &&
//       this.parameterTypes.every((t, i) =>
//         target.parameterTypes[i].isAssignableTo(t)
//       )
//     )
//   }
// }

export class Args {
  constructor(args) {
    this.args = args
  }
}

export class Parameter {
  constructor(type, id) {
    Object.assign(this, { type, id })
  }
}

export class DictEl {
  constructor(string, expression) {
    Object.assign(this, { string, expression })
  }
}

export class IfStatement {
  constructor(test, consequents, alternate) {
    Object.assign(this, { test, consequents, alternate })
  }
}

export class WhileLoop {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class ForLoop {
  constructor(iterator, test, increment, body) {
    Object.assign(this, { iterator, test, increment, body })
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class Break {}

export class Return {
  constructor(returnValue) {
    this.returnValue = returnValue
  }
}

export class BinaryExpression {
  constructor(left, op, right) {
    Object.assign(this, { left, op, right })
  }
}

export class UnaryExpression {
  constructor(prefix, expression) {
    Object.assign(this, { prefix, expression })
  }
}

export class IdentifierExpression {
  constructor(id) {
    this.id = id
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class Block {
  constructor(statements) {
    this.statements = statements
  }
}

export class ShortReturnStatement {
  // Intentionally empty
}

// Taken from Dr. Toal's AEL compiler
function prettied(node) {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough.
  const tags = new Map()

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    tags.set(node, tags.size + 1)
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child)
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""]
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, " ")} | ${type}${props}`
    }
  }

  tag(node)
  return [...lines()].join("\n")
}
