import {deepMeldF, deepInvertF} from './ogebra/hierarchical'
import {meld, invert} from './ogebra/operations'
import * as f from './ogebra/primary-functions'

declare type DTerm = RegExp|Function|"**"|string;

export interface DesignatorIR {
    groups:DTerm[]
    end:DTerm
}

interface RecurState {
    thumb:number,
    glob:boolean
}

export const DesignatorRegExp = /^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/;

/**
 * convert globs to regex to use as the designator
 */
export function regexifyDesignationTerm(term:string):DTerm{
    if(term=='*'){
        return /.*/
    }else if(term=='**'){
        return '**'
    }else{
        return new RegExp(`\^${term}\$`)
    }
}

export function parseDesignatorString(desigstr:string):DesignatorIR{

    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(DesignatorRegExp);

    if(colonSplit === null){

        //err bad designator string, must be membrane.submembrane:terminal
    }else{
        var [total, chain, terminal] = colonSplit
    }

    let subranedesig:DTerm[] = (chain?chain.split(/\./):[]).map((value, index)=>{
        return regexifyDesignationTerm(value);
    })

    return {
        groups:subranedesig,
        end:regexifyDesignationTerm(terminal)
    }
}

export function designatorToRegex(desigstr){
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

    if(colonSplit === null){

    }else{
        var [total, chain, terminal] = colonSplit
    }

    let subranedesig:string[] = chain?chain.split(/\./):[];

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

export function tokenDesignatedBy(token, designator:DesignatorIR):boolean{
   //console.log("token: ", token);
    let [match, allSubs, terminal] =  token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)$/);
   //console.log("match: ", match);

    let splitSubs = allSubs?allSubs.split(/\./):[];

    for (let i=0; i<splitSubs.length;i++){
        if(!matchDesignationTerm(splitSubs[i], designator.groups[i])){
             return false;
        }
    }

    if(!matchDesignationTerm(terminal, designator.end)){
         return false;
    }

    return true;
}

export function matchDesignationTerm(target, term){
    if(typeof(term) == 'string'){
        return target === term
    }if(term instanceof Function){
        return term(target)
    }else if(term instanceof RegExp){
        return target.match(term)
    }else{
        return target.match(regexifyDesignationTerm(term))
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

        let desExp = designatorExp;
        if(designatorExp.match(/^[a-z0-9A-Z_\$]*$/)){
            desExp = ":"+designatorExp
        }

        this.designatorIR = parseDesignatorString(desExp);
        this.regex = designatorToRegex(desExp);
        this.expression = desExp;
        this.screens = [];
    }

    getLocale():string{
        //match structural consistency with xxx.xxx... ...xxx:ppp
        let colonSplit = this.expression.match(DesignatorRegExp);
        return colonSplit[1]||""
    }

    getTerminal():string{
        let colonSplit = this.expression.match(DesignatorRegExp);
        return colonSplit[2]
    }

    mergePaths(patha, pathb){
        let merged = {
            groups:{},
            end:{}
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

            let term = (obj1: Object, obj2: Object, k: string) => {return k === 'end'}
            let endmask = meld((a,b)=> {return a})
            let endinvert = invert(f.negate.existential)

            let inv = deepInvertF(term, endinvert)(dmask)

            result = deepMeldF(term, endmask)(result, inv)
        }

        return result

    }

    _treeDesignate(target, recurState:RecurState){
        let rState = recurState
        let collected = {
            groups:{},
            end:{}
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


            //tail globbing case
            let collectedSubs = [];
            for (let mk in target[this.groupName]){
                let subgroup = target[this.groupName][mk];

                //designate subgroups
                if(matchDesignationTerm(mk, current)){
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
                if(matchDesignationTerm(tlabel, end)){
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
        let recur = function(dtree, tokens, chain){
            for(let k in dtree.end){
                let v = dtree.end[k];
                tokens[chain+':'+k] = v;
            }
            for(let k in dtree.groups){
                let v = dtree.groups[k];
                let lead = chain===''?chain:chain+'.'
                recur(v, tokens, lead+k);
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

    matches(token:string){
        return token.match(this.regex)
    }

}
