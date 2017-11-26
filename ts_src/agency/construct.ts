import { Agent, AgentConfig } from './common'
import { Composite } from '../construction/composite'
import { Construct } from '../construction/construct'

export class BedAgent implements Agent {

    constructor(public home: Composite, public config: AgentConfig) { }

    /**
        distribute the patch among components accordingly
    */
    patch(patch: any) {
        return this.home._patch(patch)
    }

    /**
     * assigned by pool called by the anchor agent patch of the child
     */
    notify: (patch) => void;

    /**
     * extract by delving into the inner components called by the pool
     */
    extract(voidspace: any):any {
        return this.home._extract(voidspace)
    }

    /**
     * assigned by pool called by the anchor agent extract of the child
     */
    fetch: (voidspace: any)=>any;

}

export class AnchorAgent implements Agent {

    constructor(public home: Construct, public config: AgentConfig) { }

    /**
     * escalate the notification to the outer context
     */
    patch(patch: any) {
        if (this.home.notify instanceof Function) {
            // let qualified = {}
            // qualified[this.home.alias] = patch
            return this.home.notify(patch)
        }
    }

    /**
     * assigned by pool called by the host decomposing patch
     */
    notify: (patch) => any;

    /**
     * extract by fetching from the outer context
     */
    extract(voidspace: any): any {
        if (this.home.fetch instanceof Function) {
            // let qualified = {}
            // qualified[this.home.alias] = voidspace

            return this.home.fetch(voidspace)
        }
    }

    /**
     * assigned by pool called by the host decomposing extract
     */
    fetch: (voidspace: any) => any;

}