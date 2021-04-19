// Code Generator Carlos -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.
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

export default function generate(program) {
  const output = []

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.id}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = (node) => {
    console.log(node.constructor.name)
    generators[node.constructor.name](node)
  }

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.
    Program(p) {
      gen(p.statements)
    },
    VariableDeclaration(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    FunctionDeclaration(d) {
      console.log("function declaration", d)
      output.push(
        `function ${gen(d.function)}(${gen(d.parameters).join(", ")}) {`
      )
      gen(d.body)
      output.push("}")
    },
    Function(f) {
      return targetName(f)
    },
    Parameter(p) {
      return targetName(p)
    },
    Increment(s) {
      output.push(`${gen(s.target)}++;`)
    },
    Decrement(s) {
      output.push(`${gen(s.target)}--;`)
    },
    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
    },
    Break(s) {
      output.push("break;")
    },
    Return(s) {
      output.push(`return ${gen(s.returnValue)};`)
    },
    ShortReturnStatement(s) {
      output.push("return;")
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate.constructor === ElseIfStatement) {
        output.push("}")
        gen(s.alternate)
      } else {
        output.push("} else {")
        gen(s.alternate)
        output.push("}")
      }
    },
    ElseIfStatement(s) {
      output.push(`else if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate.constructor === ElseIfStatement) {
        output.push("} ")
        gen(s.alternate)
      } else {
        output.push("} else {")
        gen(s.alternate)
        output.push("}")
      }
    },
    ShortIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("}")
    },
    ShortElseIfStatement(s) {
      output.push(`else if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("}")
    },
    WhileLoop(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push("}")
    },
    ForLoop(s) {
      output.push(
        `for (${gen(s.iterator)}; ${gen(s.test)}; ${gen(s.increment)}) {`
      )
      gen(s.body)
      output.push("}")
    },
    OrExpression(e) {
      //needs test
      return gen(e.expressions).join("||")
    },
    AndExpression(e) {
      //needs test
      return gen(e.expressions).join("&&")
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      return `${e.prefix}(${gen(e.expression)})`
    },
    //   DictionaryLiteral(d) {
    //     d.entries = this.analyze(d.entries)
    //     //no duplicate keys and keys must be strings
    //     check(d.entries).areAllDistinct()
    //     const newDictionaryType = new DictionaryType(d.entries[0].type)
    //     d.type = newDictionaryType
    //     return d
    //   }
    //   DictionaryEl(e) {
    //     e.key = this.analyze(e.key)
    //     check(e.key).isString()
    //     e.value = this.analyze(e.value)
    //     e.type = e.value.type
    //     return e
    //   },
    //   EmptyDictionary(e) {
    //     return "{}"
    //   },
    //   DictionaryAccess(e) {
    // use a map, like new Map(['y', 3],['x',5])
    // Object.create(null)
    //     e.dictionary = this.analyze(e.dictionary)
    //     check(e.dictionary.type).isDictionaryOrType()
    //     e.type = e.dictionary.type.type
    //     e.key = this.analyze(e.key)
    //     check(e.key).isString()
    //     return e
    //   }
    //   ArrayLiteral(a) {
    //     a.elements = this.analyze(a.elements)
    //     check(a.elements).allHaveSameType()
    //     const newArrayType = new ArrayType(a.elements[0].type)
    //     a.type = newArrayType
    //     return a
    //   }
    //   EmptyArray(e) {
    //     return "[]"
    //   },
    //   ArrayAccess(e) {
    //     e.array = this.analyze(e.array)
    //     check(e.array.type).isArrayOrType()
    //     e.type = e.array.type.type
    //     e.index = this.analyze(e.index)
    //     check(e.index).isNumber()
    //     return e
    //   },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`
      // Calls in expressions vs in statements are handled differently
      if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
        return targetCode
      }
      output.push(`${targetCode};`)
    },
    IdentifierExpression(e) {
      return targetName(e)
    },
    //   TypeIdentifier(t) {
    //     t = this.lookup(t.name)
    //     check(t).isAType()
    //     return t
    //   }
    Block(s) {
      gen(s.statements)
    },

    // PrintStatement.prototype.gen = function () {
    //     return `console.log(${this.expression.gen()})`;
    //   };
    PrintStatement(s) {
      output.push(`console.log(${gen(s.argument)})`)
    },
    Number(e) {
      return e
    },
    Boolean(e) {
      return e
    },
    String(e) {
      return JSON.stringify(e)
    },
    Array(a) {
      return a.map(gen)
    },
    NullLiteral(e) {
      return "null"
    },
  }

  gen(program)
  return output.join("\n")
}
