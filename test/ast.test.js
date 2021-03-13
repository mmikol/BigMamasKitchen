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

const source6 = `ingredient bland x = empty ;)`

const expectedAst1 = `   1 | Program statements=[#2]
   2 | PrintStatement argument='make a muffin'`

const expectedAst2 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id=#4 parameters=[#5,#8] body=#11
   3 | NamedType name='bitter'
   4 | IdentifierExpression id='gcd'
   5 | Parameter type=#6 id=#7
   6 | NamedType name='bitter'
   7 | IdentifierExpression id='a'
   8 | Parameter type=#9 id=#10
   9 | NamedType name='bitter'
  10 | IdentifierExpression id='b'
  11 | Block statements=[#12,#21,#31,#46]
  12 | IfStatement test=[#13] consequents=[#15] alternate=null
  13 | BinaryExpression left=#14 op='<' right=0
  14 | IdentifierExpression id='a'
  15 | Block statements=[#16]
  16 | Assignment target=#17 source=#18
  17 | IdentifierExpression id='a'
  18 | BinaryExpression left=#19 op='*' right=#20
  19 | UnaryExpression prefix='-' expression=1
  20 | IdentifierExpression id='a'
  21 | IfStatement test=[#22] consequents=[#25] alternate=null
  22 | Expression expression=#23
  23 | BinaryExpression left=#24 op='<' right=0
  24 | IdentifierExpression id='b'
  25 | Block statements=[#26]
  26 | Assignment target=#27 source=#28
  27 | IdentifierExpression id='b'
  28 | BinaryExpression left=#29 op='*' right=#30
  29 | UnaryExpression prefix='-' expression=1
  30 | IdentifierExpression id='b'
  31 | IfStatement test=[#32] consequents=[#35] alternate=null
  32 | BinaryExpression left=#33 op='>' right=#34
  33 | IdentifierExpression id='b'
  34 | IdentifierExpression id='a'
  35 | Block statements=[#36,#40,#43]
  36 | VariableDeclaration type=#37 variable=#38 initializer=#39
  37 | NamedType name='bitter'
  38 | IdentifierExpression id='temp'
  39 | IdentifierExpression id='a'
  40 | Assignment target=#41 source=#42
  41 | IdentifierExpression id='a'
  42 | IdentifierExpression id='b'
  43 | Assignment target=#44 source=#45
  44 | IdentifierExpression id='b'
  45 | IdentifierExpression id='temp'
  46 | WhileLoop test='cooked' body=#47
  47 | Block statements=[#48,#54,#59,#65]
  48 | IfStatement test=[#49] consequents=[#51] alternate=null
  49 | BinaryExpression left=#50 op='==' right=0
  50 | IdentifierExpression id='b'
  51 | Block statements=[#52]
  52 | Return returnValue=[#53]
  53 | IdentifierExpression id='a'
  54 | Assignment target=#55 source=#56
  55 | IdentifierExpression id='a'
  56 | BinaryExpression left=#57 op='%' right=#58
  57 | IdentifierExpression id='a'
  58 | IdentifierExpression id='b'
  59 | IfStatement test=[#60] consequents=[#62] alternate=null
  60 | BinaryExpression left=#61 op='==' right=0
  61 | IdentifierExpression id='a'
  62 | Block statements=[#63]
  63 | Return returnValue=[#64]
  64 | IdentifierExpression id='b'
  65 | Assignment target=#66 source=#67
  66 | IdentifierExpression id='b'
  67 | BinaryExpression left=#68 op='%' right=#69
  68 | IdentifierExpression id='b'
  69 | IdentifierExpression id='a'`

const expectedAst3 = `   1 | Program statements=[#2]
   2 | WhileLoop test='cooked' body=#3
   3 | Block statements=[#4]
   4 | PrintStatement argument='infinite loop baby'`

const expectedAst4 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id=#4 parameters=[#5,#8] body=#11
   3 | NamedType name='salty'
   4 | IdentifierExpression id='pudding'
   5 | Parameter type=#6 id=#7
   6 | NamedType name='salty'
   7 | IdentifierExpression id='chocolate'
   8 | Parameter type=#9 id=#10
   9 | NamedType name='spicy'
  10 | IdentifierExpression id='water'
  11 | Block statements=[#12,#22]
  12 | FunctionDeclaration type=#13 id=#14 parameters=[#15] body=#18
  13 | NamedType name='salty'
  14 | IdentifierExpression id='cream'
  15 | Parameter type=#16 id=#17
  16 | NamedType name='salty'
  17 | IdentifierExpression id='milk'
  18 | Block statements=[#19]
  19 | Return returnValue=[#20]
  20 | BinaryExpression left=#21 op='+' right='happiness'
  21 | IdentifierExpression id='milk'
  22 | IfStatement test=[#23] consequents=[#24] alternate=#30
  23 | IdentifierExpression id='water'
  24 | Block statements=[#25]
  25 | Return returnValue=[#26]
  26 | Call callee=#27 args=#28
  27 | IdentifierExpression id='cream'
  28 | Args args=[#29]
  29 | IdentifierExpression id='chocolate'
  30 | Block statements=[#31]
  31 | Return returnValue=['no pudding today']`

const expectedAst5 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 variable=#5 initializer=#6
   3 | ArrayType type=#4
   4 | NamedType name='spicy'
   5 | IdentifierExpression id='rawEggs'
   6 | ArrayLiteral expression=['raw','raw']`

const expectedAst6 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 variable=#4 initializer='empty'
   3 | NamedType name='bland'
   4 | IdentifierExpression id='x'`

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
