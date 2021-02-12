export class Program {
    constructor(statements){
        this.statments = statements
    }
}

export class FunctionDeclaration{
    constructor(name, parameters, body){
        Object.assign(this, {name, parameters, body})
    }
}

export class VariableDeclaration{
    constructor(variables, initializers){
        Object.assign(this, {variables, initializers})
    }
}

export class Parameter{
    constructor(name, type){
        Object.assign(this, {name, type})
    }
}

export class Assignment{
    constructor(targets, sources){
        Object.assign(this, {targets, sources})
    }
}

export class ForLoop{
    constructor(iterator, range, body){
        Object.assign(this, {iterator, range, body})
    }
}

export class WhileLoop{
    constructor(test, body){
        Object.assign(this, {test, body})
    }
}

export class PrintStatement{
    constructor(arguement){
       this.arguement = arguement
    }
}

export class Break{
}

export class Return{
    constructor(returnValue){
        this.returnValue = returnValue
    }
}

