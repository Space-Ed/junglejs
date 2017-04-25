namespace Jungle {

    export namespace IO {


        export interface ShellPolicy {
            fussy:boolean;
            allowAddition:boolean;
            allowRemoval:boolean;

        }

        export const FreePolicy:ShellPolicy = {
            fussy:false,
            allowAddition:true,
            allowRemoval:true
        }

        export interface MembraneHost{
            primary:Membrane;
            policy:ShellPolicy;

            retrieveContext:(crux:Crux)=>any;

            onAddCrux:(crux:Crux)=>void;
            onRemoveCrux:(crux:Crux)=>void;

        }

        export interface CruxDesignator{
            role:string;
            mDesignators:string[]|RegExp[]|((membrane:Membrane, key:string)=>boolean)[];
            cDesignator:string|RegExp|((crux:Crux)=>boolean);
        }

        export class Membrane {

            /**
             * convert globs to regex to use as the designator
             */
            static regexifyDesignationTerm(term:string){
                if(term=='*'){
                    return /.*/
                }else if(term=='**'){
                    return '**'
                }else{
                    return new RegExp(`\^${term}\$`)
                }

            }

            static parseDesignatorString(desigstr:string, targetRole:string):CruxDesignator{

                //match structural consistency with xxx.xxx... ...xxx:ppp
                let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);

                if(colonSplit === null){

                    //err bad designator string, must be membrane.submembrane:crux
                }else{
                    var [total, chain, crux] = colonSplit
                }

                let subranedesig:any[] = chain?chain.split(/\./):[];

                subranedesig = subranedesig.map((value, index)=>{
                    return Membrane.regexifyDesignationTerm(value);
                })

                return {
                    role:targetRole,
                    mDesignators:subranedesig,
                    cDesignator:Membrane.regexifyDesignationTerm(crux)
                }
            }

            inverted:Membrane;
            roles:any;
            subranes:any;

            constructor (public host:MembraneHost){
                this.roles = {};
                this.subranes = {};
            }

            forEachCrux(func:(crux, role)=>void){
                for(let rk in this.roles){
                    let ofrole = this.roles[rk]
                    for(let cruxlabel in ofrole){
                        let crux = ofrole[cruxlabel]
                        func(crux, ofrole)
                    }
                }
            }

            invert(){
                if(this.inverted === undefined){

                    this.inverted = new Membrane(this.host)
                    this.inverted.inverted = this;

                    this.forEachCrux((crux, role)=>{
                        //reattach the crux thereby picking up the inversion
                        crux.attachTo(this, crux.originalRole)
                    })
                }

                return this.inverted
            }

            addSubrane(membrane:Membrane, label:string){
                this.subranes[label] = membrane;
            }

            addCrux(crux:Crux, role:string){
                let home = this.roles[role];

                //first time seeing role
                if(home === undefined){
                    home = this.roles[role] = {};
                }

                let existing:Crux = home[crux.label];
                if(existing !== undefined){
                    throw new Debug.JungleError("")
                }else{
                    crux.attachTo(this, role)
                }
            }

            removeCrux(crux:Crux, role:string){

                let existing:Crux = this.roles[role][crux.label];

                if(existing !== undefined){
                    existing.detach();
                }
            }

            treeDesignate({mDesignators, cDesignator, role}:CruxDesignator){
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
                    for (let mk in this.subranes){
                        //designate submembranes
                        if(!terminal &&
                           ((deref instanceof Function && deref(this.subranes[mk],mk))||
                           (deref instanceof RegExp && mk.match(deref)))){
                            collected[mk] = this.subranes[mk].treeDesignate({
                                mDesignators:glob?([mDesignators[0]].concat(mDesignators.slice(2))):(mDesignators.slice(1)),//remove the  deref and glob where applicable
                                cDesignator:cDesignator,
                                role:role
                            })
                        }else if(glob){
                            collected[mk] = this.subranes[mk].treeDesignate({
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

                    let bucket = this.roles[role]

                    for(let cruxlabel in bucket){
                        let crux:Crux = bucket[cruxlabel];

                        if((cDesignator instanceof Function && cDesignator(crux))||
                           (cDesignator instanceof RegExp && crux.label.match(cDesignator))){
                               collected[cruxlabel] = crux;
                        }
                    }

                }

                return collected;
            }

            flatDesignate(designator:CruxDesignator):any{

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

            tokenDesignate(designator:CruxDesignator){
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
                    return this.tokenDesignate(Membrane.parseDesignatorString(str, role))
                }else{
                    return this.flatDesignate(Membrane.parseDesignatorString(str, role))
                }
            }


        }

    }
}
