import ohm from "ohm-js"
import * as ast from "./ast.js"

const bmkGrammar = ohm.grammar(String.raw`
BigMamasKitchen {
  Program         =  Stmt*
  Stmt            =  SimpleStmt terminate		                          -- simple
                  |  Dec                                              -- dec            
                  |  addAPinchOf Exp Block        
                      (orSubstitute Exp Block)*
                      (dumpLeftovers Block)?                          -- if    
                  |  Loop
  SimpleStmt      =  Assignment                                       -- assignment
                  |  Call                                             -- call
                  |  stop                                             -- break
                  |  serve Exp?                                       -- return
                  |  mamaSays Exp                                     -- print
                  |  Exp                                              -- expression
  Loop            =  stir until Exp Block                             -- while
                  |  bake (VarDec | id) until Exp (Increment)? Block  -- for
  Assignment      =  Increment                                        
                  |  Var "=" Exp                                      -- assign
  Increment       =  Var incop  
  Dec             =  FuncDec 
                  |  VarDec terminate                                 -- variable
  VarDec          =  ingredient Type id "=" Exp
  FuncDec         =  recipe (Type | bland) id Params Block 
  Type            =  Type "(@)"	                                      -- array
                  |  Type "[#]"                                       -- dict 
                  |  spicy 
                  |  bitter
                  |  salty
  Array           =  "(@)" ListOf<Exp, ","> "(@)"                     
  Dict            =  "[#]" ListOf< DictEl, ","> "[#]"                 
  DictEl          =  stringlit ":" Exp
  Params          =  "(" ListOf<ParamEl, ","> ")"
  ParamEl         =  Type id
  Block           =  "(^-^)~" Stmt* "~(^-^)"
  Exp             =  Exp "||" Exp1                                    -- or
                  |  Exp "&&" Exp1                                    -- and
                  |  Exp1
  Exp1            =  Exp2 relop Exp2                                  -- binary
                  |  Exp2
  Exp2            =  Exp2 addop Exp3                                  -- binary
                  |  Exp3
  Exp3            =  Exp3 mulop Exp4                                  -- binary
                  |  Exp4
  Exp4            =  prefixop Exp5                                    -- unary
                  |  Exp5
  Exp5            =  Exp6 "^" Exp5                                    -- exponential
                  |  Exp6
  Exp6            =  Literal
                  |  Increment
                  |  Var
                  |  "(" Exp ")"                                      -- parens
  Literal         =  empty
                  |  boollit
                  |  numlit
                  |  stringlit
                  |  Array
                  |  Dict
  Var             =  Var "(@)" Exp "(@)"                              -- array
                  |  Var "[#]" Exp  "[#]"                       -- dictionary 
                  |  Call
                  |  id
  Call            =  id "(" Args ")"
  Args            =  ListOf<Exp, ",">
  
  spicy           = "spicy" ~idrest
  bitter          = "bitter" ~idrest
  salty           = "salty" ~idrest
  stop            = "stop" ~idrest
  addAPinchOf     = "addAPinchOf" ~idrest
  orSubstitute    = "orSubstitute" ~idrest
  dumpLeftovers   = "dumpLeftovers" ~idrest
  raw             = "raw" ~idrest
  cooked          = "cooked" ~idrest
  bake            = "bake" ~idrest
  empty           = "empty" ~idrest
  mamaSays        = "mamaSays" ~idrest
  serve           = "serve" ~idrest
  bland           = "bland" ~idrest
  stir            = "stir" ~idrest
  ingredient      = "ingredient" ~idrest
  recipe          = "recipe" ~idrest
  until           = "until" ~idrest
  terminate       =  ";)" ~idrest
  keyword         =  spicy | addAPinchOf | stop | dumpLeftovers 
                  | bitter | bake | serve | empty | stir | cooked 
                  | salty | bland | raw | mamaSays | until | orSubstitute 
                  | ingredient | terminate | recipe
  id              =  ~keyword letter idrest*
  idrest          =  "_" | alnum
  numlit          =  digit+ ("." digit+)? (("E"|"e") ("+"|"-")? digit+)?
  boollit         =  raw | cooked
  h               =  hexDigit
  escape          =  "\\\\" | "\\\"" | "\\'" | "\\n" | "\\t" | hexseq
  hexseq          =  "\\" h h? h? h? h? h? h? h? ";"
  stringlit       =  "\"" (~"\\" ~"\"" ~"\n" any | escape)* "\""
  addop           =  "+" | "-"
  relop           =  "<=" | "<" | "==" | "!=" | ">=" | ">"
  mulop           =  "*" | "/" | "%"
  prefixop        =  ~"--" "-" | "!"
  incop           =  "++" | "--"
  space           :=  "\x20" | "\x09" | "\x0A" | "\x0D" | comment
  comment         =  "--[=]" (~"[=]--" any)* "[=]--"                    -- multiLine
                  | "~(=^..^)" (~"\n" any)*                              -- singleLine
}`)

function arrayToNullable(a) {
  return a.length === 0 ? null : a[0]
}

