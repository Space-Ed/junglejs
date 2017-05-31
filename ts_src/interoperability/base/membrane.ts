/// <reference path="../designation/designable.ts"/>

namespace Jungle {

    export namespace IO {


        export class Membrane extends BasicDesignable{



            ///---------------------------------------BEGIN CLASS

            inverted:Membrane;
            roles:any;
            subranes:any;
            parent:Membrane;
            alias:string;
            notify:boolean;

            visors:Visor[];

            constructor (public host:MembraneHost){
                super("subranes", "roles")
                this.roles = {};
                this.subranes = {};
                this.notify = true;
            }


            notifyCruxAdd(crux, role, token?){
                if(this.notify){

                    let basic = token==undefined;
                    let t = basic?`:${crux.label}/${role}`:token;


                    this.host.onAddCrux(crux,role, t)

                    if(this.parent){
                        let qualified = `${this.alias}${basic?t:'.'+token}`
                        this.parent.notifyCruxAdd(crux, role, qualified)
                    }
                }
            }

            notifyCruxRemove(crux:Crux, role:string, token?){
                if(this.notify){
                    let basic = token==undefined;
                    let t = basic?`:${crux.label}/${role}`:token;
                    this.host.onRemoveCrux(crux,role, t)

                    if(this.parent){
                        let qualified = `${this.alias}${basic?t:'.'+token}`
                        this.parent.notifyCruxRemove(crux, role, qualified)
                    }
                }
            }

            notifyMembraneAdd(membrane, token?){
                if(this.notify){
                    let basic = token==undefined;
                    let t = basic?`${membrane.alias}`:token;
                    this.host.onAddMembrane(membrane, t)

                    if(this.parent){
                        let qualified = `${this.alias}${basic?t:'.'+token}`
                        this.parent.notifyMembraneAdd(membrane, qualified)
                    }
                }
            }

            notifyMembraneRemove(membrane, token?){
                if(this.notify){
                    let basic = token==undefined;
                    let t = basic?`${membrane.alias}`:token;
                    this.host.onRemoveMembrane(membrane, t)

                    if(this.parent){
                        let qualified = `${this.alias}${basic?t:'.'+token}`
                        this.parent.notifyMembraneRemove(membrane, qualified)
                    }
                }
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

            getMembraneToken(){
                if(this.parent==undefined){
                    return undefined;
                }else{
                    let parentToken =this.parent.getMembraneToken()
                    if(parentToken){
                        return +'.'+this.alias;
                    }else{
                        return this.alias;
                    }
                }
            }

            createVisor(designation:string|string[], host){

                let visor =  new Visor(this, host);
                this.visors.push(visor)
            }

            addSubrane(membrane:Membrane, label:string){
                this.subranes[label] = membrane;
                membrane.parent = this;
                membrane.alias = label;

                this.notifyMembraneAdd(membrane);
            }

            removeSubrane(label):Membrane{
                let removing = this.subranes[label];
                delete this.subranes[label];

                this.notifyMembraneRemove(removing)

                removing.parent = undefined;
                removing.alias = undefined;

                return removing
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
                    this.notifyCruxAdd(crux, role)
                }
            }

            removeCrux(crux:Crux, role:string){

                let existing:Crux = this.roles[role][crux.label];

                if(existing !== undefined){
                    existing.detach();
                    this.notifyCruxRemove(crux, role)
                }
            }


        }

    }
}
