var Gentyl = require("../dist/gentyl.js");
var G = Gentyl.G;

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
                        Gentyl.Util.deeplyEqualsThrow(g.resolve(),
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
        var g

        beforeEach(function(){
            g = G("I",{
                c(arg){
                    if(arg === 'c'){
                        console.log('selected carry')
                        let unlock = this.gate.lock();
                        setTimeout(function(){
                            unlock("C");
                        },10)
                    }else{
                        return "C";
                    }
                },
                s(keys, arg){
                    if (arg === 's'){
                        console.log('selected select')
                        let unlock = this.gate.lock();
                        setTimeout(function(){
                            unlock(true);
                        },10)
                    }else{
                        return true;
                    }
                },
                r(obj, arg, carg){
                    if (arg === 'r'){
                        console.log('selected resolve')
                        let unlock = this.gate.lock();
                        setTimeout(function(){
                            unlock(obj+carg+"R");
                        },10)
                    }else{
                        return obj+carg+"R";
                    }
                }
            }).prepare();
        })

        describe("children synced, timeout tractors,", function(){

            fit('should return gate when carry performs a lock', function(done){
                var labels = ['r','s','c'];

                function recur(label){
                    expect(g.engaged).toBe(false);
                    var gp = g.resolve(label);

                    expect(g.deplexer.gate).toBe(g.ctx.exposed.gate, "should be the same gate as prepped")
                    expect(gp === g.deplexer).toBe(true, "should return the deplexer");
                    expect(gp.label).toBe('resolve');
                    expect(g.engaged).toBe(true, 'engaged');
                    expect(gp.returned).toBe(false, 'not returned');

                    setTimeout(function () {
                        expect(gp.deposit).toBe("ICR", label);
                        expect(gp.returned).toBe(true);

                        if(labels.length == 0){
                            done();
                        }else{
                            recur(labels.pop());
                        }
                    },20);
                }
                recur(labels.pop());
            });

            fit('when select performs a lock', function(){

            })

        })
    })
})
