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

        }

        export interface IOComponent {
            shell:Shell;
            enshell:(callback?, context?)=>Shell;
            prepare:(parg)=>void;
            extract:()=>any;

        }

        export class Port{
            callbackContext:any;
            callback:(output, ...args)=>any;

            shells:Shell[];

            constructor(public label){
                this.shells = [];
            }

            /**
             * every kind of port needs to be retrofusable
             */
            addShell(shell:Shell){
                this.shells.push(shell)
            }

            handle(input){
                if(this.callback){
                    if(this.callbackContext){
                        //call toward target
                        this.callback.call(this.callbackContext, input)
                    }else{
                        //dont call globally just use the port as context;
                        this.callback.call(this, input)
                    }
                }
            }
        }

        export class BaseIO implements IOComponent{

            specialGate:boolean;
            shell:Shell;

            constructor(){

            }

            prepare(){

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
