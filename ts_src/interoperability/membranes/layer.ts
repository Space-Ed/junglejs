
import {Watchable, SectionWatcher} from './common'
import * as D from '../../util/designation/all'
import { BaseContact } from '../contacts/base'

export class Layer implements Watchable<SectionWatcher>, SectionWatcher {
    
    watches: SectionWatcher[]
    
    constructor() {
        this.watches = [];
    }
    
    createSection(desexp: string, alias?: string, positive = true): Section {
        let section = new Section(positive, desexp);
        this.addWatch(section)
        // section.addSource(this, alias)
        
        return section
    }
    
    addWatch(watcher: SectionWatcher, alias?: string | number): symbol | string {
        
        let sym
        if (alias === undefined) {
            sym = Symbol("anon")
            this.watches[sym] = watcher
        } else {
            sym = alias
            this.watches[alias] = watcher
        }
        
        let all = this.scan('**:*', true)
        for (let token in all) {
            let reparse = D.parseTokenSimple(token);
            let qpath: D.TokenIR = alias === undefined ? reparse : [[alias + "", ...reparse[0]], reparse[1]]
            
            watcher.contactChange(qpath, all[token])
        }
        
        return sym
    }
    
    removeWatch(key: symbol | string) {
        let watcher = this.watches[key]
        
        let all = this.scan('**:*', true)
        for (let token in all) {
            
            let reparse = D.parseTokenSimple(token);
            let qpath: D.TokenIR = typeof key !== 'string' ? reparse : [[key + '', ...reparse[0]], reparse[1]]
            watcher.contactChange(qpath)
        }
        
        delete this.watches[key]
    }
    removeAllWatches() {
        this.watches = [];
    }
    
    nextToken(token: D.TokenIR, key?: string): D.TokenIR {
        if (typeof key === 'string') {
            return [[key, ...token[0]], token[1]]
        } else {
            return token
        }
    }
    
    contactChange(path: D.TokenIR, thing?: BaseContact<any>) {
        
        //notify all watchers of the change
        for (let wKey of (<any[]>Object.getOwnPropertySymbols(this.watches)).concat(Object.keys(this.watches))) {
            let watch = this.watches[wKey];
            watch.contactChange(this.nextToken(path, wKey), thing)
        }
    }
    
    scan(exp, flat): any {
        
    }
}

import {Section} from './section'