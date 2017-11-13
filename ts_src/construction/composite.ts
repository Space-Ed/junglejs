 import {Construct} from './construct'
import {isPrimative, isVanillaObject, isVanillaArray, B, meld, createVisor} from '../util/all'
import {Domain, Description, isDescription} from './domain'
import {makeSplitStateProxy} from './state'
import {BedAgent, AnchorAgent, AgentPool, Agent, createHeartBridge} from '../agency/all'

export class Composite extends Construct{

    index:any
    subconstructs:any

    anchor:AnchorAgent
    bed:BedAgent
    pool: AgentPool

    constructor(domain:Domain){
        super(domain)
        this.subconstructs = {};
        this.nucleus = [];
        this.index = [];
    }

    init(desc: Description) {
        this.origins = desc.origins;
        this.basis = desc.basis;

        this.applyHead(desc.head)

        if(desc.body !== undefined) this._patch(desc.body)
        if(desc.anon !== undefined) this._patch(desc.anon)

        let primeResult = this.head.prime ? this.head.prime.call(this.self) : undefined
    }

    /*undo init*/
    dispose(): any {
        this.disposeBody()
        this.disposeAnon()

        if (this.head.dispose) { this.head.dispose.call(this.self) }
        this.clearHead()
    }

    protected applyExposed() {
        this.exposed = makeSplitStateProxy(this)
    }
    
    protected applyHeart(heartspec) {
        let { exposed, pooled } = createHeartBridge(heartspec.exposed)

        //the light side is local and showing where the dark is dealt with internally
        this.heart = exposed
        this.dark = pooled

        this.bed = new BedAgent(this, this.head.bed)
        this.anchor = new AnchorAgent(this, this.head.anchor)
        this.pool = this.createPool(this.head.pool)

        this.pool.add(this.dark, 'heart')
        this.pool.add(this.bed, 'bed')
        this.pool.add(this.anchor, 'anchor')
    }

    protected applySelf(){
        this.self =  {};
        Object.defineProperties(this.self, {
            body:{
                get:()=> (this.exposed)
            },

            heart: {
                get: () => {
                    
                    return this.heart
                }
            },
                
            domain: {
                get:()=> (this.domain)
            }
        })
    }


    /*
        undo the setup so that a new head can be applied
    */
    clearHead(){
        super.clearHead()
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
        if(patch == undefined){
            this.disposeBody()
        }if(!(patch instanceof Object)){
            // non object patches are singular anonymous
            this._patch([patch])
        }else if(patch instanceof Array){
            for(let i=0; i<patch.length; i++){
                this.addAnon(patch[i])
            }
        }else{
            for(let k in patch){
                let v = patch[k];
                this.patchChild(k, v)
            }
        }
    }

    protected patchChild(k, v){
        if(v == undefined){
            this.remove(k)
        }else if(v in this.subconstructs){
            this.subconstructs[k].patch(v);
        }else{
            this.add(v , k);
        }
    }

    addAnon(val) {
        let id = this.makeID(val)
        this.add(val, ""+id)
    }

    makeID(val: any): number {
        return this.index.length++
    }

    add(val:any , key?:string){
        if(key === undefined){
            return this.addAnon(val)
        }

        if (isDescription(val)){
            let construct = this.domain.recover(val)
            this.attachChild(construct, key)
        }else{
            this.addStrange(key, val)
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
            delete this.nucleus[k]
            delete this.index[k]
        }
    }

    disposeBody(): any {
        //detach and dispose all children
        for (let key in this.index) {
            if (isNaN(<any>key)) {
                if (this.index[key] == this.subconstructs) {
                    let construct = this.detachChild(key)
                    construct.dispose()
                } else {
                    this.removeStrange(key)
                }

            }
        }
    }

    disposeAnon() {
        for (let key in this.index) {
            if (!isNaN(<any>key)) {
                if (this.index[key] == this.subconstructs) {
                    let construct = this.detachChild(key)
                    construct.dispose()
                } else {
                    this.removeStrange(key)
                }

            }
        }
    }

    attachChild(construct:Construct, key:any){
        this.subconstructs[key] = construct;
        this.index[key] = this.subconstructs;
        this.nucleus.length = this.index.length;
        construct.attach(this, key)
    }

    detachChild(key):Construct{
        let construct = this.subconstructs[key];
        delete this.subconstructs[key]
        delete this.index[key]

        construct.detach(this, key)
        return construct
    }

    /**
     * Add an item to the construct that is an object of a Class that is not conformant or
     Coercible to a standard jungle Construct object.
     */
    addStrange(k, v){
        this.nucleus[k] = v;
        this.index[k] = this.nucleus
    }

    removeStrange(k){
        delete this.nucleus[k];
        delete this.index[k];
    }

    extract(suction: any): any {
        return this.anchor.fetch(suction)
    }

