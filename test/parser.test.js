import assert from "assert"
import parse, { syntaxIsOkay } from "../src/parser.js"

const goodPrograms = [
  String.raw`mamaSays "make a muffin" ;)
  --[=] Include more sugar

  yay!
   [=]--`,
  String.raw`recipe salty pudding (salty chocolate, spicy water) (^-^)~

   recipe salty cream (salty milk) (^-^)~
       serve milk + "happiness" ;)
   ~(^-^)

   addAPinchOf water (^-^)~
     serve cream(chocolate) ;)
   ~(^-^) dumpLeftovers (^-^)~
     serve "no pudding today" ;)
   ~(^-^)
  ~(^-^)`,
  String.raw`mamaSays 1+2*3 ;)`,
  String.raw`"oh no" ;)`,
  String.raw`mamaSays (  	123   ) ;)`,
  String.raw`mamaSays (2+4)*7 ;)`,
  String.raw`mamaSays 2 * 3 ;)`,
  String.raw`ingredient bitter g = 5 * 10 ;)`,
  String.raw`(@) 3, 4, 5 (@) ;)`,
  String.raw`8 * 9 + (9 - 5) ;)`,
  String.raw`bake ingredient bitter egg = 1 until egg < 40 egg++ (^-^)~ 
~(^-^)`,
  `serve a + b ;)`,
  `recipe bitter Add (bitter a, bitter b) (^-^)~
  serve a + b ;)
~(^-^)`,
  String.raw`ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)`,
  String.raw`ingredient spicy(@)(@) boolArrArr = (@) (@)raw(@), (@)raw, cooked(@) (@) ;)`,
  String.raw`ingredient bitter[#][#] dictDict= 
[#] 
    "key1" : [#] "inner1": 5[#] , 
    "key2" : [#] "inner2": 2[#]  
[#];)`,
  String.raw`ingredient salty[#] basicDict = [#]  "key" : "value" [#]  ;)`,
  String.raw`serve -8 < 9 ;)`,
  String.raw`serve -(-(-(-(-(-(-5)))))) ;)`,
  String.raw`serve 4 || 9 ;)`,
  String.raw`serve 3 && 5 || 2 ;)`,
  String.raw`serve 3 || 5 && 2 * 5 + (5 - 1) ;)`,
  String.raw`addAPinchOf grand (^-^)~
serve cooked ;)
~(^-^) orSubstitute another (^-^)~
serve raw ;)
~(=^..^) saying something
~(^-^)`,
  String.raw`recipe bland triangle () (^-^)~
serve ;)
--[=] 
testing out 
multiple line
comments
[=]--
~(^-^)`,
  String.raw`serve 2^2 ;)`,
  String.raw`ingredient salty(@) rollCake = (@)"strawberry", "sugar", "cake"(@) ;)

ingredient salty fruit = rollCake(@)0(@) ;)

fruit = rollCake(@)2(@) ;)`,
  String.raw`ingredient bitter[#] rollCake = [#]
"strawberry": 0, 
"sugar": 1,
"cake": 2
[#] ;)

ingredient bitter fruit = rollCake[#]"strawberry"[#] ;)

fruit = rollCake[#]"cake"[#] ;)`,

  String.raw`addAPinchOf something (^-^)~
serve raw ;)
~(^-^) orSubstitute anotherOne (^-^)~
mamaSays "test single line" ;)
~(=^..^) testing single line comment
~(^-^)
stop ;)`,

  String.raw`stir until cooked (^-^)~
  mamaSays "infinite loop baby" ;)
~(^-^)`,
String.raw`recipe bitter gcd (bitter a, bitter b) (^-^)~
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
~(^-^)`,
String.raw`ingredient empty null = empty ;)`
]

const badPrograms = [
  String.raw`ingredient bitter g = 5 * 10 ;);)`,
  String.raw`ingredient spicy(@) = (@) raw, raw (@) ;)`,
  String.raw`ingredient salty[#]  bad= [#] "key" [#] ;)`,
  String.raw`serve -10 < 5 > -4 ;)`,
  String.raw`serve -------5 ;)`,
  String.raw`bake ingredient bitter egg = 1 u egg < 40 egg++ (^-^)~
    ~(^-^)`,
  String.raw`bake ingredient bitter egg = 1 until egg < 40 egg++ (^ -^)~
    ~(^-^)`,
]

describe("The syntax checker", () => {
  for (const program of goodPrograms) {
    it(`recognizes ${program}`, () => {
      assert.ok(syntaxIsOkay(program))
    })
  }

  for (const program of badPrograms) {
    it(`rejects ${program}`, () => {
      assert.ok(!syntaxIsOkay(program))
    })
  }
})

describe("The parser", () => {
  for (const program of goodPrograms) {
    it(`recognizes ${program}`, () => {
      assert.ok(parse(program))
    })
  }

  for (const program of badPrograms) {
    it(`reject ${program}`, () => {
      assert.throws(() => parse(program))
    })
  }
})
