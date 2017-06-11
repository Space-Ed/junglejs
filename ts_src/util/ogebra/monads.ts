import {meld, mask, invert} from './operations'
import {reduce, map, scan , terminate, negate} from './primary-functions'

import * as T from './types'


class Blender {

    static defaults = {
        reduce:reduce.latest,
        map:map.identity,
        scan:scan.enumerable,
        negate:negate.existential,
        terminate:terminate
    }

    private _blend:(obj:Object)=>Object
    private _screen:(obj:Object)=>Object
    private _diff:(obj:Object)=>Object
    private _subtract:(obj:Object)=>Object
    private _dump:()=>Object

    public monad:Object

    constructor(func:{reduce:T.Reducer, map, terminate, scan, negate}){

        this.defops({
            map:  func.map || Blender.defaults.map,
            terminate:  func.terminate || Blender.defaults.terminate,
            scan:  func.scan || Blender.defaults.scan,
            reduce:  func.reduce || Blender.defaults.reduce,
            invert:  func.negate || Blender.defaults.negate
        })
    }

    defops(func){
        this._blend = (obj:Object):Object=>{
            return meld(func.reduce)(this.monad, obj)
        }

        this._screen = (obj:Object):Object=>{
            return mask(func.reduce)(this.monad, obj)
        }

        this._diff = (obj:Object):Object=>{
            return meld(func.reduce)(invert(func.negate)(this.monad), obj)
        }

        this._subtract = (obj:Object):Object=>{
            return meld(func.reduce)(this.monad, invert(func.negate)(obj))
        }

        this._dump = ():Object=>{
            return this.monad
        }
    }

    blend(obj){
        this.monad = this._blend(obj)
        return this
    }
    blendExtract(obj){
        return this._blend(obj);
    }

    screen(obj){
        this.monad = this._screen(obj)
        return this
    }
    screenExtract(obj){
        return this._screen(obj);
    }

    diff(obj){
        this.monad = this._diff(obj)
        return this
    }
    diffExtract(obj){
        return this._diff(obj);
    }

    subtract(obj){
        this.monad = this._subtract(obj)
        return this
    }
    subtractExtract(obj){
        return this._subtract(obj);
    }

    dump(){
        return this.monad
    }


}
