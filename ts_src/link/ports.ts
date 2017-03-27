namespace Jungle {
    export namespace IO {
        /**
        **/
        export class LinkSpecialInput extends Port {

            constructor(public host:LinkIO){
                super('$');
            }

            innerHandle(input){
                super.handle(input)
            }

            /*
            Override: instead of proceeding to the emmission through super only trigger resolve.
            let the call to inner resolve decide whether to proceed by calling the inner Handle
            */
            handle(input){
                //called by link contexts and shell input
                var cell = this.host.host;

                //when the inner resolve is called
                new Util.Junction()
                    .await((done)=>{
                        this.awaitOutput(done);
                        cell.resolve(input);
                    },false).then(()=>{
                        this.clear();
                    })

                //call the host resolve - potentially inner resolve

                //no need to return anything here
            }

            awaitOutput(done){
                this.waiting = true;
            }

            clear(){
                this.resolveComplete = undefined;
            }

            complete(){

            }

        }

        export class LinkSpecialOutputPort extends Port{

            emit(output){
                super.handle(output);
            }

        }

    }
}
