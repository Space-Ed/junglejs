import {Domain} from '../../jungle'

export type AnyTestEvent = Emit | Interjection | Inspection

export interface TestEvent {
    at: string,
    type: string,
    tid: string | number
}

export interface Interjection extends TestEvent {
    type: 'interject'
    func: (event:Interjection, testObject: any) => any
}

export interface Emit extends TestEvent {
    type: 'emit',
    value: any
}

export interface Inspection extends TestEvent {
    type:'inspect',
    prop:string,
}

export interface LogEntry extends TestEvent {
    timestamp: number,
    value: any,
    message: string,
}

export interface SequencerOptions {
    moments: string
    dashTime?: number
    schedule: AnyTestEvent[]
    targets?: { [tid: string]: any }
}

export interface TestRunOptions extends SequencerOptions {
    domain: Domain,
    situation: any,
    expected: LogExpectation[],
    done: () => void
}

export interface Moment {
    mid: string,
    events: TestEvent[],
    duration: number
}

//
// Logging Interfaces
//
export interface LogSource {
    tid: string | number,

}

export type DetectionTypes = 'put' | 'resp' | 'err' | 'injresp' | 'injerr' | 'notify' | 'fetch'

export interface Detection {
    type: DetectionTypes,
    message: string,
    value: any,
}

export interface LogExpectation {
    at?: string,
    tid?: string | number,
    type?: string,
    trel?: number,
    tolerance?: number,
    expect?: 'identity' | 'equality' | 'test' | 'exists' | 'nothing'
    value?: any,
    testF?: (expected: LogExpectation, actual: LogEntry) => boolean
    unique?: boolean,
    interest?: boolean,
}

//one per expectation, where the expectation is a fail or interesting, with the expectation and matches, along with message 
export interface LogResult {
    fail: boolean,
    message: string,
    expectation: LogExpectation,
    matches: LogEntry[],
    partials: string[],
    index:number
}