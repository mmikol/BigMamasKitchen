import ohm from "ohm-js"

/*
    spread id

    ingredient egg = (@)4,4(@)
    ingredient egg2 = (@)rollOut...egg(@)
    
    el1, el2 = rollOut...egg
    spread will be difficult semantically, can consider not using it
    Done: 
    switch out the -- (name) with what it actually is
        ex: -- addAPinch should be -- if
    | Exp in Stmt so that we can go to 
    store ;) as keyword terminate, then put it where it would be applicable
        otherwise scrap it and delete it where it is now
    * Did we ge rid of degrees?

    Todo: 
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
    Stmt        =  Dec                             -- dec            
                |  Assignment terminate            -- assignment
                |  Call terminate                 -- call
                |  stop terminate                 -- break
                |  serve Exp? terminate         --return
                |  mamaSays Exp terminate           -- print
                |  addAPinch until Exp Block        
                   (orSubstitute until Exp Block)*
                   (dumpLeftovers Block)?          -- ifStatement    
                |  stir until Exp Block      -- while
                |  bake (VarDec | id) until Exp (Increment)? Block --for
                |  Exp terminate    --expression
    Assignment  =  Increment                  -- increment
                |  Var "=" Exp                -- assign
    Increment   =  Var incop             
    Dec         =  FuncDec 
                |  ( VarDec | ArrDec | DictDec ) terminate  -- variable
    VarDec      =  ingredient Type id "=" Exp
    ArrDec      =  ingredient ArrType id "=" Array 
    DictDec     =  ingredient DictType id "=" Dict 
    FuncDec     =  recipe (Type | empty) id Params Block 
    Type        =  spicy 
                |  bitter 
                |  salty
                |  ArrType
                |  DictType
    ArrType     =   ArrType "(@)" 
    			| Type "(@)"	
    DictType    = DictType "[#]" 
                | Type "[#]" 
    Array       =  "(@)" ListOf<Exp, ","> "(@)"   --array
    Dict        =  "[#]" ListOf< DictEl, ","> "[#]" --dict
    DictEl      =  stringlit ":" Exp
    Params      =  "(" ListOf<ParamEl, ","> ")"
    ParamEl     = Type id
    Block       =  "(^-^)~" Stmt* "~(^-^)"
    Exp         =  NonemptyListOf<Exp1, "||"> 
    Exp1        =  NonemptyListOf<Exp2, "&&">
    Exp2        =  Exp3 (relop Exp3)?
    Exp3        =  NonemptyListOf<Exp4, addop>
    Exp4        =  NonemptyListOf<Exp5, mulop>  
    Exp5        =  prefixop? Exp6
    Exp6        =  Literal
                |  Increment
                |  Var
                |  "(" Exp ")"                    -- parens
    Literal     =  empty
                |  boollit
                |  numlit
                |  stringlit
                |  Array
                |  Dict
    Var         =  Var "(@)" Exp "(@)"            -- arraySubscript
                |  Var "[#]" stringlit  "[#]"     -- dictionary 
                |  id
    Call        =  id "(" Args ")"
    Args        =  ListOf<Exp, ",">
    spicy       = "spicy" ~idrest
    bitter      = "bitter" ~idrest
    salty       = "salty" ~idrest
    stop        = "stop" ~idrest
    addAPinch   = "addAPinch" ~idrest
    orSubstitute  = "orSubstitute" ~idrest
    dumpLeftovers = "dumpLeftovers" ~idrest
    raw         = "raw" ~idrest
    cooked      = "cooked" ~idrest
    bake        = "bake" ~idrest
    empty       = "empty" ~idrest
    mamaSays    = "mamaSays" ~idrest
    serve       = "serve" ~idrest
    bland        = "bland" ~idrest
    stir        = "stir" ~idrest
    ingredient  = "ingredient" ~idrest
    recipe      = "recipe" ~idrest
    until       = "until" ~idrest
    terminate   =  ";)" ~idrest
    keyword     =  spicy | addAPinch | stop | dumpLeftovers | bitter | bake
                | serve | empty | stir | cooked | salty | bland | raw 
                | mamaSays | until  | orSubstitute | ingredient | terminate | recipe
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
