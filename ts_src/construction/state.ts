export type ExposureLevel = 'public'|'private'|'local'
export type ReachLevel = 'host'|'self'

export class AccessoryState implements ProxyHandler<any> {

    private myval:any;
    public exposed:any
    /**
     * @param exposure: the level of exposure that this item has if it is private, the exposed object will
     * @param scope: the scope which the accessory will be embedded, will be new object if undefined
     */
    constructor(public exposure:ExposureLevel = 'local', public accessoryKey:string, public scope:any){
        this.scope = this.scope||{}
        this.exposed = new Proxy(this.scope, this);
        this.myval = scope[accessoryKey]
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
            Object.defineProperty(this.scope, sKey, oDesc)
        }
    }
}

const exposureLevels = {
    'public':2,
    'local':1,
    'private':0
}

export class HostState {

    public local:any
    public exposed:any

    private outsourced:any

    constructor(public exposure:ExposureLevel = 'local', public scope:any){
        this.scope = this.scope||{}
        let outsourced = {}
        this.outsourced = outsourced;

        let exposedHandler = function(level){
            let hostLevel = exposureLevels[level]
            return {
                set:(target, prop:PropertyKey, value)=>{
                    if(prop in outsourced){
                        let outlevel = exposureLevels[outsourced[prop].exposure]
                        if(outlevel >= hostLevel){
                            let exposing = outsourced[prop]
                            if(exposing instanceof AccessoryState){
                                return exposing.exposed[prop] = value;
                            }else{
                                return false //cant reset a host, must be done manually
                            }
                        }else{
                            return false
                        }
                    }else{
                        target[prop] = value
                        return true
                    }
                },

                get:(target, prop:PropertyKey)=>{
                    if(prop in outsourced){
                        let outlevel = exposureLevels[outsourced[prop].exposure]
                        if(outlevel >= hostLevel){
                            let exposing = outsourced[prop]
                            if(exposing instanceof AccessoryState){
                                return exposing.exposed.me;
                            }else{
                                return exposing.exposed
                            }
                        }
                    }else{
                        return target[prop]
                    }
                },

                deleteProperty: (oTarget, sKey) => {
                    if(sKey in outsourced){
                        this.removeSub(sKey)
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

        this.local = new Proxy(scope, exposedHandler.call(this, 'local'))

        this.exposed = new Proxy(scope, exposedHandler.call(this, 'public'))

    }

    addSub(key, value:{exposure:ExposureLevel}){
        this.outsourced[key] = value;
    }

    removeSub(key){
        delete this.outsourced[key]
    }

    createAccessory(purview:'self'|'host', exposure:ExposureLevel,  key, initial={}){
        let scope = purview == 'host'? this.local : {}
        if(initial) scope[key] = initial
        let accessory = new AccessoryState(exposure, key , scope)
        this.addSub(key, accessory)
        return accessory
    }

}
