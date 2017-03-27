namespace Jungle {

    export namespace IO {
        export const HALT = {};
        Object.freeze(HALT)

        export function halting(arg){
            return HALT
        }

        export function passing(arg){
            return arg;
        }

        export function defined(arg){
            return arg === undefined ? HALT : arg;
        }

        export function always(arg){
            return true;
        }

        export function nothing(arg){
            return undefined
        }

        export function host(arg){
            //from the context
            return this.host
        }

        export enum Orientation{
            INPUT, OUTPUT, NEUTRAL, MIXED
        }

        export interface Shell {
            sinks:{$:Port};
            sources:{$:Port};
            base:IOComponent;
            designate:(designator:PortDesignator)=>Port[];
            dress:(designator:PortDesignator, coat:OutputCoat) => void;
            invert:()=>Shell;
        }

        export interface IOComponent {
            shell:Shell;
            host:BaseCell;
            enshell:() => Shell;
            dress:(designator: string, coat:OutputCoat) => void;
            extract:()=>any;
        }

        export enum DesignationTypes {
            ALL, MATCH, REGEX, FUNC
        }

        export interface PortDesignator{
            direction:Orientation,
            type:DesignationTypes,
            data: any
        }

        export interface OutputCoat {
            context:Object|((ResolveOutputPort)=>Object);
            callback:(output:any)=>any;
        }

        export class BaseIO implements IOComponent{

            specialGate:boolean;
            shell:Shell;
            ports:PortSpec[]

            constructor(public host:BaseCell, iospec){

            }


            /*
                scan the whole shell's output ports to ascribe the callbacks using a unified format
            */
            dress(designation:any, coat:OutputCoat){
                let designator: PortDesignator = {
                    direction:Orientation.OUTPUT,
                    type:DesignationTypes.MATCH,
                    data:undefined,
                }

                //rudimentary parse of wildcards
                if(typeof(designation) === 'string'){
                    if(designation === '*'){
                        designator.type = DesignationTypes.ALL;
                    }else{
                        designator.type = DesignationTypes.REGEX;
                        designator.data = designation;
                    }
                }else{
                    throw new Error("Invalid Designator: string required")
                }

                this.shell.dress(designator, coat);
            }

            hostAlias(){
                //aliased input function by binding the outward facing port to the host
                for(let k in this.shell.sinks){
                    this.host.inp[k] = (function(input){
                        this.shell.sinks[k].handle(input);
                    }).bind(this);
                }
                //aliased the output sources
                for(let k in this.shell.sources){
                    this.host.out[k] = this.shell.sources[k];
                }
            }

            enshell():Shell{
                return this.shell
            }

            extract():any{
                return {
                }
            }
        }
    }
}
