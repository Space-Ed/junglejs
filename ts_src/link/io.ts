namespace Gentyl {

    export namespace IO {

        export class LinkIO implements IOComponent {

            shell:Shell;
            specialGate:boolean;

            constructor(){

            }

            enshell(callback, context):Shell{
                return this.shell
            };


            prepare(parg){

            };

            extract(){

            }
        }



    }

}
