import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
//import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "print",
    source: `
        mamaSays "Hello world";)
      `,
    expected: dedent`
        console.log("Hello world")
      `,
  },
  {
    name: "sum",
    source: `
        recipe bitter Add (bitter a, bitter b) (^-^)~
          serve a + b ;)
        ~(^-^)
      `,
    expected: dedent`
        function Add_1(a_2, b_3) {
          return (a_2 + b_3);
        }
      `,
  },
  // {
  //   name: "and expression",
  //   source: `
  //       recipe spicy And (spicy a, spicy b) (^-^)~
  //         serve a && b ;)
  //       ~(^-^)
  //     `,
  //   expected: dedent`
  //       function And_1 (a_1, b_2) {
  //         return a_1 && b_2
  //       }
  //     `,
  // },
  // {
  //   name: "or expression",
  //   source: `
  //       recipe spicy Or (spicy a, spicy b) (^-^)~
  //         serve a || b ;)
  //       ~(^-^)
  //     `,
  //   expected: dedent`
  //       function Or_1 (a_1, b_2) {
  //         return a_1 || b_2
  //       }
  //     `,
  // },

  // {
  //   name: "array",
  //   source: `
  //     ingredient spicy(@) rawEggs = (@)raw, raw(@) ;)
  //     mamaSays rawEggs(@)0(@) ;)
  //   `,
  //   expected: dedent`
  //       const rawEggs = [false, false];
  //       console.log(rawEggs[0]);
  //     `,
  // },
  // {
  //   name: "even or odd",
  //   source: `
  //     recipe spicy evenOdd (bitter a) (^-^)~
  //       serve a % 2 == 0 ;)
  //     ~(^-^)
  //   `,
  //   expected: dedent`
  //     function evenOdd (a_1) {
  //       return a_1 % 2 == 0
  //     }
  //   `,
  // },
  // {
  //   name: "dictionary access",
  //   source: `
  //     ingredient bitter[#] rollCake = [#]"strawberry": 0,"sugar": 1,"cake": 2[#] ;)
  //     ingredient bitter fruit = rollCake[#]"strawberry"[#] ;)
  //     fruit = rollCake[#]"cake"[#] ;)
  //     `,
  //   expected: dedent`
  //     let rollCake_1 = { "strawberry":0, "sugar":1, "cake":2 };
  //     let fruit_2 = rollCake_1["strawberry"];
  //     fruit_2 = rollCake_1["cake"];
  //   `,
  // },
  // {
  //   name: "dictionary of dictionary",
  //   source: `
  //   ingredient bitter[#][#] dictDict=
  //   [#]
  //   "key1" : [#] "inner1" : 5 [#] ,
  //   "key2" : [#] "inner2" : 2 [#]
  //   [#] ;)
  //   `,
  //   expected: dedent`
  //   let dictDict_1={
  //       "key1": { "inner1":5, },
  //       "key2": { "inner2":2, },
  //   };
  //   `,
  // },
  // {
  //   name: "while loop",
  //   source: `
  //     stir until cooked (^-^)~
  //       mamaSays "infinite loop baby" ;)
  //     ~(^-^)
  //     `,
  //   expected: dedent`
  //       while (true) {
  //           console.log("infinite loop baby")
  //       }
  //   `,
  // },
  // {
  //   name: "for loop",
  //   source: `
  //   bake ingredient bitter egg = 1 until egg < 40 egg++ (^-^)~
  //      mamaSays egg ;)
  //    ~(^-^)
  //   `,
  //   expected: dedent`
  //     for (let egg_1 = 1; egg_1 < 40; egg++) {
  //         console.log(egg)
  //     }
  //   `,
  // },
  // {
  //   name: "gcd",
  //   source: `
  //     recipe bitter gcd (bitter a, bitter b) (^-^)~
  //       addAPinchOf a < 0 (^-^)~
  //         a = -1 * a ;)
  //       ~(^-^)

  //       addAPinchOf (b < 0) (^-^)~
  //         b = -1 * b ;)
  //       ~(^-^)

  //       addAPinchOf b > a (^-^)~
  //         ingredient bitter temp = a ;)
  //         a = b ;)
  //         b = temp ;)
  //       ~(^-^)

  //       stir until cooked (^-^)~

  //         addAPinchOf b == 0 (^-^)~
  //           serve a ;)
  //         ~(^-^)

  //         a = a % b ;)

  //         addAPinchOf a == 0 (^-^)~
  //           serve b ;)
  //         ~(^-^)

  //         b = b % a ;)
  //       ~(^-^)
  //     ~(^-^)
  //   `,
  //   expected: dedent`
  //     function gcd(a_1, b_2) {
  //       a_1 = Math.abs(a_1);
  //       b_2 = Math.abs(b_2);
  //       if (b_2 > a_1) {var temp = a_1; a_1 = b_2; b_2 = temp}
  //       while (true) {
  //         if (b_2 === 0) return a_1
  //         a_1 %= b_2
  //         if (a_1 === 0) return b_2
  //         b_2 %= a_1
  //       }
  //      }
  //   `,
  // },
  // {
  //   name: "comments",
  //   source: `
  //   --[=] Include more sugar
  //   if you want to
  //   lol
  //   [=]--
  //   ~(=^..^) We love Big Mama`,
  //   expected: "",
  // },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
