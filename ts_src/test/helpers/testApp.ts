import Jasmine = require('jasmine')
import {Cell} from '../../tertiary/all'
import {Junction} from '../../util/all'
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

    applyHead(head:any={}){
        Crumb.defaultOptions.log = console
        Crumb.defaultOptions.debug = true

        super.applyHead(head);
        this.debug = head.debug;


    }

    call(contact:string, data:any){
        let input = this.shell.scan(contact)[contact];

        let crumb = new Crumb("Call from TestApp")
            .with(data)

        return input.put(data, crumb)
    }

    /**
     * create a test on the behaviour of Call contacts.
      essentially choosing an in and out contact(by designator) and the sequences of expected
      receptions and return values
     */
    callResponseTest(spec:CallResponseTestSpec):Junction{

        let input = this.shell.scan(spec.inputContact)[spec.inputContact]

        expect(input).toBeDefined("Unable to find input contact")

        let output = this.shell.scan(spec.outputContact)[spec.outputContact]

        expect(output).toBeDefined("Unable to find output contact")

        let respondant = spec.respondant || ((data, crumb)=>{
            return data
        })

        //capture output
        let outspy = jasmine.createSpy('outspy', respondant).and.callThrough()
        output.emit = outspy;

        let allDone = new Junction()

        for(let i = 0; i < spec.inputValues.length; i++){

            let ival = spec.inputValues[i]

            allDone.then(()=>{
                let ret
                if(this.debug){
                    let crumb = new Crumb(`Call Response Test - ${spec.label||"unlabelled"}`)
                    .at('start')
                    .with(ival)

                    ret = input.put(ival, crumb)
                }else{
                    ret = input.put(ival)
                }
                return ret
            }).then((ret)=>{
                if(spec.outputValues[i] === Symbol.for('NOCALL')){
                    expect(outspy).not.toHaveBeenCalled();
                }else{
                    expect(outspy).toHaveBeenCalled();
                    expect(outspy.calls.first().args[0]).toBe(spec.outputValues[i])
                }

                if(spec.returnValues !== undefined){
                    expect(ret).toEqual(spec.returnValues[i])
                }
            })
        }

        return allDone
    }

    callReturnTest(spec:CallReturnTestSpec):Junction{
        console.log(`------------Call Return Test - ${spec.label||"unlabelled"}----------------`)
        let input = this.shell.scan(spec.inputContact)[spec.inputContact]
        expect(input).toBeDefined("Unable to find input contact")


        let allDone = new Junction()

        for(let i = 0; i < spec.inputValues.length; i++){
            let ival = spec.inputValues[i]

            allDone.then(()=>{
                let ret;
                if(this.debug){
                    let crumb = new Crumb(`Call Return Test - ${spec.label||"unlabelled"}`)
                    .at('start')
                    .with(ival)

                    ret = input.put(ival, crumb)
                }else{
                    ret = input.put(ival)
                }

                return ret
            }).then((ret)=>{
                if(spec.returnValues !== undefined){
                    expect(ret).toEqual(spec.returnValues[i], `Call Return Test - ${spec.label||"unlabelled"} -\n     unexpected return value`)
                }
            })

        }

        allDone.then(()=>{
            console.log('------------------------------------------------------------------\n\n')
        })

        return allDone
    }

}
