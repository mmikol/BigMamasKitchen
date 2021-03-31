// Taken from Dr. Toal's "How to Write a Compiler" notes
import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as ast from "../src/ast.js"

// Programs that are semantically correct
const semanticChecks = [
  [
    "variable declarations",
    `ingredient bland x = nothing ;) ingredient bitter y = 25 ;) ingredient spicy bool = raw ;)`,
  ],
  [
    "string function declaration",
    `recipe salty stringFunction(salty dogName) (^-^)~ serve dogName ;)
  ~(^-^)`,
  ],
  //["array declaration", "ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)"],
  [
    "void function declaration",
    `recipe empty voidFunction () (^-^)~ serve ;)
  ~(^-^)`,
  ],
  [
    "boolean function declaration",
    `recipe spicy boolFunc(spicy bool)(^-^)~ serve bool == raw ;)
      ~(^-^)`,
  ],
  [
    "basic for loop",
    `bake ingredient bitter egg = 1 until egg < 40 egg++ (^-^)~
        mamaSays egg ;)
        stop ;)
     ~(^-^)`,
  ],
  [
    "for loop with variable that has already been declared",
    `ingredient bitter egg = 1 ;)
        bake egg until egg < 40 egg++ (^-^)~
        mamaSays egg ;)
        stop ;)
    ~(^-^)`,
  ],
  [
    "nested for loop",
    `bake ingredient bitter a = 0 until a < 10 a++ (^-^)~
        bake ingredient bitter b = 10 until b >= 0 b-- (^-^)~
            mamaSays a + b ;)
        ~(^-^)
     ~(^-^)`,
  ],
  [
    "For loop with decrement",
    `bake ingredient bitter a = 0 until a < 10 a-- (^-^)~
     ~(^-^)`,
  ],
  [
    "While Loop",
    `stir until cooked (^-^)~
  mamaSays "infinite loop baby" ;)
~(^-^)`,
  ],
  [
    "While Loop incrementing a count",
    `ingredient bitter counter = 1 ;) stir until counter > 100 (^-^)~
  counter++ ;)
~(^-^)`,
  ],
  [
    "While Loop with a break",
    `ingredient bitter counter = 1 ;) stir until counter > 100 (^-^)~
  counter = counter + 20 ;)
  addAPinchOf counter == 81 (^-^)~
     stop ;)
  ~(^-^)
~(^-^)`,
  ],
  [
    "Nested if blocks",
    `
  ingredient bitter i = 90 ;)

  addAPinchOf i < -35 (^-^)~
    addAPinchOf i < -35 (^-^)~
     mamaSays "hello" ;)
    ~(^-^)
  ~(^-^)`,
  ],
  [
    "Standard if else if else statement",
    `
  ingredient bitter i = 90 ;)

  addAPinchOf i < -35 (^-^)~
    mamaSays "i is less than 35" ;)
  ~(^-^) orSubstitute i > 35 (^-^)~
    mamaSays "i is greater than 35" ;)
  ~(^-^)
  dumpLeftovers (^-^)~
    mamaSays "i is equal to 35" ;)
  ~(^-^)`,
  ],
  [
    "If Else statment",
    `ingredient bitter i = 90 ;)

  addAPinchOf i < -35 (^-^)~
    mamaSays "i is less than 35" ;)
  ~(^-^)
  dumpLeftovers (^-^)~
    mamaSays "i is equal to 35" ;)
  ~(^-^)`,
  ],
  [
    "If Else If statement",
    `ingredient bitter i = 90 ;)

  addAPinchOf i < -35 (^-^)~
    mamaSays "i is less than 35" ;)
  ~(^-^) orSubstitute i > 35 (^-^)~
    mamaSays "i is greater than 35" ;)
  ~(^-^) `,
  ],
  [
    "Simple and expression",
    `addAPinchOf raw && raw (^-^)~ mamaSays "it's raw" ;) ~(^-^)`,
  ],
  [
    "Chained and expression",
    `
  ingredient spicy pancakes = cooked ;)
  ingredient spicy syrup = raw ;)
  ingredient spicy bacon = raw ;)
  addAPinchOf pancakes && syrup && bacon (^-^)~ mamaSays "breakfast is served" ;) ~(^-^) dumpLeftovers  (^-^)~ mamaSays "we were missing ingredients" ;) ~(^-^)`,
  ],
  [
    "Chained or expression",
    `
  ingredient spicy pancakes = 8 > 9 ;)
  ingredient spicy syrup = raw ;)
  ingredient spicy bacon = 700 / 2 < 10 ;)
  addAPinchOf pancakes || syrup || bacon (^-^)~ mamaSays "breakfast is served" ;) ~(^-^) dumpLeftovers  (^-^)~ mamaSays "we were missing ingredients" ;) ~(^-^)`,
  ],
  [
    "Calling functions, nested call statements",
    ` recipe salty function1 (salty chocolate, bitter num) (^-^)~
serve chocolate ;)
~(^-^)

recipe bitter function2 (bitter num) (^-^)~
serve num + 90 ;)
~(^-^)
function1("egg", function2(400)) ;)`,
  ],
  [
    "Initializing basic array",
    `ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)
  `,
  ],
  [
    "Initializing basic array with numbers",
    `ingredient bitter(@) numbers = (@) 1, 2, 3, 4, 5 (@) ;)
  `,
  ],
  [
    "Empty array with type okay ",
    `ingredient spicy(@) rawEggs = (@ spicy  @) ;)
  `,
  ],
  [
    "Declaring 2D boolean array",
    `ingredient spicy(@)(@) rawEggs2 = (@) (@) cooked, cooked (@), (@) raw, cooked (@) (@) ;)`,
  ],
  [
    "Can declare a basic string dictionary",
    `ingredient salty[#] basicDict = [#] "key" : "value" [#] ;)`,
  ],
  [
    "Can declare a basic boolean dictionary",
    `ingredient spicy[#] basicDict = [#] "imthekey" : raw [#] ;)`,
  ],
  [
    "Can declare a 2D dictionary",
    `ingredient bitter[#][#] dictDict=
    [#]
        "key1" : [#] "inner1" : 5 [#] ,
        "key2" : [#] "inner2" : 2 [#]
    [#] ;)`,
  ],
  [
    "Can access values from dictionary",
    `
  ingredient bitter[#] rollCake = [#]
  "strawberry": 0,
  "sugar": 1,
  "cake": 2
[#] ;)

ingredient bitter fruit = rollCake[#]"strawberry"[#] ;)

fruit = rollCake[#]"cake"[#] ;)
  `,
  ],
  [
    "Can access values from dictionary of dictionary",
    `ingredient salty[#][#] dictionary = [#]
"key1": [#]"key2": "value"[#]
[#] ;)

mamaSays dictionary[#]"key1"[#][#]"key2"[#] ;)`,
  ],
  [
    "Can declare an empty dictionary",
    `ingredient salty[#] dictionary = [# salty #] ;)`,
  ],
  [
    "Can access element of 1D array",
    `ingredient salty(@) rollCake = (@)"strawberry", "sugar", "cake"(@) ;)

    ingredient salty fruit = rollCake(@)0(@) ;)
    
    fruit = rollCake(@)2(@) ;)`,
  ],
  [
    "Can access element of 2D Array",
    `ingredient bitter(@)(@) doubleArray = (@) (@)1,2,3(@), (@)4,5,6(@) (@) ;)

  mamaSays doubleArray(@)1(@)(@)2(@) == 6 ;)`,
  ],
  [
    "Function return types",
    `recipe bitter square (bitter n) (^-^)~
    serve n * n ;)
    ~(^-^)
    recipe bitter compose(bitter a) (^-^)~
     serve square(a) ;)
     ~(^-^)`,
  ],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "assign bad type to variables",
    "ingredient bitter y = 25 ;) y = raw ;)",
    /Error: Cannot assign a boolean to a number/,
  ],
  [
    "boolean function with wrong return type",
    `recipe spicy boolFunc(spicy bool)(^-^)~ serve "string" ;)
      ~(^-^)`,
    /Error: Cannot assign a string to a boolean/,
  ],
  [
    "string function with wrong return type",
    `recipe salty stringFunc(spicy bool)(^-^)~ serve 50.845783 ;)
      ~(^-^)`,
    /Error: Cannot assign a number to a string/,
  ],
  [
    "missing return keyword in void function",
    `recipe empty voidFunction () (^-^)~~(^-^)`,
    /Error: Function must have a return statement/,
  ],
  [
    "returning a type in a void function",
    `recipe empty voidFunction (spicy bool) (^-^)~ serve bool ;) ~(^-^)`,
    /Error: Cannot return a value here/,
  ],
  [
    "returning nothing in a string function",
    `recipe salty stringFunction (spicy bool) (^-^)~ serve ;) ~(^-^)`,
    /Error: Something should be returned here/,
  ],
  [
    "missing return keyword in string function",
    `recipe salty stringFunction () (^-^)~~(^-^)`,
    /Error: Function must have a return statement/,
  ],
  [
    "For loop with a non-boolean test condition",
    `bake ingredient bitter egg = 1 until "imstring" egg++ (^-^)~
      mamaSays egg ;)
      stop ;)
     ~(^-^)`,
    /Error: Expected a boolean, found string/,
  ],
  [
    "For loop with a non-number iterator",
    `bake ingredient spicy egg = raw until egg == raw egg++ (^-^)~
      mamaSays egg ;)
      stop ;)
     ~(^-^)`,
    /Error: Expected a number, found boolean/,
  ],
  [
    "For loop incrementing the wrong variable",
    `ingredient bitter heehee = 1 ;)
    bake ingredient bitter egg = 1 until egg < 40 heehee++ (^-^)~
        mamaSays egg ;)
    ~(^-^)`,
    /Error: Expected egg and heehee to be the same variable, but they are not/,
  ],
  [
    "random break not allowed",
    `stop ;)
    bake ingredient bitter a = 0 until a < 10 a++ (^-^)~
        mamaSays a ;)
     ~(^-^)`,
    /Error: Break can only appear in a loop/,
  ],
  [
    "random return not allowed",
    `serve ;)
    bake ingredient bitter a = 0 until a < 10 a++ (^-^)~
        mamaSays a ;)
     ~(^-^)`,
    /Error: Return can only appear in a function/,
  ],
  [
    "If test must be a boolean",
    `ingredient bitter i = 90 ;)
addAPinchOf "string" (^-^)~
  mamaSays "i is less than 35" ;)
~(^-^) `,
    /Error: Expected a boolean, found string/,
  ],
  [
    "Else If test must be a boolean",
    `ingredient bitter i = 90 ;)
addAPinchOf i < 70 (^-^)~
  mamaSays "i is less than 35" ;)
~(^-^) orSubstitute 500 (^-^)~
  mamaSays "i is greater than 35" ;)
~(^-^) `,
    /Error: Expected a boolean, found number/,
  ],
  [
    "While Loop test must be Boolean",
    `ingredient bitter counter = 1 ;) stir until 800 (^-^)~
  counter++ ;)
~(^-^)`,
    /Error: Expected a boolean, found number/,
  ],
  [
    "And expression expressions must be booleans",
    `addAPinchOf 22 && 500 (^-^)~ mamaSays "this is wrong" ;) ~(^-^)`,
    /Error: Expected a boolean, found number/,
  ],
  [
    "Or expression expressions must be booleans",
    `addAPinchOf "raw" || "cooked" (^-^)~ mamaSays "this is wrong" ;) ~(^-^)`,
    /Error: Expected a boolean, found string/,
  ],
  [
    "Calling a non-function like a function is not allowed",
    `ingredient bitter fakefunction = 10 ;)
fakefunction(800) ;)`,
    /Error: Call of non-function or non-constructor/,
  ],
  [
    "Passing the wrong parameter types to a function call",
    `recipe salty function1 (salty chocolate, bitter num) (^-^)~
serve chocolate ;)
~(^-^)

function1("correct", raw) ;)`,
    /Error: Cannot assign a boolean to a number/,
  ],
  [
    "Passing the wrong number of parameters to a function call",
    `recipe salty function1 (salty chocolate, bitter num) (^-^)~
serve chocolate ;)
~(^-^)

function1("correct", 100, "imanextraparam") ;)`,
    /Error: 2 argument\(s\) required but 3 passed/,
  ],
  [
    "Calling a function that doesnt exist",
    `recipe salty function1 (salty chocolate, bitter num) (^-^)~
serve chocolate ;)
~(^-^)

function10("correct", 100, "imanextraparam") ;)`,
    /Error: Identifier function10 not declared/,
  ],
  [
    "! expression must be a boolean",
    `!"this is wrong" ;)`,
    /Error: Expected a boolean, found string/,
  ],
  [
    "All Array elements must be the same",
    `ingredient spicy(@) rawEggs2 = (@) "imstrgin", raw (@) ;)`,
    /Error: Not all elements have the same type/,
  ],
  [
    "Empty array type mismatch",
    `ingredient spicy(@) rawEggs = (@ bitter @) ;)`,
    /Error: Cannot assign a \[number\] to a \[spicy\]/,
  ],
  [
    "Array dimension mismatch",
    `ingredient spicy(@)(@) rawEggs = (@) raw (@) ;)`,
    /Error: Cannot assign a \[boolean\] to a \[\[spicy\]\]/,
  ],
  [
    "Cannot declare variables with the same name",
    `ingredient spicy hehe = raw ;)
    ingredient spicy hehe = cooked ;)`,
    /Error: Identifier hehe already declared/,
  ],
  [
    "Cannot declare duplicate keys in a dictionary",
    `ingredient salty hehe = "same" ;)
    ingredient spicy[#] basicDict = [#] "same" : raw, "same" : raw, hehe : cooked [#] ;)`,
    /Error: No duplicate keys/,
  ],
  [
    "Dictionary keys must be strings",
    `ingredient bitter key1 = 24 ;)
    ingredient salty key2 = "correct" ;)
    ingredient spicy[#] basicDict = [#] key1 : raw, key2 : raw [#] ;)`,
    /Error: Expected a string, found number/,
  ],
  [
    "Dictionary values must all be the correct",
    `ingredient spicy[#] basicDict = [#] "key1" : "raw", "key2" : raw [#] ;)`,
    /Error: Cannot assign a {string} to a {spicy}/,
  ],
  [
    "Dictionary dimension mismatch",
    `ingredient spicy[#][#] basicDict = [#] "key1" : raw, "key2" : raw [#] ;)`,
    /Error: Cannot assign a {boolean} to a {{spicy}}/,
  ],
  [
    "Must access dicionary keys with a string",
    `
  ingredient bitter[#] rollCake = [#]
  "strawberry": 0,
  "sugar": 1,
  "cake": 2
[#] ;)

ingredient bitter fruit = rollCake[#]45[#] ;)
  `,
    /Error: Expected a string, found number/,
  ],

  [
    "Must access element of 1D array with integer",
    `ingredient salty(@) rollCake = (@)"strawberry", "sugar", "cake"(@) ;)

    ingredient salty fruit = rollCake(@)"sugar"(@) ;)
    
    fruit = rollCake(@)2(@) ;)`,
    /Error: Expected a number, found string/,
  ],
  [
    "Accessing array element at dimension that doesnt exist",
    `ingredient bitter(@)(@) doubleArray = (@) (@)1,2,3(@), (@)4,5,6(@) (@) ;)
      ingredient bitter(@) array = doubleArray(@)1(@)(@)2(@)(@)1(@) ;)`,
    /Error: Expected a type or an array type/,
  ],
  [
    "Accessing dictionary element at dimension that doesnt exist",
    `ingredient bitter[#][#] doubleDict = [#] "key" : [#]"key": 3[#], "key2" : [#]"key": 5[#] [#] ;)

      ingredient bitter dict = doubleDict[#]"key"[#][#]"key"[#][#]"key"[#] ;)`,
    /Error: Expected a type or a dictionary type/,
  ],
  [
    "Function type mismatch",
    `recipe bitter numFunction (bitter a) (^-^)~ serve 1 ;) ~(^-^)
     recipe spicy g (spicy b) (^-^)~ serve 5 ;) ~(^-^)
     numFunction(2, g) ;)`,
    /Error: Cannot assign a number to a boolean/,
  ],
]

const Void = ast.Type.VOID
const Bland = ast.Type.NULL
const parameters = new ast.Parameter(Bland, "heehee")
const nothingToVoidType = new ast.FunctionType(
  [parameters].map((p) => p.type),
  Void
)
const shortReturnStatement = new ast.ShortReturnStatement()
const blockStatements = new ast.Block([shortReturnStatement])

const funDeclF = Object.assign(
  new ast.FunctionDeclaration(
    Void,
    "stringFunction",
    [parameters],
    blockStatements
  ),
  {
    function: Object.assign(new ast.Function("stringFunction"), {
      type: nothingToVoidType,
    }),
  }
)
console.log(funDeclF)
const graphChecks = [
  [
    "functions created & resolved",
    `recipe empty stringFunction (bland heehee) (^-^)~
  serve ;)
  ~(^-^)`,
    [funDeclF],
  ],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
  for (const [scenario, source, graph] of graphChecks) {
    it(`properly rewrites the AST for ${scenario}`, () => {
      assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
    })
  }
})
