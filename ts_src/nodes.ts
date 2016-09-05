

namespace Gentyl {
    export function sA(components, resolveArgs):any{
        var resolution = {}

        this.index = this.index || 0
        this.mode = this.mode || "revolve"

        for (var k in components){

            if(components[k] instanceof Array){
                //Todo: Should be resolving the items
                var rarray = components[k]

                if(this.mode == "revolve"){
                    resolution[k] = rarray[this.index%rarray.length];
                }else if (this.mode == "cap"){
                    resolution[k] = rarray[Math.min(this.index, rarray.length)]
                }else {
                    throw Error("invalid mode in array revolver")
                }
            }else{
                throw Error("expected all properties in array selection to be arrays")
            }
        }

        this.index++
        return resolution
    }
}
