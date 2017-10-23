import { Junction } from '../util/junction/junction'

export interface Agent {
    patch(patch: any): Junction,
    notify(patch): Junction

    extract(voidspace: any): Junction,
    fetch(voidspace: any): Junction,

    config?: AgentConfig
}

export interface AgentConfig {
    priority?: number,
    patch?: boolean,
    notify?: boolean,
    extract?: boolean,
    fetch?: boolean
}
