import {DesignatorIR, TokenIR, parseTokenSimple, compileToken, DTerm} from './parsing'


export function matchDesignationTerm(target:string, term:DTerm): {sym?:symbol, val?:string} {
    if (typeof (term) == 'string') {
        return {val:target === term?target:undefined}
    } if (term instanceof Function) {
        return term(target)
    } else if (term instanceof RegExp) {
        let m = target.match(term)
        return {val:m?m[0]:undefined}
    } else {
        throw new Error("Jungle Internal Error: Invalid DTerm")
    }
}

function mergeBindings(bindings1, bindings2) {

    if (!bindings1) return bindings2;
    if (!bindings2) return bindings1;

    let merged = {}

    for (let sym of Object.getOwnPropertySymbols(bindings1 || {})) {
        let bound = bindings1[sym]
        merged[sym] = bound;
    }

    for (let sym of Object.getOwnPropertySymbols(bindings2 || {})) {
        let bound = bindings2[sym]
        let resolved
        //if COLLIDE
        if ((sym in merged)) {
            let existing = merged[sym];
            if (typeof bound === 'string' && typeof existing === 'string') {
                //both terminal
                if (merged[sym] === bindings2[sym]) {
                    resolved = bound;
                } else {
                    //UNMATCHING NOT ALLOWED
                    delete merged[sym]
                }
            } else if (typeof bound === 'object' && typeof existing === 'object') {
                resolved = mergeBindings(merged[sym], bound)
            } else {
                throw new Error(`Invalid Designation: binding ${bound} is of different type to binding ${existing}`)
            }
        } else {
            resolved = bindings2[sym]
        }
        merged[sym] = resolved
    }

    for(let token in bindings1){
        merged[token] = bindings1[token];
    }

    for (let token in bindings2) {
        merged[token] = bindings2[token];
    }

    return merged
}

function _matches(designatorIR:DesignatorIR, tokenIR:TokenIR,  ti, di) {
    let [tgroup, tend] = tokenIR

    /**
     * double scan recursively, stepping forward as terms are paired and maintaining a tree of bindings
     * E | sym -> matched -> E
     *   | complete_token
     */

    let tAtEnd = ti === tgroup.length, dAtEnd = di === designatorIR.groups.length;

    let tokenDTerm = tAtEnd ? tend : tgroup[ti];
    let dTerm = dAtEnd ? designatorIR.end : designatorIR.groups[di];

    if (tAtEnd !== dAtEnd){
        //the odd tail globbing case means we skip past the glob to check the final token
        if(di === designatorIR.groups.length-1 && dTerm === '**'){
            return _matches(designatorIR, tokenIR, ti, di+1)
        }else{
            return false;
        }
    } 

    let {val:tmatch, sym} = matchDesignationTerm(tokenDTerm, dTerm)

    if (tmatch || dTerm == '**') {
        //true, regex match or [sym, bind]
        let boundval;
        if (dAtEnd) {
            //terminal bindings for symbolization
            boundval = {}
            boundval[compileToken(tokenIR)] = null
        } else {
            //handle globbing
            if (dTerm === '**') {
                //recur with both di && di+1 if either is a match
                let patient = _matches(designatorIR, tokenIR, ti + 1, di)
                let eager = _matches(designatorIR, tokenIR, ti + 1, di + 1)
                boundval = mergeBindings(patient, eager)
            } else {
                boundval = _matches(designatorIR, tokenIR, ti + 1, di + 1)
            }
        }

        if (sym) {
            let binding = {}, sbind = {};
            sbind[tmatch] = boundval;
            binding[sym] = sbind;
            return binding
        } else {
            return boundval
        }
    } else {

        return false
    }
}

export function matches(designator:DesignatorIR, token:TokenIR):any{
    let m = _matches(designator, token, 0, 0);
    return m
}