/// <reference path="../interoperability/call/crux.ts"/>
/// <reference path="./base/construct.ts"/>

namespace Jungle {

    export namespace Nova {

        export interface CallHookSpec {
            target:string,
            contact:"callin"|"callout",
            mode:"push"|"pull",
            hook:any,
            default:any,
            sync:boolean
        }

        export class CallHook extends Construct<Cell> {

            crux:IO.CallCrux;
            patch:CallHookSpec;

            constructor(spec:CallHookSpec){
                super({
                    basis:'CallHook',
                    patch:spec
                })
            }

            produceHook(host:Cell, key:string):{hook:boolean|((inp:any, crumb:Debug.Crumb)=>any), sinker:any} {
                let {hook, mode, contact} = this.patch
                let cruxHook:(boolean|((inp:any, crumb:Debug.Crumb)=>any));
                let propVal:any;
                let line:string;

                if(hook instanceof Function){

                }else if(Util.isPrimative(hook)){

                }else{

                    //all types of hook function
                    if(mode == "push" && contact == "callin"){
                        //depositor push in
                        cruxHook = (inp:any, crumb:Debug.Crumb)=>{
                            crumb.drop("Value Deposit Hook")

                            host.nucleus[key] = inp;
                        }

                        propVal = this.patch.default;

                    }else if(mode == "pull" && contact == "callin"){
                        //provisor: out pulls from in
                        cruxHook = (inp:any, crumb:Debug.Crumb)=>{
                            crumb.drop("Value Provider Hook")
                            return host.nucleus[key]
                        }

                        propVal = this.patch.default;

                    }else if(mode == "push" && contact == "callout" && this.patch.default !== undefined){
                        //react push out
                        cruxHook = true;

                        propVal = {
                            set:(value)=>{
                                //access the membrane and plug the value
                                host.membranes[this.patch.target].inversion.roles[this.patch.contact][key].func(value);
                                host.nucleus[key] = value;
                            },get:()=>{
                                return host.nucleus[key];
                            },
                            value:this.patch.default
                        }

                    }else if(mode == "push" && contact == "callout" && this.patch.default !== undefined){
                        //hook out
                        cruxHook = true;

                        propVal = {
                            value:(value)=>{
                                //access the membrane and plug the value
                                host.membranes[this.patch.target].inversion.roles[this.patch.contact][key].func(value);
                                host.nucleus[key] = value;
                            }
                        }

                    }else if(mode == "push" && contact == "callout"){
                        //requestor: in pulls from out
                        cruxHook = true;

                        propVal = {
                            get:()=>{
                                let promised = host.membranes[this.patch.target].inversion.roles[this.patch.contact][key].request(key)

                                //
                                if(this.patch.sync){
                                    let zalgo = promised.realize();

                                    if(zalgo instanceof Util.Junction){
                                        zalgo.then((result)=>{
                                            this.patch.default = result; // update the default later
                                        })

                                        return this.patch.default //return a default now
                                    }else{
                                        return zalgo //ok to give sync
                                    }
                                }else{
                                    return promised
                                }
                            },
                            value:this.patch.default
                        }
                    }
                }


                return {
                    hook:cruxHook,
                    sinker:propVal
                }
            }

            induct(host:Cell, key:string){

                //the crux this rule and the state
                let {hook, sinker} = this.produceHook(host, key)

                let cruxargs = {
                    label: key,
                    hook:hook,
                    tracking:true //global debug, local debug, denial of tracking, ?
                };

                //create membrane hook
                this.crux = new IO.CallCrux(cruxargs);
                host.membranes[this.patch.target].addCrux(this.crux, this.patch.contact)

                //create context side hook/property
                host.nucleus.define(key, sinker);
            }

            prime(){
                //nothing to do
            }

            graft(patch){

            }

            dispose(){

            }

            extract(){

                return {
                    basis: this.cache.basis,
                    patch: {
                        target:this.patch.target,
                        contact:this.patch.contact,
                        mode:this.patch.mode,
                        hook:this.patch.hook,
                        default:this.parent.nucleus[this.crux.label],
                        sync:this.patch.sync
                    }
                }
            }

        }

    }

}
