


import * as I from '../../interfaces'
import {BasicContact} from '../base'
import {CallOut} from './callout'
import * as Debug from '../../../util/debug'
import {Junction} from '../../../util/junction'

export enum ExchangeTypes{
    Hook, Value
}

export type CallExchangeSpec = FuncExchangeSpec|ReactiveValueSpec

export interface FuncExchangeSpec {
    type:ExchangeTypes.Hook;
    hook:Function;
}

export interface ReactiveValueSpec {
    type:ExchangeTypes.Value;
    default:any
}

export class CallExchange extends BasicContact<CallExchange> {

    //capability flags must be decided
    public symmetric = true;
    public invertable = true;

    put(data:any, debug:Debug.Crumb):Junction{
        let crumb = debug.drop("CallExchange")
            .with(data)

        return this.partner.emit(data, crumb)
    };

    emit:(data:any, debug:Debug.Crumb)=>Junction;

    constructor(private spec: CallExchangeSpec){
        super()
    }

    // partner integration
    invert():CallExchange {
        let inverted = super.invert()
        return inverted
    }

    createPartner():CallExchange {
        return new CallExchange(this.spec)
    }

    inject(context, key){
        //the targeted property is deposit and react or call-in call-out

        if(this.spec.type === ExchangeTypes.Hook){

            context[key] = (data, tracking:Debug.Crumb)=>{
                let crumb = tracking.drop("CallExchange")
                    .with(data)

                return this.put(data, crumb)
            }

            this.emit = this.spec.hook.bind(context)

        }else if(this.spec.type === ExchangeTypes.Value){
            let stow = {value:this.spec.default}

            Object.defineProperty(context, key, {
                set:(value)=>{
                    stow.value = value;

                    let crumb = new Debug.Crumb("CallExchange - SetReaction")
                        .with(value)

                    this.put(value, crumb)
                },
                get:()=>{
                    return stow.value
                }
            })

            this.emit = (data, tracking)=>{
                tracking.drop("Deposit Value Grounding")
                    .with(data)

                if(!(stow.value = data)){
                    tracking.raise("Unable to set value")
                }

                return undefined
            }

        }

    }

    retract(context, key){
        delete context[key]
        this.emit = undefined;
    };
}
