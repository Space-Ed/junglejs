
import {Domain, Description} from './domain'
import * as Util from '../util/all'

import {deepMeldF} from '../util/ogebra/hierarchical';
import {meld} from '../util/ogebra/operations'

import {Junction} from '../util/junction/junction'

import {ExposureLevel, ReachLevel, AccessoryState} from './state'

import {AnchorAgent, BedAgent} from './agency'
/*

    The construct is a foundational interface that defines all the requirements to being a part of the jungle system.
    The requirements are designed to uphold the principles of:
        nestability: a construct can be part of a composite construct.
        recoverability: every construct can be serialised and recovered elsewhere/when, with a similar state.
        domain-specific: constructions occur within a specified domain.
        declarative construction: construct creation can have effects on context, so long as it is permutable with other creations.
        declarative connectedness: nothing can independently decide to have an effect on something else, it is only with a context that this is possible.


    ****Extending Checklist ****
    - extract must serialise with a reconstructable artefact.

*/

export abstract class Construct{

    origins:string[];
    basis:string;
    head:any;

    //state
    nucleus:any;
    local:any;
    exposed:any;

    exposure:ExposureLevel;
    reach:ReachLevel;
    remote:boolean;

    //tractors

    beginTractor: () => void;
    endTractor: () => void;
    primeTractor: () => void;
    disposeTractor: () => void;

    constructor(public domain: Domain) {
    }

    /*
        bring the the construct to life
    */
    init(desc:Description){
        this.origins = desc.origins;
        this.basis = desc.basis;

        this.applyHead(desc.head)
        
        this._patch(desc.body)

        let primeResult = this.primeTractor ? this.primeTractor.call(this.nucleus) : undefined

    }

    /*
        end the life of the construct.
        should return it's final description, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose(){

        if (this.disposeTractor) { this.disposeTractor.call(this.nucleus) }

        this.clearHead()
    }

    /**
     * Apply the essential characteristics of the Construct, that will be immutable over its lifetime.
     */
    protected applyHead(head:any={}){
        this.head = head;
        this.exposure = head.exposure     || 'local'
        this.reach = head.reach           || 'host'
        this.remote = head.remote         || false

        this.beginTractor = head.begin;
        this.endTractor = head.end;
        this.primeTractor = head.prime
        this.disposeTractor = head.dispose


    }

    /**
     *Restore the object so preheaded state
     */
    protected clearHead(){
        this.primeTractor = undefined
        this.disposeTractor = undefined
        this.exposure =undefined
        this.reach = undefined
        this.remote = undefined
    }

    /**
     * Called by the host with the host to allow the construct to use it as a plathead
     * Extending: Always call super, and provide your own interface,
     */
    attach(host:any, id:string){

        this.attachHostAgent(host, id)
        
        this.attachHostState(host,id)

        if (this.beginTractor) { this.beginTractor.call(this.local) }

    }

    private  attachHostState(host, id){
        let acc = new AccessoryState(this, id, host.local, {
            reach: this.reach,
            exposure: this.exposure,
            initial: this.nucleus
        })

        this.local = acc.exposed
        this.exposed = acc.exposed

        //setting the nucleus proxies to setting the exposed value
        Object.defineProperty(this, 'nucleus', {
            get: () => {
                return this.local.me
            },
            set: (value) => {
                return this.local.me = value
            }
        })
    }

    protected  attachHostAgent(host, id){
        this.fetch = (extractor) => {
            let qualified = {};
            qualified[id] = extractor;
            return (<BedAgent>host.bed).fetch(qualified)
        }

        this.notify = (patch) => {
            let qualified = {};
            qualified[id] = patch;
            return (<BedAgent>host.bed).notify(qualified)
        }
    }

    detachHostState(){
        this.local = undefined;
        this.exposed = undefined;
        
        //what? // undoing get/set proxy to local
        Object.defineProperty(this, 'nucleus', {
            value:this.nucleus
        })
    }

    detachHostAgent(){
        this.fetch = undefined;
        this.notify = undefined;
    }

    /**
     * remove any trace of this construct from the parent and vice versa
     */
    detach(host:any, id:string){
        if (this.endTractor) { this.endTractor.call(this.local) }

        this.detachHostState();
        this.detachHostAgent();
    }

    /**
        modification of structure by application of a patch,
        @param: patch the value to reset
    */
    _patch(patch?:any){
        this.nucleus = patch
    }

    patch(patch?:any){
        return this._patch(patch)
    }

    notify:(patch)=>any

    /*
        output a representation of the construct that may be recovered to a replication
    */
    _extract(sucker?:any):any{
        return this.nucleus
    }

    extract(sucker?:any):any{
        return this._extract(sucker)
    }

    fetch:(patch:any)=>any

}
