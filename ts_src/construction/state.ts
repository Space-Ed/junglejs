import {Composite} from './composite'
import {Construct} from './construct'


export function makeSplitStateProxy(host:Composite):ProxyHandler<any> {  
    let outsourced = host.subconstructs
    let index = host.index
    let ground = host.nucleus 

    return new Proxy(ground, {
        set: (target, prop: PropertyKey, value) => {

            if (prop in outsourced) {
                let exposing: Construct = outsourced[prop]

                if (exposing instanceof Composite) {
                    throw new Error("Unable to set composite body from internal context")
                } else {
                    //reset accessory body
                    exposing.exposed = value;
                }
            } else if (prop in target) {
                //reassigning body prop
                target[prop] = value
            } else {
                //definition of property/subconstruct
                host.add(value, <any>prop)
            }

            let q = {}; q[prop] = value

            //notify from above.
            host.bed.notify(q)

            return true
        },

        get: (target, prop: PropertyKey) => {
            if (prop in outsourced) {
                let exposing: Construct = outsourced[prop]
                return exposing.exposed
            } else {
                return target[prop]
            }
        },

        deleteProperty: (oTarget, sKey) => {
            if (sKey in outsourced) {
                host.remove(sKey)
            } else {
                delete this.scope[sKey]
            }

            let q = {}; q[sKey] = null

            //notify from above.
            host.bed.notify(q)
            return true

        },

        ownKeys: function (oTarget) {
            return Reflect.ownKeys(index)
        },

        has: function (oTarget, sKey) {
            return Reflect.has(index, sKey)
        }

    })
}