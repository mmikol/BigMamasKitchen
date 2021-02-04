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
                |  return Exp? terminate         --return
                |  print Args terminate         -- print
                |  if until Exp Block 
                   (elseIf until Exp Block)*
                   (else Block)?              -- ifStatement
                |  while until Exp Block      -- while
                |  for (VarDec | id) until Exp (Increment)? Block --for
                |  Exp terminate    --expression
    Assignment  =  Increment                  -- increment
                |  Var "=" Exp                -- assign
    Increment   =  Var incop             
    Dec         =  VarDec terminate  -- variable
                | FuncDec 
    VarDec      =  var Type id "=" Exp 
    FuncDec     =  func (Type | void) id Params Block 
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
    break       = "stop" ~idrest
    if          = "addAPinch" ~idrest
    elseIf      = "orSubstitute" ~idrest
    else        = "dumpLeftovers" ~idrest
    false       = "raw" ~idrest
    true        = "cooked" ~idrest
    for         = "bake" ~idrest
    null        = "empty" ~idrest
    print       = "mamaSays" ~idrest
    return      = "serve" ~idrest
    void        = "bland" ~idrest
    while       = "stir" ~idrest
    var         = "ingredient" ~idrest
    func        = "recipe" ~idrest
    until       = "until" ~idrest
    incrementer = "degrees" ~idrest
    spread      = "rollOut..." ~idrest
    terminate   =  ";)" ~idrest
    keyword     =  boolean | if | break | else | number | for
                | return | null | while | true | string 
                | void | false | print | until | incrementer  
                | elseIf | var | spread | terminate | func
    id          =  ~keyword letter idrest*
    idrest      =  "_" | alnum
    numlit      =  digit+ ("." digit+)? (("E"|"e") ("+"|"-")? digit+)?
    boollit     =  true | false
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
