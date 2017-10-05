

import {Construct, Agent, Composite, AgentConfig} from '../../construction/all'
import {Cell} from '../cells/cell'


export class ContextAgent extends Construct{

    agency:Agent;
    private spec:AgentConfig;

    init(spec:AgentConfig){
        super.init(spec)
        this.spec = spec
    }

    patch(spec:AgentConfig){
        /**a model for  */
        if(this.host !== undefined){
            let host = this.host, alias = this.alias
            this.detach(this.host, this.alias)
            this.spec =spec
            this.attach(host, alias)
        }
    }

    extract(){
        return this.spec
    }

    attach(host:Cell, key){
        super.attach(host, key)

        //nucleus routes to exposed.me
        this.nucleus = {
            patch:(patch:any)=>{
                if(this.agency.notify instanceof Function){
                    return this.agency.notify(patch)
                }
            },

            notify:null,

            extract:(voidspace:any)=>{
                if(this.agency.fetch instanceof Function){
                    return this.agency.fetch(voidspace)
                }
            },

            fetch:null

        }

        //the front added to the pool
        this.agency = {
            config:this.spec,
            patch:(patch:any)=>{
                if(this.nucleus.notify instanceof Function){
                    return this.nucleus.notify(patch)
                }
            },

            notify:null,

            extract:(voidspace:any)=>{
                if(this.nucleus.fetch instanceof Function){
                    return this.nucleus.fetch(voidspace)
                }
            },

            fetch:null

        }

        host.pool.add(this.agency, key)
    }

    detach(host:Cell, key){
        super.detach(host, key)
        host.pool.remove(key)

    }

}
