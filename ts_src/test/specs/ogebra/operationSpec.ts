import Jasmine = require('jasmine')
import * as op from '../../../util/ogebra/operations'
import * as f from '../../../util/ogebra/primary-functions'
import {deeplyEqualsThrow} from "../../../util/checks";

fdescribe('operations', function(){

    describe('meld', function(){

        let melder = op.meld(f.reduce.latest)

        it('should meld two objects', function(){
            let o1 = {
                a:0,
                b:0
            }

            let o2 = {
                b:1,
                c:1
            }

            deeplyEqualsThrow(melder(o1, o2), {
                a:0,
                b:1,
                c:1
            })

        })
    })

    describe('mask', function(){

        let mask = op.mask(f.reduce.latest)

        it('should mask uncommon values', function(){
            let o1 = {
                a:0,
                b:0
            }

            let o2 = {
                b:1,
                c:1
            }

            deeplyEqualsThrow(mask(o1, o2), {
                b:1
            })
        })
    })

    describe('inverse', function(){

        let inverter = op.invert(f.negate.existential)

        it('should self annihlate', function(){

            let o = {
                a:"hello",
                b:undefined
            }

            let inv = inverter(o)

            let del1 = op.meld(f.reduce.latest)(o, inv)
            let del2 = op.meld(f.reduce.latest)(inv, o)

            deeplyEqualsThrow(del1, {})
            deeplyEqualsThrow(del2, {})

        })

    })


})
