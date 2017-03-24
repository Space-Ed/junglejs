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

        resolve(resarg){
            super.resolve(resarg);
        }
    }

}
