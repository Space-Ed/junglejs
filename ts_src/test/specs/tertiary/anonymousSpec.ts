import Jasmine = require('jasmine')
import {Cell, DefaultCell, ArrayCell} from '../../../tertiary/all'
import TestApp from '../../helpers/testApp'
import {CallInSync, PushDeposit, PullDeposit} from '../../../aliases/all'

describe('anonymisation',function(){

    it('should parse anonymous array members of a Cell', function(){

        let app = new TestApp({

            ohmynon:[
                "what", "the", "sequence"
            ]
        })

        app.prime()


        expect(app.nucleus.ohmynon[0]).toBe("what")

    })

    it('should create anonymous from cell directly', function(){

        let app = new DefaultCell([
            'how', 'the', 'list'
        ])

        app.prime();

        let testinject = {test:undefined}
        app.shell.contacts.access.inject(testinject, 'test')

        expect(testinject.test[0]).toBe('how')

    })

    it('additions without a given name are pushed to the anonymous', function(){
        let app = new TestApp({})

        app.add("anon1")
        app.prime()
        app.add('anon2')

        expect(app.nucleus[0]).toBe('anon1')
        expect(app.nucleus[1]).toBe('anon2')

    })

    it('should have an array typed nucleus when created under array basis ', function(){
        let app = new ArrayCell([
            0,1, {}
        ])

        let spy = jasmine.createSpy("hiyo");

        app.prime()

        app.nucleus.forEach((x)=>{
            spy(x)
        })

        expect(spy).toHaveBeenCalledTimes(3)

    })


    it('should support multiple array nesting', function(){

        let app = new TestApp({
            form:{
                debug:true
            },

            level:[
                [0, 1],
                ['a', 'b']
            ],
            grab:CallInSync(function(x){
                return this.level[x[0]][x[1]]
            })
        })

        app.prime()

        app.callReturnTest({
            label:'Multiple Array Nesting',
            inputContact:':grab',
            inputValues:[[0,0],[0,1],[1,0],[1,1]],
            returnValues:[0,1,'a','b']
        })
    })

    it('should support designation of contacts within array structure', function(){

        let app = new TestApp({
            form:{
                debug:true
            },

            brave: [PushDeposit('defaultA'), PullDeposit('defaultB')],
            drop:CallInSync(function(x){
                console.log(this)
                this.brave[1] = x
            }),
            grab:CallInSync(function(x){
                return this.brave[x]
            })
        })

        app.prime()

        //can call inner pull deposit
        app.callReturnTest({
            label:"call inner pull deposit",
            inputContact:'_.brave:1',
            inputValues:[undefined],
            returnValues:['defaultB']
        })

        app.call(':drop', "notDefault")

        app.callReturnTest({
            label:"Test Change after drop in",
            inputContact:'_.brave:1',
            inputValues:[undefined],
            returnValues:['notDefault']
        })

        //push deposit
        app.call('_.brave:0', 'notDefault')

        app.callReturnTest({
            label:"grab push deposit",
            inputContact:':grab',
            inputValues:[0],
            returnValues:['notDefault']
        })

    })

})
