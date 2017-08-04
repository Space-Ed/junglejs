
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
        plexdist:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.DROP,
                emitCallType:_IO.CALLTYPE.BREADTH_FIRST
            }
        },

        split:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.SOME,
                emitRetType: _IO.MUXRESP.ORDER,
                emitCallType:_IO.CALLTYPE.BREADTH_FIRST
            }
        },

        compose:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.MAP,
                emitCallType:_IO.CALLTYPE.BREADTH_FIRST
            }
        },

        race:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.RACE,
                emitCallType:_IO.CALLTYPE.BREADTH_FIRST
            }
        }

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
