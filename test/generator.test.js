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
        console.log("Hello world");
      `,
  },
  {
    name: "variable dec",
    source: `
        ingredient spicy po = raw ;)
        ingredient bitter pi = 3.14 ;)
        ingredient salty pe = "pe!" ;)
      `,
    expected: dedent`
        let po_1 = false;
        let pi_2 = 3.14;
        let pe_3 = "pe!";
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
  {
    name: "and expression",
    source: `
        recipe spicy And (spicy a, spicy b) (^-^)~
          serve a && b ;)
        ~(^-^)
      `,
    expected: dedent`
        function And_1(a_2, b_3) {
          return (a_2 && b_3);
        }
      `,
  },
  {
    name: "or expression",
    source: `
        recipe spicy Or (spicy a, spicy b) (^-^)~
          serve a || b ;)
        ~(^-^)
      `,
    expected: dedent`
        function Or_1(a_2, b_3) {
          return (a_2 || b_3);
        }
      `,
  },
  {
    name: "basic arrays",
    source: `
      ingredient spicy(@) rawEggs = (@)raw, raw(@) ;)
      ingredient salty(@) emptyArr = (@ salty @) ;)
      mamaSays rawEggs(@)0(@) ;)
      mamaSays emptyArr ;)
    `,
    expected: dedent`
        let rawEggs_1 = [false, false];
        let emptyArr_2 = [];
        console.log(rawEggs_1[0]);
        console.log(emptyArr_2);
      `,
  },
  {
    name: "declaring 2D array",
    source: `ingredient spicy(@)(@) rawEggs2 = (@) (@) cooked, cooked (@), (@) raw, cooked (@) (@) ;)`,
    expected: dedent`let rawEggs2_1 = [[true, true], [false, true]];`,
  },
  {
    name: "Can access element of 2D Array",
    source: `ingredient bitter(@)(@) doubleArray = (@) (@)1,2,3(@), (@)4,5,6(@) (@) ;)
    mamaSays doubleArray(@)1(@)(@)2(@) == 6 ;)`,
    expected: dedent`let doubleArray_1 = [[1, 2, 3], [4, 5, 6]];
    console.log((doubleArray_1[1][2] === 6));`,
  },
  {
    name: "Can access values from 2D dictionary",
    source: `ingredient salty[#][#] dictionary = [#]
    "key1": [#]"key2": "value"[#]
    [#] ;)
    mamaSays dictionary[#]"key1"[#][#]"key2"[#] ;)`,
    expected: dedent`
    let dictionary_1 = new Map(["key1", new Map(["key2", "value"])]);
    console.log(dictionary_1["key1"]["key2"]);
    `,
  },
  // {
  //   name: "even or odd",
  //   source: `
  //     recipe spicy evenOdd (bitter a) (^-^)~
  //       serve a % 2 == 0 ;)
  //     ~(^-^)
  //   `,
  //   expected: dedent`
  //     function evenOdd (a_1) {
  //       return a_1 % 2 == 0;
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
