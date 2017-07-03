
import {Domain} from './construction/domain'

import * as _Util from './util/all'
import * as _IO  from './interoperability/all'
import * as _TRT from './tertiary/all'
import * as _CST from './construction/all'

export const Util = _Util
export const IO = _IO;
export const TRT = _TRT;
export const CST = _CST

export * from './util/all'
export * from './interoperability/all'
export * from './construction/all'
export * from './tertiary/all'

export const Core = new Domain({
    media:new Domain({
        direct:_IO.DirectMedium,
        distribute:_IO.DistributeMedium,
        exchange:_IO.ExchangeMedium
    }),

    cell:{
        nature:TRT.Cell,
        patch:{
            form:{
                sections:[],
                mesh:{}
            }
        }
    },

    object:TRT.DefaultCell,
    array:TRT.ArrayCell,

    link:TRT.Connector,

    hook:new Domain({
        call:TRT.CallHook,
        access:TRT.AccessHook
    })
})

//full circle
CST.Construct.DefaultDomain = Core
