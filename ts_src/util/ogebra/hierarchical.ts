import * as f from './primary-functions'
import * as op from './operations'
import * as mnd from './monads'
import * as T from './types'


function mustTerminate(obj1, obj2, q){
    obj1 instanceof Object
}

export function deepMeldF(terminator:T.Terminator, reduce:T.Reducer):(obj1, obj2)=>any{

    function recur(obj1, obj2, q?){

        if(terminator(obj1, obj2, q)){
            return reduce(obj1, obj2, q) //collision
        }else{
            return op.meld(recur)(obj1, obj2)
        }
    }

    return recur
}


export function deepMaskF(terminator:T.Terminator, reduce:T.Reducer):(obj1, obj2)=>any {


    function recur(obj1, obj2, q?){
        return op.mask((innerObj1, innerObj2,q) => {
            if(terminator(innerObj1, innerObj2, q)){
                return reduce(innerObj1, innerObj2, q) //collision
            }else{
                return recur(innerObj1,innerObj2,q)
            }
        })(obj1, obj2)
    }

    return recur
}


export function deepInvertF(terminator, negater):(obj:Object)=>any{
    function recur(obj, q?){

        return op.invert((innerObj, k) => {
            if(terminator(innerObj, undefined, k)){
                return negater(innerObj, k)
            }else{
                return recur(innerObj, k)
            }
        })(obj)
    }

    return recur
}
