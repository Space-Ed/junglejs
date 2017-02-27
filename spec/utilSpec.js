

var Util = require("../dist/jungle.js").Util;

describe("junction", function(){
    let j1, o, callout, countout;

    function doneIn(time){
        return function(done, raise){
            setTimeout(done, time)
        }
    }

    beforeEach(function(){
        o = {c:0, cb(){}};
        callout = function(res, prop){
            o.cb(res, prop);
            return prop};
        countout = function(number){
            return function(res){
                o.cb(number)
            }
        };
        spyOn(o, 'cb');

        j1 = new Util.Junction();
    });

    it('should return empty if then called before await', function(){
        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith([], undefined);
    });

    it('should return a result when they are awaited and immediate', function(){
        j1.await(function(done){
            done("Immediate return");
        });

        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith(["Immediate return"], undefined);
    });

    it('should return with multiple instant awaits',function(){
        j1  .await(function(done){
                done("Immediate return");
            }, 'x')
            .await(function(done){
                done("another immediate");
            }, 'y')
            .then(function(result){
                expect(result.x).toBe("Immediate return");
                expect(result.y).toBe("another immediate");
            });
    });

    it('should return belatedly on timeout when done ',function(done){
        j1  .await(function(mydone){
            setTimeout(mydone, 50, 'laters')
        }).then(callout);

        expect(o.cb).not.toHaveBeenCalled();

        setTimeout(function(){
            expect(o.cb).toHaveBeenCalledWith(['laters'], undefined);
            done();
        },100);
    })

    it('chains of then propagating', function(){
        j1.then(function(){return 1}).then(callout).then(callout).then(callout);
        expect(o.cb.calls.count()).toEqual(3);
        expect(o.cb.calls.allArgs()).toEqual([ [ [  ], 1 ], [ [  ], 1 ], [ [  ], 1 ] ] );
    });

    it('asynchronous chains of then propagating', function(done){
        j1  .then(function(){return 1})
            .await(doneIn(20))
            .then(callout)
            .await(doneIn(20))
            .then(callout).then(function(){
                expect(o.cb).not.toHaveBeenCalled();
            });


        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(1);
        },30)

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(2);
            expect(o.cb.calls.allArgs()).toEqual([ [ [undefined], 1 ], [ [undefined], 1 ] ]);
            done();
        },50)
    });

    it('merge other junctions', function(done){

        let j2 = new Util.Junction();
        let j3 = new Util.Junction();

        j2.await(function(mydone){
            setTimeout(mydone, 50, "first")
        });

        j3.await(function(mydone){
            setTimeout(mydone, 100, "second")
        });

        j1.merge(j2,'j2').merge(j3,'j3').then(function(merged){
            callout();
            expect(merged.j2).toEqual(["first"]);
            expect(merged.j3).toEqual(["second"]);
            done();
        });

        setTimeout(function(){
            expect(o.cb).not.toHaveBeenCalled()
        }, 70 );

    })

    it('awaits after then should begin when then completes',function(done){
        j1  .await(function(mydone){
                setTimeout(mydone, 25, 'laters')
            })
            .then(callout)
            .await(function(mydone){
                setTimeout(mydone, 50, "again laters")
            }).then(callout);

        expect(o.cb).not.toHaveBeenCalled(); //t0

        //t25 first await returns;
        setTimeout(function(){ //t50
            expect(o.cb.calls.mostRecent().args[0]).toEqual(['laters']);
            expect(o.cb.calls.count()).toBe(1);
        },50);

        setTimeout(function(){ //t100
            expect(o.cb.calls.mostRecent().args[0]).toEqual(['again laters']);
            done();
        },100);
    });

    it('should be the same to say then after than to chain it',function(){
        j1.await(doneIn(10));
        j1.then(callout);
        j1.await(doneIn(10))
        j1.then(callout).then(function(){
            expect(o.cb.calls.count()).toBe(2)
        });


    })

})
