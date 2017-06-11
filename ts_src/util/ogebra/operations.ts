
import * as T from './types'

export function meld(reduce:T.Reducer):(obj1:Object, obj2:Object)=>Object{

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

                melded[k] = reduce(obj1[k], obj2[k], k) //collision
            }else{
                melded[k] = obj2[k];
            }
        }

        return melded
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
                masked[k] = reduce(obj1[k], obj2[k], k)
            }
        }

        return masked
    }

}


export function invert(negate:(a:any, k:string)=>any):(obj:Object)=>Object{
    return function(obj:Object):Object{
        let inverted = {}

        let keys = Object.keys(obj)

        for(let k of keys){
            inverted[k] = negate(obj[k], k)
        }

        return inverted
    }

}
