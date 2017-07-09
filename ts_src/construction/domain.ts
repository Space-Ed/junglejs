
import {deepMeldF} from '../util/ogebra/hierarchical'
import {Designator} from "../util/designator";
/*
    a place where constructs are stored in either static or serial form and recovered from a serial form using a basis
*/
export class Domain {

    parent:Domain;
    registry:any
    exposed:any;

    subdomain:any
    melder:(a:any, b:any)=>any

    constructor(init:any = {}, private isolated:boolean = false){
        this.registry = {};
        this.subdomain = {};
        this.exposed = {
            register:(key, basis, patch)=>{
                this.register(key, basis, patch)
            }

        };

        //
        this.melder = deepMeldF();

        for(let key in init){
            let val = init[key]

            if(val instanceof Domain){
                this.addSubdomain(key, val)
            }else if(val instanceof Function){
                this.addNature(key, val)
            }else if('nature' in val){
                this.addNature(key, val.nature, val.patch)
            }else{
                //consider allowing latent dependency resolution
                throw new Error("invalid domain constructor value")
            }
        }
    }

    addSubdomain(key:string, val:Domain){

        if(!val.isolated){
            val.parent = this;
        }

        if(key in this.subdomain){
            throw new Error(`Subdomain ${key} already exists cannot redefine`);
        }else{
            this.subdomain[key] = val;
        }
    }

    branch(key:string){
        let branched = new Domain({}, false)
        this.addSubdomain(key, branched)
        return branched;
    }



    locateDomain(dotpath:string):Domain{
        if(dotpath.match(/^(?:[\w\$]+\.)*(?:[\w\$]+)$/)){
            let subdomains = dotpath.split(/\./);

            let ns = this;
            for(let spacederef of subdomains){
                if(spacederef in this.subdomain){
                    ns = this.subdomain[spacederef]
                }else{
                    throw new Error(`Unable to locate Domain from ${dotpath}`)
                }
            }

            return ns

        }else if (dotpath === ""){
            return this
        }else{
            throw new Error(`invalid dotpath syntax: ${dotpath}`)
        }
    }

    locateBasis(basis:string):{nature:any, patch:any} {
        let scan = new Designator('subdomain','registry', basis);

        let result = scan.scan(this)
        let nresult= Object.keys(result).length

        //when the scan fails, fall back to the parent, or throw if at root or isolated
        if(nresult === 0 ){
            if(this.parent === undefined){
                throw new Error(`Unable to locate the basis '${basis}' is not registered to the Domain`)
            }else{
                this.parent.locateBasis(basis)
            }
        }else if(nresult ===1){
            return result[Object.keys(result)[0]]
        }else{
            throw new Error(`Must designate exactly one basis object`)
        }

    }

    recover(construct):any{
        let {nature, patch} = this.locateBasis(construct.basis);

        try {
            let spec = this.melder(patch, construct)
            return new nature(spec);
        }catch (e){
            console.error("basis: ",construct.basis," not a constructor in registry")
            throw e
        }
    }

    register(key:string, basis:Function|string, patch={}){
        if(typeof(basis) === 'string'){
            this.extend(basis, key, patch)
        }else{
            this.addNature(key, basis, patch)
        }
    }

    addNature(key:string, nature:Function, patch={}){
        if(key in this.registry){
            throw new Error(`Domain cannot contain duplicates "${key}" is already registered`)
        }else{
            this.registry[key] = {
                nature:nature,
                patch:patch
            };
        }
    }

    extend(seat:string, target:string, newSpec:any = {}){

        let {targetDomain, targetName} = this.targetPlacement(target)

        let {nature, patch} = this.locateBasis(seat);

        let upspec = this.melder(patch, newSpec);

        targetDomain.addNature(targetName, nature, upspec);
    }

    targetPlacement(targetExp:string):{targetName:string, targetDomain:Domain} {
        let desig = new Designator('subdomain', 'registry', targetExp)

        //TODO: pedantic case to give best error for bad basis designator
        let targetName = desig.getTerminal()
        let targetDomain = this.locateDomain(desig.getLocale())


        return {targetName:targetName, targetDomain:targetDomain}
    }

    use(otherDomain:Domain){
        //designate everything in the other domain and add it as nature to this one

        let allOther = new Designator('subdomain', 'registry', "**:*").scan(otherDomain)

        for(let token in allOther){
            let {nature, patch} = allOther[token]

            let {targetDomain, targetName} = this.targetPlacement(token)

            targetDomain.addNature(targetName, nature, patch)
        }

    }

    addStatic(name, value){
        this.exposed[name] = value
    }

    getExposure(){
        return this.exposed
    }

}
