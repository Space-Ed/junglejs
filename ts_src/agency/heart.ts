import { Agent, AgentConfig } from './common'

export function createHeartBridge(spec:AgentConfig): { exposed: Agent, pooled: Agent } {

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