
/**
 * return the tokens that have an agreeable symbolic matching
 */
export function pairByBinding(result1, result2, hard=false):{tokenA:string, tokenB:string, bindings:{[sym:string]:string}}[]{

    let transA = transposeBindings(result1)
    let transB = transposeBindings(result2)

    let collection = []

    for (let tokenA in transA){
        for (let tokenB in transB){
            let breakpair = false

            let bindingsA = transA[tokenA]
            let bindingsB = transB[tokenB]
            let merged = {}

            for (let symInA in bindingsA){
                let termInA = bindingsA[symInA]
                if(symInA in bindingsB && termInA !== bindingsB[symInA] || (!(symInA in bindingsB) && hard) ){
                    breakpair = true
                }else{
                    merged[symInA] = termInA
                }

            }

            for (let symInB in bindingsB){
                let termInB = bindingsB[symInB]
                if(!(symInB in bindingsA)){
                    if(hard){
                        breakpair = true;
                    }else{
                        merged[symInB] = termInB;
                    }
                }
            }

            if(breakpair) continue;

            collection.push({
                tokenA:tokenA,
                tokenB:tokenB,
                bindings:merged
            })
        }
    }

    return collection
}

/*
    walk the symbol tree creating binding sets for each token,
*/
export function transposeBindings(bindings){

    function recur(bindingTree, collected, current){
        for(let token in bindingTree){
            collected[token] = current
        }

        for (let sym of Object.getOwnPropertySymbols(bindingTree)){
            let terms = bindingTree[sym]
            for(let term in terms){
                let upBind = {};
                if(Symbol.keyFor(sym) in current && current[Symbol.keyFor(sym)] !== term){
                    //we cannot do this bind as it contradicts a prior one,
                    continue
                }

                for (let bsym in current){
                    upBind[bsym] = current[bsym]
                }

                upBind[Symbol.keyFor(sym)] = term;

                let tokens = terms[term]
                recur(tokens, collected, upBind)
            }
        }
        return collected
    }

    return recur(bindings, {}, {})
}
