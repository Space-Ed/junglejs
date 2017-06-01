

import {BasicContact} from '../contacts/base'
import * as I from '../interfaces'

/**
 * convert globs to regex to use as the designator
 */
export function regexifyDesignationTerm(term:string){
    if(term=='*'){
        return /.*/
    }else if(term=='**'){
        return '**'
    }else{
        return new RegExp(`\^${term}\$`)
    }

}

export function parseDesignatorString(desigstr:string):I.ContactDesignator{

    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

    if(colonSplit === null){

        //err bad designator string, must be membrane.submembrane:contact
    }else{
        var [total, chain, contact] = colonSplit
    }

    let subranedesig:any[] = chain?chain.split(/\./):[];

    subranedesig = subranedesig.map((value, index)=>{
        return regexifyDesignationTerm(value);
    })

    return {
        mDesignators:subranedesig,
        cDesignator:regexifyDesignationTerm(contact)
    }
}

export function designatorToRegex(desigstr){
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

    if(colonSplit === null){

    }else{
        var [total, chain, contact] = colonSplit
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

    regex += `:${contact=='*'?'(\\w+)':contact}$`

    return new RegExp(regex)
}

export function tokenDesignatedBy(token, designator:I.ContactDesignator):boolean{
    // console.log("token: ", token);
    let [match, allSubs, contact] =  token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)$/);
    // console.log("match: ", match);

    let splitSubs = allSubs?allSubs.split(/\./):[];

    for (let i=0; i<splitSubs.length;i++){
        if(!matchDesignationTerm(splitSubs[i], designator.mDesignators[i])){
             return false;
        }
    }

    if(!matchDesignationTerm(contact, designator.cDesignator)){
         return false;
    }

    return true;
}

export function matchDesignationTerm(target, term){
    if(term instanceof Function){
        return term(target)
    }else if(term instanceof RegExp){
        return target.match(term)
    }else{
        return target.match(regexifyDesignationTerm(term))
    }
}

export class BasicDesignable {


    constructor(private groupName:string, private finalName:string){

    }

    treeDesignate({mDesignators, cDesignator}:I.ContactDesignator){
        let collected = {}, glob = false, terminal = false;

        //find all designated subranes and recursively collect
        if(mDesignators.length > 0){
            let deref;
            if(mDesignators[0] == '**'){
                glob = true;
                if(mDesignators.length == 1){
                    //we have only the glob as a deref
                    terminal = true
                }else{
                    deref = mDesignators[1]
                }
            }else{
                deref = mDesignators[0]
            }

            let collectedSubs = [];
            for (let mk in this[this.groupName]){
                //designate submembranes
                if(!terminal &&
                   ((deref instanceof Function && deref(this[this.groupName][mk],mk))||
                   (deref instanceof RegExp && mk.match(deref)))){
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators:glob?([mDesignators[0]].concat(mDesignators.slice(2))):(mDesignators.slice(1)),//remove the  deref and glob where applicable
                        cDesignator:cDesignator
                    })
                }else if(glob){
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators:mDesignators,//leave the glob(continue scanning)
                        cDesignator:cDesignator
                    })
                }

            }
        }else{
            terminal = true
        }

        //either we are out of derefs or we are tail globbing
        if (terminal){ // terminal

            let bucket = this[this.finalName]

            for(let contactlabel in bucket){
                let contact:I.Contact = bucket[contactlabel];

                if(matchDesignationTerm(contactlabel, cDesignator)){
                    collected[contactlabel] = contact;
                }
            }

        }

        return collected;
    }

    flatDesignate(designator:I.ContactDesignator):any{

        let recur = function(dtree, collection){
            for(let k in dtree){
                let v = dtree[k];

                if(v instanceof BasicContact){
                    collection.push(v);
                }else{
                    recur(v, collection);
                }
            }
            return collection
        }

        return recur(this.treeDesignate(designator), [])

    }

    tokenDesignate(designator:I.ContactDesignator){
        let recur = function(dtree, tokens, chain){
            for(let k in dtree){
                let v = dtree[k];

                if(v instanceof BasicContact){
                    tokens[chain+':'+k] = v;
                }else{
                    let lead = chain===''?chain:chain+'.'
                    recur(v, tokens, lead+k);
                }
            }
            return tokens
        }

        return recur(this.treeDesignate(designator), {}, '')
    }

    designate(str:string, tokenize=true){
        if(tokenize){
            return this.tokenDesignate(parseDesignatorString(str))
        }else{
            return this.flatDesignate(parseDesignatorString(str))
        }
    }

    // createVisor(designation:string|string[], host){
    //
    //     let visor =  new Visor(this, host);
    //     this.visors.push(visor)
    // }
}
