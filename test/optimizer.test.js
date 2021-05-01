import assert from "assert"
import optimize from "../src/optimizer.js"
import * as ast from "../src/ast.js"

// Make some test cases easier to read
const x = new ast.Variable(ast.Type.BOOLEAN, "x")
const z = new ast.Variable(ast.Type.BOOLEAN, "z")
const incrementX = new ast.Increment(x)
const decrementX = new ast.Decrement(x)
const return1p1 = new ast.Return(new ast.BinaryExpression(1, "+", 1))
const return2 = new ast.Return(2)
const returnX = new ast.Return(x)
const onePlusFive = new ast.BinaryExpression(1, "+", 5)
const callee = Object.assign(new ast.Function("id"), { body: returnX })
const numberFunc = (body) =>
  new ast.FunctionDeclaration(
    ast.Type.NUMBER,
    "name",
    [new ast.Parameter(ast.Type.NUMBER, "param1")],
    body
  )
const callSomething = (args) => new ast.Call(callee, args)
const eq = (x, y) => new ast.BinaryExpression(x, "==", y)
const times = (x, y) => new ast.BinaryExpression(x, "*", y)
const neg = (x) => new ast.UnaryExpression("-", x)
const array = (...elements) => new ast.ArrayLiteral(elements)
const arrayAccess = (array, index) => new ast.ArrayAccess(array, index)
const dictionaryEl = (key, value) => new ast.DictionaryEl(key, value)
const dictionary = (...entries) => new ast.DictionaryLiteral(entries)
const dictionaryAccess = (dictionary, key) =>
  new ast.DictionaryAccess(dictionary, key)

