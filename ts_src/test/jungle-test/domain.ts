export * from './interfaces'
export * from './log'
export * from './emitter'
export * from './detector'
export * from './schedule'
export * from './cell'

import {EmitterContact, DetectorContact, TestCell, EventSequencer, EventLog} from '../jungle-test/domain'

import {j, Domain} from '../../jungle'

export class TestDomain extends Domain {

    seq:EventSequencer
    log:EventLog
    targets:{[tid:string]:any}

    constructor(opts){
        super()

        let targets = {}

        let seq = new EventSequencer({
            dashTime: opts.dashTime || 10,
            moments: opts.moments,
            schedule: opts.schedule,
            targets: targets
        })

        let log = new EventLog(seq)

        //so that schedule events can be logged
        seq.log = log.createLogger({
            tid: '__sequencer__'
        })

        this
            .define('detector', j(DetectorContact, {domain:this}))
            .define('emitter', j(EmitterContact, {domain:this}))
            .define('cell', j(TestCell, {domain:this}))
            // .define('client', j(TestClient, {
            //     domain: 'test'
            // }))

        this.seq = seq
        this.log = log
        this.targets = targets
    }

    
}
