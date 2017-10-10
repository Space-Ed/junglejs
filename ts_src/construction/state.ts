import {Composite} from './composite'
import {Construct} from './construct'

export type ExposureLevel = 'public'|'private'|'local'
export type ReachLevel = 'host'|'self'

export interface AccessoryStateSpec {
    initial:any,
    reach:ReachLevel,
    exposure:ExposureLevel,
}

/**
 * a proxy to the host scope that , that adds in self reference as 'me'
 */
export class AccessoryState implements ProxyHandler<any> {

    private myval:any;
    public exposed:any

    /**
     * @param exposure: the level of exposure that this item has if it is private, the exposed object will
     * @param scope: the scope which the accessory will be embedded, will be new object if undefined
     */
    constructor(private home:Construct, private accessoryKey, scope,  spec:AccessoryStateSpec){
        this.exposed = new Proxy(scope, this);
        this.myval = spec.initial
    }

    set(target, prop:PropertyKey, value){
        if(prop === 'me' || prop == this.accessoryKey){
            this.myval = value
            return true
        }else{
            target[prop] = value
            return true
        }
    }

    get(target, prop:PropertyKey){
        if(prop === 'me'|| prop == this.accessoryKey){
            return this.myval
        }else{
            return target[prop]
        }
    }

    defineProperty(oTarget, sKey, oDesc) {
        if(sKey == 'me'){
            return Reflect.defineProperty(this, 'myval', oDesc)
        }else{
            Object.defineProperty(oTarget, sKey, oDesc)
        }
    }
}

const exposureLevels = {
    'public':2,
    'local':1,
    'private':0
}

export interface StateOpts {
}

export class HostState {

    public local:any
    public exposed:any

    private outsourced:any
    private scope:any

    constructor(public host:Composite, public spec:StateOpts){
        this.scope = this.host.nucleus || {}
        let outsourced = this.host.subconstructs
        this.outsourced = outsourced;

        let exposedHandler = function(level){
            let hostLevel = exposureLevels[level]
            return {
                set:(target, prop:PropertyKey, value)=>{

                    if(prop in outsourced){
                        let exposing:Construct = outsourced[prop]
                        let outlevel = exposureLevels[exposing.exposure]

                        if(outlevel >= hostLevel){
                            if(exposing instanceof Composite){
                                this.setSubCell(exposing, prop, value)
                            }else {
                                this.setAccessory(exposing, prop, value)
                            }
                        }else{
                            throw new Error(`Cannot assign, this space: ${prop} is taken by subconstruct that is closed`)
                        }
                    }else if(prop in target){
                        target[prop] = value
                    }else{
                        host.add(value, <any>prop)
                    }

                    let q = {}; q[prop] = value
                    host.bed.notify(q)

                    return true
                },

                get:(target, prop:PropertyKey)=>{
                    if(prop in outsourced){
                        let exposing:Construct = outsourced[prop]
                        let outlevel = exposureLevels[exposing.exposure]
                        if(outlevel >= hostLevel){
                            if(exposing instanceof Composite){
                                return exposing.exposed
                            }else{
                                return exposing.exposed.me;
                            }
                        }else if(exposing.remote){
                            exposing.extract()
                        }
                    }else{
                        return target[prop]
                    }
                },

                deleteProperty: (oTarget, sKey) => {
                    if(sKey in outsourced){
                        this.host.remove(sKey)
                    }else{
                        delete this.scope[sKey]
                    }
                },

                ownKeys: function (oTarget, sKey) {
                    let keycoll = {}
                    for(let k in outsourced){
                        let outlevel = exposureLevels[outsourced[k].exposure]
                        if(outlevel >= hostLevel){
                            keycoll[k] = null
                        }
                    }

                    for(let k in oTarget){
                        keycoll[k] = null
                    }

                    return Object.keys(keycoll)
                },

                has: function (oTarget, sKey) {
                    return sKey in oTarget || sKey in outsourced
                },

                // defineProperty: function (oTarget, sKey, oDesc) {
                //     return Reflect.defineProperty(oTarget, sKey, oDesc)
                // },
                //
                // getOwnPropertyDescriptor: function (oTarget, sKey) {
                //     return Reflect.getOwnPropertyDescriptor(oTarget, sKey)
                // }

            }
        }

        this.local = new Proxy(this.scope, exposedHandler.call(this, 'local'))

        this.exposed = new Proxy(this.scope, exposedHandler.call(this, 'public'))

    }

    setAccessory(exposing:Construct, key, value){
        exposing.exposed[key] = value;
    }

    setSubCell(exposing:Composite, key, value){
        if(value === undefined){
            //delete the relevant cell
            this.host.remove(key)
        }else if(typeof value === 'object'){
            //REVIEW: experimental assignment of objects actually patching the existing object
            let p = {}; p[key] = value
            this.host._patch(p)
        }else{
            throw new Error("A subcell cannot be reset from the context, must dispose (set undefined)")
        }
    }

}
