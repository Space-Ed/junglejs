namespace Gentyl {

    export namespace IO {
        export var ioShellDefault:{setup:any,dispatch:any} = {
            setup(label){
            },
            dispatch(output, label){
            }
        }

        export function setDefaultShell(shellConstructor:(label) => (output:any,label:string) => void | void){
            Gentyl.IO.ioShellDefault = {
                setup:shellConstructor,
                dispatch:undefined
            }
        }

        export function setDefaultDispatchFunction(dispatchF:(output:any, label:string) => void){
            Gentyl.IO.ioShellDefault = {
                setup:function(label){return dispatchF},
                dispatch:undefined
            }
        }

        export function setDefaultDispatchObject(object:Object|Function, method:string|( (output:any, label:string) => void)){
            var ctxconstructor;
            var cb;

            var error;

            if(object instanceof Function){
                ctxconstructor = object;

                // if(method instanceof Function){
                //     cb = method
                // }else if (typeof method === 'string'){
                //     if(method in object.prototype){
                //         cb = object.prototype[method];
                //     }else{
                //         error = 'object prototype must have given method';
                //     }
                // }else{
                //     error = 'method must be string or function';
                // }
            } else if(object instanceof Object){
                ctxconstructor = function(){return object};
                //
                // if(method instanceof Function){
                //     cb = method;
                // }else if (typeof method === 'string'){
                //     if(method in object){
                //         cb = object[method];
                //     }else{
                //         error = 'object must have given method';
                //     }
                // }
                // else {
                //     error = 'method must be string or Function';
                // }
            } else {
                error = 'object must be Object or Function';
            }

            if(error){
                throw new Error(error);
            }

            Gentyl.IO.ioShellDefault = {
                setup:ctxconstructor,
                dispatch:method
            }
        }
    }
}
