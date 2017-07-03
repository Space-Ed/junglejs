import Jasmine = require('jasmine')
import {Cell} from '../../tertiary/all'
import {Junction} from '../../util/junction'
import {Crumb} from '../../util/debug'
import {CallIn, CallOut, CallExchange} from '../../interoperability/contacts/call/common'

export interface CallResponseTestSpec {
    label?:string;
    inputContact:string;
    outputContact:string;
    respondant?:(data:any, crumb:Crumb)=>Junction;
    inputValues:any[];
    outputValues:any[];
    returnValues?:any[];
}

export interface CallReturnTestSpec {
    label?:string;
    inputContact:string;
    inputValues:any[];
    returnValues:any[];
}

export default class TestApp extends Cell{

    debug:boolean;

    constructor(spec){
        super(spec)
        Crumb.defaultOptions.log = console
        Crumb.defaultOptions.debug = true
    }

    applyForm(form:any={}){

        super.applyForm(form);
        this.debug = form.debug;

        this.parseSectionRule("*.**:* to shell as _")
    }

    call(contact:string, data:any){
        let input = this.shell.designate(contact)[contact];
        input.put(data)
    }

    /**
     * create a test on the behaviour of Call contacts.
      essentially choosing an in and out contact(by designator) and the sequences of expected
      receptions and return values
     */
    callResponseTest(spec:CallResponseTestSpec){

        let input = this.shell.designate(spec.inputContact)[spec.inputContact]
        let output = this.shell.designate(spec.outputContact)[spec.outputContact]

        let respondant = spec.respondant || ((data, crumb)=>{
            return data
        })

        //capture output
        let outspy = jasmine.createSpy('outspy', respondant).and.callThrough()
        output.emit = outspy;

        for(let i = 0; i < spec.inputValues.length; i++){

            let ival = spec.inputValues[i]

            let ret
            if(this.debug){
                let crumb = new Crumb(`Call Response Test - ${spec.label||"unlabelled"}`)
                .at('start')
                .with(ival)

                ret = input.put(ival, crumb)
            }else{
                ret = input.put(ival)
            }

            if(spec.outputValues[i] === Symbol.for('NOCALL')){
                expect(outspy).not.toHaveBeenCalled();
            }else{
                expect(outspy.calls.first().args[0]).toBe(spec.outputValues[i])
            }

            if(spec.returnValues !== undefined){
                expect(ret).toEqual(spec.returnValues[i])
            }
        }
    }

    callReturnTest(spec:CallReturnTestSpec){

        let input = this.shell.designate(spec.inputContact)[spec.inputContact]

        for(let i = 0; i < spec.inputValues.length; i++){
            let ival = spec.inputValues[i]

            let ret;
            if(this.debug){
                let crumb = new Crumb(`Call Return Test - ${spec.label||"unlabelled"}`)
                .at('start')
                .with(ival)

                ret = input.put(ival, crumb)
            }else{
                ret = input.put(ival)
            }

            if(spec.returnValues !== undefined){
                expect(ret).toEqual(spec.returnValues[i])
            }
        }
    }
}
