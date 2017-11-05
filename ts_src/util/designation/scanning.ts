import {DesignatorIR, parseDTerm} from './parsing'
import {matchDesignationTerm} from './matching'

export interface Scan<T> {
    groups: { [key: string]: Scan<T> },
    terminals: { [key: string]: T },
    bindings: any
}


interface RecurState {
    thumb: number,
    glob: boolean
}

function mergePaths(patha, pathb){
    let merged = {
        groups: {},
        terminals: {},
        bindings: {}
    }

    for (let sym of Object.getOwnPropertySymbols(patha.bindings || {})) {
        merged.bindings[sym] = patha.bindings[sym]
    }

    for (let sym of Object.getOwnPropertySymbols(pathb.bindings || {})) {
        if (merged.bindings[sym]) {
            merged.bindings[sym] = merged.bindings[sym].concat(pathb.bindings[sym])
        } else {
            merged.bindings[sym] = pathb.bindings[sym]
        }

    }

    for (let k in patha.groups || {}) {
        if (k in pathb.groups) {
            merged.groups[k] = mergePaths(patha.groups[k], pathb.groups[k])
        } else {
            merged.groups[k] = patha.groups[k]
        }
    }
    for (let k in pathb.groups || {}) {
        if (!(k in patha.groups)) {
            merged.groups[k] = pathb.groups[k]
        }
    }

    for (let k in patha.terminals || {}) {
        merged.terminals[k] = patha.terminals[k]
    }

    for (let k in pathb.terminals || {}) {
        merged.terminals[k] = pathb.terminals[k]
    }

    return merged
}

export function scannerF(groupName:string='groups', finalName:string='terminals'):(designator:DesignatorIR, target:any)=>Scan<any>{
    return function(designatorIR:DesignatorIR, target){
        function _treeDesignate(designatorIR:DesignatorIR, target, recurState: RecurState) {
            let rState = recurState
            let collected:Scan<any> = {
                groups: {},
                terminals: {},
                bindings: {}
            }

            let terminal = false;

            let {groups, end:terminals} = designatorIR;

            let current = groups[rState.thumb];

            if (current !== undefined) {
                //then we have a group designator
                if (current === "**") {
                    //then begin globbing, consuming the glob
                    rState.glob = true;

                    if (rState.thumb === groups.length - 1) { //final position glob;
                        terminal = true;
                    } else {
                        rState.thumb += 1;
                        current = groups[rState.thumb];
                    }

                }

                let collectedSubs = [];
                for (let mk in target[groupName]) {
                    let subgroup = target[groupName][mk];

                    //designate subgroups
                    let {val:tmatch, sym} = matchDesignationTerm(mk, current)

                    if (tmatch) {
                        if (sym) {
                            //create an array of all the matches at this level
                            collected.bindings[sym] = collected.bindings[sym] || []
                            collected.bindings[sym].push(tmatch)
                        }

                        let proceedwithoutGlob = { thumb: rState.thumb + 1, glob: false };
                        let eager = _treeDesignate(designatorIR, subgroup, proceedwithoutGlob)

                        //possibility of using term again
                        if (rState.glob) {
                            let keepWithGlob = { thumb: rState.thumb, glob: true }
                            let patient = _treeDesignate(designatorIR, subgroup, keepWithGlob)
                            collected.groups[mk] = mergePaths(eager, patient)
                        } else {
                            collected.groups[mk] = eager;
                        }

                    } else if (rState.glob) {
                        //glob matched dont increment and keep globbing
                        let rUpdate = { thumb: rState.thumb, glob: true };
                        collected.groups[mk] = _treeDesignate(designatorIR, subgroup, rUpdate);
                    }
                }
            } else {
                terminal = true;
            }

            //either we are out of derefs or we are tail globbing
            if (terminal) { // terminal
                let terminalsHere = target[finalName]

                for (let tlabel in terminalsHere) {
                    let t = terminalsHere[tlabel];
                    let {val:tmatch, sym} = matchDesignationTerm(tlabel, terminals)
                    if (tmatch) {
                        if (sym) {
                            collected.bindings[sym] = collected.bindings[sym] || []
                            collected.bindings[sym].push(tmatch)
                        }
                        collected.terminals[tlabel] = t;
                    }
                }
            }

            return collected;
        }

        let result = _treeDesignate(designatorIR, target, { thumb: 0, glob: false })
        return result

    }
}
