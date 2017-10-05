
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

    //attachment primatives
    alias:string;
    host:any;
    isComposite = false;

    //state
    nucleus:any;
    local:any;
    exposed:any;

    exposure:ExposureLevel;
    reach:ReachLevel;
    remote:boolean;

    //tractors
    primeTractor:()=>void;
    disposeTractor:()=>void;

    constructor(){}

    /*
        bring the the construct to life
    */
    init(desc:Description){
        this.origins = desc.origins;
        this.basis = desc.basis;

        this.applyHead(desc.head)
        this._patch(desc.body)
        let primeResult = this.primeTractor?this.primeTractor.call(this.nucleus):undefined
        return primeResult
    }

    /*
        end the life of the construct.
        should return it's final description, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose(){
        if(this.disposeTractor){ this.disposeTractor.call(this.nucleus) }
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
    attach(host:any, alias:string){
        this.host = host;
        this.alias = alias;

        this.fetch = (extractor)=>{
            let qualified = {};
            qualified[alias] = extractor;
            return (<BedAgent>host.bed).fetch(qualified)
        }

        this.notify = (patch)=>{
            let qualified = {};
            qualified[alias] = patch;
            return (<BedAgent>host.bed).notify(qualified)
        }

        if(!this.isComposite){
            //composites have state setup in the head application

            let acc = new AccessoryState(this, alias, {
                reach:this.reach,
                exposure:this.exposure,
                initial:this.nucleus
            })

            this.local = acc.exposed
            this.exposed = acc.exposed

            //setting the nucleus proxies to setting the exposed value
            Object.defineProperty(this, 'nucleus',{
                get:()=>{
                    return this.local.me
                },
                set:(value)=>{
                    return this.local.me = value
                }
            })

        }
    }

    /**
     * remove any trace of this construct from the parent and vice versa
     */
    detach(host:any, alias:string){
        this.host = undefined;
        this.alias = undefined;
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

    /**
     * Ensure that argument is an object
     */
    private ensureObject(spec:any){
        if(spec === undefined){
            return {}
        }else if (Util.isVanillaArray(spec)){
            return {
                basis:'array',
                anon:spec
            }
        }else if(Util.isVanillaObject(spec)){
            return spec
        }else{
            throw new Error("Invalid Specification for base Construct, must be object or undefined")
        }
    }
}
