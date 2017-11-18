import {TestDomain, Detection} from './domain'
import {Cell, BaseMedium} from '../../jungle'

export class TestCell extends Cell{
    domain:TestDomain

    constructor(domain:TestDomain){
        super(domain)

        Object.defineProperties(this, {
            shellContacts:{
                get(){
                    return Object.keys(this.shell.scan('**:*'))
                }
            },
            liningContacts:{
                get(){
                    return Object.keys(this.lining.scan('**:*'))
                }
            },
            links:{
                get:()=>{
                    let links = {}

                    for (let mk in this.weave.media){
                        let mlinks = links[mk] = []
                        let matrix = this.weave.media[mk].exportMatrix()
                        for (let tokenA in matrix){
                            for (let tokenB in matrix[tokenA]){
                                mlinks.push([tokenA, tokenB])
                            }
                        }

                    }
                    
                    return links
                }
            }
        })
    }

    log:(ev:Detection)=>void

    applyHead(head){
        super.applyHead(head)

        
        if(head.tid){
            this.domain.targets[head.tid] = this;
            this.log = this.domain.log.createLogger({
                tid:head.tid
            })
        }
        
    }

}