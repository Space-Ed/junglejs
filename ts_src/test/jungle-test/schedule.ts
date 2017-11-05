
import {SequencerOptions , Detection , Moment, Interjection, TestEvent, Emit ,AnyTestEvent} from './interfaces'

export class EventSequencer {
    moment: number;
    emitters: { [tid: string]: (value: any) => void }

    schedule: string[]
    log: (event: Detection) => void;

    mdex: { [mid: string]: Moment }
    done: () => void

    targets: any;

    constructor(opt: SequencerOptions) {
        this.schedule = [];
        this.emitters = {};
        this.moment = 0
        this.mdex = {}
        this.targets = opt.targets
        this.parseMoments(opt.moments, opt.dashTime)
        this.populateMoments(opt.schedule)
    }

    registerEmitter(tid, emitter) {
        this.emitters[tid] = emitter
    }

    executeMoment(moment: number) {

        this.moment = moment
        let mid = this.schedule[moment]


        if (mid) {
            let actual = this.mdex[mid]

            //
            actual.events.forEach((emit: AnyTestEvent, i) => {
                let target = this.targets[emit.tid]
                
                if (emit.type === 'emit') {
                    this.emitters[emit.tid]((<Emit>emit).value)
                } else if (emit.type === 'interject') {
                    try {
                        let result = (<Interjection>emit).func.call(null, emit, target)
                        if (result !== undefined) {
                            target.log({
                                message: "Interjection response",
                                value: result,
                                type: 'injresp'
                            })
                        }
                    }
                    catch (e) {
                        target.log({
                            message: `Interjection Error: ${e.message}`,
                            value: e,
                            type: 'injerr'
                        })
                    }

                } else if (emit.type == 'inspect'){

                    let val = target[emit.prop]

                    target.log({
                        message: 'Inpected Property',
                        value: val,
                        type:'inspect'
                    })
                }
            })

            this.scheduleNext(actual.duration, () => {
                this.executeMoment(moment + 1)
            })
        } else {
            this.done()
        }
    }

    scheduleNext(duration: number, callF: () => void) {
        if (duration === -1) {
            callF()
        } else if (duration === 0) {
            setImmediate(callF)
        } else {
            setTimeout(callF, duration)
        }
    }

    parseMoments(moments: string, dt: number) {
        let flags = moments.split(/\w+/)
        let ids = moments.split(/[-\+]+/)
        let zero = flags.shift()
        flags.pop

        flags.forEach((flag, index) => {
            let id = ids[index]

            let m: Moment = {
                mid: id,
                events: [],
                duration: null
            }

            if (flag.match(/^\-+$/) || flag === '') {
                m.duration = flag.length * dt
            }

            else if (flag.match(/^@$/)) {
                m.duration = -1
            }

            else if (flag.match(/^\+$/)) {
                m.duration = 0
            }

            else {
                throw new RangeError('invalid moment specification string: ' + moments + 'incorrect flag ' + flag)
            }

            this.schedule.push(id)
            this.mdex[id] = m
        })
    }

    getPresentMID() {
        return this.schedule[this.moment]
    }

    populateMoments(schedule: TestEvent[]) {
        schedule.forEach((event, index) => {
            let moment = this.mdex[event.at]

            if (moment !== undefined) {
                moment.events.push(event)
            }

        })
    }

    run(done) {
        this.done = done
        this.executeMoment(0)
    }
}