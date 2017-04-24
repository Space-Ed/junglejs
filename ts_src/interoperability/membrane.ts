namespace Jungle {

    export namespace IO {


        export interface ShellPolicy {
            fussy:boolean;

            allowInfusion:boolean;
            allowSubsume:boolean;
            allowAccess:boolean;
            allowChanges:boolean;
            allowAddition:boolean;
            allowRemoval:boolean;
            allowRenaming:boolean;

        }

        export const FreePolicy:ShellPolicy = {
            fussy:false,

            allowSubsume:true,
            allowInfusion:true,
            allowAccess:true,
            allowChanges:true,
            allowAddition:true,
            allowRemoval:true,
            allowRenaming:true
        }

        export interface MembraneHost{
            shell:Membrane;
            policy:ShellPolicy;

            retrieveContext:(crux:Crux)=>any;

            onAddCrux:(crux:Crux)=>void;
            onRemoveCrux:(crux:Crux)=>void;
            onRenameCrux:(crux:Crux)=>void;
            onFuseCrux:(crux:Crux)=>void;
        }

        export interface CruxDesignator{
            role:string;
            flatten:boolean;
            mDesignators:RegExp[]|((membrane:Membrane, key:string)=>boolean)[];
            cDesignator:RegExp|((crux:Crux)=>boolean);
        }

        export class Membrane {

            /**
             * convert globs to regex to use as the designator
             */
            static regexifyDesignationTerm(term:string){
                if(term=='*'){
                    return /.*/
                }else{
                    return new RegExp(`\$${term}^`)
                }

            }

            static parseDesignatorString(desigstr:string, targetRole:string):CruxDesignator{

                //match structural consistency with xxx.xxx... ...xxx:ppp
                let colonSplit = desigstr.match(/((?:\w+|\*)(?:\.(?:\w+|\*))*)\:(\w+|\*|\$)/);

                if(colonSplit === null){

                    //err bad designator string, must be membrane.submembrane:crux
                }else{
                    var [total, chain, crux] = colonSplit
                }

                let subranedesig:any[] = chain.split(/\./)

                subranedesig = subranedesig.map((value, index)=>{
                    return Membrane.regexifyDesignationTerm(value);
                })

                return {
                    role:targetRole,
                    flatten:true,
                    mDesignators:subranedesig,
                    cDesignator:Membrane.regexifyDesignationTerm(crux)
                }
            }

            roles:any;
            subranes:any;

            constructor (public host:MembraneHost){

            }

            invert(designation:CruxDesignator):Membrane{
                return this.propogate(designation, undefined, undefined,  true, true)
            }

            reflect(designation:CruxDesignator):Membrane{
                return this.propogate(designation, undefined, undefined, true, false)
            }

            split(designation:CruxDesignator):Membrane{
                return this.propogate(designation,undefined, undefined, false, false)
            }

            invertInto(designation:CruxDesignator, membrane:Membrane, subname:string){
                this.propogate(designation, membrane, subname, true, true)
            }

            reflectInto(designation:CruxDesignator, membrane:Membrane, subname:string){
                this.propogate(designation, membrane, subname, true, false)
            }

            transplant(designation:CruxDesignator, membrane:Membrane, subname:string){
                this.propogate(designation, membrane, subname, false, false)
            }

            remove(designation:CruxDesignator){
                this.propogate(designation, undefined, undefined, false, false)
            }

            delete(designation:CruxDesignator){
                this.propogate(designation, undefined, undefined, false, false, true)
            }

            addSubrane(membrane:Membrane, label:string){
                this.subranes[label] = membrane;
            }

            addCrux(crux:Crux, role:string){
                let home = this.roles[role];

                let existing:Crux = home[crux.label];
                if(existing != undefined){
                    throw new Debug.JungleError("")
                }else{
                    crux.attachTo(this, role)
                }
            }

            removeCrux(crux:Crux, role:string){
                let home = this.roles[role];

                let existing:Crux = home[crux.label];

                if(existing != undefined){
                    existing.detachFrom(this, role);
                }
            }

            destroyCrux(crux:Crux, role:string){
                let home = this.roles[role];

                let existing:Crux = home[crux.label];
                if(existing != undefined){
                    existing.destroy()
                }
            }

            /**
            * Swiss army knife of grouped crux transforms
            */
            propogate(designation:CruxDesignator, membrane?:Membrane, sub?:string, retain=true, invert=false, destructive=false){
                //find the designated cruxes

                let designated = this.designate(designation)
                let ripped = new Membrane(this.host)

                for(let crux of designated){
                    //inverted or not
                    let newRole = invert?crux.inversion(designation.role):designation.role;

                    ripped.addCrux(crux, newRole)

                    if(!retain){
                        if(destructive){
                            this.destroyCrux(crux, newRole);
                        }else{
                            this.removeCrux(crux, newRole);
                        }
                    }
                }

                if(membrane!=undefined){
                    membrane.addSubrane(ripped, sub);
                }

                return ripped
            }

            designate(designator:CruxDesignator): Crux[]{

                let designation = [];

                //find all designated subranes and recursively collect
                if(designator.mDesignators.length > 0){
                    let deref = designator.mDesignators.pop(); //is it really kocher to modify an IR

                    let collectedSubs = [];
                    for (let mk in this.subranes){
                        //designate submembranes
                        if((deref instanceof Function && deref(this.subranes[mk],mk))||
                           (deref instanceof RegExp && mk.match(deref))){

                                designation = designation.concat(this.subranes[mk].designate(designator.mDesignators))
                        }
                    }
                }else{ // terminal

                    let bucket = this.roles[designator.role]

                    let scanDomain;

                    scanDomain = Util.flattenObject(bucket, 1);

                    for(let cruxlabel in scanDomain){
                        let crux:Crux = scanDomain[cruxlabel];

                        if((designator.cDesignator instanceof Function && designator.cDesignator(crux))||
                           (designator.cDesignator instanceof RegExp && crux.label.match(designator.cDesignator))){
                                designation = designation.concat(crux)
                        }
                    }

                    return designation;
                }

            }


        }

    }
}
