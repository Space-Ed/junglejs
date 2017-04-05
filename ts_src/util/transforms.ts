namespace Jungle {

    export namespace Util {

        export function identity(x){
            return x
        }

        export function collapseValues(obj):any[]{

            if(!isVanillaTree(obj)){
                throw new Error("cant collapse circular structure")
            }

            let valArr = [];

            function nodeProcess(node){
                valArr.push(node);
            }

            function recursor(node:any){
                typeCaseSplitF(recursor, recursor, nodeProcess)(node);
            }

            recursor(obj)

            return valArr

        }

        /*
            translate an object into a new object with different names
        */
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


        /*
            merge trees recursively bearing similar properties
            by default the second argument takes precedence in terminal values
        */
        export function melder(node1, node2, merge=function(a,b){return b}, concatArrays=false, typeConstrain=true):any{
            if(node1 == undefined){
                return node2
            }
            if(node2 == undefined){
                return node1
            }

            if(typeConstrain && (typeof(node1) != typeof(node2))){
                var errmsg = "Expected melding nodes to be the same type \n"+
                            "type of node1: "+typeof(node1)+"\n"+
                            "type of node2: "+typeof(node2)+"\n"

                throw TypeError(errmsg)
            }

            var melded;
            if(node1 instanceof Array){
                return concatArrays ? node1.concat(node2) : merge(node1,node2)
            }else if(typeof(node1) == 'object'){
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
                            if(node1[k] == node2[k]){
                                melded[k] = node1[k] //co-contained
                            }else{
                                melded[k] = melder(node1[k], node2[k], merge, concatArrays) //collision
                            }
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


        //merge, when there is a conflict, neither is taken
        export function softAssoc(from, onto){
            for (var k in from){
                onto[k] = melder(from[k], onto[k])
            }
        }

        export function parassoc(from, onto){
            for (var k in from){
                onto[k] = melder(onto[k], from[k], function(a,b){
                    return [a,b]
                }, true)
            }
        }

        export function assoc(from, onto){
            for (var k in from){
                onto[k] = melder(onto[k], from[k])
            }
        }

        export function deepCopy<T>(thing:T):T{
            return typeCaseSplitF(deepCopy, deepCopy)(thing)
        }

        export function applyMixins(derivedCtor: any, baseCtors: any[]) {
            baseCtors.forEach(baseCtor => {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                });
            });
        }

        export function objectArrayTranspose(objArr:any, key:string){
            var invert;

            if(typeof(key) !== 'string'){
                throw new Error("Value error: key must be string literal")
            }

            if(isVanillaArray(objArr)){
                invert = {};
                (<Array<any>>objArr).forEach(function(value, index){
                    invert[<string>value[key]] = value;
                })
            }else if(isVanillaObject(objArr)){
                invert = [];
                for (var k in objArr){
                    var obj = objArr[k];
                    obj[key] = k;
                    invert.push(obj);
                }
            }else{
                throw new Error("Value error: can only transpose object and array literals")
            }
        }

        export function flattenObject(obj, depth=-1, values=[]) {

            for(let k in obj){
                let v = obj[k];
                if(isVanillaObject(v) && (depth >= 0 || depth >= -1)){
                    flattenObject(v, depth -1, values);
                }else{
                    values.push(v);
                }
            }
            return values;
        }

        export function mapObject(obj, func:(key, value)=>any){
            let mapped = {};

            for(let k in obj){
                let v = obj[k];
                mapped[k] = func(k, v);
            }
            return mapped
        }

        /*
            only take the selected keys of the object

            eg.
                ({a:0, b:1}, ['a']) => {a:0}
                ([a,b,c], [1,2])=> [b,c]

        */
        export function projectObject(obj, keys){
            if(obj instanceof Object){
                let result;

                if(obj instanceof Array){
                    result = [];
                    for(let k of keys){
                        if(k in obj){
                            result.push(obj[k])
                        }
                    }
                }else{
                    result = {};
                    for(let k of keys){
                        if(k in obj){
                            result[k] = obj[k]
                        }
                    }
                }

                return result
            }else{
                return obj
            }
        }

    }

}
