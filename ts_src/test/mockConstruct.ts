
import {Construct} from '../construction/base/construct'
import {Composite} from '../construction/complex/composite'

import jasmine from 'jasmine'

export class MockConstruct extends Construct<Composite> {

    state:any
    spies:any

    constructor(spec:{patch:"message"}){
        super({
            basis:"Mocked",
            patch:{
                message:"Hello"
            }
        })

        this.state = this.cache.patch;

        this.spies = jasmine.createSpyObj('mock-construct', [
            'prime',
            'dispose',
            'extract',
            'graft'
        ])
    }

    /*
        Called to perform operations readying for action
            - called post induct.
            - recursive for composite.
            - sets alive
            - depends on parent
    */
    prime(){
        this.spies.prime(this.state.message)
    }

    /*
        Called at the end of life of the construct,
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose():any{
        this.spies.dispose(this.state.message)
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any {
        this.spies.extract(this.state.message)
        return this.cache;
    }

    /*
        modification of live structure by application of a patch, leaving the implementation to the subclasses
    */
    patch(patch){
        this.state.message = patch.message;
        this.spies.graft(this.state.message)

    }
}
