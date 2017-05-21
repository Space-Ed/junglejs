/// <reference path="../interoperability/push/crux.ts"/>

namespace Jungle {

    export namespace Hooks {

        export class HookCrux extends IO.PortCrux {
            constructor(label, hook, exposed){
                super(label)

            }

        }

        export class PushIn extends Construct {

            hook:any;
            crux:IO.PortCrux;

            constructor(public space:NameSpace, public basis:string){
                super(space, "PushIn")
            }

            induct(host:ConstructHost, key:string){

                this.crux = new HookCrux(key);
                host.io.membranes.shell.addCrux(this.crux, 'sink')
            }

            prime(){

                this.dress({
                    callback:hook,
                    context:exposed
                })
            }

            dispose(){

            }

            extract(){
                return
            }

        }

    }

}
