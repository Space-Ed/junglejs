
namespace Jungle {

    export interface FunctionCache {
        storeFunction(func:Function):string;
        recoverFunction(id:string):Function;
    }


    /**
     * A rudimetary implementation not supporting failure cases or serialization
     * if a function is stored already this will override it will throw the
     * value error if the function is not there
     */
    class ObjectFunctionCache implements FunctionCache {
        functions = {}

        storeFunction(func:Function){
            var name = (["", 'anonymous', undefined].indexOf((<any>func).name) == -1) ? (<any>func).name : 'anonymous'
            this.functions[name] = func;
            return name;
        }

        recoverFunction(id){
            return this.functions[id]
        }
    }

    var liveCache:FunctionCache = new ObjectFunctionCache()

    /**
     * build a form ref object for the bundle by storing the function externally
     * and only storing in the bundle a uuid or function name;
     */
    export function deformulate(fromCell:BaseCell):any{
        let rCell = <ResolutionCell>fromCell;

        var preform:FormSpec = {
            r:rCell.form.resolver,
            c:rCell.form.carrier,
            x:rCell.ctx.declaration
        }

        var exForm = {};
        for (let k in preform){
            let val = preform[k]
            if(val instanceof Function){
                //TODO: Replacible with local storage mechanisms
                exForm[k] = liveCache.storeFunction(val)
            }else{
                //should only be a string or at least value
                exForm[k] = val
            }
        }

        return exForm
    }

    /**
    * rebuild the form object by recovering the stored function from the cache using the uuids and labels.
     */
    export function reformulate(formRef):FormSpec{
        var recovered = {}

        for (let k in formRef){
            recovered[k] = liveCache.recoverFunction(formRef[k])
        }

        return recovered
    }



    export interface Bundle {
        core:string;
        crown:any;
        form:any;
    }

    export function isBundle (object){
        return object instanceof Object && "form" in object && "crown" in object && "core" in object;
    }

    export function R(bundle:Bundle){
        //construct the node of array, object or primative,

        function debundle(bundle){

            if(isBundle(bundle)){
                return R(bundle)
            }else {
                return bundle
            }
        }

        let freshcrown = Util.typeCaseSplitF(debundle)(bundle.crown)

        //reconstruction is almost entirely for this, so that it can pass through reformulation.
        // let form =  Jungle.reformulate(bundle.form);

        return new ({
            "Resolution":ResolutionCell,
            "Link":LinkCell
        }[bundle.core])(freshcrown, bundle.form)
    }


}
