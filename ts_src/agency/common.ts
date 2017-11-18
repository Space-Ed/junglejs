import { Junction } from '../util/junction/junction'

export interface Agent {
    patch(patch: any):any ,
    notify(patch):any,

    extract(voidspace: any):any,
    fetch(voidspace: any):any,

    config?: AgentConfig
}

export interface AgentConfig {
    priority?: number,
    patch?: boolean,
    notify?: boolean,
    extract?: boolean,
    fetch?: boolean
}
