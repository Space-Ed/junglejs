

import {BasicContact} from './base'
import {Call} from './call'
import * as Debug from '../../util/debug'
import {Junction} from '../../util/all'

export interface IntegratorSpec {
    target:Object,
    integrator:(target:any, on:any, emit:any)=>void
}

export class Integrator extends Call<Integrator> {

    invertable = false
    recievers:{[name:string]:Function}

    constructor(private spec: IntegratorSpec){
        super()

        this.hasInput = true
        this.hasOutput = true

        this.recievers = {}

        let on = this.createReciever()
        let emit = this.createEmitter()

        spec.integrator(spec.target, this.recievers, emit)

    }

    put = (data:any, debug?:Debug.Crumb):any => {

        if(data instanceof Object && typeof data.method === 'string'){
            if(this.recievers[data.method] !== undefined){
                return this.recievers[data.method].call(this.spec.target, data.payload)
            }
        }

        if('any' in this.recievers){
            return this.recievers['any'].call(this.spec.target, data)
        }

    };

    createEmitter(){
        return (name?)=>{
            if(name !== undefined){
                return (arg)=>{
                    let packet = {
                        method:name,
                        payload:arg
                    }

                    if(this.emit){
                        this.emit(packet)
                    }
                }
            }else{
                return (arg)=>{
                    if(this.emit){
                        this.emit(arg)
                    }
                }
            }
        }
    }

    createReciever(){

    }

    createPartner(){
        return undefined
    }

}
