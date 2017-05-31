/// <reference path="../../interoperability/call/crux.ts"/>
/// <reference path="../base/construct.ts"/>

namespace Jungle {

    export namespace Nova {

        export interface CallHookSpec {
            target:string,
            contact:"called"|"caller",
            mode:"push"|"pull",
            hook:any,
            default:any,
            sync:boolean
        }

        export class CallHook extends Construct<Cell> {

            crux:IO.CallCrux;
            cache:CallHookSpec

            constructor(spec:any){
                spec.basis = 'CallHook';
                super(spec);
            }

            produceHook(host:Cell, key:string):{hook:boolean|((inp:any, crumb:Debug.Crumb)=>any), sinker:any} {
                let {hook, mode, contact} = this.cache
                let cruxHook:(boolean|((inp:any, crumb:Debug.Crumb)=>any));
                let propVal:any;
                let line:string;

                if(hook instanceof Function){
                    if(contact == "called"){
                        propVal = this.cache.default;
                        cruxHook = hook.bind(host.nucleus);
                    }
                }else{

                    //all types of hook function
                    if(mode == "push" && contact == "called"){
                        //depositor push in
                        cruxHook = (inp:any, crumb:Debug.Crumb)=>{
                            crumb.drop("Value Deposit Hook")
                            host.nucleus[key] = inp;
                        }

                        propVal = this.cache.default;

                    }else if(mode == "pull" && contact == "called"){
                        //provisor: out pulls from in
                        cruxHook = (inp:any, crumb:Debug.Crumb)=>{
                            crumb.drop("Value Provider Hook")
                            return host.nucleus[key]
                        }

                        propVal = this.cache.default;

                    }else if(mode == "push" && contact == "caller" && this.cache.default !== undefined){
                        //react push out
                        cruxHook = true;

                        propVal = {
                            set:(value)=>{
                                //access the membrane and plug the value
                                host.membranes[this.cache.target].inversion.roles[this.cache.contact][key].func(value);
                                host.nucleus[key] = value;
                            },get:()=>{
                                return host.nucleus[key];
                            },
                            value:this.cache.default
                        }

                    }else if(mode == "push" && contact == "caller" && this.cache.default !== undefined){
                        //hook out
                        cruxHook = true;

                        propVal = {
                            value:(value)=>{
                                //access the membrane and plug the value
                                host.membranes[this.cache.target].inversion.roles[this.cache.contact][key].func(value);
                                host.nucleus[key] = value;
                            }
                        }

                    }else if(mode == "push" && contact == "caller"){
                        //requestor: in pulls from out
                        cruxHook = true;

                        propVal = {
                            get:()=>{
                                let promised = host.membranes[this.cache.target].inversion.roles[this.cache.contact][key].request(key)

                                //
                                if(this.cache.sync){
                                    let zalgo = promised.realize();

                                    if(zalgo instanceof Util.Junction){
                                        zalgo.then((result)=>{
                                            this.cache.default = result; // update the default later
                                        })

                                        return this.cache.default //return a default now
                                    }else{
                                        return zalgo //ok to give sync
                                    }
                                }else{
                                    return promised
                                }
                            },
                            value:this.cache.default
                        }
                    }
                }


                return {
                    hook:cruxHook,
                    sinker:propVal
                }
            }

            induct(host:Cell, key:string){
                super.induct(host, key);

                console.log('Induct Hook Yay!')

                //the crux this rule and the state
                let {hook, sinker} = this.produceHook(host, key)

                let cruxargs = {
                    label: key,
                    hook:hook,
                    tracking:true //global debug, local debug, denial of tracking, ?
                };

                //create membrane hook
                this.crux = new IO.CallCrux(cruxargs);
                host.membranes[this.cache.target].addCrux(this.crux, this.cache.contact)

                //create context side hook/property
                host.nucleus[key] = sinker;
            }

            prime(){
                //nothing to do
            }

            patch(patch){

            }

            dispose(){
                this.parent.membranes[this.cache.target].removeCrux(this.crux, this.cache.contact)

                //retracting the effect on state
            }

            extract(){
                let cp = Util.deepCopy(this.cache);
                if(this.alive){
                    cp.default = this.parent.nucleus[this.crux.label]; //the only thing that changes
                }

                return cp;
            }

        }

        JungleDomain.register('CallHook', CallHook)

    }

}
