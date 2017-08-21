

import * as D from '../../../util/designator'
import {dumpToDepthF as dump, logdump} from '../../../util/debug'
import* as M from '../../../util/designation/matching'

describe('symbolic designation',function(){

    it('should allow symbol in expression', function(){
        let d = new D.Designator('g', 't', 'a#.b#:c#')
        expect(d.scan({g:{A:{g:{B:{t:{C:"hi"}}}}}})['A.B:C']).toBe('hi')
    })

    it('should bind symbols to the result', ()=>{
        let d = new D.Designator('g', 't', 'a#.b#:c#')
        let scan = d.scan({g:{A:{g:{B:{t:{C:"hi"}}}}}})

        let debind = scan[Symbol.for('a')]['A'][Symbol.for('b')]['B'][Symbol.for('c')]['C']

        expect(debind).toEqual({'A.B:C':'hi'})
    })

    it('should bind over a globbed designator', function(){
        let d = new D.Designator('g', 't', '**:a#')
        let scan = d.scan({g:{A:{g:{B:{t:{C:"hi"}}}}}, t:{C:"bye"}})

        expect(scan[Symbol.for('a')]['C']).toEqual({'A.B:C':'hi',':C':'bye'})

    })


})


describe('designator match symbol binding', function(){
    it('should match normally as token', function(){
        let d = new D.Designator('g', 't', '*:*')
        let match = d.matches('A:B')
        expect(match).toEqual({'A:B':null})
        expect(d.matches('foot.rot:flats')).toBe(false)
    })

    it('should match token to symbols', function(){
        let d = new D.Designator('g', 't', 'a#:b#')
        let match = d.matches('A:B')


        expect(match[Symbol.for('a')]['A'][Symbol.for('b')]['B']).toEqual   ({'A:B':null})
    })

    it('should match with interspaced terms designator',function(){
        let d = new D.Designator('g', 't', 'a#.two.three:b#')
        let match = d.matches('one.two.three:end')

        expect(match[Symbol.for('a')]['one'][Symbol.for('b')]['end']).toEqual   ({'one.two.three:end':null})
    })

    it('should match with globbed interspaced' ,function(){
        let d = new D.Designator('g', 't', 'a#.**:b#')
        let match = d.matches('one.two.three:end')

        expect(match[Symbol.for('a')]['one'][Symbol.for('b')]['end']).toEqual   ({'one.two.three:end':null})
    })
})

describe('symbol match designator pairing', function(){
    it('should transpose a binding structure', function(){
        let d = new D.Designator('g', 't', 'a#.**:b#')
        let match = d.matches('one.two.three:end')

        expect(M.transposeBindings(match)).toEqual({
            'one.two.three:end':{a:'one', b:'end'}
        })
    })

    it('should match a clean chain of bindings',function(){
        let structure = {
            g:{
                Alpha:{g:{algo:{t:{common:"art"}}}},
                Beta:{g:{bald:{t:{common:"boo"}}}}
            }}

        let d1 = new D.Designator('g', 't', 'Alpha.mine#:ours#')
        let d2 = new D.Designator('g', 't', 'Beta.mein#:ours#')

        let scan1 = d1.scan(structure)
        let scan2 = d2.scan(structure)

        let pairs = M.pairByBinding(scan1, scan2)

        expect(pairs).toEqual([
          {
            tokenA: "Alpha.algo:common",
            tokenB: "Beta.bald:common",
            bindings: {
              mine: "algo",
              ours: "common",
              mein: "bald"
            }
          }
      ])
    })

    // it('should match across many possibilities in squared fashion', function(){
    //
    //
    //     let d1 = new D.Designator('g', 't', 'Alpha.mine#:ours#')
    //     let d2 = new D.Designator('g', 't', 'Beta.mein#:ours#')
    //
    //     let scan1 = d1.scan(structure)
    //     let scan2 = d2.scan(structure)
    //
    //     let pairs = M.pairByBinding(scan1, scan2)
    //
    //
    // })
})
