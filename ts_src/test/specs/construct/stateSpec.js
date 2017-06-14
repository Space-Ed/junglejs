const State = require('../../build/construction/state.ts').State

describe("State Construct", function(){


    it('exposed should behave like a normal object',function(){
        let s = new State();
        let e = s.exposed;

        e.a = 1;
        expect(e.a).toBe(1)

        e.b = {c:2};
        expect(e.b.c).toBe(2)

        delete e.a;
        expect(e.a).toBe(undefined)

        delete(e.b);
        expect(e.b).toBe(undefined)

    })
})
