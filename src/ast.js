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
  constructor(target) {
    Object.assign(this, { target })
  }
}

export class Decrement {
  constructor(target) {
    this.target = target
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

export class ArrayLiteral {
  constructor(elements) {
    this.elements = elements
  }
}

export class DictionaryLiteral {
  constructor(entries) {
    this.entries = entries
  }
}

export class ArrayAccess {
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

export class DictionaryAccess {
  constructor(dictionary, key) {
    Object.assign(this, { dictionary, key })
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
    return this === target
  }

  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  }
}

export class ArrayType extends Type {
  constructor(type) {
    super(`[${type.name}]`), Object.assign(this, { type })
  }
  isEquivalentTo(other) {
    return (
      other.constructor === ArrayType && this.type.isEquivalentTo(other.type)
    )
  }

  isAssignableTo(other) {
    return this.isEquivalentTo(other)
  }
}

export class DictionaryType extends Type {
  constructor(type) {
    super(`{${type.name}}`), Object.assign(this, { type })
  }
  isEquivalentTo(other) {
    return (
      other.constructor === DictionaryType &&
      this.type.isEquivalentTo(other.type)
    )
  }

  isAssignableTo(other) {
    return this.isEquivalentTo(other)
  }
}

export class EmptyArray {
  constructor(type) {
    this.type = type
  }
}

export class EmptyDictionary {
  constructor(type) {
    this.type = type
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
  }
}

export class FunctionType extends Type {
  constructor(parameterTypes, returnType) {
    super(
      `(${parameterTypes.map((t) => t.name).join(",")}) => ${returnType.name}`
    )
    Object.assign(this, { parameterTypes, returnType })
  }
}

export class Parameter {
  constructor(type, id) {
    Object.assign(this, { type, id })
  }
}

export class DictionaryEl {
  constructor(key, value) {
    Object.assign(this, { key, value })
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class ShortIfStatement {
  constructor(test, consequent) {
    Object.assign(this, { test, consequent })
  }
}

export class ElseIfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class ShortElseIfStatement {
  constructor(test, consequent) {
    Object.assign(this, { test, consequent })
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

export class OrExpression {
  constructor(expressions) {
    this.expressions = expressions
  }
}

export class AndExpression {
  constructor(expressions) {
    this.expressions = expressions
  }
}

function prettied(node) {
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
