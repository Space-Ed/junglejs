import {Construct, StdOp, Cell} from '../../jungle'
import {Detection} from './interfaces'
import {TestDomain} from './domain'

export class EmitterContact extends Construct {

    log: (ev: Detection) => void;
    emit: (value) => void;
    contact: StdOp;
    tid: string;

    domain:TestDomain

    init(spec) {
        this.tid = spec.body.tid

        this.log = this.domain.log.createLogger({
            tid: this.tid,
        })

        super.init(spec)
    }

    attach(cell: Cell, id) {
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
            if (this.nucleus.inward) {
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

            if (this.nucleus.outward) {
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

        this.domain.seq.registerEmitter(this.tid, emitAll)
        this.domain.targets[this.tid] = this;

        cell.lining.addContact(this.contact, id)
    }

    detach(cell: Cell, id) {
        super.detach(cell, id)
        cell.lining.removeContact(id)
    }
}