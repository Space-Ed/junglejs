
import {Domain, Description, isDescription} from './domain'
import {AnchorAgent, BedAgent, Agent, createHeartBridge} from '../agency/all'

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

export class Construct{
    host:any;
    id:string;
    
    //immutable 
    origins:string[];
    basis:string;
    head:any;

    //complex
    self;

    //self- interaction
    heart:Agent
    dark:Agent

    //primative cache
    nucleus:any;

    //
    exposed:any;

    constructor(public domain: Domain) {
    }

    /*
        bring the the construct to life
    */
    init(desc:Description){
        this.origins = desc.origins;
        this.basis = desc.basis;

        this.applyHead(desc.head)
        
        this._patch(desc.body)

        let primeResult = this.head.prime ? this.head.prime.call(this.self) : undefined

    }

    /*
        end the life of the construct.
        should return it's final description, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose(){

        if (this.head.dispose) { this.head.dispose.call(this.nucleus) }

        this.clearHead()
    }

    /**
     * Apply the essential characteristics of the Construct, that will be immutable over its lifetime.
     */
    protected applyHead(head:any={}){
        this.head = head;
        
        //setup the body
        this.applyExposed()

        //setup the heart
        this.applyHeart(head.heart||{})

        //setup the context
        this.applySelf()
    }

    protected applyExposed(){

        //this behaviour is to notify upwards when sets occur to the body. 
        // alternative behavious include no body 
        Object.defineProperty(this, 'exposed', {
            configurable: true,
            get: () => {
                return this.nucleus
            },
            set: (value) => {
                this.dark.patch(value) //notify the heart
                this.notify(value)     //notify above
                return this.nucleus = value //enact the change
            }
        })
    }

    /**
     * create and set the heart that is exposed as part of the self
     * @param heartspec the head.heart config section
     */
    protected applyHeart(heartspec){
        let { exposed, pooled } = createHeartBridge(heartspec.exposed)

        //the light side is local and showing where the dark is dealt with internally
        this.heart = exposed 
        this.dark = pooled

        //called on this.heart.patch
        this.dark.notify = (nt) => {
            this.nucleus = nt

            if (this.notify) {
                this.notify(nt)
            }

            return null
        }

        //called on this.heart.extract
        this.dark.fetch = (ft) => {
            let res = this.nucleus
            if (res == undefined) {
                if (this.fetch) {
                    res = this.fetch(ft)
                }
            }
            return res
        }
    }

    protected applySelf() {
        this.self = {}
        Object.defineProperties(this.self, {
            body: {
                get: () => (this.exposed)
            },

            heart: {
                get: () => (this.heart)
            },
        })
    }

    /**
     *Restore the object so preheaded state
     */
    protected clearHead(){
        
    }

    /**
     * Called by the host with the host to allow the construct to use it as a plathead
     * Extending: Always call super, and provide your own interface,
     */
    attach(host:any, id:string){
        this.host = host;
        this.id = id;
        
        

        //access to host methods is through this.world
        let visor = host.grantVisor(id, this)
        Object.defineProperties(this.self, {
            world: {
                configurable:true,
                get: () => (visor)
            },
            earth: {
                configurable:true,
                get: () => (visor.body)
            },
            agent: {
                configurable: true, 
                get: () => (visor.heart)
            },
        })

        this.attachHostAgent(host, id)

        if (this.head.attach) { 
            
            this.head.attach.call(this.self)
        }
    }

    protected  attachHostAgent(host, id){
        this.fetch = (extractor) => {
            let qualified = {};
            qualified[id] = extractor;
            return (<BedAgent>host.bed).fetch(qualified)
        }

        this.notify = (patch) => {
            let qualified = {};
            qualified[id] = patch;
            return (<BedAgent>host.bed).notify(qualified)
        }
    }


    detachHostAgent(){
        this.fetch = undefined;
        this.notify = undefined;
    }

    /**
     * remove any trace of this construct from the parent and vice versa
     */
    detach(host:any, id:string){
        if (this.head.detach) { this.head.detach.call(this.self) }

        this.detachHostAgent();

        delete this.self.world;
        delete this.self.agent;
    }
    
    patch(patch?:any){
        this._patch(patch)
        this.dark.notify(patch)
    }

    /**
        modification of structure by application of a patch,
        @param: patch the value to reset
    */
    _patch(patch?:any){
        this.nucleus = patch
    }

    notify:(patch)=>any

    /*
        output a representation of the construct that may be recovered to a replication
    */
    _extract(sucker?:any):any{
        if(isDescription(sucker)){
            return {
                basis:this.basis,
                head:this.head,
                origins:this.origins,
                body:this.nucleus
            }
        }

        return this.nucleus
    }

    extract(sucker?:any):any{
        let extract = this._extract(sucker)

        if(extract == undefined){
            extract = this.dark.fetch(sucker)
        }

        return extract
    }

    fetch:(patch:any)=>any

    protected move(to:string){
        let landing = this.host.getAtLocation(to)
        let id = this.id

        if(landing){
            this.detach(this.host, this.id)
            this.attach(landing, this.id)
        }
    }

    protected getRoot():Construct {
        if(this.host === undefined){
            return this;
        }else{
            return this.host.getRoot()
        }
    }
        
    protected getLocation():string{
        if (this.host !== undefined){
            return this.host.getLocation()+'/'+ this.id
        } else {
            return '/'
        }
    }

}
