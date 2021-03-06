// Code Generator Carlos -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.
import {
  Type,
  ElseIfStatement,
  ShortElseIfStatement,
  Increment,
} from "./ast.js"

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
    //console.log(node.constructor.name)
    return generators[node.constructor.name](node)
  }

  const generators = {
    Program(p) {
      gen(p.statements)
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    Variable(d) {
      return targetName(d)
    },
    FunctionDeclaration(d) {
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
    Break() {
      output.push("break;")
    },
    Return(s) {
      output.push(`return ${gen(s.returnValue)};`)
    },
    ShortReturnStatement() {
      output.push("return;")
    },
    ShortIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("}")
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (
        [ElseIfStatement, ShortElseIfStatement].includes(
          s.alternate.constructor
        )
      ) {
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
      if (
        ![ElseIfStatement, ShortElseIfStatement].includes(
          s.alternate.constructor
        )
      ) {
        output.push("} else {")
        gen(s.alternate)
        output.push("}")
      }
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
      let variableName = targetName(s.iterator.variable)

      const increment =
        s.increment.constructor === Increment
          ? `${variableName}++`
          : `${variableName}--`

      output.push(
        `for (let ${variableName} = ${gen(s.iterator.initializer)}; ${gen(
          s.test
        )}; ${increment}) {`
      )
      gen(s.body)
      output.push("}")
    },
    OrExpression(e) {
      return `(${gen(e.expressions).join(" || ")})`
    },
    AndExpression(e) {
      return `(${gen(e.expressions).join(" && ")})`
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==", "^": "**" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      return `${e.prefix}(${gen(e.expression)})`
    },
    DictionaryLiteral(d) {
      return `new Map(${gen(d.entries).join(", ")})`
    },
    DictionaryAccess(e) {
      return `${gen(e.dictionary)}[${gen(e.key)}]`
    },
    DictionaryEl(e) {
      return `[${JSON.stringify(e.key)}, ${gen(e.value)}]`
    },
    EmptyDictionary() {
      return "new Map()"
    },
    ArrayLiteral(e) {
      return `[${gen(e.elements).join(", ")}]`
    },
    EmptyArray() {
      return "[]"
    },
    ArrayAccess(e) {
      return `${gen(e.array)}[${gen(e.index)}]`
    },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`
      if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
        return targetCode
      }
      output.push(`${targetCode};`)
    },
    Block(s) {
      gen(s.statements)
    },
    PrintStatement(s) {
      output.push(`console.log(${gen(s.argument)});`)
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
    NullLiteral() {
      return "null"
    },
  }

  gen(program)
  return output.join("\n")
}
