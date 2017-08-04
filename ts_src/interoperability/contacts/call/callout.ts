
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
        return new CallIn(this.spec)
    }

}
