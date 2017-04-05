let Jungle = require('../dist/jungle.js');
let {G, L, R, Util} = Jungle;

describe('link within Synth',function(){

    it('should allow use of Link in synth', function () {
        let l1 = L({
        },{
            link:['_.$->_.$']
        });

        // l1.prepare();
        //
        //
        // expect(l1.io.shell.sources.$).not.toBeUndefined()
        // expect(l1.io.shell.sinks.$).not.toBeUndefined()
        //
        // expect(l1.crown).not.toBeUndefined();
        // expect(l1.resolve(1)).toBe(1);

        let g = G([
                l1
            ]
        )

        expect(g.crown[0] instanceof Jungle.LinkCell).toBe(true)

        expect(g.resolve(1)).toBe([1]);

        // let spy = jasmine.createSpy();
        //
        // g.io.dress(spy);
        //
        //

    })

})
