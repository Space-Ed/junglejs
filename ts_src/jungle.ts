
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
        direct:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.ONE,
                emitRetType: _IO.MUXRESP.LAST,
                emitCallType:_IO.CALLTYPE.DIRECT
            }
        },
        smear:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.LAST,
                emitCallType:_IO.CALLTYPE.BREADTH_FIRST
            }
        },

        split:{
            nature:_IO.MuxMedium,
            patch:{
                symbols:[],
                emitArgType: _IO.DEMUXARG.SOME,
                emitRetType: _IO.MUXRESP.MAP,
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

    cell:TRT.Cell,
    object:TRT.DefaultCell,
    array:TRT.ArrayCell,

    link:TRT.Connector,

    contact:new Domain({
        op:TRT.StandardOp,
        outof:{
            nature:TRT.StandardOp,
            patch:{
                carry_out:true
            }
        },
        into:{
            nature:TRT.StandardOp,
            patch:{
                carry_in:true
            }
        }
    })
})

//full circle
CST.Construct.DefaultDomain = Core
