

import * as D from '../../../util/designation/all'
import {dumpToDepthF as dump, logdump} from '../../../util/debug'
import* as M from '../../../util/designation/pairing'

function symtest(expression, target, tunnel, result){
    let scanner = D.scannerF('g', 't')
    let designator = D.parseDesignatorString(expression)
    let scan = scanner(designator, target)

    let r = D.tokenize(scan)
    for (let ref of tunnel){
        r = r[ref]
    }

    expect(r).toEqual(result)
}

describe('symbolic designation scanning',function(){


    it('should allow symbol in expression', function(){

        symtest(
            'a#.b#:c#',
            { g: { A: { g: { B: { t: { C: "hi" } } } } } },
            ['A.B:C'],
            'hi'
        )

    })

    it('should bind symbols to the result', ()=>{

        symtest(
            'a#.b#:c#', 
            { g: { A: { g: { B: { t: { C: "hi" } } } } } }, 
            [Symbol.for('a'), 'A', Symbol.for('b'), 'B', Symbol.for('c'), 'C'], 
            { 'A.B:C': 'hi' }
        )
    })

    it('should bind over a globbed designator', function(){

        symtest(
            '**:a#',
            { g: { A: { g: { B: { t: { C: "hi" } } } } }, t: { C: "bye" } },
            [Symbol.for('a'), 'C'],
            {'A.B:C':'hi',':C':'bye'}

        )
    })


})

function matchtest (expression, tokenStr, tunnel, result){
    let designator = D.parseDesignatorString(expression)
    let token = D.parseTokenSimple(tokenStr) 
    let r = D.matches(designator, token)
    for (let ref of tunnel) {
        r = r[ref]
    }
    expect(r).toEqual(result)
}

describe('designator match symbol binding', function(){
    it('should match normally as token', function(){
        matchtest('*:*', 'A:B', [], {'A:B':null})
    })

    it('should match token to symbols', function(){
        matchtest('a#:b#'
        ,'A:B', 
        [Symbol.for('a'),'A',Symbol.for('b'), 'B'],
         { 'A:B': null })
    })

    it('should match with interspaced terms designator',function(){
        matchtest('a#.two.three:b#', 'one.two.three:end', [Symbol.for('a'), 'one', Symbol.for('b'), 'end'], { 'one.two.three:end': null })
    })

    it('should match with globbed interspaced' ,function(){
        matchtest('a#.**:b#', 'one.two.three:end', [Symbol.for('a'), 'one', Symbol.for('b'), 'end'], { 'one.two.three:end': null })
    })
})

describe('symbol match designator pairing', function(){
    it('should transpose a binding structure', function(){


        let d = D.parseDesignatorString('a#.**:b#')
        let match = D.matches(d, D.parseTokenSimple('one.two.three:end'))

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

        let d1 = D.parseDesignatorString('Alpha.mine#:ours#')
        let d2 = D.parseDesignatorString('Beta.mein#:ours#')
        let scanner = D.scannerF('g','t')

        let scan1 = scanner(d1, structure)
        let scan2 = scanner(d2, structure)

        let flat1 = D.tokenize(scan1)
        let flat2 = D.tokenize(scan2)

        let pairs = M.pairByBinding(flat1, flat2)

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


})
