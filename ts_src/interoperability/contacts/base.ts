
// import * as I from '../interfaces'

export namespace I {
    export interface ContactHost {
        invert():ContactHost
    }
}

export abstract class BasicContact<Partner extends BasicContact<any>> {

    //exclusion flags
    public hidden = false;  //does not appear in designations.
    public plugged = false; //no further links allowed
    public gloved = false;  //no further rules allowed
    public claimed = false; //no further media allowed

    protected host:I.ContactHost;
    protected partner:Partner;

    attach(host:I.ContactHost, name:string){
        this.host = host;
    }

    detach(){
        this.host = undefined;
        this.partner = undefined;
    }

    /**
     * if possible create the partner that will appear on the other side and put it there.
     * this action is undertaken when added to a membrane
     */
    invert():Partner{
        if (this.partner === undefined && this.invertable === true){
            this.partner = this.createPartner()
            this.partner.host = this.host.invert();
            this.partner.partner = this;
        }
        return this.partner;
    }

    //---------------Copy to Implement-------------

    //capability flags must be decided
    public abstract symmetric:boolean;
    public abstract invertable:boolean;

    // partner integration
    // invert():Partner{
    //      super.invert()
    // }

    // membrane integration
    // attach(host:I.ContactHost, name:string){
    //     super.attach(host, name)
    // }
    //
    // detach(){
    //    super.detach()
    // }


    abstract createPartner():Partner
    //   return new Partner()

    abstract inject(context, key);
    abstract retract(context, key);

    //--------------End Copy-----------------------

    // /**
    //  * Forward this contact across a void
    //  * this action should only be enacted in formation, and should preceed any situation that it is exposed
    //  */
    // forward():Partner{
    //     this.hidden = true;
    //     this.createBridge();
    // };
    //
    // abstract createBridge():Partner

}
