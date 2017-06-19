import Jasmine = require('jasmine')
import {Cell} from '../../tertiary/all'
import {Junction} from '../../util/junction'
import {Crumb} from '../../util/debug'
import {JungleDomain} from '../../construction/domain'

export interface CallResponseTestSpec {
    inputContact:string;
    outputContact:string;
    respondant:(data:any, crumb:Crumb)=>Junction;
    inputValues:any[];
    outputValues:any[];
    returnValues:any[];
}

export default class TestApp extends Cell{

    constructor(spec){
        super(spec)
        Crumb.defaultOptions.log = console
        Crumb.defaultOptions.debug = true
    }

    /**
     * create a test on the behaviour of Call contacts.
      essentially choosing an in and out contact(by designator) and the sequences of expected
      receptions and return values
     */
    callResponseTest(spec:CallResponseTestSpec){

        let input = this.shell.designate(spec.inputContact)[spec.inputContact]
        let output = this.shell.designate(spec.outputContact)[spec.outputContact]

        //capture output
        let outspy = jasmine.createSpy('outspy', spec.respondant).and.callThrough()
        output.emit = outspy;

        for(let i = 0; i < spec.inputValues.length; i++){
            let ival = spec.inputValues[i]
            let ret = input.put(ival)

            if(spec.outputValues[i] === Symbol.for('NOCALL')){
                expect(outspy).not.toHaveBeenCalled();
            }else{
                expect(outspy).toHaveBeenCalledWith(spec.outputValues[i])
            }
            expect(ret).toEqual(spec.returnValues[i])
        }
    }

}
