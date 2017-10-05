
import {Construct, Agent, Composite, AgentConfig} from '../../construction/all'
import {Cell} from '../cells/cell'
import {Integrator} from  '../../interoperability/contacts/integrator'
import {Membrane} from '../../interoperability/membranes/membrane'


export class SubraneAgent extends Construct{

    agency:Agent;
    private spec:any;

    presence:string

    applyHead(head){
        super.applyHead(head)

        this.presence = head.presence || 'none'
    }

    patch(spec:any){
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
        //the front added to the pool
        this.agency = {
            config:this.spec,
            patch:null,
            notify:null,
            extract:null,
            fetch:null

        }

        let integrator = (push:boolean)=> (new Integrator({
            target:this.agency,
            integrator(target, on , emit){
                let op = push?'notify':'fetch'

                on.any = (voidspace:any)=>{
                    if(target[op] instanceof Function){
                        return target[op](voidspace)
                    }
                }

                target[push?'patch':'extract']=emit()
            }
        }))


        let subrane = new Membrane()
        subrane.addContact(integrator(false),'pull')
        subrane.addContact(integrator(true),'push')

        if(this.presence === 'shell'){
            host.shell.addSubrane(subrane, key)
        }else if(this.presence === 'lining'){
            host.lining.addSubrane(subrane, key)
        }

        host.pool.add(this.agency, key)
    }

    detach(host:Cell, key){
        super.detach(host, key)
        host.lining.removeContact(key)
        host.pool.remove(key)

    }

}
