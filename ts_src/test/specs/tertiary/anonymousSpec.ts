import {Cell} from '../../../tertiary/all'
import TestApp from '../../helpers/testApp'
import {j, J, Construct} from '../../../jungle'

describe('anonymisation',function(){

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

        let app = new Cell(J)

        app.init(j([
            'how', 'the', 'list'
        ]));

        expect(app.exposed[0]).toBe('how')

    })

    it('additions without a given name are pushed to the anonymous', function(){
        let app = new TestApp(J)

        app.addAnon("anon1")
        app.init(j('test', {}))
        app.add('anon2')

        expect(app.nucleus[0]).toBe('anon1')
        expect(app.nucleus[1]).toBe('anon2')

    })

    it('should have an array typed nucleus and exposed when created under array basis ', function(){

        let app = new Cell(J)

        J.define('simple', j(Construct))

        let spy = jasmine.createSpy("hiyo");

        app.init(j([
            0,1, j('simple', 'body'), 'after',  'thought'
        ]))
        
        expect(app.exposed instanceof Array).toBe(true)
        expect(Object.getPrototypeOf(app.exposed)).toBe(Array.prototype);

        app.exposed.forEach((x)=>{
            spy(x)
        })

        spy.calls.allArgs().forEach(([arg], i)=>{
            expect(arg).toBe([0,1,'body','after','thought'][i])
        })
    })


    it('should support multiple array nesting', function(){

        let app = new TestApp(J)

        app.init(j({
            head:{
                debug:true
            },

            level:j([
                j([0, 1]),
                j(['a', 'b'])
            ]),

            grab:j('resolve',{
                outer(x){
                    return this.earth.level[x[0]][x[1]]
                }
            })
        }))

        app.callReturnTest({
            label:'Multiple Array Nesting',
            inputContact:':grab',
            inputValues:[[0,0],[0,1],[1,0],[1,1]],
            returnValues:[0,1,'a','b']
        })
    })

    it('should support designation of contacts within array structure', function(){

        let app:any = new TestApp(J)

        app.init(j({
            head:{
                debug:true
            },

            brave: j([j('deposit', 'defaultA'), j('deposit', 'defaultB')]),

            drop:j('resolve',{
                outer(x){this.earth.brave[1] = x}
            }),

            grab:j('resolve', {
                outer(x){return this.earth.brave[x]}
            })
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
