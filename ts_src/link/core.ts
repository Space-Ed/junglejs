module Gentyl {



    class LinkNode extends BaseNode{

        constructor(crown, formspec){
            super(crown, formspec)
        }

        constructIO(iospec):IO.IOComponent{
            return new IO.LinkIO()
        }

        protected prepareChild(prepargs, child){
            var pchild = super.prepareChild(prepargs, child)
            pchild.enshell();

            return pchild
        }
    }

}
