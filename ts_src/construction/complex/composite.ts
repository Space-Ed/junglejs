import {Construct} from '../base/construct'
import {isPrimative, isVanillaObject, B} from '../../util/all'

export class Composite extends Construct<any> {

    keywords = {basis:null, domain:null}

    subconstructs:any;

    constructor(spec:any){
        super(spec); //cache
        this.subconstructs = {};
    }

    prime(){
        this.alive = true;

        //incrementally apply the patch, ignoring keywords.
        console.log("Composite prime: ", this.cache)
        for(let k in this.cache){
            if(!(k in this.keywords)){
                let v = this.cache[k];
                this.add(k, v);
            }
        }
    }

    /**
     * Add a subconstruct, when alive introducing to
     */
    add(k, v){
        //saved
        if(this.alive){

            let spec = this.ensureRecoverable(v)

            if(spec){
                //recover using the domain given
                let construct = this.domain.recover(spec);

                //Let the construct manage it's integration.
                construct.induct(this, k);

                //recursively
                construct.prime();

                this.subconstructs[k] = construct;
            }else{
                this.addStrange(k, v)
            }
        } else {

            //extending dead structure just save it for later
            this.cache[k] = v;
        }
    }

    addStrange(k, v){

    }

    ensureRecoverable(value){
        if(isPrimative(value)){
            return false// {anon:value, basis:'primative'}
        }else if(value instanceof Construct){
            console.log("construct value extracted")
            return value.extract()
        }else if(isVanillaObject(value)){
            value.basis = 'composite'
            return value
        }else{
            return false;
        }
    }


    remove(k){
        let removing = <Construct<Composite>>this.subconstructs[k];

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
                .init(this.cache)
                .blend(extracted)
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
    extend(patch):Construct<any> {

        let ext = B()
            .init(this.extract())
            .merge(patch)
            .dump();

        return this.domain.recover(ext)

    }

}
