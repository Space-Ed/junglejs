
import * as I from '../../interfaces'
import {CallExchange, CallExchangeSpec} from './exchange'
import {CallOut} from './callout'

export class CallIn extends CallExchange {

    //capability flags must be decided
    public symmetric = false;
    public invertable = true;

    constructor(spec:CallExchangeSpec){
        super(spec)
        spec.hasInput=true; spec.hasOutput = false
    }

    invert():CallOut{
        return <CallOut>super.invert()
    }

    createPartner():CallOut{
         return new CallOut({
             hasInput:this.spec.hasOutput,
             hasOutput:this.spec.hasInput,
             default:this.spec.default,
             forceSync:this.spec.forceSync,
             hook:this.spec.hook,
             tracking:this.spec.tracking,
             type:this.spec.type
         })
    }

}
