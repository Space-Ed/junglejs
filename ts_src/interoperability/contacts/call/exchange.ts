import * as I from '../../interfaces'
import {BasicContact} from '../base'
import * as Debug from '../../../util/debug'
import {Junction} from '../../../util/all'

export type ExchangeTypes = 'hook'|'deposit'|'retrieve'

export interface CallExchangeSpec {
    tracking:boolean|string,
    type:ExchangeTypes
    hasInput?:boolean,
    hasOutput?:boolean,
    default?:any,
    forceSync?:boolean
    hook?:Function;
}

export class CallExchange extends BasicContact<CallExchange> {

    label:string

    //capability flags must be decided
    public symmetric = true;
    public invertable = true;

    private injectedContext:boolean;

    put = (data:any, debug?:Debug.Crumb):Junction => {
        let crumb = debug;
        if(this.spec.tracking && debug !== undefined){
            crumb = debug.drop(`CallIn Contact - put: ${this.label}`)
            .with(data)
        }

        if(this.partner === undefined){
            if(crumb) crumb.raise('CallIn contact has no partner')
        }else if(this.partner.emit === undefined){
            if(crumb) crumb.raise("CallIn contact partner has no emit function")
        }else{
            if(crumb){
                return this.partner.emit(data, crumb);
            }else{
                return this.partner.emit(data);
            }
        }
    };

    emit:(data:any, debug?:Debug.Crumb)=>Junction;

    constructor(public spec: CallExchangeSpec){
        super()
        spec.hasInput = true;
        spec.hasOutput = true;

        this.injectedContext = false;
        this.label = typeof this.spec.tracking == 'string' ? this.spec.tracking : 'unlabelled';
    }

    // partner integration
    invert():CallExchange {
        let inverted = super.invert()
        return inverted
    }

    createPartner():CallExchange {
        return new CallExchange({
            hasInput:this.spec.hasOutput,
            hasOutput:this.spec.hasInput,
            default:this.spec.default,
            forceSync:this.spec.forceSync,
            hook:this.spec.hook,
            tracking:this.spec.tracking,
            type:this.spec.type
        })
    }

    inject(context, key){
        //the targeted property is deposit and react or call-in call-out
        if(this.spec.type === 'hook'){

            if(this.spec.hasInput){

                if(this.spec.tracking){
                    context[key] = (data, tracking:Debug.Crumb)=>{

                        let crumb
                        if((tracking instanceof Debug.Crumb)){
                            crumb = tracking.drop(`CallIn Hook ${this.label}`)
                                .with(data)
                        }else{
                            crumb = new Debug.Crumb(`CallIn Hook Inception ${this.label}`)
                                .with(data)
                        }

                        return this.put(data, crumb)
                    }
                }else{
                    context[key] = this.put
                }

                this.injectedContext = true;
            }

            if(this.spec.hasOutput){

                if(this.spec.tracking){
                    this.emit = (data, tracking:Debug.Crumb)=>{
                        let crumb = tracking ? tracking.drop(`CallOut Hook ${this.label}`)
                            .with(data) : undefined

                        return this.spec.hook.call(context, data, tracking)
                    }
                }else{
                    this.emit = this.spec.hook.bind(context)
                }
            }

        }else if(this.spec.type === 'deposit'){
            let stow = {value:this.spec.default}

            Object.defineProperty(context, key, {
                set:(value)=>{
                    stow.value = value;

                    if(this.spec.hasInput){

                        if(this.spec.tracking){
                            let crumb = new Debug.Crumb("CallExchange - SetReaction")
                                .with(value)

                            this.put(value, crumb)
                        }else{
                            this.put(value)
                        }
                    }
                },
                get:()=>{
                    return stow.value
                },
                enumerable:true
            })

            this.injectedContext = true;


            if(this.spec.hasOutput){

                if(this.spec.tracking){
                    this.emit = (data, crumb)=>{
                        crumb.drop("Deposit Value Grounding")
                        .with(data)

                        if(!(stow.value = data)){
                            crumb.raise("Unable to set value")
                        }

                        return undefined
                    }
                }else{
                    this.emit = (data, crumb)=>{
                        stow.value = data
                        return undefined
                    }
                }

            }

        }else if(this.spec.type === 'retrieve'){

            let stow = {value:this.spec.default}

            if(this.spec.hasInput){
                Object.defineProperty(context, key, {
                    get:()=>{
                        let crumb, promised;
                        if(this.spec.tracking){
                            crumb = new Debug.Crumb("Context injection get Beginning")
                            promised = this.put(undefined, crumb)
                        }else{
                            promised = this.put(undefined)
                        }

                        if(this.spec.forceSync){
                            let zalgo = promised.realize();

                            if(zalgo instanceof Junction){
                                zalgo.then((result)=>{
                                    this.spec.default = result; // update the default later
                                })

                                return this.spec.default //return a default now
                            }else{
                                return zalgo //ok to give sync
                            }
                        }else{
                            return promised
                        }
                    },
                    set:(value)=>{
                        console.log("set value to ", value)
                        this.spec.default = value
                    },
                    enumerable:true
                })
            }

            if(this.spec.hasOutput){

                Object.defineProperty(context, key, {
                    set:(value)=>{
                        this.spec.default = value
                    },
                    enumerable:true
                })

                if(this.spec.tracking){
                    this.emit = (data, crumb)=>{
                        crumb.drop("Retrieve Value Grounding")
                            .with(this.spec.default)
                        return  this.spec.default
                    }
                }else{
                    this.emit = (data, crumb)=>{
                        return this.spec.default
                    }
                }
            }

            this.injectedContext = true;
        }

    }

    retract(context, key){
        if(this.injectedContext){
            delete context[key]
        }
        this.emit = undefined;
    };
}
