
import { TokenIR } from '../../util/designation/all'
import { BaseContact } from '../contacts/base'


export interface Watchable<Watcher> {
    addWatch(watcher: Watcher, alias?: string);
}

export interface SectionWatcher {
    contactChange(token: TokenIR, thing?: BaseContact<any>): void
}
