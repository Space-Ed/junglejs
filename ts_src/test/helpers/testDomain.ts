import {J, j,Cell, Domain, Composite, Construct,  OpConstruct,  StdOp, deeplyEqualsThrow, Debug} from '../../jungle'
import TestApp from './testApp'

export type AnyTestEvent = Emit|Interjection

export interface TestEvent {
    at:string,
    type:string,
    tid:string|number
}

export interface Interjection extends TestEvent{
    type:'interject'
    func:(testObject:any)=>boolean
}

/**
 * the type of event that creates a call at an emmitter
 */
export interface Emit extends TestEvent {
    type: 'emit',
    value: any
}
                

export interface LogEntry extends TestEvent{
    timestamp: number,
    value:any,
    message:string,
}

export interface SequencerOptions {
    moments:string
    dashTime:number
    schedule:AnyTestEvent[]
    targets?:{[tid:string]:any}
}

export interface TestRunOptions extends SequencerOptions{
    domain:Domain,
    situation: any,
    expected: LogExpectation[],
    done:()=>void
}

enum MFLAG {
    FRAME, WAIT
}

export interface Moment {
    mid: string,
    events: TestEvent[],
    duration: number
}

class EventSequencer{
    moment:number;
    emitters:{[tid:string]:(value:any)=>void}

    schedule:string[]
    log:(event:Detection)=>void;

    mdex:{ [mid:string]:Moment }
    done:()=>void

    targets:any;

    constructor(opt:SequencerOptions){
        this.schedule = [];
        this.emitters = {};
        this.moment = 0
        this.mdex = {}
        this.targets = opt.targets
        this.parseMoments(opt.moments, opt.dashTime)
        this.populateMoments(opt.schedule)
    }

    registerEmitter(tid, emitter){
        this.emitters[tid] = emitter
    }
    
    executeMoment(moment:number){
        
        this.moment = moment       
        let mid = this.schedule[moment]
        
        
        if(mid){
            let actual = this.mdex[mid]
    
            //
            actual.events.forEach((emit:TestEvent, i)=>{

                if(emit.type ==='emit'){
                    this.emitters[emit.tid]((<Emit>emit).value)
                }else if (emit.type ==='interject'){
                    let target = this.targets[emit.tid]

                    try{
                        let result = (<Interjection>emit).func.call(emit, target)
                        if (result !== undefined){
                            this.log({
                                message:"Interjection response",
                                value:result,
                                type:'injresp'
                            })
                        }
                    }
                    catch (e){
                        this.log({
                            message:`Interjection Error: ${e.message}`,
                            value:e,
                            type:'injerr'
                        })
                    }

                    
                }
            })
    
            this.scheduleNext(actual.duration, ()=>{
                this.executeMoment(moment+1)
            })
        }else{ 
            this.done()
        }


    }

    scheduleNext(duration:number, callF:()=>void){
        if (duration === -1){
            callF()
        }else if (duration ===0){
            setImmediate(callF)
        }else {
            setTimeout(callF, duration)
        }
    }

    parseMoments(moments:string, dt:number){
        let flags = moments.split(/\w+/)
        let ids = moments.split(/[-\+]+/)
        let zero = flags.shift()
        flags.pop

        flags.forEach((flag, index)=>{
            let id = ids[index]
            
            let m:Moment = {
                mid: id,
                events: [],
                duration:null
            }

            if(flag.match(/^\-+$/)||flag===''){
                m.duration = flag.length * dt
            }

            else if(flag.match(/^@$/)){
                m.duration = -1
            }

            else if (flag.match(/^\+$/)){
                m.duration = 0
            }

            else {
                throw new RangeError('invalid moment specification string: ' +  moments + 'incorrect flag '+ flag)
            }

            this.schedule.push(id)
            this.mdex[id] = m
        })
    }

    getPresentMID(){
        return this.schedule[this.moment]
    }

    populateMoments(schedule:TestEvent[]){
        schedule.forEach((event, index)=>{
            let moment = this.mdex[event.at]
            
            if(moment !== undefined){ 
                moment.events.push(event)
            }

        })
    }

