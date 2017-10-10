 import {Construct} from './construct'
import {isPrimative, isVanillaObject, isVanillaArray, B, meld} from '../util/all'
import {Domain, Description} from './domain'
import {HostState, AccessoryState, ExposureLevel} from './state'
import {BedAgent, AnchorAgent, AgentPool,Agent} from './agency'

export class Composite extends Construct{

    static keywords = {basis:null, domain:null, head:null, anon:null}
    
    subconstructs:any

    state:HostState
    
    isComposite = true

    anchor:AnchorAgent
    bed:BedAgent
    pool: AgentPool


    constructor(domain:Domain){
        super(domain)
        this.subconstructs = [];
        this.nucleus = {}
    }
    

    init(desc:Description){
        this.addStrange('domain', this.domain.getExposure())
        
        this.origins = desc.origins;
        this.basis = desc.basis;

        this.applyHead(desc.head)

        this._patch(desc.body)
        this._patch(desc.anon)

        let primeResult = this.primeTractor ? this.primeTractor.call(this.nucleus) : undefined
        
    }

    /*undo init*/
    dispose(): any {

        //detach and dispose all children
        for (let key in this.subconstructs) {
            let construct = this.detachChild(key)
            construct.dispose()
        }

        if (this.disposeTractor) { this.disposeTractor.call(this.nucleus) }

        this.clearHead()
    }

    /*
        essential configuration to occur before constructions
    */
    applyHead(head:any={}){
        super.applyHead(head)

        this.state = new HostState(this, head.state)
        this.exposed = this.state.exposed
        this.local = this.state.local

        // //heart method exposure
        let { exposed, pooled } = this.createHeart(((head.heart || {}).exposed || {}))

        this.addStrange('heart', exposed)
        this.bed = new BedAgent(this, head.bed)
        this.anchor = new AnchorAgent(this, head.anchor)
        this.pool = this.createPool(head.pool)
        
        this.pool.add(pooled, 'heart')
        this.pool.add(this.bed, 'bed')
        this.pool.add(this.anchor, 'anchor')

    }



    /*
        undo the setup so that a new head can be applied
    */
    clearHead(){
        this.beginTractor = undefined;
        this.endTractor = undefined;
        super.clearHead()
    }

    attach(host: any, id: string) {
        this.attachHostAgent(host, id)

        if (this.beginTractor) { this.beginTractor.call(this.local) }
    }

    patch(patch: any): any {
        //external patching is considered to be from the host
        return this.anchor.notify(patch)
    }

    /*
        modification of structure by application of a patch,
        when alive and being reformed it will kill it first and then apply a recursive patching
    */
    _patch(patch:any):any{
        //incrementally apply the patch, ignoring keywords.
        //console.log("Composite patch: ", patch)

        if(patch instanceof Array){
            for(let i = 0; i<patch.length; i++){
                //push all, no colli
                this.add(patch[i])
            }
        }else{
            for(let k in patch){
                if(!(k in Composite.keywords)){
                    let v = patch[k];
                    this.patchChild(k, v)
                }
            }
        }
    }

    protected patchChild(k, v){

        let existing:Construct = this.subconstructs[k];
        if(existing !== undefined){
            existing.patch(v);
        }else{
            if(v === undefined){
                this.remove(k)
            }else{
                this.add(v , k);
            }
        }
    }

    addAnon(val) {
        
    }

    add(val:any , key?:string){

        let k = key === undefined? this.subconstructs.length++:key

        if(this.nucleus instanceof Array){
            this.nucleus.length = this.subconstructs.length
        }

        if (val instanceof Object && 'basis' in val){
            let construct = this.domain.recover(val)
            this.attachChild(construct, k)
        }else{
            this.addStrange(k, val)
        }

    }


    remove(k) {
        let removing = <Construct>this.subconstructs[k];

        if (removing !== undefined) {
            this.detachChild(k)
            let final = removing.dispose();
            return final
        } else if (k in this.nucleus) {
            let removeState = this.nucleus[k];
            delete this.nucleus
        }


    }


    attachChild(construct:Construct, key:any){
        this.subconstructs[key] = construct;
        construct.attach(this, key)
    }

    detachChild(key):Construct{
        let construct = this.subconstructs[key];
        delete this.subconstructs[key]

        construct.detach(this, key)
        return construct
    }


    /**
     * Add an item to the construct that is an object of a Class that is not conformant or
     Coercible to a standard jungle Construct object.
     */
    addStrange(k, v){
        this.nucleus[k] = v
    }

    /**
     * Add an item to the composite that is not an object
     */
    addPrimative(k, v){
        this.nucleus[k] = v
    }

    getExposure():any{
        return {
            create:(v, k?)=>{
                this.add(v, k)
            },
            destroy:(k)=>{
                this.remove(k)
            }
        }
    }


    /*
        output a representation of the construct that may be recovered to a replication
    */
    _extract(suction:any):any {
        let voidspace

        if(suction === undefined || typeof suction === 'object'){
            voidspace = suction
        }else if (typeof suction === 'string'){
            voidspace = {};
            voidspace[suction] = null;
        }else{
            throw new Error('Invalid extractor suction argument')
        }

        let extracted = {}
        for (let key in this.subconstructs) {
            if(voidspace === undefined || key in voidspace){
                let construct = this.subconstructs[key]
                extracted[key] = construct.extract(voidspace===undefined?undefined:voidspace[key]);
            }
        }

        for (let key in this.nucleus){
            if(voidspace === undefined || (key in voidspace && voidspace[key] === undefined)){
                extracted[key] = this.nucleus[key]
            }
        }

        return extracted

    }

    extract(suction:any):any{
        return this.anchor.fetch(suction)
    }

    createPool(poolConfig): AgentPool {
        return new AgentPool(poolConfig)
    }

    createHeart(spec): { exposed:Agent, pooled: Agent } {

        //the front added to the pool
        let pooled = {
            config: spec,
            patch: (patch: any) => {
                if (exposed.notify instanceof Function) {
                    return exposed.notify(patch)
                }
            },

            notify: null,

            extract: (voidspace: any) => {
                if (exposed.fetch instanceof Function) {
                    return exposed.fetch(voidspace)
                }
            },

            fetch: null
        }
        let exposed = {
            patch: (patch: any) => {
                if (pooled.notify instanceof Function) {
                    return pooled.notify(patch)
                }
            },

            notify: null,

            extract: (voidspace: any) => {
                if (pooled.fetch instanceof Function) {
                    return pooled.fetch(voidspace)
                }
            },

            fetch: null

        }

        return {
            pooled: pooled,
            exposed: exposed
        }

    }
}
