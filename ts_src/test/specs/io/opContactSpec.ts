
import {Junction} from '../../../util/junction/junction'
import {StdOp,StdOpSpec} from '../../../interoperability/contacts/stdops'

interface OpTest {
    spec:StdOpSpec,
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

        let op = new StdOp({
            label:'resolver',
            context:context,
            mode:'resolve',
            inner_op(inp){
                return 'Fiddle' + inp + this.detritus
            },
        })

        let opinv = op.invert()

        expect(op.isTargetable).toBe(true)
        expect(op.isSeatable).toBe(false)
        expect(opinv.isTargetable).toBe(false)
        expect(opinv.isSeatable).toBe(false)

        op.put(' my ').then(x=>{
            expect(x).toBe('Fiddle my Diddle')
        })
    })

    it('should create carrier', function(){
        let op = new StdOp({
            label:'carrier',
            context:context,
            mode:'carry',
            inner_op(inp, carry){
                return carry('Fiddle' + inp + this.detritus)
            },
        })

        let opinv = op.invert()

        expect(op.isTargetable).toBe(true)
        expect(op.isSeatable).toBe(false)
        expect(opinv.isTargetable).toBe(false)
        expect(opinv.isSeatable).toBe(true)

        let espy = jasmine.createSpy('emitinv')
        opinv.emit = espy

        op.put(' your ')

        expect(espy.calls.first().args[0]).toBe('Fiddle your Diddle')

    })

    it('should create reflex',function(){
        let op = new StdOp({
            label:'reflex',
            context:context,
            mode:'reflex',
            inner_op(inp, reflex){
                return reflex('Fiddle' + inp + this.detritus)
            }
        })

        let opinv = op.invert()

        expect(op.isTargetable).toBe(true)
        expect(op.isSeatable).toBe(true)
        expect(opinv.isTargetable).toBe(false)
        expect(opinv.isSeatable).toBe(false)

        let espy = jasmine.createSpy('emitinv')
        op.emit = espy

        op.put(' this ')

        expect(espy.calls.first().args[0]).toBe('Fiddle this Diddle')
    })

    it('should create a bidirectional push, pull buffer', function(){
        let buffer = []
        let op = new StdOp({
            context:buffer,
            label:'push-pull buffer',
            mode:'resolve',
            inner_op(data){
                this.push(data)
            },

            outer_op(data){
                return this.shift()
            },
        })

        let opinv = op.invert()

        op.put(1)
        op.put(2)
        op.put(3)

        opinv.put().then(x=>{expect(x).toBe(1)})
        opinv.put().then(x=>{expect(x).toBe(2)})
        opinv.put().then(x=>{expect(x).toBe(3)})
    })

    it('should allow drain',function(){

        function drain(data){
            this.dumped = data
        }

        let op = new StdOp({
            context: context,
            mode:'resolve', label:'resolve',
            inner_op:drain,
            outer_op:drain
        })

        let opinv = op.invert()

        op.put('filth')

        expect(context.dumped).toBe('filth')

        opinv.put('gold')

        expect(context.dumped).toBe('gold')

    })

    it('should allow spring', function(){

        let op = new StdOp({
            label:'spring',
            context:context,
            hook_inward:true,
            hook_outward:true,
            mode:'resolve'
        })

        let opinv = op.invert()

        let opemit = jasmine.createSpy('opemit'); op.emit = opemit
        let invemit = jasmine.createSpy('invemit'); opinv.emit = invemit

        op.hook.inward('hello all')
        expect(opemit.calls.first().args[0]).toBe('hello all')

        op.hook.outward('hello all')
        expect(invemit.calls.first().args[0]).toBe('hello all')

    })


})
