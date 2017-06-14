 import {Construct} from './construct'
import {isPrimative, isVanillaObject, B} from '../util/all'
import {Domain} from './domain'

export class Composite extends Construct{

    keywords = {basis:null, domain:null, form:null}
    subconstructs:any;

    constructor(spec:any){
        super(spec); //cache
        this.subconstructs = {};
    }

    prime(domain:Domain){
        super.prime(domain)
        this.alive = true;

        //incrementally apply the patch, ignoring keywords.
        //console.log("Composite prime: ", this.cache)
        for(let k in this.cache){
            if(!(k in this.keywords)){
                let v = this.cache[k];
                this.add(k, v);
            }
        }
    }

    /**
     * Add any kind of item to the composite, will split into 4 cases
     * Ultimately adding to the subcomposite and/or context objects
     */
    add(k, v){
        //saved
        if(this.alive){
            if(isPrimative(v)){
                this.addPrimative(k, v)
            }else if(v instanceof Construct){
                //primary construct case
                let spec = v.extract();
                let recovered = this.domain.recover(spec);
                this.addConstruct(k, recovered);
            }else if(isVanillaObject(v)){
                if('basis' in v){
                    //serial recovery case
                    let recovered = this.domain.recover(v);
                    this.addConstruct(k, recovered);
                }else{
                    //Object Literal Default
                    this.addObject(k, v)
                }
            }else{
                this.addStrange(k, v)
            }
        } else {

            //extending dead structure just save it for later
            this.cache[k] = v;
        }
    }

    addConstruct(k, construct:Construct){
        //recursively prime and add
        construct.prime(this.domain);
        this.subconstructs[k] = construct;
        construct.attach(this.anchor, k)
    }

    /**
     * Add an item to the construct that is an object of a Class that is not conformant or
     Coercible to a standard jungle Construct object.
     */
    addStrange(k, v){

    }

    /**
     * Add an item to the composite that is not an object
     */
    addPrimative(k, v){

    }

    /**
    *the generic Object interpretation
    */
    addObject(k:string, obj:Object){
        let construct = new Composite(obj)
        this.addConstruct(k, construct)
    }

    remove(k){
        let removing = <Construct>this.subconstructs[k];

        if(removing !== undefined){
            let final = removing.dispose();
            delete this.subconstructs[k];
            return final
        }

    }

    /*
        Called at the end of life of the construct,
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose():any{

        for (let key in this.subconstructs) {
            let construct = this.subconstructs[key]
            construct.dispose()
        }

        this.alive = false;
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any {

        if(this.alive){
            let extracted = {}
            for (let key in this.subconstructs) {
                let construct = this.subconstructs[key]
                extracted[key] = construct.extract();
            }

            return B()
                .init(this.cache)    // original copy
                .blend(extracted)    // changes within extracted
                .dump()
        }else{
            return this.cache
        }

    }

    patch(patch){

    }

    /*
        as an unprimed construct{pattern} this may occur to create an extended version.
    */
    extend(patch):Construct{

        let ext = B()
            .init(this.extract())
            .merge(patch)
            .dump();

        return this.domain.recover(ext)

    }

}
