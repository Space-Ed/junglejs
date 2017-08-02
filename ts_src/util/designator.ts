import {deepMeldF, deepInvertF} from './ogebra/hierarchical'
import {meld, invert} from './ogebra/operations'
import * as f from './ogebra/primary-functions'
import {dumpToDepthF as dump, logdump} from './debug'

export declare type DTerm = RegExp|Function|"**"|string;

export interface DesignatorIR {
    groups:DTerm[]
    end:DTerm
}

interface RecurState {
    thumb:number,
    glob:boolean
}

export const DSetExp = "(?:\\*|\\{\\w+(?:\,\\w+)*\\})?"
export const DSymBindingExp = `(?:\\w+#${DSetExp})`
export const DSymBindingParse = `(?:(\\w+)#(${DSetExp}))`

export const DTermExp = `(?:\\w+|\\*|${DSymBindingExp})`
export const DGroupExp = `(?:\\w+|\\*{1,2}|${DSymBindingExp})`

export const DTotalExp = new RegExp(`^(${DGroupExp}(?:\\.${DGroupExp})*)?\\:(${DTermExp})$`);

export function parseDesignatorString(desigstr:string):DesignatorIR{

    let [groups, terminal] = splitDesignatorString(desigstr)

    let groupTerms:DTerm[] = groups.map((value, index)=>{
        return parseDTerm(value);
    })

    return {
        groups:groupTerms,
        end:parseDTerm(terminal)
    }
}

function splitDesignatorString(desigstr):[string[], string]{
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(DTotalExp);

    if(colonSplit === null){
        throw new SyntaxError("Incorrect syntax on designator " + desigstr)
    }else{
        var [total, chain, terminal] = colonSplit
    }

    let groupLex:string[] = chain?chain.split(/\./):[];
    return [groupLex, terminal]
}

export function parseDSet(DSetExp:string):(checkMember)=>boolean {
    return checked => true
}

/**
 * convert globs to regex to use as the designator
 */
export function parseDTerm(term:string):DTerm{
    //TODO:case for symbolic match
    if(term=='*'){
        return /.*/
    }else if(term=='**'){
        return '**'
    }else if(term!==undefined && term.match(DSymBindingExp)){
        let match = term.match(DSymBindingParse)
        let set = parseDSet(match[2])
        let sym = match[1]
        return function(exp){
            if (set(exp)){
                return [Symbol.for(sym), exp]
            }
        }
    }else{
        return new RegExp(`\^${term}\$`)
    }
}



/**create a regex that will o*/
export function designatorToRegex(desigstr){
    let [subranedesig, terminal] = splitDesignatorString(desigstr)

    let regex = ''

    for (let i = 0; i < subranedesig.length; i++) {
        let term = subranedesig[i], first=i===0, last=i===subranedesig.length-1;

        if(term == '*'){
            regex += first?'^(\\w+)':'\.\\w+'
        }else if(term == '**'){
            regex += first?'^(\\w+(\.\\w+)*?)?':'(\.\\w+)*'
        }else{
            regex += first?`^${term}`:`\.${term}`
        }
    }

    regex += `:${terminal=='*'?'(\\w+)':terminal}$`

    return new RegExp(regex)
}

export function matchDesignationTerm(target, term):any{
    if(typeof(term) == 'string'){
        return target === term
    }if(term instanceof Function){
        return term(target)
    }else if(term instanceof RegExp){
        return target.match(term)
    }else{
        return target.match(parseDTerm(term))
    }
}

/**
 * The designator is like a regular expression for complex tree structures.
 * It always uses the pattern of two step trees where the terminals and groups are kept in
 * distinct objects.
 */
export class Designator {

    designatorIR:DesignatorIR;
    regex:RegExp;
    expression:string;
    screens:Designator[];

    constructor(private groupName:string, private finalName:string, designatorExp:string){

        let desExp = this.autoColon(designatorExp)

        this.designatorIR = parseDesignatorString(desExp);
        this.regex = designatorToRegex(desExp);
        this.expression = desExp;
        this.screens = [];
    }

    autoColon(designatorExp:string):string{
       if(designatorExp.match(/^[a-z0-9A-Z_\$]+$/)){
           return ":"+designatorExp
       }else{
           return designatorExp
       }
    }

    getLocale():string{
        //match structural consistency with xxx.xxx... ...xxx:ppp
        let colonSplit = this.expression.match(DTotalExp);
        return colonSplit[1]||""
    }

    getTerminal():string{
        let colonSplit = this.expression.match(DTotalExp);
        return colonSplit[2]
    }

