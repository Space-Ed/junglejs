
import {deepMeldF, deepInvertF, safeMeld, negate, reduce, terminate} from '../util/ogebra/all'
import {Construct} from './construct'
import {isVanillaObject, isVanillaArray} from '../util/checks'


export interface SeekResult {
    domain: Domain,
    name: string,
    entry?: Description,
    reason?:string
}

export interface SeekQuery { 
    location: string[],
    name: string
}


export interface Description { 
    basis: any, 
    head?: any, 
    body?: any,
    anon?: any[],
    
    domain?: Domain,
    origins?: string[]
}

export interface GDescription<H,B>{
    basis: any,
    head?: H,
    body?: B,
    anon?: any[],

    domain?: Domain,
    origins?: string[],

}

function parseBasisString(str:string):{location:string[], name:string, invasive:boolean}{
    let rx = /^(?:((?:\w+\.)*[\w]+)\:)?(\w+)$/
    let m = str.match(rx)
    if(m){
        let [full, loc, name] = m

        let sloc = loc ? loc.split('.') : []

        return {
            location:sloc,
            name:name,
            invasive:false
        }
    }else{
        throw new RangeError(`invalid basis desiginator expression ${str}`)
    }
}

export function isNature(thing:any):boolean{
    return thing instanceof Function && (thing.prototype instanceof Construct || thing === Construct)
}

export function isDescription(thing:any):boolean {
    return isVanillaObject(thing) && 'basis' in thing
}



export function descmeld(entry, desc, k?) {
    let meld:Description =  {
        basis: entry.basis,
        head: headmeld(entry.head||{}, desc.head||{}),
        body: safeMeld(bodyMeldItem)(entry.body||{}, desc.body||{}),
        domain: entry.domain || desc.domain
    }

    if(desc.anon) meld.anon = desc.anon

    return meld
}

function bodyMeldItem(entry, desc, k?) {
    if(isDescription(entry)){
        if (isDescription(desc)) {
            if (entry.basis !== desc.basis) {  //differing basis replacement
                return desc
            } else {
                return descmeld(entry, desc)    //deep meld description
            }
        } else if (isVanillaObject(desc)) {
            return descmeld(entry, { body: desc })
        } else if (isVanillaArray(desc)) {
            return descmeld(entry, { anon: desc })
        } else if (desc === null) {
            return Symbol.for('delete')
        } else {
            return desc
        }
    }else{
        return desc
    }
    
}

let headmeld = deepMeldF()

function descdebase(desc, base) {

    let debased:Description = {
        basis: base.basis,
        head: deepMeldF(terminate.isPrimative, reduce.negateEqual)(desc.head || {}, base.head || {}),
        body: safeMeld(debaseBodyItem)(desc.body, base.body),
    }

    if(desc.origins){
        let [basis, ...origins] = desc.origins

        debased.basis = basis;
        if(origins.length > 0){
            debased.origins = origins
        }
    }

    if(desc.anon && desc.anon.length !== 0){
        debased.anon = desc.anon;
    }

    return debased

}


function debaseBodyItem (desc, base, k?){
    if(isDescription(desc)){
        if(isDescription(base)){
            if (desc.basis !== base.basis) {  //differing basis, take desc
                return desc
            } else {
                return descdebase(desc, base)    //deep debase description
            }    
        }else{ //descriptions trump, no consumption
            return desc
        }
    } else {
        return reduce.negateEqual(desc, base)
    }

}


/*
    a place where constructs are stored in either static or serial form and recovered from a serial form using a basis
*/
export class Domain{

    parent:Domain;
    exposed:any;
    registry:{[name:string]:Description};
    subdomain: { [name: string]: Domain }

    melder:(a:any, b:any)=>any
    debaser:(a:any, b:any)=>any


    constructor(){

        this.registry = {};
        this.subdomain = {};
        this.exposed = {};

    }

    public define(name: string, val: any): Domain {
        let m = name.match(/^[a-zA-Z0-9_]+$/)
        if (m) {
            if (isDescription(val)) {           //description
                this.addDescription(name, val)

            } else if (isNature(val)) {      //direct nature 
                this.addDescription(name, {
                    basis: val,
                })
            } else {                            //other
                this.addStatic(name, val)
            }

            return this
        } else {
            throw new Error("Invalid basis name")
        }
    }



    addDescription(name, desc:Description){
        // 

        if(!(name in this.registry)){
            this.registry[name] = desc;

            if(typeof desc.domain === 'string'){
                let domloc = (<string>desc.domain).split('.')
                let domain = this.seekInherit({ location: domloc, name: null }).domain

                if(domain != undefined){
                    desc.domain = domain
                }else {
                    throw new Error(`cant find domain "${desc.domain}" required for definition of "${name}"`)
                }
            }
        }else{
            throw new Error(`Cannot Redefine: "${name}" is already defined in this domain`)
        }

    }


    /**
     * Take a Description and transform into an initialized mountable construct. 
     * 
     * @param desc  a description object that will be overlaid on the basis
     */
    recover(desc: Description|string): Construct {
        //coerce to description and initialize origins
        let _desc =  (typeof desc == 'string')?{basis:desc}:desc
        _desc.origins = [];

        //reduce the description to a final one
        let final = this.collapse(_desc);

        //instantiate and initialise
        let nature = <any>final.basis
        let recovered = new nature(final.domain);

        recovered.init(final)
        return recovered
    }
    
