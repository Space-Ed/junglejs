import {Junction} from '../util/junction/junction'
import {Composite} from './composite'
import {Construct} from './construct'

export interface Agent {
    patch(patch:any):Junction,
    notify(patch):Junction

    extract(voidspace:any):Junction,
    fetch(voidspace:any):Junction,

    config?:AgentConfig
}

export interface AgentConfig {
    priority?:number,
    patch?:boolean,
    notify?:boolean,
    extract?:boolean,
    fetch?:boolean
}

export class BedAgent implements Agent {

        constructor(public home:Composite, public config:AgentConfig){}

        /**
            distribute the patch among components accordingly
        */
        patch(patch:any):Junction{
            return this.home._patch(patch)
        }

        /**
         * assigned by pool called by the anchor agent patch of the child
         */
        notify:(patch)=>Junction;

        /**
         * extract by delving into the inner components called by the pool
         */
        extract(voidspace:any):Junction{
            return this.home._extract(voidspace)
        }

        /**
         * assigned by pool called by the anchor agent extract of the child
         */
        fetch:(voidspace:any)=>Junction;

}

export class AnchorAgent implements Agent{

    constructor(public home:Construct, public config:AgentConfig){}

    /**
     * escalate the notification to the outer context
     */
    patch(patch:any):Junction{
        if(this.home.notify instanceof Function){
            // let qualified = {}
            // qualified[this.home.alias] = patch
            return this.home.notify(patch)
        }
    }

    /**
     * assigned by pool called by the host decomposing patch
     */
    notify:(patch)=>Junction;

    /**
     * extract by fetching from the outer context
     */
    extract(voidspace:any):Junction{
        if(this.home.fetch instanceof Function){
            // let qualified = {}
            // qualified[this.home.alias] = voidspace

            return this.home.fetch(voidspace)
        }
    }

    /**
     * assigned by pool called by the host decomposing extract
     */
    fetch:(voidspace:any)=>Junction;

}

export interface PoolConfiguration {

}

export class AgentPool {

    pool:{[key:string]:Agent}

    constructor(config:PoolConfiguration){
        this.pool = {}
    }

    add(agent:Agent, key){
        agent.notify = this.notifyIn(key)
        agent.fetch = this.fetchIn(key)
        this.pool[key] = agent
    }

    remove(key):Agent{
        let agent = this.pool[key]

        agent.notify = undefined
        agent.fetch = undefined

        delete this.pool[key]

        return agent
    }

    /**
        notify all other members of the pool
     */
    notifyIn(key){
        return (data)=>{
            let junction = new Junction().mode('last')

            for (let k in this.pool){
                if(k !== key){
                    junction.merge(this.pool[k].patch(data))
                }
            }
            return junction
        }
    }

    /**
        Scan the pool for the first adequate extraction.
     */
    fetchIn(key){
        return (data)=>{
            let junction = new Junction().mode('first')

            for (let k in this.pool){
                if(k !== key){
                    junction = junction.then(data=>{
                        if (this.fetchComplete(data)){
                            console.log('calling into pool to key ', k)
                            //the extract is complete
                            return data
                        }else{
                            //continue searching replugging the data.
                            return this.pool[k].extract(data)
                        }
                    }).catch(err=>{

                    })
                }
            }
            return junction
        }
    }

    /**
     * check that the latest fetch is fully complete
     */
    fetchComplete(latestFetch):boolean{
        return  latestFetch !== undefined
    }

}
