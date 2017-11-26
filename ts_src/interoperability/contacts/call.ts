
import {BaseContact} from './base'
import * as Debug from '../../util/debug'
import {Junction} from '../../util/all'

export abstract class Call<T extends BaseContact<any>> extends BaseContact<T> {

    //capability flags must be decided
    public invertable = true;

    public isTargetable = false;
    public isSeatable = false;

    put:(data?:any, crumb?:Debug.Crumb)=>Junction;
    emit:(data?:any, crumb?:Debug.Crumb)=>any;

}
