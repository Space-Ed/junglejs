import {isVanillaArray, isVanillaObject} from './checks'

function identity(x){
    return x
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
