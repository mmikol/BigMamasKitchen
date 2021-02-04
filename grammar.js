import ohm from "ohm-js"

/*
    spread id

    ingredient egg = (@)4,4(@)
    ingredient egg2 = (@)rollOut...egg(@)
    
    el1, el2 = rollOut...egg
    spread will be difficult semantically, can consider not using it

    switch out the -- (name) with what it actually is
        ex: -- addAPinch should be -- if
    | Exp in Stmt so that we can go to 
    store ;) as keyword terminate, then put it where it would be applicable
        otherwise scrap it and delete it where it is now
    redo the Exp so that instead of nonempty lists, make it recursive
        ex: Exp1 = Exp1 && Exp2
    do we want a break to be allowed randomly by itself in a program
        consider moving it, look at realhotgirlsscript for ex.
        semantically it can be enforced 
        different groups do break differently
    recommended we expand the rules the normal way with left and right
        associativity instead of the NonemptyListOf since it will make 
        AST trees easier later on
    "(@)" ((id | Literal) ("," (id | Literal))*)? "(@)" ";)"  --array
    do the same for dictionary as with array^
    *can delete CollecDec since it is in Exp so VarDec will cover it*
    !!!types for arrays and dictionaries??? so that each thing is the same!!!
    for Params do ListOf
*/
const BigMamasKitchen = ohm.grammar(String.raw`BigMamasKitchen {
    Program     =  Stmt+
    Stmt        =  Dec        -- dec            
                |  Assignment terminate            -- assignment
                |  Call terminate                 -- call
                |  stop terminate                 -- break
                |  serve Exp? terminate    --return
                |  mamaSays Args terminate         -- print
                |  addAPinch until Exp Block 
                   (orSubstitute until Exp Block)*
                   (dumpLeftovers Block)?              -- ifStatement
                |  stir until Exp Block      -- while
                |  bake (VarDec | id) until Exp (Increment)? Block --for
                |  Exp terminate    --expression
    Assignment  =  Increment                  -- increment
                |  Var "=" Exp                -- assign
    Increment   =  Var incop             
    Dec         =  VarDec terminate  -- variable
                | FuncDec 
    VarDec      =  ingredient Type id "=" Exp 
    FuncDec     =  recipe (Type | void) id Params Block 
    Type        =  boolean 
                |  number 
                |  string
    Collec     =  "(@)" ListOf<Exp, ","> "(@)"   --array
                |  "[#]" (id ":" (id | Literal) ("," id ":" (id | Literal))*)? "[#]"   --dictionary
    Params      =  "(" (Type id ("," Type id)*)? ")"
    Block       =  "(^-^)~" Stmt* "~(^-^)"
    Exp         =  NonemptyListOf<Exp1, "||"> 
    Exp1        =  NonemptyListOf<Exp2, "&&">
    Exp2        =  Exp3 (relop Exp3)?
    Exp3        =  NonemptyListOf<Exp4, addop>
    Exp4        =  NonemptyListOf<Exp5, mulop>  
    Exp5        =  prefixop? Exp6
    Exp6        =  Collec 
                |  Exp7
    Exp7        =  Literal
                |  Increment
                |  Var
                |  "(" Exp ")"                    -- parens
    Literal     =  null
                |  boollit
                |  numlit
                |  stringlit
    Var         =  Var "(@)" Exp "(@)"            -- arraySubscript
                |  Var "[#]" id  "[#]"            -- dictionary 
                |  id
    Call        =  id "(" Args ")"
    Args        =  ListOf<Exp, ",">
    boolean     = "spicy" ~idrest
    number      = "bitter" ~idrest
    string      = "salty" ~idrest
    stop       = "stop" ~idrest
    addAPinch          = "addAPinch" ~idrest
    orSubstitute      = "orSubstitute" ~idrest
    dumpLeftovers        = "dumpLeftovers" ~idrest
    raw       = "raw" ~idrest
    cooked        = "cooked" ~idrest
    bake         = "bake" ~idrest
    null        = "empty" ~idrest
    mamaSays       = "mamaSays" ~idrest
    serve      = "serve" ~idrest
    void        = "bland" ~idrest
    stir       = "stir" ~idrest
    ingredient  = "ingredient" ~idrest
    recipe      = "recipe" ~idrest
    throwIn     = "throwIn " ~idrest
    until       = "until" ~idrest
    degrees     = "degrees" ~idrest
    spread      = "rollOut..." ~idrest
    terminate  =  ";)" ~idrest
    keyword     =  boolean | addAPinch | stop | dumpLeftovers | number | bake
                | serve | null | stir | cooked | string 
                | void | raw | mamaSays | until | degrees | throwIn 
                | orSubstitute | ingredient | spread | terminate
    id          =  ~keyword letter idrest*
    idrest      =  "_" | alnum
    numlit      =  digit+ ("." digit+)? (("E"|"e") ("+"|"-")? digit+)?
    boollit     =  raw | cooked
    h           =  hexDigit
    escape      =  "\\\\" | "\\\"" | "\\'" | "\\n" | "\\t" | hexseq
    hexseq      =  "\\" h h? h? h? h? h? h? h? ";"
    stringlit   =  "\"" (~"\\" ~"\"" ~"\n" any | escape)* "\""
    addop       =  "+" | "-"
    relop       =  "<=" | "<" | "==" | "!=" | ">=" | ">"
    mulop       =  "*" | "/" | "%"
    prefixop    =  ~"--" "-" | "!"
    incop       =  "++" | "--"
    space      :=  "\x20" | "\x09" | "\x0A" | "\x0D" | comment
    comment     =  "--[=]" (any ("\n")?)* "[=]--"  -- multiLine
                | "~(=^‥^)" (~"\n" any)*  -- singleLine
  }`)
