
import {Composite} from './composite'
import {Domain, JungleDomain} from './domain'
import * as Util from '../util/all'

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

    /*
        fundamentally composites need to know if the construct is a living one
    */
    alive:boolean;

    cache:any;
    domain:Domain;
    anchor:any;
    alias:string;


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
        }else if(Util.isVanillaObject(spec)){
            return spec
        }else{
            throw new Error("Invalid Specification for base Construct, must be object or undefined")
        }
    }


    attach(anchor:any, alias:string){
        this.anchor = anchor;
        this.alias = alias;
    }

    detach(anchor:any, alias:string){
        this.anchor = undefined;
        this.alias = undefined;
    }


    /*
        Called to bring the the construct to life, it is given it's domain, that represents the set of components available to it
    */
    prime(domain?:Domain){
        if(typeof this.cache.domain === 'string'){
            if(domain){
                this.domain = domain.locateDomain(this.cache.domain);
            }else{
                //the domain is not provided but is requested by name
            }
        }else if(this.cache.domain instanceof Domain){
            this.domain = this.cache.domain
        }else if(domain === undefined){
            this.domain = JungleDomain
        }else{
            //the domain is of a bad type
        }
    };

    /*
        Called at the end of life of the construct.
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    abstract dispose():any

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any{
        return this.cache;
    }

    /*
        modification of live structure by application of a patch, leaving the implementation to the subclasses
    */
    abstract patch(patch:any);


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
