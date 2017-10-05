 import {Construct} from './construct'
import {isPrimative, isVanillaObject, isVanillaArray, B, meld} from '../util/all'
import {Domain} from './domain'
import {HostState, AccessoryState, ExposureLevel} from './state'
import {BedAgent, AnchorAgent, AgentPool} from './agency'

export class Composite extends Construct{

    static keywords = {basis:null, domain:null, head:null, anon:null}
    
    subconstructs:any

    state:HostState
    
    isComposite = true

    anchor:AnchorAgent
    bed:BedAgent
    pool:AgentPool

    beginTractor:()=>void;
    endTractor:()=>void;

    constructor(public domain:Domain){
        super(); //cache

        this.subconstructs = [];
        this.nucleus = {}
    }

    init(patch){

        super.init(patch)

        //add Everything
        this.addStrange('domain', this.domain.getExposure())

        if(this.beginTractor){ this.beginTractor.call(this.local) }
    }

    /*
        essential configuration to occur before constructions
    */
    applyHead(head:any={}){
        super.applyHead(head)

        this.state = new HostState(this, head.state)
        this.exposed = this.state.exposed
        this.local = this.state.local

        this.beginTractor = head.begin;
        this.endTractor = head.end;

        this.bed = new BedAgent(this, head.bed)
        this.anchor = new AnchorAgent(this, head.anchor)
        this.pool = new AgentPool(head.pool)

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


    /*
        modification of structure by application of a patch,
        when alive and being reformed it will kill it first and then apply a recursive patching
    */
    _patch(patch:any):any{
        //incrementally apply the patch, ignoring keywords.
        //console.log("Composite patch: ", patch)

        for(let k in patch){
            if(!(k in Composite.keywords)){
                let v = patch[k];
                this.patchChild(k, v)
            }
        }

        if(patch.anon !== undefined){
            for(let i = 0; i<patch.anon.length; i++){
                //push all, no colli
                this.add(patch.anon[i])
            }
        }
    }

    patch(patch:any):any{
        //external patching is considered to be from the host
        return this.anchor.notify(patch)
    }

    reset(patch){
        this.dispose()
        this.init(patch)
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

    /**
     * Add any kind of item to the composite, will split into 4 cases
     * Ultimately adding to the subcomposite and/or context objects
     */
    add(val:any , key?:string){

        let k = key === undefined? this.subconstructs.length++:key

        if(this.nucleus instanceof Array){
            this.nucleus.length = this.subconstructs.length
        }

        if (val instanceof Object && 'basis' in val){
            let construct = this.domain.recover(val)
            if(construct instanceof Construct){
                this.attachChild(construct, k)
            }else{
                //domain emits strange value
                this.addStrange(k, construct)
            }
        }else{
            this.addStrange(k, val)
        }

    }

    attachChild(construct:Construct, key:any){
        this.subconstructs[key] = construct;
        construct.attach(this, key)
    }

    detachChild(key){
        let construct = this.subconstructs[key];
        delete this.subconstructs[key]

        construct.detach(this, key)
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


    remove(k){
        let removing = <Construct>this.subconstructs[k];

        if(removing !== undefined){
            this.detachChild(k)
            let final = removing.dispose();
            return final
        }else if(k in this.nucleus){
            let removeState = this.nucleus[k];
            delete this.nucleus
        }


    }

    /*
        Called at the end of life of the construct,
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose():any{
        if(this.endTractor){ this.endTractor.call(this.state.local) }

        for (let key in this.subconstructs) {
            let construct:Construct = this.subconstructs[key]

            construct.dispose()
            this.detachChild(key)
        }

        this.clearHead()

        super.dispose();
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
}
