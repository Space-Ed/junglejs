
import * as T from './types'

export function meld(reduce:T.Reducer):(obj1:Object, obj2:Object)=>any{

    return function(obj1:Object, obj2:Object):Object{
        let melded = {}
        let keys1 = Object.keys(obj1)
        let keys2 = Object.keys(obj2)

        //in one or the other
        for(let k of keys1){
            if(!(k in obj2)){
                melded[k] = obj1[k]
            }
        }

        for(let k of keys2){
            if((k in obj1)){
                if(obj1[k] === Symbol.for('delete') || obj2[k] === Symbol.for('delete')){
                    continue;
                }
                let reduced = reduce(obj1[k], obj2[k], k)
                if(reduced !== Symbol.for('delete')) melded[k] = reduced;
            }else{
                melded[k] = obj2[k];
            }
        }

        return melded
    }
}

export function safeMeld(reduce: T.Reducer): (obj1: any, obj2: any) => any {

    const omeld = meld(reduce)

    return function (obj1: any, obj2: any): any {
        if (obj1 instanceof Object && obj2 instanceof Object){
            return omeld(obj1,obj2)
        }else{
            if(obj1 == undefined){  //absolute pull of void
                return obj2
            }

            if(obj2 == undefined){  //obj1 is undisturbed
                return obj1
            }

            if(obj1 == Symbol.for('delete')){ //the only obj1 trump
                return obj1
            }else{
                return obj2 //the otherwise override
            }
        }


    }
}

export function mask(reduce:T.Reducer):(obj1:Object, obj2:Object)=>Object{

    return function(obj1:Object, obj2:Object):Object{
        let masked = {}
        let keys1 = Object.keys(obj1)

        for(var k of keys1){
            if(k in obj2){
                if(obj1[k] === Symbol.for('delete') || obj2[k] === Symbol.for('delete')){
                    continue;
                }
                let reduced = reduce(obj1[k], obj2[k], k)
                if(reduced !== Symbol.for('delete')) masked[k] = reduced;
            }
        }

        return masked
    }

}

export function define(reducer:T.Reducer):(obj:Object, prop:PropertyKey, val:any)=>any{
    return function(obj:Object, prop:PropertyKey, val:any):Object{
        let assoced = {}
        assoced[prop] = val;
        return meld(reducer)(obj, assoced)
    }
}

export function invert(negate:(a:any, k:string)=>any):(obj:Object)=>any{
    return function(obj:Object):Object{
        let inverted = {}

        let keys = Object.keys(obj)

        for(let k of keys){
            inverted[k] = negate(obj[k], k)
        }

        return inverted
    }

}