const tests = [
  ["folds +", new ast.BinaryExpression(5, "+", 8), 13],
  ["folds -", new ast.BinaryExpression(5, "-", 8), -3],
  ["folds *", new ast.BinaryExpression(5, "*", 8), 40],
  ["folds /", new ast.BinaryExpression(5, "/", 8), 0.625],
  ["folds ^", new ast.BinaryExpression(5, "^", 8), 390625],
  ["folds <", new ast.BinaryExpression(5, "<", 8), true],
  ["folds <=", new ast.BinaryExpression(5, "<=", 8), true],
  ["folds ==", new ast.BinaryExpression(5, "==", 8), false],
  ["folds !=", new ast.BinaryExpression(5, "!=", 8), true],
  ["folds >=", new ast.BinaryExpression(5, ">=", 8), false],
  ["folds >", new ast.BinaryExpression(5, ">", 8), false],
  ["optimizes +0", new ast.BinaryExpression(x, "+", 0), x],
  ["optimizes -0", new ast.BinaryExpression(x, "-", 0), x],
  ["optimizes *1", new ast.BinaryExpression(x, "*", 1), x],
  ["optimizes /1", new ast.BinaryExpression(x, "/", 1), x],
  ["optimizes *0", new ast.BinaryExpression(x, "*", 0), 0],
  ["optimizes 0*", new ast.BinaryExpression(0, "*", x), 0],
  ["optimizes 0/", new ast.BinaryExpression(0, "/", x), 0],
  ["optimizes 0+", new ast.BinaryExpression(0, "+", x), x],
  ["optimizes 0-", new ast.BinaryExpression(0, "-", x), neg(x)],
  ["optimizes 1*", new ast.BinaryExpression(1, "*", x), x],
  ["folds negation", new ast.UnaryExpression("-", 8), -8],
  ["folds !", new ast.UnaryExpression("!", true), false],
  [
    "unary cannot be folded",
    new ast.UnaryExpression("!", x),
    new ast.UnaryExpression("!", x),
  ],
  [
    "binary cannot be folded",
    new ast.BinaryExpression(x, "==", x),
    new ast.BinaryExpression(x, "==", x),
  ],
  ["optimizes 1^", new ast.BinaryExpression(1, "^", x), 1],
  ["optimizes ^0", new ast.BinaryExpression(x, "^", 0), 1],
  [
    "optimizes inside OrExpression",
    new ast.OrExpression(
      new ast.BinaryExpression(5, "<", 6),
      new ast.BinaryExpression(5, "==", 6)
    ),
    new ast.OrExpression(true, false),
  ],
  [
    "optimizes inside AndExpression",
    new ast.AndExpression(
      new ast.BinaryExpression(5, "<", 6),
      new ast.BinaryExpression(5, "==", 6)
    ),
    new ast.AndExpression(true, false),
  ],
  [
    "removes x=x at beginning",
    [new ast.Assignment(x, x), incrementX],
    [incrementX],
  ],
  ["removes x=x at end", [incrementX, new ast.Assignment(x, x)], [incrementX]],
  [
    "removes x=x in middle",
    [incrementX, new ast.Assignment(x, x), incrementX],
    [incrementX, incrementX],
  ],
  [
    "optimizes if-true",
    new ast.IfStatement(true, new ast.Block(incrementX), []),
    new ast.Block(incrementX),
  ],
  [
    "optimizes if-false",
    new ast.IfStatement(false, [], incrementX),
    incrementX,
  ],
  [
    "doesn't optimize if",
    new ast.IfStatement(x, [], []),
    new ast.IfStatement(x, [], []),
  ],
  [
    "optimizes short-if-true",
    new ast.ShortIfStatement(true, new ast.Block(decrementX)),
    new ast.Block(decrementX),
  ],
  [
    "doesn't optimize short-if",
    new ast.ShortIfStatement(x, []),
    new ast.ShortIfStatement(x, []),
  ],
  [
    "optimizes short-if-false",
    [new ast.ShortIfStatement(false, new ast.Block(incrementX))],
    [],
  ],
  [
    "optimizes else-if-true",
    new ast.ElseIfStatement(true, new ast.Block(incrementX), []),
    new ast.Block(incrementX),
  ],
  [
    "doesn't optimize else-if",
    new ast.ElseIfStatement(x, [], []),
    new ast.ElseIfStatement(x, [], []),
  ],
  [
    "optimizes else-if-false",
    new ast.ElseIfStatement(false, [], new ast.Block(incrementX)),
    new ast.Block(incrementX),
  ],
  [
    "optimizes short-else-if-true",
    new ast.ShortElseIfStatement(true, new ast.Block(decrementX)),
    new ast.Block(decrementX),
  ],
  [
    "doesn't optimize short-else-if",
    new ast.ShortElseIfStatement(x, []),
    new ast.ShortElseIfStatement(x, []),
  ],
  [
    "optimizes short-else-if-false",
    [new ast.ShortElseIfStatement(false, new ast.Block(incrementX))],
    [],
  ],
  ["optimizes while-false", [new ast.WhileLoop(false, new ast.Break())], []],
  [
    "optimizes while-loop body",
    new ast.WhileLoop(x, return1p1),
    new ast.WhileLoop(x, return2),
  ],
  [
    "optimizes for loop test",
    new ast.ForLoop(
      x,
      new ast.BinaryExpression(5, "<", onePlusFive),
      incrementX,
      returnX
    ),
    new ast.ForLoop(x, true, incrementX, returnX),
  ],
  [
    "optimizes for loop increment",
    new ast.ForLoop(
      x,
      true,
      new ast.Increment(arrayAccess(array(x), onePlusFive)),
      returnX
    ),
    new ast.ForLoop(
      x,
      true,
      new ast.Increment(arrayAccess(array(x), 6)),
      returnX
    ),
  ],
  [
    "optimizes for loop body",
    new ast.ForLoop(x, true, incrementX, return1p1),
    new ast.ForLoop(x, true, incrementX, return2),
  ],
  [
    "applies if-false after folding",
    new ast.ShortIfStatement(eq(1, 1), incrementX),
    incrementX,
  ],
  ["optimizes in functions", numberFunc(return1p1), numberFunc(return2)],
  [
    "optimizes in subscripts for array",
    arrayAccess(array(1, 2, 3, 4, 5, 6, 7), onePlusFive),
    arrayAccess(array(1, 2, 3, 4, 5, 6, 7), 6),
  ],
  ["optimizes in array literals", array(0, onePlusFive, 9), array(0, 6, 9)],
  ["optimizes in arguments", callSomething([times(3, 5)]), callSomething([15])],
  [
    "optimizes in dictionary literals",
    dictionary(
      dictionaryEl("key1", onePlusFive),
      dictionaryEl("key2", times(3, 5))
    ),
    dictionary(dictionaryEl("key1", 6), dictionaryEl("key2", 15)),
  ],
  [
    "optimizes in subscripts for dictionary",
    dictionaryAccess(
      dictionary(
        dictionaryEl("key1", onePlusFive),
        dictionaryEl("key2", times(3, 5))
      ),
      "key1"
    ),
    dictionaryAccess(
      dictionary(dictionaryEl("key1", 6), dictionaryEl("key2", 15)),
      "key1"
    ),
  ],
  [
    "optimizes empty-array",
    new ast.EmptyArray(ast.Type.NUMBER),
    new ast.EmptyArray(ast.Type.NUMBER),
  ],
  [
    "optimizes empty dictionary",
    new ast.EmptyDictionary(ast.Type.NUMBER),
    new ast.EmptyDictionary(ast.Type.NUMBER),
  ],
  [
    "doesn't optimize assignment",
    new ast.Assignment(x, z),
    new ast.Assignment(x, z),
  ],
  [
    "optimizes program",
    new ast.Program(new ast.BinaryExpression(6, "<", onePlusFive)),
    new ast.Program(false),
  ],
  [
    "doesn't optimize variable declaration",
    new ast.VariableDeclaration(ast.Type.BOOLEAN, "zClone", "z"),
    new ast.VariableDeclaration(ast.Type.BOOLEAN, "zClone", "z"),
  ],
  [
    "param can exist in expression",
    new ast.FunctionDeclaration(
      ast.Type.NUMBER,
      "name",
      [new ast.Parameter(ast.Type.NUMBER, "param1")],
      new ast.Block(
        new ast.BinaryExpression(
          new ast.Parameter(ast.Type.NUMBER, "param1"),
          "==",
          9
        )
      )
    ),
    new ast.FunctionDeclaration(
      ast.Type.NUMBER,
      "name",
      [new ast.Parameter(ast.Type.NUMBER, "param1")],
      new ast.Block(
        new ast.BinaryExpression(
          new ast.Parameter(ast.Type.NUMBER, "param1"),
          "==",
          9
        )
      )
    ),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
