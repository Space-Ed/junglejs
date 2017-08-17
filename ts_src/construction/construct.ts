
import {Composite} from './composite'
import {Domain} from './domain'
import * as Util from '../util/all'

import {deepMeldF} from '../util/ogebra/hierarchical';
import {meld} from '../util/ogebra/operations'

import {ExposureLevel, ReachLevel} from './state'
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

    static DefaultDomain:Domain;

    /* fundamentally composites need to know if the construct is a living one */
    alive:boolean;

    alias:string;
    host:Composite;

    nucleus:any;
    local:any;
    exposed:any;

    primeTractor:()=>void;
    disposeTractor:()=>void;
    exposure:ExposureLevel;
    reach:ReachLevel

    constructor(protected domain:Domain = Construct.DefaultDomain){}

    /*
        bring the the construct to life
    */
    init(patch){
        let ensured = this.ensureObject(patch)
        this.applyForm(ensured.form)
        this.patch(ensured)
        let primeResult = this.primeTractor?this.primeTractor.call(this.local):undefined
        return primeResult
    }

    /*
        end the life of the construct.
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose(){
        if(this.disposeTractor){ this.disposeTractor.call(this.local) }
    }

    /**
     * Apply the essential characteristics of the Construct, that will be immutable over its lifetime.
     */
    protected applyForm(form:any={}){
        this.exposure = form.exposure     || 'local'
        this.reach = form.reach           || 'host'
        this.primeTractor = form.prime
        this.disposeTractor = form.dispose
    }

    /**
     * Clear the form, returning to the basic nature of the
     */
    protected clearForm(form:any = {}){
        this.primeTractor = undefined
        this.disposeTractor = undefined
    }

    /**
     * Called by the host with the host to allow the construct to use it as a platform
     * Extending: Always call super, and provide your own interface,
     */
    attach(host:any, alias:string){
        this.host = host;
        this.alias = alias;

        if(this instanceof Composite){
            host.state.addSub(alias, this)
        }else{
            let acc = host.state.createAccessory(this.reach, this.exposure, alias, this.nucleus)

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
    patch(patch:any){
        this.nucleus = patch
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any{
        return this.nucleus
    }

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
