
import {Agent, AgentConfig} from '../../construction/agency'

import Jasmine = require('jasmine')

export class MockAgent implements Agent{

    patchSpy:jasmine.Spy
    extractSpy:jasmine.Spy

    constructor(public config:AgentConfig, public extractResult, public patchResult){
        this.patchSpy = jasmine.createSpy('patch')
        this.extractSpy = jasmine.createSpy('extract')
    }

    reset(){
        this.patchSpy.calls.reset()
        this.extractSpy.calls.reset()
    }

    /**
        distribute the patch among components accordingly
    */
    patch(patch:any):any{
        this.patchSpy(patch)
        return this.patchResult
    }

    /**
     * assigned by pool called by the anchor agent patch of the child
     */
    notify:(patch)=>any;

    /**
     * extract by delving into the inner components called by the pool
     */
    extract(voidspace:any):any{
        this.extractSpy(voidspace)
        return this.extractResult
    }

    /**
     * assigned by pool called by the anchor agent extract of the child
     */
    fetch:(voidspace:any)=>any;

}
