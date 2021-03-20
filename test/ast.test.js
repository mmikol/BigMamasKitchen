import assert from "assert"
import parse from "../src/parser.js"
import util from "util"

/*
src/bigMamasKitchen.js examples/hello.bmk ast*/
const source1 = `mamaSays "make a muffin" ;)`

const source2 = `recipe bitter gcd (bitter a, bitter b) (^-^)~
addAPinchOf a < 0 (^-^)~
  a = -1 * a ;)
~(^-^)

addAPinchOf (b < 0) (^-^)~
  b = -1 * b ;)
~(^-^)

addAPinchOf b > a (^-^)~
  ingredient bitter temp = a ;)
  a = b ;)
  b = temp ;)
~(^-^)

stir until cooked (^-^)~

  addAPinchOf b == 0 (^-^)~
    serve a ;)
  ~(^-^)

  a = a % b ;)

  addAPinchOf a == 0 (^-^)~
    serve b ;)
  ~(^-^)

  b = b % a ;)
~(^-^)
~(^-^)`

const source3 = `stir until cooked (^-^)~
mamaSays "infinite loop baby" ;)
~(^-^)`

const source4 = `recipe salty pudding (salty chocolate, spicy water) (^-^)~
--[=] 
testing out 
multiple line
comments
[=]--

recipe salty cream (salty milk) (^-^)~
   serve milk + "happiness" ;)
~(^-^)

addAPinchOf water (^-^)~
 serve cream(chocolate) ;)
~(^-^) dumpLeftovers (^-^)~
 serve "no pudding today" ;)
~(^-^)

~(^-^)`

const source5 = `ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)`

const source6 = `ingredient bland x = nothing ;)`

const expectedAst1 = `   1 | Program statements=[#2]
   2 | PrintStatement argument='make a muffin'`

const expectedAst2 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id='gcd' parameters=[#4,#6] body=#8
   3 | TypeIdentifier name='bitter'
   4 | Parameter type=#5 id='a'
   5 | TypeIdentifier name='bitter'
   6 | Parameter type=#7 id='b'
   7 | TypeIdentifier name='bitter'
   8 | Block statements=[#9,#18,#28,#42]
   9 | IfStatement test=[#10] consequents=[#12] alternate=null
  10 | BinaryExpression left=#11 op='<' right=0
  11 | IdentifierExpression id='a'
  12 | Block statements=[#13]
  13 | Assignment target=#14 source=#15
  14 | IdentifierExpression id='a'
  15 | BinaryExpression left=#16 op='*' right=#17
  16 | UnaryExpression prefix='-' expression=1
  17 | IdentifierExpression id='a'
  18 | IfStatement test=[#19] consequents=[#22] alternate=null
  19 | Expression expression=#20
  20 | BinaryExpression left=#21 op='<' right=0
  21 | IdentifierExpression id='b'
  22 | Block statements=[#23]
  23 | Assignment target=#24 source=#25
  24 | IdentifierExpression id='b'
  25 | BinaryExpression left=#26 op='*' right=#27
  26 | UnaryExpression prefix='-' expression=1
  27 | IdentifierExpression id='b'
  28 | IfStatement test=[#29] consequents=[#32] alternate=null
  29 | BinaryExpression left=#30 op='>' right=#31
  30 | IdentifierExpression id='b'
  31 | IdentifierExpression id='a'
  32 | Block statements=[#33,#36,#39]
  33 | VariableDeclaration type=#34 name='temp' initializer=#35
  34 | TypeIdentifier name='bitter'
  35 | IdentifierExpression id='a'
  36 | Assignment target=#37 source=#38
  37 | IdentifierExpression id='a'
  38 | IdentifierExpression id='b'
  39 | Assignment target=#40 source=#41
  40 | IdentifierExpression id='b'
  41 | IdentifierExpression id='temp'
  42 | WhileLoop test=true body=#43
  43 | Block statements=[#44,#50,#55,#61]
  44 | IfStatement test=[#45] consequents=[#47] alternate=null
  45 | BinaryExpression left=#46 op='==' right=0
  46 | IdentifierExpression id='b'
  47 | Block statements=[#48]
  48 | Return returnValue=[#49]
  49 | IdentifierExpression id='a'
  50 | Assignment target=#51 source=#52
  51 | IdentifierExpression id='a'
  52 | BinaryExpression left=#53 op='%' right=#54
  53 | IdentifierExpression id='a'
  54 | IdentifierExpression id='b'
  55 | IfStatement test=[#56] consequents=[#58] alternate=null
  56 | BinaryExpression left=#57 op='==' right=0
  57 | IdentifierExpression id='a'
  58 | Block statements=[#59]
  59 | Return returnValue=[#60]
  60 | IdentifierExpression id='b'
  61 | Assignment target=#62 source=#63
  62 | IdentifierExpression id='b'
  63 | BinaryExpression left=#64 op='%' right=#65
  64 | IdentifierExpression id='b'
  65 | IdentifierExpression id='a'`

const expectedAst3 = `   1 | Program statements=[#2]
   2 | WhileLoop test=true body=#3
   3 | Block statements=[#4]
   4 | PrintStatement argument='infinite loop baby'`

const expectedAst4 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id='pudding' parameters=[#4,#6] body=#8
   3 | TypeIdentifier name='salty'
   4 | Parameter type=#5 id='chocolate'
   5 | TypeIdentifier name='salty'
   6 | Parameter type=#7 id='water'
   7 | TypeIdentifier name='spicy'
   8 | Block statements=[#9,#17]
   9 | FunctionDeclaration type=#10 id='cream' parameters=[#11] body=#13
  10 | TypeIdentifier name='salty'
  11 | Parameter type=#12 id='milk'
  12 | TypeIdentifier name='salty'
  13 | Block statements=[#14]
  14 | Return returnValue=[#15]
  15 | BinaryExpression left=#16 op='+' right='happiness'
  16 | IdentifierExpression id='milk'
  17 | IfStatement test=[#18] consequents=[#19] alternate=#25
  18 | IdentifierExpression id='water'
  19 | Block statements=[#20]
  20 | Return returnValue=[#21]
  21 | Call callee=#22 args=#23
  22 | IdentifierExpression id='cream'
  23 | Args args=[#24]
  24 | IdentifierExpression id='chocolate'
  25 | Block statements=[#26]
  26 | Return returnValue=['no pudding today']`

const expectedAst5 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 name='rawEggs' initializer=#5
   3 | ArrayType type=#4
   4 | TypeIdentifier name='spicy'
   5 | ArrayLiteral expression=[false,false]`

const expectedAst6 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 name='x' initializer=#4
   3 | TypeIdentifier name='bland'
   4 | NullLiteral`

const goodPrograms = [
  { source: source1, expectedAst: expectedAst1 },
  { source: source2, expectedAst: expectedAst2 },
  { source: source3, expectedAst: expectedAst3 },
  { source: source4, expectedAst: expectedAst4 },
  { source: source5, expectedAst: expectedAst5 },
  { source: source6, expectedAst: expectedAst6 },
]

describe("The Ast Generation", () => {
  for (const program of goodPrograms) {
    it(`recognizes ${program}`, () => {
      assert.deepStrictEqual(
        util.format(parse(program.source)),
        program.expectedAst
      )
    })
  }
})
