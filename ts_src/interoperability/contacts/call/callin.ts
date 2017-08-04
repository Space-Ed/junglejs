
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
         return new CallOut(this.spec)
    }

}
