// import {makeHandler} from '../../../construction/state'
import {Composite, Construct, Domain, j} from '../../../jungle'

describe('internal state proxy', function (){

    let testDomain:Domain;
    let testObject:Composite;

    beforeEach(function(){
        testDomain = new Domain()
        testObject = new Composite(testDomain)

        testObject.init(j({
            strange:42,
            good:j(Construct, 'Sup'),
            bad:j(Construct),
            anon:[
                0,
                j(Composite, {
                    love:'one'
                })
            ]
        }))
    })

    it('should access strange properties', function(){
        expect(testObject.exposed.strange).toBe(42)
    })

    it('should access exposed of subconstruct', function(){
        expect(testObject.exposed.good).toBe('Sup')
    })

    it('should access anonymous entries by numeric index', function(){
        expect(Object.getOwnPropertyNames(testObject.exposed)).toEqual(['0', '1', 'length', 'strange', 'good', 'bad'])
        expect(testObject.exposed.length).toBe(2)
        expect(testObject.exposed[0]).toBe(0)
        expect(testObject.exposed[1].love).toBe('one')
    })

    it('should be able to set nucleus', function(){
        testObject.exposed[0] = 'blam'
        expect(testObject.exposed[0]).toEqual('blam')

        testObject.exposed['good'] = 'bunk'
        expect(testObject.exposed['good']).toEqual('bunk')
    })

    it('should not be able to set composite nucleus', function(){
        expect(()=>{testObject.exposed[1] = 'WHYYYEE'}).toThrowError('Unable to set composite body from internal context')
    })



})
