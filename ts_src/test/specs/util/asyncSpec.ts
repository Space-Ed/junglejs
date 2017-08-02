
import {Junction} from '../../../util/junction/junction'

describe("junction", function(){
    let j1:Junction, callout:jasmine.Spy

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
        j1 = new Junction();
        callout = jasmine.createSpy('callout').and.callFake(x=>{
            console.log(`callout: ${JSON.stringify(x)}`)
            return x
        })
    });

    afterEach(function(){
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    })

    it('should return empty if then called before await', function(){
        j1.then(callout);
        expect(callout).toHaveBeenCalledWith(undefined);
    });

    it('should return a result when they are awaited and immediate appending', function(){
        j1.await(function(done){
            done("Immediate return");
        });

        j1.then(callout);

        expect(callout).toHaveBeenCalledWith("Immediate return");
    });

    it('should return a result when they are awaited and immediate appending', function(){
        j1
        .mode("append")
        .await(function(done){
            done("Immediate return");
        });

        j1.then(callout);
        expect(callout).toHaveBeenCalledWith(["Immediate return"]);
    });


    it('should return with multiple instant awaits',function(){
        j1  .mode('object')
            .await(function(done){
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

        expect(callout).not.toHaveBeenCalled();

        setTimeout(function(){
            expect(callout).toHaveBeenCalledWith('laters');
            done();
        },100);
    })

    it('synchronous chains of then propagating', function(){

        j1  .then(function(){return 1})
            .then(callout)
            .then(callout)
            .then(callout);

        expect(callout.calls.count()).toEqual(3);

        //all calls are 1
        callout.calls.allArgs().forEach(arg=>{
            expect(arg[0]).toEqual(1);
        })
    });

    it('asynchronous chains of then propagating', function(done){
        j1  .mode('first')
            .then(function(){return 1})
            .await(doneIn(20))
            .then(callout)
            .await(doneIn(20))
            .then(callout);

        setTimeout(function(){
            expect(callout.calls.count()).toEqual(1);
        },30)

        setTimeout(function(){
            expect(callout.calls.count()).toEqual(2);
            (callout.calls.allArgs()).forEach(arg=>{
                expect(arg[0]).toEqual(1);
            })
            done();
        },50)

    });

    it('merge other junctions', function(done){

        let j2 = new Junction();
        let j3 = new Junction();

        j2.await(function(mydone){
            setTimeout(mydone, 50, "first")
        });

        j3  .mode('append')
            .await(function(mydone){
            setTimeout(mydone, 100, "second")
        });

        j1  .mode('object')
            .merge(j2,'j2')
            .merge(j3,'j3').then(function(merged){
            callout(merged);

            expect(merged.j2).toEqual("first");
            expect(merged.j3).toEqual(["second"]);
            done();
        });

        setTimeout(function(){
            expect(callout).not.toHaveBeenCalled()
        }, 70 );

    })

    it('awaits after then should begin when then completes',function(done){
        j1  .mode('append').await(function(mydone){
                setTimeout(mydone, 25, 'laters')
            })
            .then(callout)
            .mode('last')
            .await(function(mydone){
                setTimeout(mydone, 50, "again laters")
            })
            .then(callout);

        expect(callout).not.toHaveBeenCalled(); //t0

        //t25 first await returns;
        setTimeout(function(){ //t50
            expect(callout.calls.mostRecent().args[0]).toEqual(['laters']);
            expect(callout.calls.count()).toBe(1);
        },50);

        setTimeout(function(){ //t100
            expect(callout.calls.mostRecent().args[0]).toEqual('again laters');
            done();
        },100);
    });

    it('should be the same to say then after than to chain it',function(done){
        j1.await(doneIn(10));
        j1.then(callout).then(callout);
        j1.await(doneIn(10));
        j1.then(callout).then(callout);

        setTimeout(function(){
            expect(callout.calls.count()).toBe(2);
        },15)

        setTimeout(function(){
            expect(callout.calls.count()).toBe(4);
            done();
        },30)
    });

    it('should allow calling of hold to contribute to the next',function(done){
        j1  .await(doneIn(20))
            .then(callout);

        //draw now falls on the next
        let [mydone, raise] = j1.hold();
        setTimeout(mydone, 40);

        j1  .then(callout)

        setTimeout(function(){
            expect(callout.calls.count()).toEqual(1);
        },30);

        setTimeout(function(){
            expect(callout.calls.count()).toEqual(2);
            done();
        },50);

    });

    it('should catch an error',function(){
        var spy = jasmine.createSpy("errspy")
        var j2 = j1.await(raiser)
        .catch(spy);

        expect(j2).toBe(j1.future);
        expect(spy).toHaveBeenCalled()
        expect(spy.calls.first().args[0]).toEqual({message:"Error", key:0})
    });

    it('should allow the idle value extraction', function(done){

        j1  .await(doneIn(10))
            .then(function(){return "idle"},false)

        expect(j1.realize() instanceof Junction).toBeTruthy("still a junction");

        setTimeout(function(){
            expect(j1.realize()).toEqual("idle");
            done();
        },20);
    })

    it('a junction returned from the callback can pass a value to the next open phase', function(done){
        j1  .mode('object')
            .await(function(done){
                setTimeout(done, 10, "thing");
            },"awaited")
            .then(function(result){
                let junc = new Junction()
                let [mydone, raise] = junc
                    .mode('object')
                    .hold("handled");

                setTimeout(mydone, 10, result.awaited);

                return junc
            })
            .mode("last")
            .then(function(result){
                expect(result.handled).toBe('thing');
                done();
            });
    })

    it('should merge concrete results', function(){
        j1.mode('object').merge(2,'a').merge(3,'b').then(function(result){
            expect(result.a).toBe(2);
            expect(result.b).toBe(3);
        })
    })

    it('should use an overriding reduction default',function(){
        j1.mode('single')
        let [silentDone, raise] = j1.hold(false);
        let [done] = j1.hold(true);
        done(1);
        done(2);
        silentDone();

        j1.then(function(result){
            expect(result).toBe(2)
        })
    })

    it('Idle non holding then handle manipulation', function(){
        j1.then(function(result){
            let handle:any = new Junction()
            let h1 = handle.then(x=>x);
            expect(handle.isClean()).toBe(false, "single then touch");
            // expect(h1.isTampered()).toBe(false, "is tampered by then")

            handle.then(function(){
                return "Hello"
            },false);

            expect(handle.frontier().isIdle()).toBe(true, "synchronous addon");

            expect(handle.realize()).toBe("Hello", "handle value realization");
            return handle
        }).then(function(result){
            expect(result).toEqual("Hello");
        })
    })

    it('Active tampering handle manipulation', function(done){
        j1
        .mode('object')
        .then(function(result){
            let handle = new Junction()
            let [release, raise] = handle.hold(false);
            release("Bam");
            return handle
        },"residue")
        .then(function(result){
            expect(result.residue).toEqual("Bam", "instant release")
        })
        .mode('append')
        .then(function (result){
            let handle = new Junction();
            let [release, raise] = handle.hold();
            setTimeout(release, 10, 'Bop');
            return handle
        }).then(function(result){
            expect(result[0]).toEqual("Bop", "belated release");
            done();
        })

    })

})
