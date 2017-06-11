

export namespace map {

    export function identity(x){
        return x
    }
}


export namespace reduce {

    export function latest(a, b){
        return b
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
    export function existential(some){
        return Symbol.for("delete")
    }
}