    run(done){
        this.done = done
        this.executeMoment(0)
    }
}

interface LogSource {
    tid:string|number,
    
}

export type DetectionTypes = 'put' | 'resp' | 'err' | 'injresp' | 'injerr' | 'notify' | 'fetch'

export interface Detection {
    type:DetectionTypes,
    message: string,
    value: any,
}

export interface LogExpectation {
    at?: string,
    tid?: string | number,
    type?:string,
    trel?:number,
    tolerance?: number,
    expect?: 'identity' | 'equality' | 'test' | 'exists'
    value?: any,
    testF?: (expected:LogExpectation, actual: LogEntry) => boolean
    unique?: boolean,
    interest?: boolean,
}

//one per expectation, where the expectation is a fail or interesting, with the expectation and matches, along with message 
export interface LogResult {
    fail:boolean,
    message:string,
    expectation:LogExpectation,
    matches:LogEntry[],
    partials:string[]
}

class EventLog {
    log:LogEntry[];
    
    constructor(public sequencer: EventSequencer){
        this.log = [];
    }

    createLogger(source:LogSource):(event:Detection)=>void{
        return (ev:Detection)=>{
            this.logEvent({
                type:ev.type,
                value:ev.value,
                message:ev.message,
                tid:source.tid,
                at:this.sequencer.getPresentMID(),
                timestamp:new Date().getMilliseconds(),
            })
        }
    }

    private logEvent(event:LogEntry){
        this.log.push(event)
    }

    query(expected:LogExpectation[]):LogResult[]{
        let results:LogResult[] = []
        //for each expectation scan the log and establish the result, 

        expected.forEach((exp, i)=>{
            
            let result:LogResult = {
                expectation:exp,
                fail:false,
                matches:[],
                partials:[],
                message:''
            }

            for (let entry of this.log){
                let {isMatch, reason:matchReason, partial} = this.matchExpectation(exp, entry)
                
                if(isMatch){
                    result.message = matchReason;

                    result.matches.push(entry);
                    
                    let {result:passTest,message:testReason } = this.runTest(exp, entry)
                    
                    if(!passTest){
                        result.fail = true;
                        result.message += '\n     but failed because: \n'+ testReason
                    }else{

                        result.message +=  '\n     and passed because: \n' + testReason
                    }
                    
                    if(exp.unique && result.matches.length == 2){
                        result.fail = true;
                        result.message += 'Multiple matches found for result expected unique'
                        
                        //finding multiple matches
                    }

                    if(result.fail){
                        break;
                    }

                }else{
                    //though we have not matched it does not constitute failure, until absolutely no matches occur 
                    // the partial match information for this expectation may be relevant to debug
                    if(partial){
                        result.partials.push(matchReason)
                    }
                }
            }

            if(result.matches.length === 0){
                result.fail = true;

                if(result.partials.length > 0 ){
                    result.message = 'No complete matches, but partial matches found: \n   '+ result.partials.join('\n   ')
                }else {
                    result.message = 'No results found'
                }
            }

            if(this.isResultInteresting(result)){
                results.push(result)
            }
        })


        return results
    }   

    isResultInteresting(result:LogResult){
        return result.fail || result.expectation.interest
    }

