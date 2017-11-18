import { Agent } from './common'

export interface PoolConfiguration {

}

/**
 * A round table like listener system where all are notified of change that any other puts
 *  and the first to provide a complete response to a query will do so.
 */
export class AgentPool {

    pool: { [key: string]: Agent }

    constructor(config: PoolConfiguration) {
        this.pool = {}
    }

    add(agent: Agent, key) {
        agent.notify = this.notifyIn(key)
        agent.fetch = this.fetchIn(key)
        this.pool[key] = agent
    }

    remove(key): Agent {
        let agent = this.pool[key]

        agent.notify = undefined
        agent.fetch = undefined

        delete this.pool[key]

        return agent
    }

    /**
        notify all other members of the pool, 
        complete success returns undefined.
        failures are composed with terminal messages.
     */
    notifyIn(key) {
        return (data) => {
            let cresult

            for (let k in this.pool) {
                if (k !== key) {
                    
                    let result = this.pool[k].patch(data);
                    if(result !== undefined){
                        if(cresult == undefined){
                            cresult = {}
                        }

                        cresult[k] = result;
                    }
                }
            }
            return cresult
        }
    }

    /**
        Scan the pool for the first adequate extraction.
     */
    fetchIn(key) {
        return (fetcher) => {

            let result
            for (let k in this.pool) {
                if (k !== key) {
                    result = this.pool[k].extract(fetcher)
                    
                    if (this.fetchComplete(result)) {
                        return result
                    }
                }
            }
        }
    }

    /**
     * check that the latest fetch is fully complete
     */
    fetchComplete(latestFetch): boolean {
        return latestFetch !== undefined
    }

}
