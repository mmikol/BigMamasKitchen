import util from "util"

export class Program {
  constructor(statements) {
    this.statments = statements
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
  constructor(targets, sources) {
    Object.assign(this, { targets, sources })
  }
}

export class Increment {
  constructor(target, increment) {
    Object.assign(this, { target, increment })
  }
}

export class VariableDeclaration {
  constructor(type, variables, initializers) {
    Object.assign(this, { type, variables, initializers })
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
  constructor(expression) {
    this.expression = expression
  }
}

export class DictLiteral {
  constructor(expression) {
    this.expression = expression
  }
}

export class ArrayAccess {
  constructor(variable, index) {
    Object.assign(this, { variable, index })
  }
}

export class DictAccess {
  constructor(variable, key) {
    Object.assign(this, { variable, key })
  }
}

export class NamedType {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class FunctionDeclaration {
  constructor(type, id, parameters, body) {
    Object.assign(this, { type, id, parameters, body })
  }
}

// export class Type {
//   constructor(id) {
//     this.id = id
//   }
// }

export class Parameter {
  constructor(params) {
    this.params = params
  }
}

export class Args {
  constructor(args) {
    this.args = args
  }
}

export class ParamEl {
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
  constructor(tests, consequents, alternate) {
    Object.assign(this, { tests, consequents, alternate })
  }
}

export class WhileLoop {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class ForLoop {
  constructor(iterator, range, increment, body) {
    Object.assign(this, { iterator, range, increment, body })
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
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
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

//Taken from Dr. Toal's AEL compiler
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
