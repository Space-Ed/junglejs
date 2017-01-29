namespace Gentyl {

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
        }

        export interface IOComponent {
            shell:Shell;
            enshell:() => Shell;
            dress:(designator: string, coat:OutputCoat) => void;
            prepare:(parg)=>void;
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

            constructor(){

            }

            prepare(){

            }

            dress(designation:string, coat:OutputCoat){
                
            }

            enshell():Shell{
                return this.shell
            }

            extract():any{
                return {}
            }
        }
    }
}
