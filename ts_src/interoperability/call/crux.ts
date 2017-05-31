
import * as I from '../base/interfaces'
import {Junction} from '../../util/junction'
import * as Debug  from '../../util/debug'
import {Crux} from '../base/crux'


export interface Called extends I.Contact {
    func:(data:any, tracking:Debug.Crumb)=>Junction;
}

export interface Caller extends I.Contact {
    func?:(data:any, tracking:Debug.Crumb)=>Junction;
}


export interface CallCruxSpec {
    label:string,
    hook?:boolean|((data:any, crumb:Debug.Crumb)=>any),
    tracking:boolean
}

/**
A crux for passing a request through to an assignable
 */
export class CallCrux extends Crux{

    roles:{
        caller:any;
        called:Called
    }

    constructor(spec:CallCruxSpec){
        super(spec.label)

        let capin, capout, reqfunc

        if(spec.hook === true){ //hook in
            capin = true;
            capout = false;
        }else if(spec.hook instanceof Function){ //hook out
            capout = true;
            capin = false;
            reqfunc = spec.hook;
        }

        //appointment of roles

        this.roles = {
            caller:{
                capped:capout,
                func:reqfunc
            },called:{
                capped:capin,
                func:(data:any, tracking:Debug.Crumb)=>{

                    let crumb;
                    if(spec.tracking && tracking !== undefined){
                        crumb = tracking.drop("Caller Crux")
                        .with(data)
                        .at(`crux-label:${this.label}`)
                    }

                    if(this.roles.caller.func !== undefined){
                        if(crumb){
                            return this.roles.caller.func(data, crumb);
                        }else{
                            return this.roles.caller.func(data);
                        }
                    }else{
                        //hitting a contact without connection, a call to void
                        if(tracking){
                            tracking.raise("Called crux with no assigned caller, missing link")
                        }
                    }
                }
            }
        }
    }
}
