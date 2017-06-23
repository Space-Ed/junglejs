import Jasmine = require('jasmine')
import TestApp from "../../helpers/testApp";

describe('life cycle', function(){

    describe('prime', function(){

        it('should call the provided tractors in context', function(){

            let primespy = jasmine.createSpy('prime')
            let disposespy = jasmine.createSpy('dispose')
            let beginspy = jasmine.createSpy('begin')
            let endspy = jasmine.createSpy('end')

            let app = new TestApp({
                form:{
                    prime:primespy,
                    dispose:disposespy,
                    begin:beginspy,
                    end:endspy
                }
            })

            app.prime()

            expect(primespy).toHaveBeenCalledTimes(1)
            expect(primespy.calls.first().object).toBe(app.nucleus)

            expect(beginspy).toHaveBeenCalledTimes(1)
            expect(beginspy.calls.first().object).toBe(app.nucleus)

            app.dispose()

            expect(disposespy).toHaveBeenCalledTimes(1)
            expect(disposespy.calls.first().object).toBe(app.nucleus)


            expect(endspy).toHaveBeenCalledTimes(1)
            expect(endspy.calls.first().object).toBe(app.nucleus)
        })

    })

})
