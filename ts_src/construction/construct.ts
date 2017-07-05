
import {Composite} from './composite'
import {Domain} from './domain'
import * as Util from '../util/all'

import {deepMeldF} from '../util/ogebra/hierarchical';
import {meld} from '../util/ogebra/operations'

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

    /*
        fundamentally composites need to know if the construct is a living one
    */
    alive:boolean;

    cache:any;
    domain:Domain;
    alias:string;
    host:Composite;

    nucleus:any;

    primeTractor:()=>void;
    disposeTractor:()=>void;

    constructor(spec:any){
        this.cache = this.ensureObject(spec);
        this.cache.basis = this.cache.basis || 'object';
       //console.log("Create Construct, ",this.cache)
        this.alive = false;
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

    /**
     * Apply the essential characteristics of the Construct, that will be immutable over its lifetime.
     */
    protected applyForm(form:any = {}){
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
     * Extending: Always call super, and provide your own interface, and rewrite the doc
     */
    attach(host:any, alias:string){
        this.host = host;
        this.alias = alias;
    }

    /**
     * remove any trace of this construct from the parent and vice versa
     */
    detach(host:any, alias:string){
        this.host = undefined;
        this.alias = undefined;
    }

    /*
        Called to bring the the construct to life, it is given it's domain, that represents the set of components available to it
        The Parent Composite will pass it's domain and if there is no domain we use the static  Construct.DefaultDomain
    */
    prime(providedDomain?:Domain){

        if(providedDomain instanceof Domain){
            this.domain = providedDomain
        }else if(providedDomain === undefined){
            this.domain = Construct.DefaultDomain
        }else {
            throw new Error(`The provided domain must be Domain type, or undefined`)
        }

        //local domain self localization and detachment respectively
        if(this.cache.domain !== undefined){
            if(typeof this.cache.domain === 'string'){
                //access based of provided domain
                this.domain = Construct.DefaultDomain.locateDomain(this.cache.domain);
            }else if (this.cache.domain instanceof Domain){
                this.domain = this.cache.domain;
            }
        }

        this.alive = true;

        this.applyForm(this.cache.form)

        if(this.primeTractor){ this.primeTractor.call(this.nucleus) }

    };

    /*
        Called at the end of life of the construct.
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose(){
        if(this.disposeTractor){ this.disposeTractor.call(this.nucleus) }
        this.alive = false;
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any{
        return this.cache;
    }

    /*
        modification of structure by application of a patch,
        when alive and being reformed it will kill it first and then apply a recursive patching
    */
    patch(patch:any){
        if(this.alive && !patch.form != undefined){
            this.dispose();
            this.patch(patch)
            this.prime(this.domain);
        }else{
            this.cache = deepMeldF(this.shouldMergeChild.bind(this), this.mergeChild.bind(this))(this.cache, patch)
        }
    }

    /**
     * decide whether a conflict of two objects should be a merge, only vanilla objects are eligeble
     */
    protected shouldMergeChild(a:any, b:any, key:string){
        return Util.isVanillaObject(a) && Util.isVanillaObject(b)
    }

    /**
     * Occurs during patching when there is a key conflict, at this level it ok to just overwrite.
     * Extenders must consider the implications of the changes. If the require the object to be updated
     */
    protected mergeChild(a:any, b:any, key:string){
        return b
    }

    /*
        as an unprimed construct{pattern} this may occur to create an extended version.
    */
    extend(patch):Construct {

        //convert to serial form and extend
        let ext = Util.B()
            .init(this.extract())
            .merge(patch)
            .dump();

        return this.domain.recover(ext)

    }

}
