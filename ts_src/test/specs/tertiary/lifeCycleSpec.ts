import Jasmine = require('jasmine')
import TestApp from "../../helpers/testApp";
import * as Jungle from '../../../jungle'
import {j, J} from '../../../jungle'

describe('life cycle', function(){

    pending('Lifecycle review')

    describe('prime', function(){

        it('should call the provided tractors in context', function(){

            let primespy = jasmine.createSpy('prime')
            let disposespy = jasmine.createSpy('dispose')
            let beginspy = jasmine.createSpy('begin')
            let endspy = jasmine.createSpy('end')

            let app = new TestApp(J)

            app.init(j({
                head:{
                    prime:primespy,
                    dispose:disposespy,
                    begin:beginspy,
                    end:endspy
                },

                hello:"something"
            }))

            expect(primespy).toHaveBeenCalledTimes(1)
            expect(primespy.calls.first().object.hello).toBe("something")
            expect(primespy.calls.first().object).toBe(app.nucleus)

            expect(beginspy).toHaveBeenCalledTimes(1)
            expect(beginspy.calls.first().object).toBe(app.local)

            app.dispose()

            expect(disposespy).toHaveBeenCalledTimes(1)
            expect(disposespy.calls.first().object).toBe(app.local)


            expect(endspy).toHaveBeenCalledTimes(1)
            expect(endspy.calls.first().object).toBe(app.local)
        })

        it('should have base properties exposed to prime when extended', function(){
            let subd = Jungle.J.sub("pollute", {rebasing:false})
                .define('object', j('object',{
                    head:{
                        dispose(){
                            pspy('backwater')
                        }
                    }
                }))

            let pspy = jasmine.createSpy("pspy")

            let app = subd.recover(j({
                head:{
                    prime(){
                        pspy(this.trash.fiend);
                    },

                    begin(){
                        pspy(this.monster);
                    },

                    end(){
                        pspy('turgid')
                    },

                },

                monster:"garbage",

                trash:{
                    fiend:'gargoyle'
                }
            }))

            expect(pspy.calls.first().args[0]).toBe("gargoyle")
            expect(pspy.calls.mostRecent().args[0]).toBe("garbage")

            pspy.calls.reset()
            app.dispose()

            expect(pspy.calls.first().args[0]).toBe("turgid")
            expect(pspy.calls.mostRecent().args[0]).toBe("backwater")


        })

    })

})
