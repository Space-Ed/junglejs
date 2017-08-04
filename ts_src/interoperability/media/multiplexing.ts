

import * as I from '../interfaces'
import {mediaConstructors,BaseMedium } from './medium'
import {ExchangeTypes, CallIn, CallOut,CallExchange} from '../contacts/call/common'
import {Junction} from '../../util/all'
import * as Debug from '../../util/debug'

/*
    A one size fits all callover contraption, designed to work with:

    - pull and push modes of operation
    - any degree from onto one through many to many
    - restrictions on incoming, to give sensible misuse exceptions
    - any way of creating a response.

    eventually should be possible to specify by an expression.

*/

export enum DEMUXARG {
    ONE,   //demux exactly one
    SOME,  //demux what you can
    DONT,  //leave the argument as is
    ALL,   //require all tokens to be present
}

export enum CALLTYPE {
    DIRECT,        //require the call to go straight to target
    BREADTH_FIRST, //outgoing calls are all executed asynchronously
    DEPTH_FIRST,   //outgoing calls are executed
    SERIAL         //only one call can be made at once
}

export enum MUXRESP {
    RACE,  //wait until something happens
    FIRST, //wait for the first actual response
    LAST,  //take the last response
    MAP,   //create an object of responses based off syms
    ORDER,   //all responses come as ordered key value pairs
    DROP,    //dont even collect responses, just return nothing straight away
}

const JunctionModeKeys:{[muxresp:number]:string} = {}

JunctionModeKeys[MUXRESP.RACE]="race"
JunctionModeKeys[MUXRESP.FIRST]="first"
JunctionModeKeys[MUXRESP.LAST]="last"
JunctionModeKeys[MUXRESP.MAP]="object"
JunctionModeKeys[MUXRESP.ORDER]="array"



export interface MuxMediumSpec extends I.MediumSpec{
    symbols:string[],         //the symbols that decide what the keys to mux and demux with
    emitArgType: DEMUXARG,    //how the argment is interpreted and unpacked
    emitRetType: MUXRESP,     //how the return value is arrived at
    emitCallType:CALLTYPE,    //how to call across
}

export class MuxMedium extends BaseMedium <CallOut, CallIn> {

    typeA = CallExchange;
    typeB  = CallExchange;

    emitScope:any;

    constructor(private muxspec:MuxMediumSpec){
        super(muxspec);
    }

    emitArgProcess(inpArg, crumb, sink:CallIn, link:I.LinkSpec<CallOut, CallIn>){
        let arg, escape

        let eType:DEMUXARG = this.muxspec.emitArgType

        if(eType === DEMUXARG.DONT){
            arg = inpArg
        }else if(eType !== DEMUXARG.ONE){

            let packet = inpArg

            for(let sym of this.muxspec.symbols){

                if(sym in link.bindings){
                    let bound = link.bindings[sym]

                    if(bound in packet){
                        packet = packet[bound] //demux
                    }else{
                        //packet has no binding for this mux symbol
                        if(eType === DEMUXARG.ALL){
                            crumb.raise(`Incoming packet must include key: ${bound}, but only has ${Object.getOwnPropertyNames(packet)}`)
                        }
                    }
                }else{
                    //media symbol does not appear in the link bindings
                }
            }

            arg = packet
        }else if(eType == DEMUXARG.ONE){

        }

    }

    emitResponse(putResp, crumb:Debug.Crumb, link:I.LinkSpec<CallOut, CallIn>){
        let Rtype = this.muxspec.emitRetType;
        let emitResp = putResp;

        if(Rtype == MUXRESP.DROP){
            return null
        }else if(Rtype == MUXRESP.MAP){
            let demuxterms = []

            for(let sym in this.muxspec.symbols){
                if(sym in link.bindings){
                    let term = link.bindings[sym]
                    demuxterms.push(term)
                }
            }

            this.emitScope.junction.merge(putResp, demuxterms)
        }else if(Rtype == MUXRESP.FIRST || Rtype === MUXRESP.LAST || Rtype === MUXRESP.RACE ){
            this.emitScope.junction.merge(putResp)
        }
    }

    emitter(sourceToken, data:any, crumb){

        //get all outgoing
        let allFromA = this.matrix.to[sourceToken];

        this.beginEmit();


        for(let sinkToken in allFromA){
            let link:I.LinkSpec<CallOut, CallIn> = allFromA[sinkToken]
            let sink:CallIn = link.contactB

            let arg = this.emitArgProcess(data, crumb, sink, link);

            //Only depth first
            let putResp = sink.put(arg, crumb.drop());

            this.emitResponse(putResp, crumb, link)

        }

        return this.endEmit();
    }

    beginEmit(){
        this.emitScope = {};
        this.emitScope.junction = new Junction()

        if(this.muxspec.emitRetType in JunctionModeKeys){
            this.emitScope.junction.mode(JunctionModeKeys[this.muxspec.emitRetType])
        }

        this.emitScope.packet = {};
    }

    endEmit(){
        let junc = this.emitScope.junction;
        this.emitScope = undefined
        return junc
    }

    inductA(token:string, a:CallOut){
        a.emit = this.emitter.bind(this, token)
    }

    inductB(token:string, b:CallIn){
    }

    connect(link: I.LinkSpec<CallOut, CallIn>){
    }

    check(link: I.LinkSpec<CallOut, CallIn>){
        let superok =  super.check(link)
        let out = link.contactA.spec.hasOutput
        let inp = link.contactB.spec.hasInput
        console.log("checked link", superok, " out: ", out, '  inp:', inp)

        return superok && out && inp
    }

    disconnect(link: I.LinkSpec<CallOut, CallIn>){
        super.disconnect(link)
        link.contactA.emit = undefined;
    }
}
