

var Util = require("../../build/jungle.js").Util;

describe("junction", function(){
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
        callout = function(res, handle){
            o.cb(res);
            return res};
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
        expect(o.cb).toHaveBeenCalledWith(undefined);
    });

    it('should return a result when they are awaited and immediate appending', function(){
        j1.await(function(done){
            done("Immediate return");
        },true);

        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith(["Immediate return"]);
    });

    it('should return a result when they are awaited and immediate appending', function(){
        j1.await(function(done){
            done("Immediate return");
        },false);

        j1.then(callout);
        expect(o.cb).toHaveBeenCalledWith("Immediate return");
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
        }, false).then(callout);

        expect(o.cb).not.toHaveBeenCalled();

        setTimeout(function(){
            expect(o.cb).toHaveBeenCalledWith('laters');
            done();
        },100);
    })

    it('chains of then propagating', function(){
        j1.then(function(){return 1},false).then(callout,false).then(callout,false).then(callout);
        expect(o.cb.calls.count()).toEqual(3);
        o.cb.calls.allArgs().forEach(arg=>{
            expect(arg[0]).toEqual(1);
        })
    });

    it('asynchronous chains of then propagating', function(done){
        j1  .then(function(){return 1},false)
            .await(doneIn(20))
            .then(callout,false)
            .await(doneIn(20))
            .then(callout,false);

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(1);
        },30)

        setTimeout(function(){
            expect(o.cb.calls.count()).toEqual(2);
            (o.cb.calls.allArgs()).forEach(arg=>{
                expect(arg[0]).toEqual(1);
            })
            done();
        },50)

    });

    it('merge other junctions', function(done){

        let j2 = new Util.Junction();
        let j3 = new Util.Junction();

        j2.await(function(mydone){
            setTimeout(mydone, 50, "first")
        },false);

        j3.await(function(mydone){
            setTimeout(mydone, 100, "second")
        },true);

        j1.merge(j2,'j2').merge(j3,'j3').then(function(merged, handle){
            callout(merged);
            expect(merged.j2).toEqual("first");
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
            }, true)
            .then(callout)
            .await(function(mydone){
                setTimeout(mydone, 50, "again laters")
            }, false).then(callout);

        expect(o.cb).not.toHaveBeenCalled(); //t0

        //t25 first await returns;
        setTimeout(function(){ //t50
            expect(o.cb.calls.mostRecent().args[0]).toEqual(['laters']);
            expect(o.cb.calls.count()).toBe(1);
        },50);

        setTimeout(function(){ //t100
            expect(o.cb.calls.mostRecent().args[0]).toEqual('again laters');
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
        var spy = jasmine.createSpy()
        var j2 = j1.await(raiser).catch(spy);

        expect(j2).toBe(j1.future);

        expect(spy.calls.first().args[0]).toEqual({message:"Error", key:0})
    });

    it('should allow the idle value extraction', function(done){

        j1  .await(doneIn(10))
            .then(function(){return "idle"},false)

        expect(j1.realize() instanceof Util.Junction).toBeTruthy("still a junction");

        setTimeout(function(){
            expect(j1.realize()).toEqual("idle");
            done();
        },20);
    })

    it('should give a handle to the callback that can pass the value through to the next residual', function(done){

        j1  .await(function(done){
                setTimeout(done, 10, "thing");
            },"awaited")
            .then(function(result, handle){
                let [mydone, raise] = handle.hold("handled");
                setTimeout(mydone, 10, result.awaited);
            },false)
            .then(function(result, handle){
                expect(result.handled).toBe('thing');
                done();
            });
    })

    it('should merge concrete results', function(){
        j1.merge(2,'a').merge(3,'b').then(function(result){
            expect(result.a).toBe(2);
            expect(result.b).toBe(3);
        })
    })

    it('should use an overriding reduction default',function(){
        let [silentDone, raise] = j1.hold();
        let [done] = j1.hold(false);
        done(1);
        done(2);
        silentDone();

        j1.then(function(result, handle){
            expect(result).toBe(2)
        })
    })

    it('Idle non holding then handle manipulation', function(){
        j1.then(function(result, handle){
            let h1 = handle.then();
            expect(handle.isClean()).toBe(false, "single then touch");
            expect(h1.isTampered()).toBe(false)


            handle.then(function(){
                return "Hello"
            },false);

            expect(handle.frontier().isIdle()).toBe(true, "synchronous addon");

            expect(handle.realize()).toBe("Hello", "handle value realization");

        },false).then(function(result,  handle){
            expect(result).toEqual("Hello");
        })
    })

    it('Active tampering handle manipulation', function(done){
        j1.then(function(result, handle){
            let [release, raise] = handle.hold(false);
            release("Bam");
        },"residue").then(function(result, handle){
            expect(result.residue).toEqual("Bam", "instant release")
        }).then(function (result, handle){
            let [release, raise] = handle.hold(false);
            setTimeout(release, 10, 'Bop');
        },true).then(function(result,residue){
            expect(result[0]).toEqual("Bop", "belated release");
            done();
        })

    })

})
