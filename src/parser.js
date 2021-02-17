import ohm from "ohm-js"
import * as ast from "./ast.js"

const bmkGrammar = ohm.grammar(String.raw`
BigMamasKitchen {
  Program         =  Stmt*
  Stmt            =  SimpleStmt terminate		                          -- simple
                  |  Dec                                              -- dec            
                  |  addAPinchOf Exp Block        
                      (orSubstitute Exp Block)*
                      (dumpLeftovers Block)?                          -- ifStatement    
                  |  stir until Exp Block                             -- while
                  |  bake (VarDec | id) until Exp (Increment)? Block  -- for
  SimpleStmt      =  Assignment                                       -- assignment
                  |  Call                                             -- call
                  |  stop                                             -- break
                  |  serve Exp?                                       -- return
                  |  mamaSays Exp                                     -- print
                  |  Exp                                              -- expression
  Assignment      =  Increment                                        -- increment
                  |  Var "=" Exp                                      -- assign
  Increment       =  Var incop             
  Dec             =  FuncDec 
                  |  ( VarDec | ArrDec | DictDec ) terminate          -- variable
  VarDec          =  ingredient Type id "=" Exp
  ArrDec          =  ingredient ArrType id "=" Array 
  DictDec         =  ingredient DictType id "=" Dict 
  FuncDec         =  recipe (Type | bland) id Params Block 
  Type            =  spicy 
                  |  bitter 
                  |  salty
                  |  ArrType
                  |  DictType
  ArrType         =  ArrType "(@)" 
                  |  Type "(@)"	
  DictType        =  DictType "[#]" 
                  |  Type "[#]" 
  Array           =  "(@)" ListOf<Exp, ","> "(@)"                     -- array
  Dict            =  "[#]" ListOf< DictEl, ","> "[#]"                 -- dict
  DictEl          =  stringlit ":" Exp
  Params          =  "(" ListOf<ParamEl, ","> ")"
  ParamEl         =  Type id
  Block           =  "(^-^)~" Stmt* "~(^-^)"
  Exp             =  Exp "||" Exp1                                    -- or
                  |  Exp "&&" Exp1                                    -- and
                  |    Exp1
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
  Var             =  Var "(@)" Exp "(@)"                              -- arraySubscript
                  |  Var "[#]" stringlit  "[#]"                       -- dictionary 
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
/* eslint-disable no-unused-vars*/
const astBuilder = bmkGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  
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