    /*
        output a representation of the construct that may be recovered to a replication

        the suction has a few overloads
        null/undefined                  : Everything of the body
        []                              : Eveything anon
        j() - the undefined basis: E    : the entire description
        {}                              : only the matching object keys and recur
        value                           : only if different

    */
    _extract(suction:any):any {
    
        if(suction instanceof Array){
            return this.extractAnon(suction)
        }else if(typeof suction === 'number' ){
            let subsuck = []

            if(suction === Infinity){
                subsuck[0] = subsuck
            }else{
                for (let i=0;i<suction;i++){
                    subsuck = [subsuck]
                }
            }

            return this.extractAnon(subsuck)
        }else if(isDescription(suction)){
            return this.extractBeing(suction)            
        }else if (typeof suction ==='string'){
            let subsuck = {}; subsuck[suction]=undefined
            return this.extractBody(suction)
        }else{
            return this.extractBody(suction)
        }
    }

    /**
     * 
     * @param suction a description to 
     */
    extractBeing(suction){
        let being:any = {
            basis:this.basis,
            head:this.head,
            origins:this.origins
        }
        
        being.body = this.extractBody(suction.body||{ basis:undefined})
        being.anon = this.extractAnon(suction.anon||[{basis:undefined}])
        
        return being
    }

    extractAnon(suction){

        let result = []

        this.index.forEach((location, i) => {
            let extract;
            if (suction.length > 0) {
                extract = this.extractChild(i, suction[0]);
            } else {
                extract = this.extractChild(i, []);
            }
            result.push(extract)
        })

        return result
    }

    /**
     * 
     * @param suction undefined means all, j() means all beings, {} means select with
     */
    extractBody(suction){
        let extracted = {}

        if(isDescription(suction) || suction === undefined){
            // extract entire body with suction as subsuction
            
            for(let k in this.index){
                if(isNaN(<any>k)){
                    extracted[k] = this.extractChild(k, suction)
                }
            }
        }else if (suction instanceof Object){
            // extract selectively and take matched subsuctions

            for(let k in this.index){
                if(isNaN(<any>k) && k in suction){
                    extracted[k] = this.extractChild(k, suction[k])
                }
            }
        }else {
            throw new Error("Invalid Extract Argument")
        }
    
        return extracted

    }

    extractChild(k, voidspace){
        let extract
        if (k in this.subconstructs){
            //extract will 
            extract=this.subconstructs[k].extract(voidspace)

            if(isDescription(extract)){
                //compress description taking the voidspace description basis as target or 
                extract = this.domain.debase(extract, isDescription(voidspace)?voidspace.basis:false)
            }
        }else if (k in this.nucleus){
            //terminal extract            
            extract=this.nucleus[k]
        }

        //apparently the child does not exist so let's try to find it in the scope
        if(extract === undefined){
            let qfetch = {}
            qfetch[k]=voidspace
            extract = this.bed.fetch(qfetch)
        }

        return extract
    }

    createPool(poolConfig): AgentPool {
        return new AgentPool(poolConfig)
    }

    /**
     * Grant visor creates the object representing someone elses perspective on this space, including the ability to act as an agent in the scope
     * 
     * @param k the key of the requesting construct,
     * @param c the construct that will use the visor
     */
    grantVisor(k:string , c:Construct){
        
        //pending agent configuration defaults 
        // if ((c.head.world||{}).heart){
        //     if(this.head.heart[k]){
        //         let {exposed, pooled} = createHeartBridge(this.head.heart[k]||{})
        //         agent = exposed;
        //         this.pool.add(pooled, k)
        //     }else if(this.head.heart.other){
        //         let { exposed, pooled } = createHeartBridge(this.head.heart[k])
        //         this.pool.add(pooled, k)
        //         agent = exposed
        //     }
        // }

        let { exposed:agent, pooled } = createHeartBridge({})//this.head.heart[k])
        
        this.pool.add(pooled, k)
        
        //proxy to self except referring to the heart yields the agent rather than the core heart
        return new Proxy(this.self, {
            
            set(oTarg, prop, val){
                return false
            },

            get(oTarg, prop){
                if (prop === 'heart'){
                    return agent
                }else {
                    return oTarg[prop]
                }
            }
        })
    }

    protected getAtLocation(to: string) {
        let items = to.split('/')

        let thumb:Composite;
        if(to[0] === '/'){
            thumb = <Composite>this.getRoot(); items.shift()
        }else {
            thumb = this
        }

        for (let i=0 ; i< items.length;i++) {
            let item = items[i]
            if (item in thumb.subconstructs && thumb.subconstructs[item] instanceof Composite){
                thumb = thumb.subconstructs[item]
            }else if(item === '..' && thumb.host !== undefined){
                //upward
                thumb = thumb.host
            }else if (item !== ''){
                //can only nav to composite
                return undefined
            }
        }

        return thumb
    }

}