/* eslint-disable no-unused-vars*/
const astBuilder = bmkGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  //Stmt =  SimpleStmt terminate		                          -- simple
  Stmt_simple(statement, _terminate) {
    return statement.ast()
  },
  ///Dec =  ( VarDec | ArrDec | DictDec ) terminate          -- variable
  Dec_variable(declaration, _terminate) {
    return declaration.ast()
  },
  //ingredient Type id "=" Exp
  VarDec(_ingredient, type, id, _eq, initializers) {
    return new ast.VariableDeclaration(type.ast(), id.ast(), initializers.ast())
  },
  // ArrType         =  ArrType "(@)"
  // |  Type "(@)"
  Type_array(type, _symbol) {
    return new ast.ArrayType(type.ast())
  },
  Type_dict(type, _symbol) {
    return new ast.DictType(type.ast())
  },
  // Array           =  "(@)" ListOf<Exp, ","> "(@)"                     -- array
  Array(_left, expressions, _right) {
    return new ast.ArrayLiteral(expressions.asIteration().ast())
  },
  //  Var "[#]" Exp "[#]"                       -- dictionary
  Var_dictionary(variable, _left, key, _right) {
    return new ast.DictAccess(variable.ast(), key.ast())
  },
  //Var "(@)" Exp "(@)"                -- array
  Var_array(variable, _left, index, _right) {
    return new ast.ArrayAccess(variable.ast(), index.ast())
  },
  // Dict            =  "[#]" ListOf< DictEl, ","> "[#]"                 -- dict
  Dict(_left, expressions, _right) {
    return new ast.DictLiteral(expressions.asIteration().ast())
  },
  //  DictEl          =  stringlit ":" Exp,
  DictEl(str, _colon, expression) {
    return new ast.DictEl(str.ast(), expression.ast())
  },
  //recipe (Type | bland) id Params Block
  FuncDec(_recipe, type, id, parameters, body) {
    return new ast.FunctionDeclaration(
      type.ast(),
      id.ast(),
      parameters.ast(),
      body.ast()
    )
  },
  //|  Var "=" Exp                                      -- assign
  Assignment_assign(targets, _eq, sources) {
    return new ast.Assignment(targets.ast(), sources.ast())
  },
  //Increment  =  Var incop
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
  // |  stir until Exp Block                             -- while
  Loop_while(_stir, _until, test, body) {
    return new ast.WhileLoop(test.ast(), body.ast())
  },
  //  |  bake (VarDec | id) until Exp (Increment)? Block  -- for
  // do we include increment if it's optional?
  Loop_for(_bake, iterator, _until, range, increment, body) {
    return new ast.ForLoop(
      iterator.ast(),
      range.ast(),
      increment.ast(),
      body.ast()
    )
  },

  // mamaSays Exp
  SimpleStmt_print(_mamaSays, argument) {
    return new ast.PrintStatement(argument.ast())
  },
  //stop  -- break
  SimpleStmt_break(_stop) {
    return new ast.Break()
  },
  //serve Exp?
  SimpleStmt_return(_serve, returnValue) {
    return new ast.Return(returnValue.ast())
  },
  //  Exp             =  Exp "||" Exp1                                    -- or
  //|  Exp "&&" Exp1                                    -- and
  //|  Exp1 is this right??
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
  //Exp5            =  Exp6 "^" Exp5
  // why is this not binary?                             -- exponential
  // why not source string??
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
  //  Block           =  "(^-^)~" Stmt* "~(^-^)"
  Block(_left, statements, _right) {
    return new ast.Block(statements.ast())
  },

  // types?????????????
  // Type(_) {

  // },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  // digit+ ("." digit+)? (("E"|"e") ("+"|"-")? digit+)?
  numlit(digits, decimal, fractions, exponents, sign, digit2) {
    return Number(+this.sourceString)
  },
  stringlit(_left, chars, _right) {
    return chars.sourceString
  },
  boollit(bool) {
    return bool.sourceString
  },
  Params(_left, params, _right) {
    return new ast.Parameter(params.asIteration().ast())
  },
  //ParamEl         =  Type id
  ParamEl(type, id) {
    return new ast.ParamEl(type, id)
  },
  spicy(_) {
    return new ast.NamedType("spicy")
  },
  salty(_) {
    return new ast.NamedType("salty")
  },
  bitter(_) {
    return new ast.NamedType("bitter")
  },
  bland(_) {
    return new ast.NamedType("bland")
  },
  // _terminal() {
  //   return this.sourceString
  // },

  //Params =  "(" ListOf<ParamEl, ","> ")"
  //ParamEl =  Type id

  // Statement_declare(_let, id, _eq, expression) {
  //   return new ast.Declaration(id.sourceString, expression.ast())
  // },
  // Statement_assign(id, _eq, expression) {
  //   return new ast.Assignment(
  //     new ast.IdentifierExpression(id.sourceString),
  //     expression.ast()
  //   )
  // },
  // Statement_print(_print, expression) {
  //   return new ast.PrintStatement(expression.ast())
  // },
  // Exp_binary(left, op, right) {
  //   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  // },
  // Exp1_binary(left, op, right) {
  //   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  // },
  // Term_binary(left, op, right) {
  //   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  // },
  // Term_unary(op, operand) {
  //   return new ast.UnaryExpression(op.sourceString, operand.ast())
  // },
  // Factor_binary(left, op, right) {
  //   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  // },

  // Primary_parens(_open, expression, _close) {
  //   return expression.ast()
  // },
  // Primary_unary(op, operand) {
  //   return new ast.UnaryExpression(op.sourceString, operand.ast())
  // },
  // num(_base, _radix, _fraction) {
  //   return new ast.LiteralExpression(+this.sourceString)
  // },
  // id(_firstChar, _restChars) {
  //   return new ast.IdentifierExpression(this.sourceString)
  // },
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
