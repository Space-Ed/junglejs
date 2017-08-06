
import * as I from '../../interfaces'
import {CallExchange, CallExchangeSpec} from './exchange'
import {CallIn} from './callin'


export class CallOut extends CallExchange {

    invertable = true;
    symmetric = false;

    constructor(spec:CallExchangeSpec){
        super(spec)
        this.spec.hasInput = false, this.spec.hasOutput = true;
    }

    invert():CallIn{
        return <CallIn>super.invert();
    }

    createPartner():CallIn{
        return new CallIn({
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
