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

        function timeout(label, returnValueOrFunc, labelArg, funcArgs, timeout){

            let rf = (returnValueOrFunc instanceof Function ) ? returnValueOrFunc : function(){return returnValueOrFunc}

            return function(...tractorArgs){
                let inargs = tractorArgs;

                let args = []
                for (var i = 0; i < funcArgs.length; i++) {
                    args[i] = tractorArgs[funcArgs[i]];
                }
                let rvinner = rf.apply(this, args);

                if(arguments[labelArg].indexOf(label) != -1 ){
                    let unlock = this.gate.lock();
                    setTimeout(function(){
                        unlock(rvinner);
                    },10);
                }else{
                    return rvinner;
                }
            }
        }

        beforeEach(function(){
            g = G("I",{
                c:timeout('c', 'C', 0,[], 10),
                s:timeout('s', true, 1,[], 10),
                r:timeout('r', function(o,a,c){return o+c+'R'}, 1, [0,1,2],10)
            }).prepare();

            g1 = G("I",{
                c:timeout('k', 'C', 0,[], 10),
                s:timeout('z', true, 1,[], 10),
                r:timeout('d', function(o,a,c){return o+c+'D'}, 1, [0,1,2],10)
            })

            g2 = G([
                g,
                g1
            ]);
        })

        fit('should return gate when any tractor performs a lock', function(done){
            var labels = ['r','s','c', 'rc', 'rsc', 'sc', 'rs'];

            function recur(i){
                expect(g.engaged).toBe(false);
                var gp = g.resolve(labels[i]);

                expect(g.deplexer.gate).toBe(g.ctx.exposed.gate, "should be the same gate as prepped")
                expect(gp === g.deplexer).toBe(true, "should return the deplexer");
                expect(gp.label).toBe('resolve');
                expect(g.engaged).toBe(true, 'engaged');
                expect(gp.returned).toBe(false, 'not returned');

                setTimeout(function () {
                    expect(gp.deposit).toBe("ICR", labels[i]);
                    expect(gp.returned).toBe(true);

                    if(i === labels.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                },50);
            }
            recur(0);
        });

        fit('should return gate if any object child locks', function(){

            var labels = ['c', 'k', 'z', 'cz'];

            function recur(i){
                expect(g2.engaged).toBe(false);
                var gp = g2.resolve(labels[i]);

                expect(g2.deplexer.gate).toBe(g2.ctx.exposed.gate, "should be the same gate as prepped")
                expect(gp === g2.deplexer).toBe(true, "should return the deplexer");
                expect(gp.label).toBe('resolve');
                expect(g2.engaged).toBe(true, 'engaged');
                expect(gp.returned).toBe(false, 'not returned');

                setTimeout(function () {

                    expect(gp.deposit.a).toBe("ICR", labels[i]);
                    expect(gp.deposit.b).toBe("ICD", labels[i]);
                    expect(gp.returned).toBe(true);

                    if(i === labels.length-1){
                        done();
                    }else{
                        recur(i+1);
                    }
                },200);
            }

            recur(0);
        })

    });
});
