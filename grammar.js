import ohm from "ohm-js"

const BigMamasKitchen = ohm.grammar(String.raw`BigMamasKitchen {
    Program         =  Stmt+
    Stmt            =  SimpleStmt terminate		                        -- simple
                    |  Dec                                              -- dec            
                    |  addAPinchOf Exp Block        
                        (orSubstitute Exp Block)*
                        (dumpLeftovers Block)?                          -- ifStatement    
                    |  stir until Exp Block                             -- while
                    |  bake (VarDec | id) until Exp (Increment)? Block  -- for
    SimpleStmt      =  Assignment                                       -- assignment
                    |  Call                                             -- call
                    |  stop                                             -- break
                    |  serve Exp?                                       -- return
                    |  mamaSays Exp                                     -- print
                    |  Exp                                              -- expression
    Assignment      =  Increment                                        -- increment
                    |  Var "=" Exp                                      -- assign
    Increment       =  Var incop             
    Dec             =  FuncDec 
                    |  ( VarDec | ArrDec | DictDec ) terminate          -- variable
    VarDec          =  ingredient Type id "=" Exp
    ArrDec          =  ingredient ArrType id "=" Array 
    DictDec         =  ingredient DictType id "=" Dict 
    FuncDec         =  recipe (Type | bland) id Params Block 
    Type            =  spicy 
                    |  bitter 
                    |  salty
                    |  ArrType
                    |  DictType
    ArrType         =  ArrType "(@)" 
    			    |  Type "(@)"	
    DictType        =  DictType "[#]" 
                    |  Type "[#]" 
    Array           =  "(@)" ListOf<Exp, ","> "(@)"                     -- array
    Dict            =  "[#]" ListOf< DictEl, ","> "[#]"                 -- dict
    DictEl          =  stringlit ":" Exp
    Params          =  "(" ListOf<ParamEl, ","> ")"
    ParamEl         =  Type id
    Block           =  "(^-^)~" Stmt* "~(^-^)"
    Exp             =  Exp "||" Exp1                                    -- or
                    |  Exp "&&" Exp1                                    -- and
                    |    Exp1
    Exp1            =  Exp2 relop Exp2                                  -- binary
                    |  Exp2
    Exp2            =  Exp2 addop Exp3                                  -- binary
                    |  Exp3
    Exp3            =  Exp3 mulop Exp4                                  -- binary
                    |  Exp4
    Exp4            =  prefixop Exp5                                    -- unary
                    |  Exp5
    Exp5            =  Exp6 "^" Exp5                                    -- exponential
                    |  Exp6
    Exp6            =  Literal
                    |  Increment
                    |  Var
                    |  "(" Exp ")"                                      -- parens
    Literal         =  empty
                    |  boollit
                    |  numlit
                    |  stringlit
                    |  Array
                    |  Dict
    Var             =  Var "(@)" Exp "(@)"                              -- arraySubscript
                    |  Var "[#]" stringlit  "[#]"                       -- dictionary 
                    |  Call
                    |  id
    Call            =  id "(" Args ")"
    Args            =  ListOf<Exp, ",">
    spicy           = "spicy" ~idrest
    bitter          = "bitter" ~idrest
    salty           = "salty" ~idrest
    stop            = "stop" ~idrest
    addAPinchOf     = "addAPinchOf" ~idrest
    orSubstitute    = "orSubstitute" ~idrest
    dumpLeftovers   = "dumpLeftovers" ~idrest
    raw             = "raw" ~idrest
    cooked          = "cooked" ~idrest
    bake            = "bake" ~idrest
    empty           = "empty" ~idrest
    mamaSays        = "mamaSays" ~idrest
    serve           = "serve" ~idrest
    bland           = "bland" ~idrest
    stir            = "stir" ~idrest
    ingredient      = "ingredient" ~idrest
    recipe          = "recipe" ~idrest
    until           = "until" ~idrest
    terminate       =  ";)" ~idrest
    keyword         =  spicy | addAPinchOf | stop | dumpLeftovers 
                    | bitter | bake | serve | empty | stir | cooked 
                    | salty | bland | raw | mamaSays | until | orSubstitute 
                    | ingredient | terminate | recipe
    id              =  ~keyword letter idrest*
    idrest          =  "_" | alnum
    numlit          =  digit+ ("." digit+)? (("E"|"e") ("+"|"-")? digit+)?
    boollit         =  raw | cooked
    h               =  hexDigit
    escape          =  "\\\\" | "\\\"" | "\\'" | "\\n" | "\\t" | hexseq
    hexseq          =  "\\" h h? h? h? h? h? h? h? ";"
    stringlit       =  "\"" (~"\\" ~"\"" ~"\n" any | escape)* "\""
    addop           =  "+" | "-"
    relop           =  "<=" | "<" | "==" | "!=" | ">=" | ">"
    mulop           =  "*" | "/" | "%"
    prefixop        =  ~"--" "-" | "!"
    incop           =  "++" | "--"
    space           :=  "\x20" | "\x09" | "\x0A" | "\x0D" | comment
    comment         =  "--[=]" (~"[=]--" any)* "[=]--"                    -- multiLine
                    | "~(=^..^)" (~"\n" any)*                              -- singleLine
  }`)
