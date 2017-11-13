import {Domain, Composite as Comp, Construct,j, J} from '../../../jungle'

describe('extraction', function(){

    describe( 'of terminal constructs', function(){

        let construct = new Construct(J) 

        it('should extract the initial body', function(){
            construct.init(j('basis', {
                its: "mybody"
            }))

            expect(construct.extract()).toEqual({
                its:'mybody'
            })
        })
    } )

    describe( 'of composite constructs', function(){
        
        let D = new Domain()
            .define('comp', Comp)
            .define('array', Comp)
            .define('cons', Construct)

        let seed = j('comp', {
            x: "basic data",
            y: j('comp', {
                data: 'not so basic'
            }),
            z: j('comp', {
                info: j('cons', 'so deep')
            }),
            anon: [
                0, 'one', j('cons', 'two'), j(['a','b','c'])
            ]
        })

        let composite = D.recover(seed)

        it('should extract whole body with no arg / null', function(){
            expect(composite.extract()).toEqual({
                x:'basic data',
                y:{
                    data:'not so basic'
                },
                z:{
                    info:'so deep'
                }
            })
        })

        it('should extract entire being with null j' , function(){
            expect(composite.extract(j(null))).toEqual({
                basis:Comp,
                origins:['comp'],
                head:{},
                body:{
                    x:"basic data",
                    y:{
                        basis:'comp',
                        head:{},
                        body:{
                            data:'not so basic'
                        }
                    },
                    z:{
                        head:{},
                        basis:'comp',
                        body:{
                            info: {
                                head:{}, basis:'cons', body:'so deep'}
                        }
                    }
                },
                anon: [
                    0, 'one', { head: {}, basis: 'cons', body: 'two' }, { head: {}, basis:'array', body:{}, anon:['a','b','c']}
                ]
            })
        })

        it('should extract partial being with specified body j', )

        it('should selectively extract with object', function(){
            expect(composite.extract({
                x:null, y:{ data:null }
            })).toEqual(
                {x:'basic data', y:{data:'not so basic'}}
            )
        })

        it('should extract all anons into an array', function(){
            expect(composite.extract([])).toEqual([
                0, 'one', 'two', ['a', 'b', 'c']
            ])
        })

        it('should extract deep anon with zeroeth index of selector', function(){
            expect(composite.extract([j(null)])).toEqual([
                0, 'one', { head: {}, basis: 'cons', body: 'two' }, { head: {}, basis: 'array', body: {}, anon: ['a', 'b', 'c'] }
            ])

        })


    })

})