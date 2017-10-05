
import {Construct, Agent, Composite, AgentConfig, GDescription} from '../../construction/all'
import {Cell} from '../cells/cell'
import {Integrator} from  '../../interoperability/contacts/integrator'

export type ContactPresence = 'none'|'shell'|'lining'|'omni'

export class ContactAgent extends Construct{

    agency:Agent;
    private spec:AgentConfig;

    presence:ContactPresence;

    init(spec:GDescription<any, AgentConfig>){
        super.init(spec)
    }

    applyHead(head){
        super.applyHead(head)
        this.presence = head.presence || 'none'

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
        //the front added to the pool
        this.agency = {
            config:this.spec,
            patch:null,
            notify:null,
            extract:null,
            fetch:null

        }

        const contact = ()=>( new Integrator({
            target:this.agency,
            integrator(target, on , emit){
                on.extract = (voidspace:any)=>{
                    if(target.fetch instanceof Function){
                        return target.fetch(voidspace)
                    }
                }

                on.patch = (voidspace:any)=>{
                    if(target.notify instanceof Function){
                        return target.notify(voidspace)
                    }
                }

                target.patch=emit('patch')
                target.extract=emit('patch')

            }
        }))

        if(this.presence == 'lining') {host.lining.addContact(contact(), key); console.log('added to lining')}
        if(this.presence == 'shell')  {host.shell.addContact(contact(), key); console.log('added to shell')}

        host.pool.add(this.agency, key)
    }

    detach(host:Cell, key){
        super.detach(host, key)
        host.lining.removeContact(key)
        host.pool.remove(key)

    }

}
