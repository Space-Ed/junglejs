
import * as I from '../base/interfaces'
import {Crux} from '../base/crux'

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

export function parseDesignatorString(desigstr:string, targetRole:string):I.CruxDesignator{

    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

    if(colonSplit === null){

        //err bad designator string, must be membrane.submembrane:crux
    }else{
        var [total, chain, crux] = colonSplit
    }

    let subranedesig:any[] = chain?chain.split(/\./):[];

    subranedesig = subranedesig.map((value, index)=>{
        return regexifyDesignationTerm(value);
    })

    return {
        role:targetRole,
        mDesignators:subranedesig,
        cDesignator:regexifyDesignationTerm(crux)
    }
}

export function designatorToRegex(desigstr, role){
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

    if(colonSplit === null){

    }else{
        var [total, chain, crux] = colonSplit
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

    regex += `:${crux=='*'?'(\\w+)':crux}/${role}$`

    return new RegExp(regex)
}

export function tokenDesignatedBy(token, designator:I.CruxDesignator):boolean{
    console.log("token: ", token);
    let [match, allSubs, crux, role] =  token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)\/(\w+)$/);
    console.log("match: ", match);

    let splitSubs = allSubs?allSubs.split(/\./):[];

    for (let i=0; i<splitSubs.length;i++){
        if(!matchDesignationTerm(splitSubs[i], designator.mDesignators[i])){
             return false;
        }
    }

    if(!matchDesignationTerm(crux, designator.cDesignator)){
         return false;
    }

    return role === designator.role
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

    treeDesignate({mDesignators, cDesignator, role}:I.CruxDesignator){
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
                        cDesignator:cDesignator,
                        role:role
                    })
                }else if(glob){
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators:mDesignators,//leave the glob(continue scanning)
                        cDesignator:cDesignator,
                        role:role
                    })
                }

            }
        }else{
            terminal = true
        }

        //either we are out of derefs or we are tail globbing
        if (terminal){ // terminal

            let bucket = this[this.finalName][role]

            for(let cruxlabel in bucket){
                let crux:Crux = bucket[cruxlabel];

                if(matchDesignationTerm(cruxlabel, cDesignator)){
                    collected[cruxlabel] = crux;
                }
            }

        }

        return collected;
    }

    flatDesignate(designator:I.CruxDesignator):any{

        let recur = function(dtree, collection){
            for(let k in dtree){
                let v = dtree[k];

                if(v instanceof Crux){
                    collection.push(v);
                }else{
                    recur(v, collection);
                }
            }
            return collection
        }

        return recur(this.treeDesignate(designator), [])

    }

    tokenDesignate(designator:I.CruxDesignator){
        let recur = function(dtree, tokens, chain){
            for(let k in dtree){
                let v = dtree[k];

                if(v instanceof Crux){
                    tokens[chain+':'+k+'/'+designator.role] = v;
                }else{
                    let lead = chain===''?chain:chain+'.'
                    recur(v, tokens, lead+k);
                }
            }
            return tokens
        }

        return recur(this.treeDesignate(designator), {}, '')
    }

    designate(str:string, role:string, tokenize=true){
        if(tokenize){
            return this.tokenDesignate(parseDesignatorString(str, role))
        }else{
            return this.flatDesignate(parseDesignatorString(str, role))
        }
    }

    // createVisor(designation:string|string[], host){
    //
    //     let visor =  new Visor(this, host);
    //     this.visors.push(visor)
    // }
}
