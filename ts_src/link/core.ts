module Jungle {



    class LinkCell extends BaseCell{

        constructor(crown, formspec){
            super(crown, formspec)
        }

        constructIO(iospec):IO.IOComponent{
            return new IO.LinkIO()
        }

        protected prepareChild(prepargs, child, k){
            var pchild = super.prepareChild(prepargs, child, k)
            pchild.enshell();

            return pchild
        }
    }

}
