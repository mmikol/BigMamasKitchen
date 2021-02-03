import ohm from "ohm-js";

/*
    spread id

    ingredient egg = (@)4,4(@)
    ingredient egg2 = (@)rollOut...egg(@)
    
    el1, el2 = rollOut...egg
*/
const BigMamasKitchen = ohm.grammar(String.raw`BigMamasKitchen {
    Program     =  Stmt+
    Stmt        =  Dec                        -- declaration
                |  Assignment ";)"            -- assignment
                |  Call ";)"                  -- call
                |  break ";)"                 -- stop
                |  return Exp? ";)"           -- serve
                |  print Args ";)"            -- mamaSays
                |  if until Exp Block 
                   (elseIf until Exp Block)*
                   (else Block)?              -- addAPinch
                |  while until Exp Block      -- stir
                |  for (VarDec | id) until Exp (degrees Increment)? Block --bake 
    Assignment  =  Increment                  -- increment
                |  Var "=" Exp                -- plain
    Increment   =  Var incop                  -- postfix
    Dec         =  VarDec | FuncDec | CollecDec
    VarDec      =  ingredient Type id "=" Exp ";)"
    CollecDec   =  ingredient id = "(@)" ((id | Literal) ("," id | Literal)*)? "(@)" ";)"  --array
                |  ingredient id = "[#]" (id ":" (id | Literal) ("," id ":" (id | Literal))*)? "[#]" ";)"   --dictionary
    FuncDec     =  recipe (Type | void) id throwIn Params Block 
    Type        =  boolean 
                |  number 
                |  string
    Params      =  (Type id ("," Type id)*)?
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
    Literal     =  null
                |  boollit
                |  numlit
                |  stringlit
    Var         =  Var "(@)" Exp "(@)"            -- arraySubscript
                |  Var "[#]" id  "[#]"            -- dictionary 
                |  Call
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
    ingredient  = "ingredient" ~idrest
    recipe      = "recipe" ~idrest
    throwIn     = "throwIn " ~idrest
    until       = "until" ~idrest
    degrees     = "degrees" ~idrest
    spread      = "rollOut..." ~idrest
    keyword     =  boolean | if | break | else | number | for
                | return | char | null | while | true | string 
                | void | false | print | until | degrees | throwIn 
                | elseIf | ingredient | spread
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
  }`);
