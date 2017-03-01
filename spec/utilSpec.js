

var Util = require("../dist/jungle.js").Util;

fdescribe("junction", function(){
    let j1, o, callout, countout

    function doneIn(time){
        return function(done, raise){
            setTimeout(done, time)
        }
    }

    function raiser(done, raise){
        raise("Error")
    }

    beforeEach(function(){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

        o = {c:0, cb(){}};
        callout = function(res){
            let prop = res?res.residue:null;
            o.cb(res);
            return prop};
        countout = function(number){
            return function(res){
                o.cb(number)
            }
        };
        spyOn(o, 'cb');

        j1 = new Util.Junction();
    });

    afterEach(function(){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    })

    it('should return empty if then called before await', function(){
        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith([]);
    });

    it('should return a result when they are awaited and immediate', function(){
        j1.await(function(done){
            done("Immediate return");
        });

        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith(["Immediate return"]);
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
            expect(o.cb).toHaveBeenCalledWith(['laters']);
            done();
        },100);
    })

    it('chains of then propagating', function(){
        j1.then(function(){return 1}).then(callout).then(callout).then(callout);
        expect(o.cb.calls.count()).toEqual(3);
        o.cb.calls.allArgs().forEach(arg=>{
            expect(arg[0].residue).toEqual(1);
        })
    });

    it('asynchronous chains of then propagating', function(done){
        j1  .then(function(){return 1})
            .await(doneIn(20))
            .then(callout)
            .await(doneIn(20))
            .then(callout);

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(1);
        },30)

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(2);
            (o.cb.calls.allArgs()).forEach(arg=>{
                expect(arg[0].residue).toEqual(1);
            })
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

    it('should be the same to say then after than to chain it',function(done){
        j1.await(doneIn(10));
        j1.then(callout).then(callout);
        j1.await(doneIn(10));
        j1.then(callout).then(callout);

        setTimeout(function(){
            expect(o.cb.calls.count()).toBe(2);
        },15)

        setTimeout(function(){
            expect(o.cb.calls.count()).toBe(4);
            done();
        },30)
    });

    it('should allow calling of draw to contribute to the next',function(done){
        j1  .await(doneIn(20))
            .then(callout);

        //draw now falls on the next
        let [mydone, raise] = j1.hold();
        setTimeout(mydone, 40);

        j1  .then(callout)

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(1);
        },30);

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(2);
            done();
        },50);

    });

    it('should catch an error',function(){
        var j2 = j1.await(raiser).catch(callout);

        expect(j2).toBe(j1.future)

        expect(o.cb.calls.first().args[0]).toEqual({message:"Error", key:0})
    })

})
