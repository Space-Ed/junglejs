
import {BasicContact} from './base'
import * as Debug from '../../util/debug'
import {Junction} from '../../util/all'

export abstract class Call<T extends BasicContact<any>> extends BasicContact<T> {

    //capability flags must be decided
    public invertable = true;

    public hasInput = false;
    public hasOutput = false;

    put:(data?:any, crumb?:Debug.Crumb)=>Junction;
    emit:(data?:any, crumb?:Debug.Crumb)=>any;

}