    matchExpectation(exp:LogExpectation, entry:LogEntry):{isMatch:boolean, reason:string, partial:boolean}{
        let isMatch = true
        let partial = false 

        let momentMessage = '',tidMessage='', typeMessage=''
        let positiveMessage = '', negativeMessage = '', counterfactual=''


        if(exp.at !== undefined){
            if(exp.at !== entry.at){
                isMatch = false;
                negativeMessage += ` none at moment: '${exp.at}'`
                counterfactual += ` at moment: '${entry.at}'`
            }else{
                positiveMessage += ` at moment: '${exp.at}'`
                partial = true;
            }
        }

        if (exp.type !== undefined) {
            if (exp.type !== entry.type) {
                isMatch = false;
                negativeMessage += ` none with type: '${exp.type}' `
                counterfactual += ` with type: '${entry.type}'`
            } else {
                positiveMessage += ` with type: '${exp.type}'`
                partial = true;
            }
        }

        if (exp.tid !== undefined) {
            if (exp.tid !== entry.tid) {
                isMatch = false;
                negativeMessage += ` none on detector: '${exp.tid}'`
                counterfactual += ` on detector: '${entry.tid}'`
            } else {
                positiveMessage += ` on detector: '${exp.tid}'`
                partial = true;
            }
        }

        let reason;

        if(partial && !isMatch){
            reason = `Event occurred${positiveMessage } but${negativeMessage} actually ${counterfactual}` 
        }else if(!partial && !isMatch){
            reason =`No event occurred:${negativeMessage} `
        }else if(isMatch){
            reason = `Event occurred:${positiveMessage}`
        }

        return {
            partial:partial,
            isMatch:isMatch,
            reason:reason
        }
    }

    runTest(exp:LogExpectation, entry:LogEntry):{result:boolean, message:string}{
        if (exp.expect === 'equality'){
            try{
                deeplyEqualsThrow(exp.value, entry.value)
                return {result:true, message:'deep equality satisfied'}
            }
            catch (e){
                return {result:false, message:e.message}
            }
            
        }else if(exp.expect === 'identity'){
            let res = exp.value === entry.value
            return {result:res, message:'is identical'}
        }else if(exp.expect === 'test'){
            if(exp.testF === undefined){
                throw new Error('test of type expect:test must contain testF')
            }else{
                let res = exp.testF(exp, entry)
                return {result:res, message:res?'passed test function':'failed test function'}
            }

        }else {
            return {result:true, message:'the event exists in the log'}
        }   
    }

}


/**
 * The client tests using the capabilities of a client, thereby having 
 */
class TestClient extends Composite {

    logger:(event:Detection)=>void

    applyHead(head){
        super.applyHead(head)
        
        this.domain.exposed.targets[head.tid] = this;
        let log = this.domain.exposed.log

        this.logger = log.createLogger({
            tid:head.tid
        })

        this.heart.notify = <any>((occurrance)=>{
            this.logger({
                message:"heart notify",
                value:occurrance,
                type:'notify'
            })
        })

    }

    attach(host, id ){
        super.attach(host, id)

        this.self.agent.notify = (occurrance) => {
            this.logger({
                message: "heart notify",
                value: occurrance,
                type: 'notify'
            })
        }
    }

    clearHead(){
        delete this.domain.exposed.targets[this.head.tid] 
    }



}

/**
 * The detector takes the place of a contact, it can provide a mocked value or carry 
 */
export class DetectorContact extends Construct{


    log:(event:Detection)=>void
    contact:StdOp

    init(spec){
        let outbody = spec.body

        this.log = this.domain.exposed.log.createLogger({
            tid:outbody.tid,
        })

        this.contact = new StdOp({
            label:outbody.tid,
            context:this,
            hook_inward:false,
            hook_outward:false,
            inner_op:this.detectOutward,
            outer_op:this.detectInward,
            mode:'resolve'
        })
        
        super.init(spec)
        
    }

    detectOutward(x) {

        this.log({
            type: 'put',
            value: x,
            message: 'outward put'
        })

        if (this.nucleus.mock instanceof Function) {
            return this.nucleus.mock.call(this.self, x)
        } else {
            return this.nucleus.mock
        }
    }

    detectInward(x) {
        this.log({
            type: 'put',
            value: x,
            message: 'inward put'
        })

        if (this.nucleus.mock instanceof Function) {
            return this.nucleus.mock.call(this.self, x)
        } else {
            return this.nucleus.mock
        }
    }     


    attach(cell: Cell, id) {
        super.attach(cell, id)
        this.domain.exposed.targets[this.nucleus.tid] = this;

        cell.lining.addContact(this.contact, id)
    }

    detach(cell: Cell, id) {
        super.detach(cell, id)
        cell.lining.removeContact(id)
    }
}