    mergePaths(patha, pathb){
        let merged = {
            groups:{},
            end:{},
            bindings:{}
        }

        for (let sym of Object.getOwnPropertySymbols(patha.bindings||{})){
            merged.bindings[sym] = patha.bindings[sym]
            console.log('merged binding to sym: ', sym)
        }

        for (let sym of Object.getOwnPropertySymbols(pathb.bindings||{})){
            if(merged.bindings[sym]){
                merged.bindings[sym] = merged.bindings[sym].concat(pathb.bindings[sym])
            }else{
                merged.bindings[sym] = pathb.bindings[sym]
            }

        }

        for (let k in patha.groups||{}){
            if(k in pathb.groups){
                merged.groups[k] = this.mergePaths(patha.groups[k], pathb.groups[k])
            }else{
                merged.groups[k] = patha.groups[k]
            }
        }
        for (let k in pathb.groups||{}){
            if(!(k in patha.groups)){
                merged.groups[k] = pathb.groups[k]
            }
        }

        for (let k in patha.end||{}){
            merged.end[k] = patha.end[k]
        }

        for (let k in pathb.end||{}){
            merged.end[k] = pathb.end[k]
        }

        return merged
    }

    treeDesignate(target, negative=false){

        let result = this._treeDesignate(target, {thumb:0, glob:false})

        //prune the tree with the screen

        for(let screen of this.screens){
            let dmask = screen._treeDesignate(result, {thumb:0, glob:false})

            let term = (obj1: Object, obj2: Object, k: string) => {return k === 'end' || k ==='bindings'}
            let endmask = meld((a,b)=> {return a})
            let endinvert = invert(f.negate.existential)

            let inv = deepInvertF(term, endinvert)(dmask)

            result = deepMeldF(term, endmask)(result, inv)
        }


        return result

    }

    private _treeDesignate(target, recurState:RecurState){
        let rState = recurState
        let collected = {
            groups:{},
            end:{},
            bindings:{}
        }

        let terminal = false;

        let groups = this.designatorIR.groups;
        let end = this.designatorIR.end;

        let current = groups[rState.thumb];

        if(current !== undefined){
            //then we have a group designator
            if(current === "**"){
                //then begin globbing, consuming the glob
                rState.glob = true;

                if(rState.thumb === groups.length-1){ //final position glob;
                    terminal = true;
                }else{
                    rState.thumb += 1;
                    current = groups[rState.thumb];
                }

            }

            let collectedSubs = [];
            for (let mk in target[this.groupName]){
                let subgroup = target[this.groupName][mk];

                //designate subgroups
                let tmatch = matchDesignationTerm(mk, current)
                if(tmatch){
                    if(typeof tmatch[0] === 'symbol'){
                        //create an array of all the matches at this level
                        collected.bindings[tmatch[0]] = collected.bindings[tmatch[0]]||[]
                        collected.bindings[tmatch[0]].push(tmatch[1])
                    }

                    let proceedwithoutGlob = {thumb:rState.thumb+1, glob:false};
                    let eager= this._treeDesignate(subgroup, proceedwithoutGlob)

                    //possibility of using term again
                    if(rState.glob){
                        let keepWithGlob = {thumb:rState.thumb, glob:true}
                        let patient = this._treeDesignate(subgroup, keepWithGlob)
                        collected.groups[mk] = this.mergePaths(eager, patient)
                    }else{
                        collected.groups[mk] = eager;
                    }

                }else if(rState.glob){
                    //glob matched dont increment and keep globbing
                    let rUpdate = {thumb:rState.thumb, glob:true};
                    collected.groups[mk] = this._treeDesignate(subgroup, rUpdate);
                }
            }
        }else{
            terminal=true;
        }

        //either we are out of derefs or we are tail globbing
        if (terminal){ // terminal
            let terminalsHere = target[this.finalName]

            for(let tlabel in terminalsHere){
                let t = terminalsHere[tlabel];
                let tmatch = matchDesignationTerm(tlabel, end)
                if(tmatch){
                    if(typeof tmatch[0] === 'symbol'){
                        collected.bindings[tmatch[0]] = collected.bindings[tmatch[0]]||[]
                        collected.bindings[tmatch[0]].push(tmatch[1])
                    }
                    collected.end[tlabel] = t;
                }
            }
        }

        return collected;
    }

