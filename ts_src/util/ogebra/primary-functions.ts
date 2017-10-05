

export namespace map {

    export function identity(x){
        return x
    }
}


export namespace reduce {

    export function latest(a, b){
        return b
    }

    export function foremost(a, b){
        return a
    }

    export function negateEqual(a, b){
        if(a === b){
            return Symbol.for('delete')
        }else{
            return a
        }
    }
}

export namespace scan {

    export function enumerable(obj) {
        return Object.keys(obj)
    }
}

export namespace terminate {

    export function isPrimative(test, obj2, key){
        return  !(test instanceof Object)
        // return Object.getPrototypeOf(test) !== Object
    }

}

export namespace negate {
    export function existential(some, key?){
        return Symbol.for("delete")
    }
}
