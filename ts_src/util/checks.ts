

export function ensureArray(sometimes) {
    return (sometimes instanceof Array) ? sometimes : (sometimes != undefined ? [sometimes] : [])
}

export function isPrimative(thing){
    return thing == undefined || typeof(thing) !== 'object';
}

export function isVanillaObject(thing){
    return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing)
}

export function isVanillaArray(thing){
    return thing instanceof Array && Array.prototype == Object.getPrototypeOf(thing)
}

export function deeplyEquals(node1, node2, allowIdentical=true){
    if(typeof(node1) != typeof(node2)){
        return false // nodes not same type
    }
    else if (node1 instanceof Object){
        if(node1 === node2 && !allowIdentical){
            return false // identical object
        }else{
            for (var k in node1){
                if(!(k in node2)){
                    return false; // key in node1 but node node2
                }
            }
            for (var q in node2){
                if(!(q in node1)){
                    return false;// key in node2 and not node1
                }else if(!deeplyEquals(node1[q], node2[q], allowIdentical)){
                        return false; //recursive came up false.
                }
            }
            return true; // no false flag
        }
    } else {
        return (node1 === node2); ///primitive equality
    }
}

export function deeplyEqualsThrow(node1, node2, derefstack?, seen?, allowIdentical=true){
    var derefstack = derefstack || [];
    var seen = seen || []

    //circularity prevention
    if(seen.indexOf(node1) !== -1 || seen.indexOf(node2) !== -1){
        return
    }

    if(typeof(node1) != typeof(node2)){
        throw new Error(`nodes not same type, derefs: [${derefstack}],  node1:${node1} of type ${typeof(node1)}, node2:${node2} of type ${typeof(node2)}`)
    }
    else if (node1 instanceof Object){
        if(node1 === node2 && !allowIdentical){
            throw new Error(`identical object not replica, derefs:[${derefstack}]`)
        }else{
            for (let k in node1){
                if(!(k in node2)){
                    throw new Error(`key ${k} in object1 but not object2, derefs:[${derefstack}]`)
                }
            }
            for (let q in node2){
                if(!(q in node1)){
                    throw new Error(`key ${q} in object2 but not object1, derefs:[${derefstack}]`)// key in node2 and not node1
                }else{
                    deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), seen.concat(node1, node2), allowIdentical)
                }
            }
            return true; // no false flag
        }
    } else if(node1 !== node2){
        throw new Error(`Terminals: "${node1}" and "${node2}" not equal, derefs:[${derefstack}]`)
    }
}

export function isDeepReplica(node1, node2){
    deeplyEquals(node1,node2,false)
}

export function isDeepReplicaThrow(node1, node2){
    deeplyEqualsThrow(node1, node2, undefined, undefined, false)
}
