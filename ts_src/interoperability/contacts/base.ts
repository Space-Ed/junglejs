
// import * as I from '../interfaces'

import {ContactToMedium} from '../media/base'

export namespace I {
    export interface ContactHost {
        invert():ContactHost
    }
}

export abstract class BaseContact<Partner extends BaseContact<any>> implements ContactToMedium{

    //exclusion flags used by mesh
    public hidden = false;  //does not appear in designations.
    public plugged = false; //no further links allowed
    public gloved = false;  //no further rules allowed
    public claimed = false; //no further media allowed
    public inverted = false;

    protected partner:Partner;

    abstract isTargetable:boolean;
    abstract isSeatable:boolean;

    private claims:any;

    claim(medium){
        this.claims = true
    }

    isContested():boolean {
        return this.claims
    }

    isClaimed():boolean{
        return !this.isContested()
    }

    /**
     * if possible create the partner that will appear on the other side and put it there.
     * this action is undertaken when added to a membrane
     */
    invert():Partner{
        if (this.partner === undefined && this.invertable === true){
            this.partner = this.createPartner()
            this.inverted = true;

            this.partner.partner = this;
            this.partner.inverted = true;

        }
        return this.partner;

    }

    //---------------Copy to Implement-------------

    //Is the contact appearing on both sides of the membrane?
    public abstract invertable:boolean;

    //after super.invert() this.partner to refer to the opposite side
    // invert():Partner{
    //      super.invert()
    // }

    //must return the partner contact if invertable is true
    createPartner():Partner{
        return undefined
    }

    //--------------End Copy-----------------------


}
