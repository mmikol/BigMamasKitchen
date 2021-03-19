// Taken from Dr. Toal's "How to Write a Compiler" notes
import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
// import * as ast from "../src/ast.js"

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations", 'ingredient bland x = nothing ;) ingredient bitter y = 25 ;) ingredient spicy bool = raw ;)'],
  ["array declaration", "ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["assign bad type", "ingredient bitter y = 25 ;) y = raw ;)", /Cannot assign a boolean to a int/],
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
//   for (const [scenario, source, graph] of graphChecks) {
//     it(`properly rewrites the AST for ${scenario}`, () => {
//       assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
//     })
//   }
})