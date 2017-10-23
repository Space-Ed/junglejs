import {Composite} from './composite'
import {Construct} from './construct'


export function makeHandler(host:Composite, outsourced:{[key:string]:Construct}):ProxyHandler<any> {  
    return {
        set: (target, prop: PropertyKey, value) => {

            if (prop in outsourced) {
                let exposing: Construct = outsourced[prop]

                if (exposing instanceof Composite) {
                    throw new Error("A subcell cannot be reset from the context, must use patch")
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
                return true
            } else {
                return delete this.scope[sKey]
            }
        },

        ownKeys: function (oTarget) {

            //union of outsourced and target
            let keycoll = new Set<PropertyKey>()

            for (let k in outsourced) {
                keycoll.add(k)
            }

            for (let k in oTarget) {
                keycoll.add(k)
            }
            
            return [...keycoll.values()]
        },

        has: function (oTarget, sKey) {
            return sKey in oTarget || sKey in outsourced
        }

    }
}