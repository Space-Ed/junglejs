import Jasmine = require('jasmine')
import * as op from '../../../util/ogebra/operations'
import * as f from '../../../util/ogebra/primary-functions'
import * as hrc from '../../../util/ogebra/hierarchical'
import {deeplyEqualsThrow} from "../../../util/checks";


describe('deep melding ',function(){

    let melder = hrc.deepMeldF(f.terminate.isPrimative, f.reduce.latest)

    it('should meld deep object structure', function(){
        let s1 = {
            a:0,
            b:{
                a:0,
                b:0
            }
        }

        let s2 = {
            b:{
                b:1,
                c:1
            },
            c:1
        }

        console.log(melder(s1,s2))

        deeplyEqualsThrow(melder(s1,s2), {
            a:0,
            b:{
                a:0,
                b:1,
                c:1
            },
            c:1
        })

    })

})


describe('deep mask', function(){

    let masker = hrc.deepMaskF(f.terminate.isPrimative, f.reduce.latest)

    it('should recursively mask', function(){
        let s1 = {
            a:0,
            b:{
                a:0,
                b:0
            }
        }

        let s2 = {
            b:{
                b:1,
                c:1
            },
            c:1
        }

        console.log(masker(s1,s2))

        deeplyEqualsThrow(masker(s1,s2), {
            b:{
                b:1
            }
        })
    })
})


describe('deep invert', function(){

    it('should perform deep subtraction', function(){


        let inverter = hrc.deepInvertF(f.terminate.isPrimative, (x)=>{
            return -x
        })


        let cnums1 = {
            vals:{
                a:{
                    i:-10,
                    r:10
                },
                b:{
                    i:1,
                    r:1
                }
            }
        }

        let cnums2 = {
            vals:{
                b:{
                    i:2,
                    r:3
                }
            }
        }

        let inv1 = inverter(cnums1)
        let diff = hrc.deepMeldF(f.terminate.isPrimative, (x,y)=>{return x+y})(inv1, cnums2)

        console.log(inv1)
        console.log(diff)

        deeplyEqualsThrow(diff, {
            vals:{
                a:{
                    i:10,
                    r:-10
                },
                b:{
                    i:1,
                    r:2
                }
            }
        })
    })
})
