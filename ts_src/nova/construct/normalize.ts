namespace Jungle {

    export namespace Nova {

        export function normalise(key, value):ConstructSpec {
            if (Util.isPrimative(value)){
                return {
                    basis:'primative',
                    patch:value
                }
            }else if(Util.isVanillaObject(value)){
                return {
                    basis:'state',
                    patch:value
                }
            }else if(value instanceof Construct){
                return value.extract()
            }else if(Construct.isConstructSpec(value)){
                return value
            }else{
                throw new Error("Form property not normalisable")
            }
        }

    }
}