    flatDesignate(target:any):any{

        let recur = function(dtree, collection){

            for(let k in dtree.end){
                let v = dtree.end[k];
                collection.push(v);
            }
            for(let k in dtree.groups){
                let v = dtree.groups[k];
                recur(v, collection);
            }
        }

        return recur(this.treeDesignate(target), [])

    }

    tokenDesignate(target:any){
        let recur = function(dtree, tokens, chain, symhead?){
            let insymhead = symhead || tokens

            //mark the symbols so that recursion and termination can carry new sym head or add terminal respectively
            //possibly it is an issue that the same symbol could theoretically bind to the terminal and group at once
            let marked = {}
            for(let s of Object.getOwnPropertySymbols(dtree.bindings)){
                insymhead[s] = insymhead[s]||{};
                let terms = dtree.bindings[s];
                for (let term of terms){
                    insymhead[s][term] = insymhead[s][term]||{};
                    marked[term] = s
                }
            }

            for(let k in dtree.end){
                let v = dtree.end[k];
                let token = chain+':'+k
                tokens[token] = v;

                if(k in marked){
                    insymhead[marked[k]][k][token] = v
                }else{
                    insymhead[token] = v
                }
            }

            for(let k in dtree.groups){
                let v = dtree.groups[k];
                let lead = chain===''?chain:chain+'.'

                let recsymhead;
                if(k in marked){
                    recsymhead = insymhead[marked[k]][k]
                }else{
                    recsymhead = insymhead
                }

                recur(v, tokens, lead+k, recsymhead);
            }


            return tokens
        }

        return recur(this.treeDesignate(target), {}, '')
    }

    /**
     * Mask the designations taking place with the input designator.
     */
    screen(desexp:string){
        this.screens.push(new Designator('groups','end', desexp))
    }

    scan(target:any, flat=false, negative=false){
        if(flat){
            return this.flatDesignate(target);
        }else{
            return this.tokenDesignate(target);
        }
    }

    mergeBindings(bindings1, bindings2){

        if(!bindings1) return bindings2;
        if(!bindings2) return bindings1;

        let merged = {}

        for (let sym of Object.getOwnPropertySymbols(bindings1||{})){
            let bound = bindings1[sym]
            merged[sym] = bound;
        }

        for (let sym of Object.getOwnPropertySymbols(bindings2||{})){
            let bound = bindings2[sym]
            let resolved
            //if COLLIDE
            if((sym in merged)){
                let existing = merged[sym];
                if(typeof bound === 'string' && typeof existing === 'string'){
                    //both terminal
                    if(merged[sym] === bindings2[sym]){
                        resolved = bound;
                    }else{
                        //UNMATCHING NOT ALLOWED
                        delete merged[sym]
                    }
                }else if (typeof bound === 'object' && typeof existing === 'object'){
                    resolved = this.mergeBindings(merged[sym], bound)
                }else{
                    throw new Error(`Invalid Designation: binding ${bound} is of different type to binding ${existing}`)
                }
            }else{
                 resolved = bindings2[sym]
            }
            merged[sym] = resolved
        }
        return merged
    }

    _matches(token, tgroup, tend, ti, di){

        let tAtEnd = ti === tgroup.length, dAtEnd = di === this.designatorIR.groups.length;

        let tokenDTerm = tAtEnd ? tend:  tgroup[ti];
        let dTerm = dAtEnd ? this.designatorIR.end : this.designatorIR.groups[di];

        if(tAtEnd !== dAtEnd && (dTerm !== '**')) return false;

        let tmatch = matchDesignationTerm(tokenDTerm, dTerm)
        if(tmatch || dTerm == '**'){
            //true, regex match or [sym, bind]
            let boundval;
            if(tAtEnd || dAtEnd){
                //terminal bindings only bindings for
                boundval = {}
                boundval[token] = null
            }else{
                //handle globbing
                if(dTerm ==='**'){
                    //recur with both di && di+1 if either is a match
                    let patient = this._matches(token, tgroup, tend, ti+1, di)
                    let eager = this._matches(token, tgroup, tend, ti+1, di+1)
                    boundval = this.mergeBindings(patient, eager)
                }else{
                    boundval = this._matches(token, tgroup, tend, ti+1, di+1)
                }
            }

            if(typeof tmatch[0] === 'symbol'){
                let binding = {}, sbind = {}
                sbind[tmatch[1]] = boundval
                binding[tmatch[0]] = sbind
                return binding
            }else{
                return boundval
            }
        }else{

            return false
        }
    }

    matches(token:string){
        let [tgroup, tend]  = splitDesignatorString(this.autoColon(token));
        return this._matches(token, tgroup, tend, 0, 0);
    }

}
