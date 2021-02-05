import assert from "assert"
import parse from "../src/parser"

const goodPrograms = [
"mamaSays 1+2*3 ;)",
`"oh no" ;)`,
`mamaSays (  	123   ) ;)`,
`mamaSays (2+4)*7 ;)`,
`mamaSays 2 * 3 ;)`,
`ingredient bitter g = 5 * 10 ;)`,
`(@) 3, 4, 5 (@) ;)`,
`8 * 9 + (9 - 5) ;)`,
`bake ingredient bitter egg = 1 until egg < 40 egg++ (^-^)~ 
~(^-^)`,
`serve a + b ;)`,
`recipe bitter Add (bitter a, bitter b) (^-^)~
  serve a + b ;)
~(^-^)`,
`ingredient spicy(@) rawEggs = (@) raw, raw (@) ;)`,
`ingredient spicy(@)(@) boolArrArr = (@) (@)raw(@), (@)raw, cooked(@) (@) ;)`,
`ingredient bitter[#][#] dictDict= 
[#] 
    "key1" : [#] "inner1": 5[#] , 
    "key2" : [#] "inner2": 2[#]  
[#];)`,
`ingredient salty[#] basicDict = [#]  "key" : "value" [#]  ;)`,
]

const badPrograms = [
    `ingredient bitter g = 5 * 10 ;);)`,
    `ingredient spicy(@) = (@) raw, raw (@) ;)`,
    `ingredient salty[#]  bad= [#] "key" [#] ;)`
]

describe("The parser", () => {
    for (const program of goodPrograms){
        it(`recognizes ${program}`, () => {
            assert.ok(parse(program))
        });
    }

    for (const program of badPrograms){
        it(`reject ${program}`, () => {
            assert.ok(!parse(program))
        });
    }
    //can also use landing
})