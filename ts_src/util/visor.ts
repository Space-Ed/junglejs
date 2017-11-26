

export function createVisor (target, visorConfig){
    let visor = {}
    
    for (let k in visorConfig){
        let v = visorConfig[k]
        
        if(v instanceof Function){ //create an entry for the specific user
            visor[k] = v(k, target) ;
        }else if(v instanceof Object){
            visor[k] = createVisor(target[k], v)
        }else if(v){
            let tk = typeof v == 'string'?v:k

            if(target[tk] instanceof Function){
                visor[k] = target[tk].bind(target)
            }else{
                //primarily route properties back
                Object.defineProperty(visor, k, {
                    get:()=>{
                        return target[tk]
                    }
                })
            }
        }else {
            // null, false, wtf, 
        }

    }

    return visor
}