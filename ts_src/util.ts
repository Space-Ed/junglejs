namespace Jungle{
     export namespace Util
     {
        export function identity(x){
            return x
        }

        export function weightedChoice(weights:number[]){
            var sum = weights.reduce(function(a,b){return a+b},0)
            var cdfArray = weights.reduce(function(coll, next, i){
               var v = (coll[i-1] || 0)+next/sum
               return coll.concat([v])
            },[])

            var r = Math.random();
            var i = 0;

            //the cdf exceeds r increment
            while(i < weights.length-1 && r > cdfArray[i]){i++}
            return i
        }

        export function range(...args){
            var beg, end, step

            switch(args.length){
                case 1:{
                    end = args[0]; beg=0; step=1
                    break;
                }
                case 2:{
                    end =args[1];beg=args[0];step=1
                    break;
                }
                case 3:{
                    end=args[2];beg=args[0];step=args[1]
                    break;
                }
                default:{
                    end=0;beg=0;step=1
                    break
                }
            }
            var rng = []
            if(beg > end && step < 0){
                for(let i = beg; i > end; i+=step){
                    rng.push(i)
                }
            } else if (beg < end && step > 0){
                for(let i = beg; i < end; i+=step){
                    rng.push(i)
                }
            } else {
                throw new Error("invalid range parameters")
            }
            return rng;
        }

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

        export function deeplyEqualsThrow(node1, node2, derefstack, seen, allowIdentical=true){
            var derefstack = derefstack || [];
            var seen = seen || []

            //circularity prevention
            if(seen.indexOf(node1) || seen.indexOf(node2)){
                return
            }

            if(typeof(node1) != typeof(node2)){
                throw new Error(`nodes not same type, derefs: [${derefstack}]`)
            }
            else if (node1 instanceof Object){
                if(node1 === node2 && !allowIdentical){
                    throw new Error(`identical object not replica, derefs:[${derefstack}]`)
                }else{
                    for (var k in node1){
                        if(!(k in node2)){
                            throw new Error(`key ${k} in object1 but not object2, derefs:[${derefstack}]`)
                        }
                    }
                    for (var q in node2){
                        if(!(q in node1)){
                            throw new Error(`key ${k} in object2 but not object1, derefs:[${derefstack}]`)// key in node2 and not node1
                        }else{
                            deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), allowIdentical)
                        }
                    }
                    return true; // no false flag
                }
            } else if(node1 !== node2){
                throw new Error(`${node1} and ${node2} not equal, derefs:[${derefstack}]`)
            }
        }

        export function isDeepReplica(node1, node2){
            deeplyEquals(node1,node2,false)
        }

        export function isDeepReplicaThrow(node1, node2, derefstack){
            deeplyEqualsThrow(node1, node2, derefstack, null, false)
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

        export function isPrimative(thing){
            return thing == undefined || typeof(thing) !== 'object';
        }

        export function isVanillaObject(thing){
            return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing)
        }

        export function isVanillaArray(thing){
            return thing instanceof Array && Array.prototype == Object.getPrototypeOf(thing)
        }

        export function isTree(thing, stack=[]){
            stack = stack.concat(thing)
            function decirc(proposed){
                if((stack.indexOf(proposed) === -1)){
                    return isTree(proposed, stack)
                } else {
                    return false;
                }
            }
            //recursively check for circularity and set the reduction to false.
            return typeCaseSplitR(decirc, decirc, function(){return true})(thing, true, function(a,b,k){return a && b})
        }

        export function isVanillaTree(thing, stack=[]){

            function decirc(proposed){
                if((isVanillaObject(proposed) || isVanillaArray(proposed) && stack.indexOf(proposed) === -1)){
                    return isVanillaTree(proposed, stack.concat(proposed))
                }else {
                    return false;
                }
            }
            //recursively check for circularity and set the reduction to false.
            return typeCaseSplitR(decirc, decirc, isPrimative)(thing, true, function(a,b,k){return a && b})
        }

        export function typeCaseSplitR(objectOrAllFunction, arrayFunc?, primativeFunc?){
            var ofunc, afunc, pfunc;

            if( primativeFunc == undefined && arrayFunc == undefined){
                ofunc = objectOrAllFunction || identity;
                afunc = objectOrAllFunction || identity;
                pfunc = objectOrAllFunction  || identity;
            } else{
                ofunc = objectOrAllFunction || identity;
                afunc = arrayFunc || identity;
                pfunc = primativeFunc  || identity;
            }

            return function(inThing, initial=null, reductor=function(a,b,k){}){
                var result = initial;
                if(isVanillaArray(inThing)){
                    for (var i = 0; i < inThing.length; i++){
                        var subBundle = inThing[i];
                        result = reductor(result, afunc(subBundle, i), i)
                    }

                }else if(isVanillaObject(inThing)){
                    for (var k in inThing){
                        var subBundle = inThing[k];
                        result = reductor(result, ofunc(subBundle, k), k)
                    }
                }else {
                    result = pfunc(inThing);
                }
                return result
            }
        }

        export function typeCaseSplitF(objectOrAllFunction, arrayFunc?, primativeFunc?){
            var ofunc, afunc, pfunc;

            if( primativeFunc == undefined && arrayFunc == undefined){
                ofunc = objectOrAllFunction || identity;
                afunc = objectOrAllFunction || identity;
                pfunc = objectOrAllFunction  || identity;
            } else{
                ofunc = objectOrAllFunction || identity;
                afunc = arrayFunc || identity;
                pfunc = primativeFunc  || identity;
            }

            return function(inThing){
                var outThing;
                if(isVanillaArray(inThing)){
                    outThing = [];
                    outThing.length = inThing.length;
                    for (var i = 0; i < inThing.length; i++){
                        var subBundle = inThing[i];
                        outThing[i] = afunc(subBundle, i)
                    }

                }else if(isVanillaObject(inThing)){
                    outThing = {}
                    for (var k in inThing){
                        var subBundle = inThing[k];
                        outThing[k] = ofunc(subBundle, k)
                    }
                }else {
                    outThing = pfunc(inThing);
                }
                return outThing

            }
        }

        export function typeCaseSplitM(objectOrAllFunction, arrayFunc?, primativeFunc?){
            var ofunc, afunc, pfunc;

            if( primativeFunc == undefined && arrayFunc == undefined){
                ofunc = objectOrAllFunction || identity;
                afunc = objectOrAllFunction || identity;
                pfunc = objectOrAllFunction  || identity;
            } else{
                ofunc = objectOrAllFunction || identity;
                afunc = arrayFunc || identity;
                pfunc = primativeFunc  || identity;
            }

            return function(inThing){
                if(isVanillaArray(inThing)){
                    for (var i = 0; i < inThing.length; i++){
                        var subBundle = inThing[i];
                        inThing[i] = afunc(subBundle, i)
                    }

                }else if(isVanillaObject(inThing)){
                    for (var k in inThing){
                        var subBundle = inThing[k];
                        inThing[k] = ofunc(subBundle, k)
                    }
                }else {
                    //wont modify primative
                    pfunc(inThing)
                }
            }
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


        export class Gate{
            private locks:boolean[];
            private locki:number;
            private data:any[];

            constructor(public callback?, public context?){
                this.locks = [];
                this.locki = 0;
                this.data = [];
            }

            lock():(arg) => void {
                this.locks[this.locki] = true;

                return (function(locki, arg){

                    if(arg != undefined){
                        this.data = arg;
                    }

                    this.locks[locki] = false;
                    if(this.allUnlocked()){
                        this.callback.call(this.context, this.data);
                    }
                }).bind(this, this.locki++)
            }

            reset(){
                this.locks = [];
                this.locki = 0;
            }

            allUnlocked():boolean{
                return this.locks.filter(function(x){return x}).length === 0;
            }
        }

    }
}
