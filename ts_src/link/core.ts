module Jungle {

    export class LinkCell extends BaseCell{

        kind:string = "Link";
        constructor(crown, formspec){
            super(crown, formspec)
        }

        constructIO(iospec):IO.IOComponent{
            return new IO.LinkIO(this, iospec)
        }

        constructForm():LinkForm{
            return new LinkForm(this);
        }

        protected prepareChild(prepargs, handle, child, k){

            let mergekey = k === undefined ? false : k;

            if(child instanceof BaseCell){
                var replica = child.replicate();

                (<any>replica).setParent(this, k);

                let prep = replica.prepare(prepargs);

                //enshell happens after
                let aftershell = new Util.Junction().merge(prep, false).then(function(preparedReplica){
                    preparedReplica.enshell();
                    return preparedReplica
                }, false);

                handle.merge(aftershell, mergekey);
            }else{
                handle.merge(child, mergekey);
            }
        }

        completePrepare(){
            this.prepared = true;
            this.enshell();
        }

        innerResolve(arg){
            //called by special tractor or resolve.

            /** ports in the lining */
            let detector:IO.SpecialLinkOutputPort = this.io.shell.sources.$;
            let emmitter:IO.SpecialLinkInputPort = this.io.shell.sinks.$

            //await result from shell
            let result = new Util.Junction().await(
                (done, raise)=>{
                    detector.detect = done;
                }
            ).then(()=>{
                detector.emit()
                emmitter.complete()
            }
            )

            emmitter.innerHandle(arg)

            return result;

        }

    }

}
