module Jungle {

    export class LinkCell extends BaseCell{

        constructor(crown, formspec){
            super(crown, formspec)
        }

        constructIO(iospec):IO.IOComponent{
            return new IO.LinkIO(this, iospec)
        }

        constructForm():LinkForm{
            return new LinkForm(this);
        }

        protected prepareChild(prepargs, child, k){
            var pchild = super.prepareChild(prepargs, child, k)
            pchild.enshell();

            return pchild
        }
    }

}
