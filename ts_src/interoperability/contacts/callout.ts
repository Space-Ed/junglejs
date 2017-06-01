
import * as I from '../interfaces'


import {BasicContact} from './base'
import {CallIn} from './callin'

export class CallOut extends BasicContact<CallIn> {

    invertable = true;
    symmetric = false;

    constructor(private spec:I.CallContactSpec){
        super()
    }

    emit:(data, track?)=>any;

    invert(){
        return super.invert();
    }

    createPartner(){
        return new CallIn(this.spec)
    }

    inject(context, key){

    }

    retract(context, key){

    }

}
