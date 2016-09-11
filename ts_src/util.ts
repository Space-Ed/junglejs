namespace Gentyl{
     export namespace Util
     {
        export function translator(node, translation){
            var translated

            //array?
            if(typeof(node) == "object" && !(node instanceof Array)){
                translated = {};
                for(var k in node){
                    var tval = translation[k]
                    if(typeof(tval)=="function"){
                         //rename to the function name with function value
                         translated[tval.name] = tval(node[k])
                    } if (typeof(tval)== "string"){
                        //rename the leaf
                        translated[tval] = node[k];
                    }else if (tval != undefined){
                         translated[k] = translator(node[k], tval)
                    }else {
                        //dont bother recurring if the translator wont come
                        translated[k] = node[k]
                    }
                }
                return translated
            } else {
                return node
            }
        }

        export function melder(node1, node2, merge=function(a,b){return b}, concatArrays=false):any{
            if(node1 == undefined){
                return node2
            }
            if(node2 == undefined){
                return node1
            }

            if(typeof(node1) != typeof(node2)){
                var errmsg = "Expected melding nodes to be the same type \n"+
                            "type of node1: "+typeof(node1)+"\n"+
                            "type of node2: "+typeof(node2)+"\n"

                throw TypeError(errmsg)
            }
            var melded;
            if(node1 instanceof Array){
                melded = concatArrays ? node1.concat(node2) : merge(node1,node2)
            }
            else if(typeof(node1) == 'object'){
                melded = {}

                //in one or the other
                for(var k in node1){
                    melded[k] = node1[k];
                }

                for(var q in node2){
                    melded[q] = node2[q];
                }

                //in both
                for(var k  in node1){
                    for(var q in node2){
                        if(k == q){
                            melded[k] = melder(node1[k], node2[k], merge, concatArrays)
                        }
                    }
                }
            }
            else{
                // if they are not objects just take the second argument
                melded = merge(node1,node2)
            }
            return melded
        }

        export function isDeepReplica(node1, node2){
            if(typeof(node1) != typeof(node2)){
                return false // nodes not same type
            }
            else if (node1 instanceof Object){
                if(node1 === node2){
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
                        }else if(!isDeepReplica(node1[q], node2[q])){
                                return false; //recursive came up false.
                        }
                    }
                    return true; // no false flag
                }
            } else {
                return (node1 === node2); ///primitive equality
            }
        }

        //merge, when there is a conflict, neither is taken
        export function softAssoc(from, onto){
            for (var k in from){
                onto[k] = melder(from[k], onto[k])
            }
        }

        export function assoc(from, onto){
            for (var k in from){
                onto[k] = melder(onto[k], from[k])
            }
        }

        export function copyObject(object){
            var cp = {};
            assoc(object, cp)
            return cp
        }

        export function applyMixins(derivedCtor: any, baseCtors: any[]) {
            baseCtors.forEach(baseCtor => {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                });
            });
        }
    }
}

module.exports = Gentyl