export class EmitterContact extends Construct{

    log:(ev:Detection)=>void;
    emit:(value)=>void;
    contact:StdOp;
    tid:string;

    init(spec){
        this.tid = spec.body.tid

        this.log = this.domain.exposed.log.createLogger({
            tid: this.tid,
        })
        
        super.init(spec) 
    }
    
    attach(cell:Cell, id){
        super.attach(cell, id)

        this.contact = new StdOp({
            context: this,
            description: 'test emitter',
            hook_inward: this.nucleus.inward,
            hook_outward: this.nucleus.outward,
            label: this.tid,
            mode: 'resolve'
        })

        let emitAll = (value) => {
            console.log('contact hook ', this.contact.hook)
            if(this.nucleus.inward){
                this.contact.hook.inward(value).then((result) => {
                    this.log({
                        message: 'response to inward emit',
                        type: 'resp',
                        value: result
                    })
                }).catch((err) => {
                    this.log({
                        message: 'error response to inward emit',
                        type: 'err',
                        value: err
                    })
                })
            }

            if(this.nucleus.outward){
                this.contact.hook.outward(value)
                    .then((result) => {
                        this.log({
                            message: 'response to outward emit',
                            type: 'resp',
                            value: result
                        })
                    })
                    .catch((err) => {
                        this.log({
                            message: 'error response to outward emit',
                            type: 'err',
                            value: err
                        })
                    })

            }
        }

        this.domain.exposed.seq.registerEmitter(this.tid, emitAll)
        this.domain.exposed.targets[this.tid] = this;

        cell.lining.addContact(this.contact, id)
    }
    
    detach(cell:Cell, id){
        super.detach(cell, id)
        cell.lining.removeContact(id)
    }
}


    
export function run(opts:TestRunOptions){
    
    let tdom = opts.domain.sub('test')
    
    let targets = {}
    let seq = new EventSequencer({
        dashTime: opts.dashTime,
        moments: opts.moments,
        schedule: opts.schedule,
        targets:targets
    })
    
    let log = new EventLog(seq)
    
    //so that schedule events can be logged
    seq.log = log.createLogger({
        tid: '__sequencer__'
    })
    
    
    tdom
    .define('detector', DetectorContact)
    .define('emitter', EmitterContact)
    
    .define('targets', targets)
    .define('seq', seq)
    .define('log', log)
    // .define('client', j(TestClient, {
        //     domain: 'test'
        // }))
    
    //recover situation -- phase 0
    opts.domain.recover(opts.situation)
    
    //run event schedule 
    seq.run(()=>{
        
        //when schedule complete check the results
        let results:LogResult[] = log.query(opts.expected)
        
        let nfail = results.filter((result)=>(result.fail)).length
        let nsuccess = opts.expected.length - nfail
        let ninterest = results.length - nfail
        
        console.log(`------------Results: Failed: ${nfail} Passed: ${nsuccess} Interesting: ${ninterest}------------`)
        
        //interpret the results as a test
        results.forEach((result, i)=>{
            displayResult(result, i)
        })
        
        console.log(`--------------------------End Results -----------------------------`)
        
        //and carry completion to outside
        delete opts.domain.subdomain.test
        opts.done()
        
    })
}
    
function displayResult(result:LogResult, i :number){
    console.log('\nResult: %d - %s', i, result.fail ? 'FAIL' : 'PASS')
    
    if (result.fail) {
        console.log('\x1b[33m%s\x1b[0m', result.message)
    } else { //interestnig
        console.log(`\nInteresting results of    ${result.message}`)
        result.matches.forEach((match, i)=>{
        displayMatchEntry(match, false)
        })
    }
}

function displayMatchEntry(entry:LogEntry, fail){
    let color = (str) => (fail ? `\x1b[33m${str}\x1b[0m` : `\x1b[34m${str}\x1b[0m`)

    let message = `
event message: ${entry.message}
event value:   ${Debug.dumpToDepthF(4, '   ', )(entry.value)}
    `
    
    console.log(color(message))
}