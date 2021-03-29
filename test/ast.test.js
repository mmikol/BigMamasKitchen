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

const source7 = `recipe spicy containsZero (bitter(@)(@) doubleArray, bitter rows, bitter columns) (^-^)~ 
ingredient spicy hasZero =  raw ;) 
bake ingredient bitter i = 0 until i < rows i++ (^-^)~
  addAPinchOf hasZero == cooked (^-^)~
    stop ;)
  ~(^-^)
  bake ingredient bitter j = 0 until j < columns j++ (^-^)~
    addAPinchOf doubleArray(@)i, j(@) == 0 (^-^)~
      hasZero = cooked ;)
      stop ;)
    ~(^-^) 
  ~(^-^) 
~(^-^)
serve hasZero ;)
~(^-^)`

const source8 = `recipe salty getCertainValue (salty[#] basicDict, salty key) (^-^)~ 
serve basicDict[#]key[#] ;) 
~(^-^)`

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
   9 | ShortIfStatement test=#10 consequent=#12
  10 | BinaryExpression left=#11 op='<' right=0
  11 | IdentifierExpression id='a'
  12 | Block statements=[#13]
  13 | Assignment target=#14 source=#15
  14 | IdentifierExpression id='a'
  15 | BinaryExpression left=#16 op='*' right=#17
  16 | UnaryExpression prefix='-' expression=1
  17 | IdentifierExpression id='a'
  18 | ShortIfStatement test=#19 consequent=#22
  19 | Expression expression=#20
  20 | BinaryExpression left=#21 op='<' right=0
  21 | IdentifierExpression id='b'
  22 | Block statements=[#23]
  23 | Assignment target=#24 source=#25
  24 | IdentifierExpression id='b'
  25 | BinaryExpression left=#26 op='*' right=#27
  26 | UnaryExpression prefix='-' expression=1
  27 | IdentifierExpression id='b'
  28 | ShortIfStatement test=#29 consequent=#32
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
  44 | ShortIfStatement test=#45 consequent=#47
  45 | BinaryExpression left=#46 op='==' right=0
  46 | IdentifierExpression id='b'
  47 | Block statements=[#48]
  48 | Return returnValue=#49
  49 | IdentifierExpression id='a'
  50 | Assignment target=#51 source=#52
  51 | IdentifierExpression id='a'
  52 | BinaryExpression left=#53 op='%' right=#54
  53 | IdentifierExpression id='a'
  54 | IdentifierExpression id='b'
  55 | ShortIfStatement test=#56 consequent=#58
  56 | BinaryExpression left=#57 op='==' right=0
  57 | IdentifierExpression id='a'
  58 | Block statements=[#59]
  59 | Return returnValue=#60
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
  14 | Return returnValue=#15
  15 | BinaryExpression left=#16 op='+' right='happiness'
  16 | IdentifierExpression id='milk'
  17 | IfStatement test=#18 consequent=#19 alternate=#24
  18 | IdentifierExpression id='water'
  19 | Block statements=[#20]
  20 | Return returnValue=#21
  21 | Call callee=#22 args=[#23]
  22 | IdentifierExpression id='cream'
  23 | IdentifierExpression id='chocolate'
  24 | Block statements=[#25]
  25 | Return returnValue='no pudding today'`

const expectedAst5 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 name='rawEggs' initializer=#5
   3 | ArrayType name='[spicy]' type=#4
   4 | TypeIdentifier name='spicy'
   5 | ArrayLiteral elements=[false,false]`

const expectedAst6 = `   1 | Program statements=[#2]
   2 | VariableDeclaration type=#3 name='x' initializer=#4
   3 | TypeIdentifier name='bland'
   4 | NullLiteral`

const expectedAst7 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id='containsZero' parameters=[#4,#8,#10] body=#12
   3 | TypeIdentifier name='spicy'
   4 | Parameter type=#5 id='doubleArray'
   5 | ArrayType name='[[bitter]]' type=#6
   6 | ArrayType name='[bitter]' type=#7
   7 | TypeIdentifier name='bitter'
   8 | Parameter type=#9 id='rows'
   9 | TypeIdentifier name='bitter'
  10 | Parameter type=#11 id='columns'
  11 | TypeIdentifier name='bitter'
  12 | Block statements=[#13,#15,#48]
  13 | VariableDeclaration type=#14 name='hasZero' initializer=false
  14 | TypeIdentifier name='spicy'
  15 | ForLoop iterator=#16 test=#18 increment=#21 body=#23
  16 | VariableDeclaration type=#17 name='i' initializer=0
  17 | TypeIdentifier name='bitter'
  18 | BinaryExpression left=#19 op='<' right=#20
  19 | IdentifierExpression id='i'
  20 | IdentifierExpression id='rows'
  21 | Increment target=#22
  22 | IdentifierExpression id='i'
  23 | Block statements=[#24,#29]
  24 | ShortIfStatement test=#25 consequent=#27
  25 | BinaryExpression left=#26 op='==' right=true
  26 | IdentifierExpression id='hasZero'
  27 | Block statements=[#28]
  28 | Break
  29 | ForLoop iterator=#30 test=#32 increment=#35 body=#37
  30 | VariableDeclaration type=#31 name='j' initializer=0
  31 | TypeIdentifier name='bitter'
  32 | BinaryExpression left=#33 op='<' right=#34
  33 | IdentifierExpression id='j'
  34 | IdentifierExpression id='columns'
  35 | Increment target=#36
  36 | IdentifierExpression id='j'
  37 | Block statements=[#38]
  38 | ShortIfStatement test=#39 consequent=#44
  39 | BinaryExpression left=#40 op='==' right=0
  40 | ArrayAccess name=#41 indices=[#42,#43]
  41 | IdentifierExpression id='doubleArray'
  42 | IdentifierExpression id='i'
  43 | IdentifierExpression id='j'
  44 | Block statements=[#45,#47]
  45 | Assignment target=#46 source=true
  46 | IdentifierExpression id='hasZero'
  47 | Break
  48 | Return returnValue=#49
  49 | IdentifierExpression id='hasZero'`

const expectedAst8 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration type=#3 id='getCertainValue' parameters=[#4,#7] body=#9
   3 | TypeIdentifier name='salty'
   4 | Parameter type=#5 id='basicDict'
   5 | DictType type=#6
   6 | TypeIdentifier name='salty'
   7 | Parameter type=#8 id='key'
   8 | TypeIdentifier name='salty'
   9 | Block statements=[#10]
  10 | Return returnValue=#11
  11 | DictAccess name=#12 keys=[#13]
  12 | IdentifierExpression id='basicDict'
  13 | IdentifierExpression id='key'`

const goodPrograms = [
  { source: source1, expectedAst: expectedAst1 },
  { source: source2, expectedAst: expectedAst2 },
  { source: source3, expectedAst: expectedAst3 },
  { source: source4, expectedAst: expectedAst4 },
  { source: source5, expectedAst: expectedAst5 },
  { source: source6, expectedAst: expectedAst6 },
  { source: source7, expectedAst: expectedAst7 },
  { source: source8, expectedAst: expectedAst8 },
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