    /**
     * reduce by following the chain of basis references
     */
    private collapse (desc:Description):Description{
        if (isNature(desc.basis)) {
            //terminal case 
            return desc
        } else if (typeof desc.basis === 'string') {
            //locate the description for the present basis

            let sresult:SeekResult;

            if(desc.basis === desc.origins[0]){
                //handling the redfine case if the origin is the same as the desc we will go up a level
                desc.origins = desc.origins.slice(1)
                
                if(this.parent){
                    sresult = this.parent.seek(desc.basis, true);
                }else{
                    throw new Error(`Domain must be based on superdomain for redefinition of ${desc.basis}`)
                }
            }else{
                sresult = this.seek(desc.basis, true)
            }

            //Curate the Description Collapsed one more layer
            let {domain, entry} = sresult;

            let melded = descmeld(entry, desc)
            melded.origins = [desc.basis, ...desc.origins] //<--base level--   --top level
            melded.domain = melded.domain || this
            return melded.domain.collapse(melded)
            // if(entry.domain == undefined){
            //     return domain.collapse(melded)
            // }else{
            //     //collapse into 
            // return melded.domain.collapse(melded)
            // }
            
        } else {
            throw new Error("Invalid recovery basis must be basis designator or Construct function")
        }
    }


    /**
     * restore a desription of a construct that is recoverable in this domain
     * 
     * the target defaults to the original basis of the construct
     * @param construct the construct to describe
     */
    describe(construct:Construct, target:boolean|string=true):Description{

        //extract possible changes
        let extracted = construct.extract({
            basis:undefined
        })

        //percolate through origins until the origin cannot be found,  
        let debased = this.debase(extracted, target)

        return debased

    }

    /**
     * 
     * @param desc 
     * @param target 
     */
    public debase(desc:Description, target:string|boolean){
        //determine exit conditions, no more origins to consume or reaching target origin
        if (desc.origins === undefined || desc.origins.length == 0 || target === false || desc.basis === target){
            return desc
        }else{
            //the front is consumed as the new basis
            
            let find = this.seek(desc.origins[0], false)

            if(find.entry == null){
                return desc
            }else{
                //something like deeply remove anything that is unchanged
                let debased = descdebase(desc, find.entry)
                // debased.origins = desc.origins.slice(1)
                // debased.basis = desc.origins[0]
                
                if(debased.basis === target){
                    return debased //reached target debase level
                }else{
                    return this.debase(debased, target)
                }
            }
        }
    }

    seek(basis: string, fussy:boolean=false): SeekResult {

        let parsed = <SeekQuery> parseBasisString(basis)
        let result = this.seekInherit(parsed)
        
        //When a domain is found and did not have any digging
        if(parsed.location.length === 0 && result.domain !== undefined){
            result.domain = this
        }

        if (fussy && result.domain == undefined) {
            throw new Error(`Unable to find domain designated for basis: ${basis}`)
        } else if (fussy && result.entry == undefined) {
            throw new Error(`Unable to find registry entry for basis: ${basis}`)
        } else {
            return result
        }
    }

    //recurse out when not found or root
    private seekInherit(place: SeekQuery): SeekResult {
        let result = this.seekDelve(place)

        if ((result.entry == undefined || result.domain == undefined) && this.parent !== undefined) {
            //being unable to find it we will inherit if possible
            result = this.parent.seekInherit(place)
        }

         return result
    }

    //recurse in when basis has terms remaining 
    private seekDelve({ location, name }: SeekQuery): SeekResult {

        let result;
        if (location.length === 0) {
            if (!(name in this.registry)) {
                result = {
                    domain: this,
                    name: name,
                    entry: null
                }
            }else {
                // console.log(`pulled registry entry for ${name} %o`, this.registry[name] )
                result = {
                    domain: this,
                    name: name,
                    entry: this.registry[name]
                }
            }
        } else {
            let [subdomain, ...rest] = location

            if (subdomain in this.subdomain) {
                //dig deeper
                result = this.subdomain[subdomain].seekDelve({ location: rest, name: name})
            } else {
                //unable to find domain
                result = {
                    domain: null,
                    name: name,
                    entry: null
                }
            }
        }
        return result
    }

    /**
     * create a new subdomain that is based on this
     */
    sub(name: string):Domain{
        if(name in this.subdomain){
            return this.subdomain[name]
        }

        let domain = new Domain()
        domain.on(this.parent || this)

        this.addSubdomain(name, domain)
        return domain        
    }

    with(subdomains:{[subID:string]:Domain}):Domain{
        for (let k in subdomains){
            this.addSubdomain(k, subdomains[k])
        }

        return this
    }

    up():Domain{
        if(this.parent){
            return this.parent
        }else{
            return this
        }
    } 

    on(domain:Domain):Domain{
        if(this.parent !== undefined){
            throw new  Error(`Domain must have exactly one ground but was already defined`)
        }
        
        this.parent = domain

        return this
    }

    private addSubdomain(key: string, newsub: Domain) {
        if (key in this.subdomain) {
            throw new Error(`Subdomain ${key} already exists cannot redefine`);
        } else {
            
            this.subdomain[key] = newsub;
            // if (this.parent === undefined || isGroundedOn(newsub, this)){
            // }else {
            //     throw new Error(`This domain does not support the domain mounting as ${key}: Must be it's ground or be on its ground`)
            // }

        }
    } 

    private addStatic(name, value){
        this.exposed[name] = value
    }
}


function isGroundedOn(domain:Domain, ground:Domain):boolean {
    //where there is ground and that ground or its ground ad inf, 
    return ground !== undefined && (domain.parent === ground || isGroundedOn(domain, ground.parent))
}