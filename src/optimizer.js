import * as ast from "./ast.js"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    d.initializer = optimize(d.initializer)
    return d
  },
  FunctionDeclaration(d) {
    d.body = optimize(d.body)
    return d
  },
  Variable(v) {
    return v
  },
  Function(f) {
    return f
  },
  Parameter(p) {
    return p
  },
  Increment(s) {
    s.target = optimize(s.target)
    return s
  },
  Decrement(s) {
    s.target = optimize(s.target)
    return s
  },
  Assignment(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return []
    }
    return s
  },
  Break() {},
  Return(s) {
    s.returnValue = optimize(s.returnValue)
    return s
  },
  ShortReturnStatement() {},
  IfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    s.alternate = optimize(s.alternate)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate
    }
    return s
  },
  ShortIfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : []
    }
    return s
  },
  ElseIfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    s.alternate = optimize(s.alternate)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate
    }
    return s
  },
  ShortElseIfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : []
    }
    return s
  },
  WhileLoop(s) {
    s.test = optimize(s.test)
    if (s.test === false) {
      // while false is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  ForLoop(s) {
    s.test = optimize(s.test)
    s.increment = optimize(s.increment)
    s.body = optimize(s.body)
    return s
  },
  OrExpression(e) {
    e.expressions = optimize(e.expressions)
    return e
  },
  AndExpression(e) {
    e.expressions = optimize(e.expressions)
    return e
  },
  BinaryExpression(e) {
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if ([Number].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "^") return e.left ** e.right
        else if (e.op === "<") return e.left < e.right
        else if (e.op === "<=") return e.left <= e.right
        else if (e.op === "==") return e.left === e.right
        else if (e.op === "!=") return e.left !== e.right
        else if (e.op === ">=") return e.left >= e.right
        else if (e.op === ">") return e.left > e.right
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-")
        return new ast.UnaryExpression("-", e.right)
      else if (e.left === 1 && e.op === "^") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
      else if (e.op === "*" && e.right === 0) return 0
      else if (e.op === "^" && e.right === 0) return 1
    }
    return e
  },
  UnaryExpression(e) {
    e.expression = optimize(e.expression)
    if (e.expression.constructor === Number) {
      if (e.prefix === "-") {
        return -e.expression
      }
    } else if (e.expression.constructor === Boolean) {
      if (e.prefix === "!") {
        return !e.expression
      }
    }
    return e
  },
  ArrayAccess(e) {
    e.array = optimize(e.array)
    e.index = optimize(e.index)
    return e
  },
  ArrayLiteral(e) {
    e.elements = optimize(e.elements)
    return e
  },
  EmptyArray(e) {
    return e
  },
  DictionaryAccess(e) {
    e.dictionary = optimize(e.dictionary)
    return e
  },
  DictionaryLiteral(e) {
    e.entries = optimize(e.entries)
    return e
  },
  DictionaryEl(e) {
    e.value = optimize(e.value)
    return e
  },
  EmptyDictionary(e) {
    return e
  },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },
  Block(p) {
    p.statements = optimize(p.statements)
    return p
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  },
  String(e) {
    return e
  },
  Array(a) {
    return a.flatMap(optimize)
  },
}
