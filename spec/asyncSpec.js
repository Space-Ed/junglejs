var Jungle = require("../dist/jungle.js");
var G = Jungle.G;
var Util = Jungle.Util;


const fs = require('fs');

describe("asynchronous tractors", function(){

    describe(" (prepare )", function(){
        var g;

        describe("asynchronously", function(){

            beforeEach(function(){
                g = G({
                    file:G(null,{
                        p(parg){

                            this.handle.await(function(done, raise){
                                fs.readFile(parg, function(err, data){
                                    if(err){
                                        console.log(err)
                                        raise(err)
                                    }else{
                                        this.data = JSON.parse(data);
                                        done();
                                    }
                                })
                            },false)

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

                var junction = g.prepare("./spec/articles/data.json");

                expect(g.ctx.exposed.data).toBeUndefined();
                expect(junction instanceof Util.Junction).toBe(true, "return should be junction")

                expect(junction.isIdle()).toBe(false, "junction is waiting for something");

                junction.then((prepared)=>{
                    expect(prepared.prepared).toBe(true)

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
                    }).not.toThrowError();

                    done();
                });


            });
        })

    })

    describe("resolve", function(){
        var g, g2, g1;

        /*
         a higher order function whose product function returns a certain value after a timeout
           marker: how to select the phase of operation c, s or r;
           returnValueOrFunction: the value to return or means to derive from a designated value;
           markerArg: means to choose which argument is the key to match on arg 1;
           funcArgs: the indicies of the tractor passed to the value derivation;
           timeout: the time (ms) after which the lock is released and value [is derived and] returned;
         */
        function markerTestedTimeout(marker, returnValueOrFunc, markerArg, funcArgs, timeout){

            let rf = (returnValueOrFunc instanceof Function ) ? returnValueOrFunc : function(){return returnValueOrFunc}

            return function(...tractorArgs){
                let args = []
                for (var i = 0; i < funcArgs.length; i++) {
                    args[i] = tractorArgs[funcArgs[i]];
                }

                let rvinner = rf.apply(this, args);

                //when the marker can be found in the input arguments
                if(tractorArgs[markerArg].indexOf(marker) != -1 ){ //is the m
                    let [unlock] = this.handle.hold(false);
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
                c:markerTestedTimeout('k', 'Carried', 0, [] , 10),
                s:markerTestedTimeout('z',  true,     1, [] , 10),
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
                var  junc = g.resolve(activatedMarkers[i]);

                expect(junc instanceof Util.Junction).toBe(true, "Returned Junction");
                expect(junc.isIdle()).toBe(false);

                junc.then(function (result) {
                    expect(result).toBe("TerminalCarriedResolved", activatedMarkers[i]);
                    expect(junc.allDone()).toBe(true);

                    if(i === activatedMarkers.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                });
            }

            recur(0);
        });

        it('should return gate if any object child locks', function(done){

            var activatedMarkers = ['c', 'k', 'z', 'cz'];

            function recur(i){

                var junc = g2.resolve([activatedMarkers[i], activatedMarkers[i]]);

                junc.then(function(result){

                    expect(result).toEqual(["TerminalCarriedResolved", "TerminalCarriedDifferentlyResolved"], activatedMarkers[i]);
                    expect(junc.allDone()).toBe(true);

                    if(i === activatedMarkers.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                });
            }

            recur(0);
        })

    });
});
