import util from "util"

/*
- Use his AST printer/prettied function?
- What needs to be a class, do we need to include literals and types, also do the names 
need to correspond to the -- stuff in ohm? 
- How does the ast builder work?
- What do we do with the prettied function? / Do we need the prettied function?
*/

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

export class Type {
  constructor(id) {
    this.id = id
  }
}

// export class NumericLiteral {
//   constructor(value) {
//     this.value = value
//   }
// }

// export class BooleanLiteral {
//   constructor(value) {
//     this.value = value
//   }
// }

// export class StringLiteral {
//   constructor(value) {
//     this.value = value
//   }
// }

// maybe like this?????
/*
export const SpicyType = new Type("spicy")
export const BitterType = new Type("bitter")
export const SaltyType = new Type("salty")
*/

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

function prettied(node) {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough.
  const seen = new Map()
  let nodeId = 0

  function* prettiedSubtree(node, prefix, indent = 0) {
    seen.set(node, ++nodeId)
    let descriptor = `${" ".repeat(indent)}${prefix}: ${node.constructor.name}`
    let [simpleProps, complexProps] = ["", []]
    for (const [prop, child] of Object.entries(node)) {
      if (seen.has(child)) {
        simpleProps += ` ${prop}=$${seen.get(child)}`
      } else if (Array.isArray(child) || (child && typeof child == "object")) {
        complexProps.push([prop, child])
      } else {
        simpleProps += ` ${prop}=${util.inspect(child)}`
      }
    }
    yield `${String(nodeId).padStart(4, " ")} | ${descriptor}${simpleProps}`
    for (let [prop, child] of complexProps) {
      if (Array.isArray(child)) {
        for (let [index, node] of child.entries()) {
          yield* prettiedSubtree(node, `${prop}[${index}]`, indent + 2)
        }
      } else {
        yield* prettiedSubtree(child, prop, indent + 2)
      }
    }
  }

  return [...prettiedSubtree(node, "program")].join("\n")
}
