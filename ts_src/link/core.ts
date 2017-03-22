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
            if(child instanceof BaseCell){
                var replica = child.replicate();

                (<any>replica).setParent(this, k);

                replica.prepare(prepargs);

                //enshell happens after
                let aftershell = new Util.Junction().merge(replica, false).then(function(replica){
                    replica.enshell();
                    return replica
                }, false);

                handle.merge(aftershell, k);
            }else{
                handle.merge(child, k);
            }
        }

        resolve(resarg){
            super.resolve(resarg);
        }
    }

}
