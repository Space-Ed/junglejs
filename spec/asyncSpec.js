var Jungle = require("../dist/jungle.js");
var G = Jungle.G;

const fs = require('fs');

describe("asynchronous tractors", function(){

    describe(" (prepare )", function(){
        var g;

        describe("boring old nothing",function(){

            beforeEach(function(){
                g = G({
                    boring:0,
                    old:G({
                        nothing:1,
                    })
                })

            })

            it("should give a returned gate port when no async children",function(){
                g.async = true;
                var prep = g.prepare();

                expect(prep.returned).toBe(true);
                expect(prep.deposit).toBe(g);
            })

            it("should return normally when async is not set", function(){
                expect(g.prepare()).toBe(g);
            });

            it("should give a returned port even when child is set to async", function(){
                //children returning async does not interrupt triggering
                g.async = true;
                g.crown.old.async = true;
                var prep = g.prepare();

                expect(prep.returned).toBe(true);
                expect(prep.deposit).toBe(g);

            });

            it("should return normally when async is not set even when child is async", function(){
                g.crown.old.async = true;
                expect(g.prepare()).toBe(g);
            });

        });

        describe("something clever", function(){

            beforeEach(function(){
                g = G({
                    file:G(null,{
                        p(parg){
                            var unlock = this.gate.lock()

                            fs.readFile(parg, function(err, data){
                                if(err){
                                    this.data = "ERROR DATA"
                                }else{
                                    this.data = JSON.parse(data);
                                }

                                unlock();
                            })
                        },
                        r(){
                            return this.data;
                        },
                        data:undefined

                    })
                },{

                })
            })

            it("should return gate that returns when file loaded",function(done){

                var port = g.prepare("/spec/articles/data.json");

                port.callback = function(){}
                spyOn(port, "callback");
                expect(port.returned).toBe(false);
                expect(g.engaged).toBe(true);

                setTimeout(function(){
                    expect(port.callback).toHaveBeenCalledWith(g)
                    expect(port.returned).toBe(true);

                    expect(function(){
                        Jungle.Util.deeplyEqualsThrow(g.resolve(),
                        {
                            "shallow":0,
                            "deep":{
                                "sorts":"data",
                                "counts":2
                            },
                            "many":[
                                "again","defined"
                            ]
                        })
                    }).not.toThrowError()

                    done();
                },500);
            });
        })

    })

    describe("resolve", function(){
        var g, g2, g1;

        /*
         a higher order function whose product function returns a certain value after a timeout
           label: how to select the phase of operation c, s or r;
           returnValueOrFunction: the value to return or means to derive from a designated value;
           label Arg: means to choose which argument is the key to match on arg 1;
           funcArgs: the indicies of the tractor passed to the value derivation;
           timeout: the time (ms) after which the lock is released and value [is derived and] returned;
         */
        function markerTestedTimeout(marker, returnValueOrFunc, markerArg, funcArgs, timeout){

            let rf = (returnValueOrFunc instanceof Function ) ? returnValueOrFunc : function(){return returnValueOrFunc}

            return function(...tractorArgs){
                let inargs = tractorArgs;

                let args = []
                for (var i = 0; i < funcArgs.length; i++) {
                    args[i] = tractorArgs[funcArgs[i]];
                }
                let rvinner = rf.apply(this, args);

                if(arguments[markerArg].indexOf(marker) != -1 ){
                    let unlock = this.gate.lock();
                    setTimeout(function(){
                        unlock(rvinner);
                    },10);
                }else{
                    return rvinner;
                }
            }
        }

        function repeatedTimeout(dofunc, checkfunc, repeatTime){
            setTimeout(function(){
                if(checkfunc()){
                    dofunc();
                }else{
                    repeatedTimeout(dofunc, checkfunc, repeatTime);
                }
            },repeatTime)
        }

        beforeEach(function(){
            g = G("Terminal",{
                c:markerTestedTimeout('c', 'Carried', 0,[], 10),
                s:markerTestedTimeout('s', true, 1,[], 10),
                r:markerTestedTimeout('r', function(o,a,c){return o+c+'Resolved'}, 1, [0,1,2],10)
            }).prepare();

            g1 = G("Terminal",{
                c:markerTestedTimeout('k', 'Carried', 0,[], 10),
                s:markerTestedTimeout('z', true, 1,[], 10),
                r:markerTestedTimeout('d', function(o,a,c){return o+c+'DifferentlyResolved'}, 1, [0,1,2],10)
            }).prepare();

            g2 = G([
                g,
                g1
            ]).prepare();
        })

        it('should return gate when any tractor performs a lock', function(done){
            var activatedMarkers = ['r','s','c', 'rc', 'rsc', 'sc', 'rs'];

            function recur(i){
                expect(g.engaged).toBe(false);
                var gp = g.resolve(activatedMarkers[i]);

                expect(g.deplexer.gate).toBe(g.ctx.exposed.gate, "should be the same gate as prepped")
                expect(gp === g.deplexer).toBe(true, "should return the deplexer");
                expect(gp.label).toBe('resolve');
                expect(g.engaged).toBe(true, 'engaged');
                expect(gp.returned).toBe(false, 'not returned');

                repeatedTimeout(function () {
                    expect(gp.deposit).toBe("TerminalCarriedResolved", activatedMarkers[i]);
                    expect(gp.returned).toBe(true);

                    if(i === activatedMarkers.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                },function(){
                    return !g.engaged;
                },250);
            }

            recur(0);
        });

        it('should return gate if any object child locks', function(done){

            var activatedMarkers = ['c', 'k', 'z', 'cz'];

            function recur(i){
                expect(g2.engaged).toBe(false);

                var gp = g2.resolve(activatedMarkers[i]);

                expect(g2.deplexer.gate).toBe(g2.ctx.exposed.gate, "should be the same gate as prepped")

                expect(gp === g2.deplexer).toBe(true, "should return the deplexer");
                expect(gp.label).toBe('resolve');
                expect(g2.engaged).toBe(true, 'engaged');
                expect(gp.returned).toBe(false, 'not returned');

                repeatedTimeout(function () {

                    console.log("deposit or value at marker " + activatedMarkers[i], gp.deposit.label);

                    expect(gp.deposit).toBe(["TerminalCarriedResolved", "TerminalCarriedDifferentlyResolved"], activatedMarkers[i]);
                    expect(gp.returned).toBe(true);

                    if(i === activatedMarkers.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                },function(){
                    return !g.engaged;
                },50);
            }

            recur(0);
        })

    });
});
