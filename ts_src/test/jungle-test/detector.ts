import {TestDomain} from './domain'
import { Construct, StdOp, Cell } from '../../jungle'
import { Detection } from './interfaces'
/**
 * The detector takes the place of a contact, it can provide a mocked value or carry 
 */
export class DetectorContact extends Construct {

    domain: TestDomain

    log: (event: Detection) => void
    contact: StdOp

    init(spec) {
        let outbody = spec.body

        this.log = this.domain.log.createLogger({
            tid: outbody.tid,
        })

        this.contact = new StdOp({
            label: outbody.tid,
            context: this,
            hook_inward: false,
            hook_outward: false,
            inner_op: this.detectOutward,
            outer_op: this.detectInward,
            mode: 'resolve'
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
        this.domain.targets[this.nucleus.tid] = this;

        cell.lining.addContact(this.contact, id)
    }

    detach(cell: Cell, id) {
        super.detach(cell, id)
        cell.lining.removeContact(id)
    }
}