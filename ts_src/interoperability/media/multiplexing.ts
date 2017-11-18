

import {Claim, Link, BaseMedium } from './base'
import {Junction} from '../../util/all'
import * as Debug from '../../util/debug'

import {BaseContact} from '../contacts/base'
import {Call} from '../contacts/call'

export type CallContact = Call<any>
export type CallIn = CallContact
export type CallOut = CallContact

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



export interface MuxMediumSpec{
    symbols:string[],         //the symbols that decide what the keys to mux and demux with
    emitArgType: DEMUXARG,    //how the argment is interpreted and unpacked
    emitRetType: MUXRESP,     //how the return value is arrived at
    emitCallType:CALLTYPE,    //how to call across
}

export class MuxMedium extends BaseMedium <CallOut, CallIn> {

    emitScope:any;

    seatType = Call
    targetType = Call
    fanIn = true
    fanOut = true

    constructor(private muxspec:MuxMediumSpec){
        super();

        if(muxspec.emitCallType == CALLTYPE.DIRECT){
            this.fanIn = false;
            this.fanOut = false;
        }
    }

    emitArgProcess(inpArg, crumb, sink:CallIn, link:Link<CallOut, CallIn>):{arg:any, escape:boolean}{
        let arg, escape

        let eType:DEMUXARG = this.muxspec.emitArgType

        if(eType === DEMUXARG.DONT){
            arg = inpArg
        }else { // DEMUX

            if (eType == DEMUXARG.ONE){
                if (this.emitScope.oneDone){
                    crumb.raise(`Incoming packet breaches single target constraint`)
                    return
                }else{
                    this.emitScope.oneDone = true;
                }
            }

            let packet = inpArg

            for(let symk in this.muxspec.symbols){
                let sym = this.muxspec.symbols[symk]

                if(sym in link.bindings){
                    let bound = link.bindings[sym]

                    if(!(packet instanceof Object)){
                        crumb.raise(`incoming packet must be object to be demuxed`)
                    }

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
        }

        return {arg:arg, escape:escape}

    }

    emitResponse(putResp, crumb:Debug.Crumb, link:Link<CallOut, CallIn>){
        let Rtype = this.muxspec.emitRetType;
        let emitResp = putResp;

        if(Rtype == MUXRESP.DROP){
            return null
        }else if(Rtype == MUXRESP.MAP){
            let demuxterms = []

            for(let symk in this.muxspec.symbols){
                let sym = this.muxspec.symbols[symk]
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
        let allFromA = this.claims[sourceToken].outbound;

        this.beginEmit();


        for(let sinkToken in allFromA){
            let link = <Link<CallOut, CallIn>>allFromA[sinkToken]
            let sink:CallIn = link.target.contact

            //perform switching 
            let {arg, escape} = this.emitArgProcess(data, crumb, sink, link);

            if(!escape){
                let putResp = sink.put(arg, crumb);
    
                this.emitResponse(putResp, crumb, link)
            }
            //Only depth first
            //HACK: setting undefined argument ill advised

        }

        return this.endEmit();
    }

    beginEmit(){
        this.emitScope = {};
        this.emitScope.junction = new Junction()

        if(this.muxspec.emitRetType in JunctionModeKeys){
            this.emitScope.junction.mode(JunctionModeKeys[this.muxspec.emitRetType])
        }

        if(this.muxspec.emitArgType == DEMUXARG.ONE){
            this.emitScope.oneDone = false
        }

        this.emitScope.packet = {};
    }

    endEmit(){
        let junc = this.emitScope.junction;
        this.emitScope = undefined
        return junc
    }

    inductSeat(claim: Claim<CallOut>) {
        if (this.muxspec.emitCallType !== CALLTYPE.DIRECT) {
            claim.contact.emit = this.emitter.bind(this, claim.token)
        }
    }

    inductTarget(claim: Claim<CallIn>) { }
    retractSeat(token: string) { }
    retractTarget(token: string) { }

    connect(link: Link<CallOut, CallIn>) {
        if (this.muxspec.emitCallType == CALLTYPE.DIRECT) {
            link.seat.contact.emit = link.target.contact.put
        }
    }

    disconnect(link: Link<CallOut, CallIn>) { 
        link.seat.contact.emit = undefined;
    }

}
