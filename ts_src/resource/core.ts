module Jungle {

    export class ResourceCell extends BaseCell{

        constructor(formspec){
            super(null, formspec);
        }

        protected constructForm(){
            return new BaseForm(this);
        }

        protected constructIO(iospec):IO.IOComponent{
            return new IO.BaseIO(this, iospec)
        }

        protected constructContext(contextspec){
            return new GContext(this, contextspec)
        }

        protected constructActions(){
            return new Actions.Component(this)
        }

        protected constructCore(crown, form){
            return new ResourceCell(form)
        }
    }

}
