
import {Junction} from '../../../util/junction/junction'
import {Op,OpSpec,OpCallTarget} from '../../../interoperability/contacts/op'

interface OpTest {
    spec:OpSpec,
    majorIn:boolean,
    majorOut:boolean,
    minorOut:boolean,
    minorIn:boolean,
}

describe('op contact', function(){

    let context

    beforeEach(function(){
        context = {
            detritus:'Diddle'
        }
    })

    it('should create resolver', function(){

        let op = new Op({
            context:context,
            major_op(inp){
                return 'Fiddle' + inp + this.detritus
            },
            major_return:'resolve'
        })

        let opinv = op.invert()

        expect(op.hasInput).toBe(true)
        expect(op.hasOutput).toBe(false)
        expect(opinv.hasInput).toBe(false)
        expect(opinv.hasOutput).toBe(false)

        op.put(' my ').then(x=>{
            expect(x).toBe('Fiddle my Diddle')
        })
    })

    it('should create carrier', function(){
        let op = new Op({
            context:context,
            major_op(inp){
                return 'Fiddle' + inp + this.detritus
            },
            major_return:'carry'
        })

        let opinv = op.invert()

        expect(op.hasInput).toBe(true)
        expect(op.hasOutput).toBe(false)
        expect(opinv.hasInput).toBe(false)
        expect(opinv.hasOutput).toBe(true)

        let espy = jasmine.createSpy('emitinv')
        opinv.emit = espy

        op.put(' your ')

        expect(espy.calls.first().args[0]).toBe('Fiddle your Diddle')

    })

    it('should create reflex',function(){
        let op = new Op({
            context:context,
            major_op(inp){
                return 'Fiddle' + inp + this.detritus
            },
            major_return:'reflex'
        })

        let opinv = op.invert()

        expect(op.hasInput).toBe(true)
        expect(op.hasOutput).toBe(true)
        expect(opinv.hasInput).toBe(false)
        expect(opinv.hasOutput).toBe(false)

        let espy = jasmine.createSpy('emitinv')
        op.emit = espy

        op.put(' this ')

        expect(espy.calls.first().args[0]).toBe('Fiddle this Diddle')
    })

    it('should create a bidirectional push, pull buffer', function(){
        let buffer = []
        let op = new Op({
            context:buffer,
            major_op(data){
                this.push(data)
            },

            minor_op(data){
                return this.shift()
            },

            minor_return:'resolve'
        })

        let opinv = op.invert()

        op.put(1)
        op.put(2)
        op.put(3)

        opinv.put().then(x=>{expect(x).toBe(1)})
        opinv.put().then(x=>{expect(x).toBe(2)})
        opinv.put().then(x=>{expect(x).toBe(3)})
    })

    it('should create full monty ', function(){
        let op = new Op({
            context:context,
            major_op(data, carry, reflex){
                return new Junction().mode('object')
                    .merge(carry(data),'carry')
                    .merge(reflex(data),'reflex')
            },
            major_return:'resolve',
            major_arg1:'carry',
            major_arg2:'reflex',

            minor_op(data, reflex, carry){
                return new Junction().mode('object')
                    .merge(carry(data),'carry')
                    .merge(reflex(data),'reflex')
            },
            minor_return:'resolve',
            minor_arg1:'reflex',
            minor_arg2:'carry'

        })

        let opinv = op.invert()

        op.emit = x =>`op emit:${x}`
        opinv.emit = x =>`opinv emit:${x}`

        opinv.put('beep').then(resp=>{expect(resp).toEqual({
            carry:'op emit:beep',
            reflex:'opinv emit:beep'
        })})

        op.put('boop').then(resp=>{expect(resp).toEqual({
            carry:'opinv emit:boop',
            reflex:'op emit:boop'
        })})

    })

    it('should allow drain',function(){

        function drain(data){
            this.dumped = data
        }

        let op = new Op({
            context: context,
            major_op:drain,
            minor_op:drain
        })

        let opinv = op.invert()

        op.put('filth')

        expect(context.dumped).toBe('filth')

        opinv.put('gold')

        expect(context.dumped).toBe('gold')

    })

    it('should allow spring', function(){

        let op = new Op({
            context:context,
            hook_op(inp, carry, reflex){
                carry(inp)
                reflex(inp)
            },
            hook_name:'hook',
            hook_arg1:'carry',
            hook_arg2:'reflex'
        })

        let opinv = op.invert()

        let opemit = jasmine.createSpy('opemit'); op.emit = opemit
        let invemit = jasmine.createSpy('invemit'); opinv.emit = invemit

        context.hook('hello all')

        expect(opemit.calls.first().args[0]).toBe('hello all')
        expect(invemit.calls.first().args[0]).toBe('hello all')

    })


})
