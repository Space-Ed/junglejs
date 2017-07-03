


import * as I from '../interfaces'
import {mediaConstructors,BaseMedium } from './medium'
import {ExchangeTypes,CallExchangeSpec,CallExchange} from '../contacts/call/exchange'


export class ExchangeMedium extends BaseMedium<CallExchange, CallExchange> {
    typeA = CallExchange;
    typeB  = CallExchange;

    constructor(spec:I.MediumSpec){
        super(spec);
    }

    distribute(sourceToken:string, data:any, crumb){
        for(let sinkToken in this.matrix.to[sourceToken]){
            let allFromA = this.matrix.to[sourceToken];
            let sink:CallExchange = allFromA[sinkToken].contactB
            sink.put(data, crumb)
        }
    }

    inductA(token:string, a:CallExchange){
        console.log("inducting A:", token )
        a.emit = this.distribute.bind(this, token)
    }

    inductB(token:string, b:CallExchange){
    }

    connect(link: I.LinkSpec<CallExchange, CallExchange>){
    }

    disconnect(link: I.LinkSpec<CallExchange, CallExchange>){
        super.disconnect(link)
        link.contactA.emit = undefined;
    }
}
