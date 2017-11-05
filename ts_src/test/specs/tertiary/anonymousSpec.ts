import {Cell, ObjectCell, ArrayCell} from '../../../tertiary/all'
import TestApp from '../../helpers/testApp'
import {j, J} from '../../../jungle'

describe('anonymisation',function(){


    pending('Full review of anonymisation')


    it('should parse anonymous array members of a Cell', function(){

        let app = new TestApp(J)

        app.init(j('test',{
            ohmynon:j([
                "what", "the", "sequence"
            ])
        }))

        expect(app.exposed.ohmynon[0]).toBe("what")

    })

    it('should create anonymous from cell directly', function(){

        let app = new ObjectCell(J)

        app.init(j([
            'how', 'the', 'list'
        ]));

        expect(app.exposed[0]).toBe('how')

    })

    it('additions without a given name are pushed to the anonymous', function(){
        let app = new TestApp(J)

        app.add("anon1")
        app.init(j('test', {}))
        app.add('anon2')

        expect(app.nucleus[0]).toBe('anon1')
        expect(app.nucleus[1]).toBe('anon2')

    })

    it('should have an array typed nucleus and exposed when created under array basis ', function(){

        let app = new ArrayCell(J)

        let spy = jasmine.createSpy("hiyo");

        app.init(j([
            0,1, {}
        ]))

        expect(app.exposed instanceof Array).toBe(true)
        expect(Object.getPrototypeOf(app.exposed)).toBe(Array.prototype);

        //for(let i=0 ;i<app.exposed.length; i++)

        app.exposed.forEach((x)=>{
            spy(x)
        })

        expect(app.exposed instanceof Array).toBe(true)

        expect(spy).toHaveBeenCalledTimes(3)

    })


    it('should support multiple array nesting', function(){

        let app = new TestApp()

        app.init(j({
            head:{
                debug:true
            },

            level:[
                [0, 1],
                ['a', 'b']
            ],

            grab:{
                basis:'contact:op',
                resolve_in(x){
                    return this.level[x[0]][x[1]]
                }
            }
        }))

        app.callReturnTest({
            label:'Multiple Array Nesting',
            inputContact:':grab',
            inputValues:[[0,0],[0,1],[1,0],[1,1]],
            returnValues:[0,1,'a','b']
        })
    })

    it('should support designation of contacts within array structure', function(){

        let app:any = new TestApp()

        app.init(j({
            head:{
                debug:true
            },

            brave: [j('defaultA'), j('defaultB')],

            drop:{
                basis:'contact:op',
                resolve_in(x){this.brave[1] = x}
            },

            grab:{
                basis:'contact:op',
                resolve_in(x){return this.brave[x]}
            }
        }))

        expect(app.shell.subranes.brave.contacts['0']).not.toBeUndefined()

        //can call inner pull deposit
        app.callReturnTest({
            label:"call inner pull deposit",
            inputContact:'brave:1',
            inputValues:[undefined],
            returnValues:['defaultB']
        })

        app.call(':drop', "notDefault")

        app.callReturnTest({
            label:"Test Change after drop in",
            inputContact:'brave:1',
            inputValues:[undefined],
            returnValues:['notDefault']
        })

        //push deposit
        app.call('brave:0', 'notDefault')

        app.callReturnTest({
            label:"grab push deposit",
            inputContact:':grab',
            inputValues:[0],
            returnValues:['notDefault']
        })

    })

})
