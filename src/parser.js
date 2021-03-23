import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const bmkGrammar = ohm.grammar(fs.readFileSync("src/bigMamasKitchen.ohm"))

function arrayToNullable(a) {
  return a.length === 0 ? null : a[0]
}

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
    return new ast.DictType(type.ast())
  },
  Array(_left, expressions, _right) {
    return new ast.ArrayLiteral(expressions.asIteration().ast())
  },
  Var_dictionary(name, _left, keys, _right) {
    return new ast.DictAccess(name.ast(), keys.asIteration().ast())
  },
  Var_array(name, _left, indices, _right) {
    return new ast.ArrayAccess(name.ast(), indices.asIteration().ast())
  },
  Dict(_left, expressions, _right) {
    return new ast.DictLiteral(expressions.asIteration().ast())
  },
  DictEl(str, _colon, expression) {
    return new ast.DictEl(str.ast(), expression.ast())
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
    return new ast.Increment(target.ast(), increment.sourceString)
  },
  Stmt_if(
    _addAPinchOf,
    firstTest,
    firstBlock,
    _orSubstitute,
    secondTest,
    secondBlock,
    _dumpLeftovers,
    finalBlock
  ) {
    const tests = [firstTest.ast(), ...secondTest.ast()]
    const consequents = [firstBlock.ast(), ...secondBlock.ast()]
    const alternate = arrayToNullable(finalBlock.ast())
    return new ast.IfStatement(tests, consequents, alternate)
  },
  Loop_while(_stir, _until, test, body) {
    return new ast.WhileLoop(test.ast(), body.ast())
  },
  Loop_for(_bake, iterator, _until, test, increment, body) {
    return new ast.ForLoop(
      iterator.ast(),
      test.ast(),
      arrayToNullable(increment.ast()),
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
    return new ast.Return(arrayToNullable(returnValueTree))
  },
  Exp_or(left, op, right) {
    return new ast.Expression(left.ast(), op.sourceString, right.ast())
  },
  Exp_and(left, op, right) {
    return new ast.Expression(left.ast(), op.sourceString, right.ast())
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
    return new ast.Call(callee.ast(), args.ast())
  },
  Args(args) {
    return new ast.Args(args.asIteration().ast())
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
