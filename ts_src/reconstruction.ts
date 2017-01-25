
namespace Gentyl {

    export interface FormRef {
        f:string,
        c:string,
        m:string
    }

    export interface FunctionCache {
        storeFunction(func:Function):string;
        recoverFunction(id:string):Function;
    }

    export interface Bundle {
        node:any;
        form:FormRef;
        state:any;
    }

    export function isBundle (object){
        return object instanceof Object && "form" in object && "state" in object && "node" in object;
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
    export function deformulate(fromNode:BaseNode):any{
        let rNode = <ResolutionNode>fromNode;

        var preform:FormSpec = {
            r:rNode.form.resolver,
            c:rNode.form.carrier,
            x:rNode.ctx.declaration
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
    export function reformulate(formRef:FormRef):FormSpec{
        var recovered = {}

        for (let k in formRef){
            recovered[k] = liveCache.recoverFunction(formRef[k])
        }

        return recovered
    }


    export class Reconstruction extends BaseNode {

        constructor(bundle:Bundle){

            //construct the node of array, object or primative,

            function debundle(bundle){
                if(isBundle(bundle)){
                    return new Reconstruction(bundle)
                }else {
                    return bundle
                }
            }

            let node = Util.typeCaseSplitF(debundle)(bundle.node)

            //reconstruction is almost entirely for this, so that it can pass through reformulation.
            let form =  Gentyl.reformulate(bundle.form);
            let state = bundle.state;

            super(node, Util.melder(form, state))

        }
    }
}
