import {GDescription} from '../../construction/domain'
import {Construct} from '../../construction/construct'
import {StdOp, OpCallTarget} from '../../interoperability/contacts/stdops'
import {Cell} from '../cells/cell'


export abstract class OpConstruct<Body> extends Construct{

    contact:StdOp
    nucleus:Body

    init(spec){
        super.init(spec)

    }

    applyExposed(){
        //undoing super assumption of exposed nucleus
    }

    attach(host:Cell, key:string){
        super.attach(host, key)

        let op = this.contact = this.createOp(this.nucleus, key)
        let inj = this.getInjected()
        if(inj !== undefined){
            this.exposed = inj;
        }

        host.lining.addContact(op, key)
    }

    detach(host:Cell, key:string){
        host.lining.removeContact(key)
    }
    abstract createOp(body:Body, key:string):StdOp

    getInjected(){
        return undefined
    }


}


export interface SpringBody {
    inward:boolean, outward:boolean, description:string
}

export class Spring extends OpConstruct<SpringBody> {

    createOp(body:SpringBody, key) {

        return new StdOp({
            label: this.getLocation() + key,
            context: this.self,
            description: this.nucleus.description,
            hook_inward: this.nucleus.inward,
            hook_outward: this.nucleus.outward,
            mode: 'resolve'
        })
    }

    getInjected(){

        let first = this.contact.hook.inward
        let last = this.contact.hook.outward

        return  (data) => {
            if (this.nucleus.inward) {
                first(data)
            } 
            if (this.nucleus.outward) {
                last(data)
            }
        }
    }
}

export interface ResolveBody {
    inner:any, outer:any, either:any, description:string
}

export class Resolve extends OpConstruct<ResolveBody> {
    createOp(body: ResolveBody, key) {
        
        return new StdOp({
            label: this.getLocation() + key,
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'resolve',
            inner_op:this.nucleus.inner || this.nucleus.either,
            outer_op:this.nucleus.outer || this.nucleus.either
        })
        
    }
}


export interface ReflexBody {
    inner: any, outer: any, either: any, description: string
}

export class Reflex extends OpConstruct<ReflexBody> {
    createOp(body: ReflexBody, key) {

        return new StdOp({
            label: this.getLocation() + key,
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'reflex',
            inner_op: this.nucleus.inner || this.nucleus.either,
            outer_op: this.nucleus.outer || this.nucleus.either
        })

    }
}

export interface CarryBody {
    inward: any, outward: any, either: any, description: string
}

export class Carry extends OpConstruct<CarryBody> {
    createOp(body: CarryBody, key) {

        return new StdOp({
            label: this.getLocation() + key,
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'carry',
            inner_op: this.nucleus.outward || this.nucleus.either,
            outer_op: this.nucleus.inward || this.nucleus.either
        })

    }
}


export class Deposit extends Construct {

    attach(host: Cell, key: string) {
        super.attach(host, key)

        const drop = (x) => { if (x == undefined) { return this.nucleus } else { this.nucleus = x } } 
        let op = new StdOp({
            label: this.getLocation() + key,
            context: this.self,
            description: "A simple deposit",
            hook_inward: false,
            hook_outward: false,
            mode: 'resolve',
            inner_op: drop,
            outer_op: drop
        })

        host.lining.addContact(op, key)
    }

    detach(host: Cell, key: string) {
        host.lining.removeContact(key)
    }

}
