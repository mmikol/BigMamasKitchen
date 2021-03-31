import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const bmkGrammar = ohm.grammar(fs.readFileSync("src/bigMamasKitchen.ohm"))

/* eslint-disable no-unused-vars*/
const astBuilder = bmkGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  Stmt_simple(statement, _terminate) {
    return statement.ast()
  },
  Dec_variable(declaration, _terminate) {
    return declaration.ast()
  },
  VarDec(_ingredient, type, id, _eq, initializers) {
    return new ast.VariableDeclaration(
      type.ast(),
      id.sourceString,
      initializers.ast()
    )
  },
  Type_array(type, _symbol) {
    return new ast.ArrayType(type.ast())
  },
  Type_dict(type, _symbol) {
    return new ast.DictionaryType(type.ast())
  },
  Array_array(_left, expressions, _right) {
    return new ast.ArrayLiteral(expressions.asIteration().ast())
  },
  Array_emptyarray(_left, type, _right) {
    return new ast.EmptyArray(type.ast())
  },
  Var_dictionary(dictionary, _left, key, _right) {
    return new ast.DictionaryAccess(dictionary.ast(), key.ast())
  },
  Var_subscript(array, _left, index, _right) {
    return new ast.ArrayAccess(array.ast(), index.ast())
  },
  Dict_dict(_left, entries, _right) {
    return new ast.DictionaryLiteral(entries.asIteration().ast())
  },
  Dict_emptydict(_left, type, _right) {
    return new ast.EmptyDictionary(type.ast())
  },
  DictEl(key, _colon, value) {
    return new ast.DictionaryEl(key.ast(), value.ast())
  },
  FuncDec(_recipe, type, id, parameters, body) {
    return new ast.FunctionDeclaration(
      type.ast(),
      id.sourceString,
      parameters.ast(),
      body.ast()
    )
  },
  Assignment_assign(targets, _eq, sources) {
    return new ast.Assignment(targets.ast(), sources.ast())
  },
  Increment(target, increment) {
    return increment.sourceString === "++"
      ? new ast.Increment(target.ast())
      : new ast.Decrement(target.ast())
  },
  IfStmt_long(_addAPinchOf, test, consequent, alternate) {
    return new ast.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStmt_short(_addAPinchOf, test, consequent) {
    return new ast.ShortIfStatement(test.ast(), consequent.ast())
  },
  ElseIfStmt_long(_orSubstitute, test, consequent, alternate) {
    return new ast.ElseIfStatement(
      test.ast(),
      consequent.ast(),
      alternate.ast()
    )
  },
  ElseIfStmt_short(_orSubstitute, test, consequent) {
    return new ast.ShortElseIfStatement(test.ast(), consequent.ast())
  },
  ElseStmt(_dumpLeftovers, consequent) {
    return consequent.ast()
  },
  Loop_while(_stir, _until, test, body) {
    return new ast.WhileLoop(test.ast(), body.ast())
  },
  Loop_for(_bake, iterator, _until, test, increment, body) {
    return new ast.ForLoop(
      iterator.ast(),
      test.ast(),
      increment.ast(),
      body.ast()
    )
  },
  SimpleStmt_print(_mamaSays, argument) {
    return new ast.PrintStatement(argument.ast())
  },
  SimpleStmt_break(_stop) {
    return new ast.Break()
  },
  SimpleStmt_return(_serve, returnValue) {
    const returnValueTree = returnValue.ast()
    if (returnValueTree.length === 0) {
      return new ast.ShortReturnStatement()
    }
    return new ast.Return(returnValueTree[0])
  },
  Exp_or(first, _op, rest) {
    return new ast.OrExpression([first.ast(), ...rest.ast()])
  },
  Exp_and(first, _op, rest) {
    return new ast.AndExpression([first.ast(), ...rest.ast()])
  },
  Exp1_binary(left, op, right) {
    return new ast.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp2_binary(left, op, right) {
    return new ast.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp3_binary(left, op, right) {
    return new ast.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp4_unary(prefix, expression) {
    return new ast.UnaryExpression(prefix.sourceString, expression.ast())
  },
  Exp5_exponential(left, op, right) {
    return new ast.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp6_parens(_left, expression, _right) {
    return new ast.Expression(expression.ast())
  },
  Call(callee, _left, args, _right) {
    return new ast.Call(callee.ast(), args.asIteration().ast())
  },
  Block(_left, statements, _right) {
    return new ast.Block(statements.ast())
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  numlit(digits, decimal, fractions, exponents, sign, digit2) {
    return Number(+this.sourceString)
  },
  stringlit(_left, chars, _right) {
    return chars.sourceString
  },
  boollit(bool) {
    return bool.sourceString === "cooked"
  },
  // deal with null later
  nothing(nothing) {
    return new ast.NullLiteral()
  },
  Params(_left, params, _right) {
    return params.asIteration().ast()
  },
  Parameter(type, id) {
    return new ast.Parameter(type.ast(), id.sourceString)
  },
  spicy(_) {
    return new ast.TypeIdentifier("spicy")
  },
  salty(_) {
    return new ast.TypeIdentifier("salty")
  },
  bitter(_) {
    return new ast.TypeIdentifier("bitter")
  },
  bland(_) {
    return new ast.TypeIdentifier("bland")
  },
  empty(_) {
    return new ast.TypeIdentifier("empty")
  },
})

/* eslint-enable no-unused-vars*/
export default function parse(sourceCode) {
  const match = bmkGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}

export function syntaxIsOkay(source) {
  const match = bmkGrammar.match(source)
  return match.succeeded()
}
