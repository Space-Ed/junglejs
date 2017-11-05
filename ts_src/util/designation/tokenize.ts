import {Scan} from './scanning'

export function tokenize<T>(scanned:Scan<T>):{[token:string]:T}{
    let recur = function (dtree: Scan<T>, tokens, chain, symhead?) {
        let insymhead = symhead || tokens

        //mark the symbols so that recursion and termination can carry new sym head or add terminal respectively
        //possibly it is an issue that the same symbol could theoretically bind to the terminal and group at once
        let marked = {}
        for (let s of Object.getOwnPropertySymbols(dtree.bindings)) {
            insymhead[s] = insymhead[s] || {};
            let terms = dtree.bindings[s];
            for (let term of terms) {
                insymhead[s][term] = insymhead[s][term] || {};
                marked[term] = s
            }
        }

        for (let k in dtree.terminals) {
            let v = dtree.terminals[k];
            let token = chain + ':' + k
            tokens[token] = v;

            if (k in marked) {
                insymhead[marked[k]][k][token] = v
            } else {
                insymhead[token] = v
            }
        }

        for (let k in dtree.groups) {
            let v = dtree.groups[k];
            let lead = chain === '' ? chain : chain + '.'

            let recsymhead;
            if (k in marked) {
                recsymhead = insymhead[marked[k]][k]
            } else {
                recsymhead = insymhead
            }

            recur(v, tokens, lead + k, recsymhead);
        }


        return tokens
    }

    return recur(scanned, {}, '')
}