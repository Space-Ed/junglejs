
import {BaseMedium, Claim, Link, BaseContact} from '../../interoperability/all'
export interface MockMediumSpec {
    fanIn?:boolean,
    fanOut?:boolean,
    seatType?:Function,
    targetType?:Function
}

export class MockMedium extends BaseMedium<any, any> {

    fanIn:boolean; 
    fanOut:boolean;
    
    seatType: Function
    targetType: Function

    constructor(spec:MockMediumSpec){
        super()
        this.fanIn = spec.fanIn || true 
        this.fanOut = spec.fanOut || true 
        this.seatType = spec.seatType || BaseContact
        this.targetType = spec.targetType || BaseContact

        this.inductSeat=jasmine.createSpy('inductSeat',this.inductSeat).and.callThrough()
        this.inductTarget=jasmine.createSpy('inductTarget',this.inductTarget).and.callThrough()
        this.retractSeat=jasmine.createSpy('retractSeat',this.retractSeat).and.callThrough()
        this.retractTarget=jasmine.createSpy('retractTarget',this.retractTarget).and.callThrough()
        this.connect=jasmine.createSpy('connect',this.connect).and.callThrough()
        this.disconnect=jasmine.createSpy('disconnect',this.disconnect).and.callThrough()
    }

    inductSeat(claim: Claim){}
    inductTarget(claim: Claim){}
    retractSeat(token: string){}
    retractTarget(token: string){}
    connect(link: Link){}
    disconnect(link: Link){}


}