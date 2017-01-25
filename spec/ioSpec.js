var Gentyl = require('../dist/gentyl.js');
var signals = require('signals')
var G = Gentyl.G, I = Gentyl.I, O = Gentyl.O;

describe("input-output", function(){
    var g1;

    beforeEach(function(){
        g1 = G({
            arc:G(null,{
                    _arc(input){
                        this.saved = input
                    },
                    r(){
                        return this.saved
                    },
                    arc_(out){
                        return `I have saved ${out}`
                    },
                    saved:null
                }),
            beam:G(null
                ,{
                    _beamin(inp){
                        this.buffer.push(inp);
                    },
                    r(obj, arg){
                        return this.buffer.pop() || obj
                    },
                    buffer:[]
                }),
            crux:G(
                null
                ,{
                    __trigger(input){
                        if(input <= 5){
                            return Gentyl.IO.HALT
                        }
                    }
                })
        },{
            beamout_(obj, arg){
                return obj.beam
            }
        })
    })

    it('should throw error when shelling unprepared', function(){
        expect(function(){
            g1.io.enshell()
        }).toThrowError("unable to shell unprepared node")

    })

    it('should shell up', function(){
        g1.prepare()
        g1.io.enshell()
    })

    describe("prepared shell",function(){

        beforeEach(function(){
            g1.prepare()
            g1.io.enshell()

            //spyOn(this, 'outcatch')

        })


        it("should allow me to call input label",function(){
            g1.io.inputs.beamin("fallacies")
        });

        it('should modify state using input function',function(){
            g1.io.inputs.arc("hello?")

            expect(g1.crown.arc.ctx.exposed.saved).toBe("hello?")

        })
    })

    describe('signal shelling',function(){

        beforeEach(function(){
            g1.prepare()
            g1.io.enshell(signals.Signal.prototype.dispatch, signals.Signal)

            //spyOn(this, 'outcatch')

        })

        it('should have a signal instance on outputs', function(){
            expect(g1.io.outputs.arc.callbackContext instanceof signals.Signal).toBe(true)
            expect(g1.io.outputs.beamout.callbackContext instanceof signals.Signal).toBe(true)
        })

        describe('with output detectors',function(){

            beforeEach(function(){
                this.outcatch = function(out){
                    this.deposit = out
                };
                this.deposit = undefined

                g1.io.outputs["beamout"].callbackContext.add(this.outcatch, this);
            })

            it('should allow signal subscription', function(){
                var s = g1.io;
                s.inputs.beamin("Buckets")
                expect(this.deposit).toBeUndefined();
                s.inputs.trigger(2);
                expect(this.deposit).toBeUndefined();
                s.inputs.trigger(6);
                expect(this.deposit).toBe("Buckets")

                //spyOn(s.outs.beamout, "dispatch")
                //expect(s.outs.beamout.dispatch).toHaveBeenCalled()
            })

        })
    })

    describe("special base io", function(){

        var trigate, entrigate, entrigater, trigater, g2, types, results, calls, inputs;

        beforeEach(function(){
            trigate = G({isolated:0},{
                _$(input){},
                $_(output){}
            }).prepare().enshell(Gentyl.Inv.pass, {});

            entrigate = G({open:1},{
                __$(input){return input},
                c(arg){
                    return arg + 1;
                },
                r(obj, arg, carg){
                    return obj.open + carg;
                },
                $_(output){return output}
            }).prepare().enshell(Gentyl.Inv.pass, {});

            entrigater = G({},{
                __$(input){},
                $__(output){return Gentyl.IO.HALT},
            }).prepare().enshell(Gentyl.Inv.pass, {});

            trigater = G({},{
                _$(input){this.supreme = input;},
                r(x, o){this.supreme = 'false'},
                $__(output){return this.supreme},
            },{supreme:"ruler"}).prepare().enshell(Gentyl.Inv.pass, {});

            versions = [trigate,     entrigate,   entrigater,    trigater];
            inputs =   [undefined,   1,           undefined,     'chancellor']
            results =  [undefined,   3,           Gentyl.IO.HALT,'chancellor']
            calls =    [false,       true,        false,         false]

            g2 = G(null,{
                __$(input){
                    this.store = input;
                },
                $__(output){
                    return `store: ${this.store}`
                }
            },{
                store:"dead",
            }).prepare();
        })

        it('should do root io', function(){

            g2.io.enshell(function(x){}, {});

            var s = g2.io;

            s.inputs.$("stagnation")
            spyOn(s.outputs.$, "callback")
            s.inputs.$("stagnation")

            expect(s.outputs.$.callback).toHaveBeenCalled()

        })

        it('resolve should work for all io types',function(){
            g2.io.enshell();
            expect(g2.resolve("alive")).toBe("store: alive");

            for (var i = 0; i < versions.length; i++) {
                var g = versions[i]
                var source = g.io.shell.sources.$;
                spyOn(source, 'callback')

                //routing through special io
                expect(g.resolve(inputs[i])).toBe(results[i]);

                if(calls[i]){
                    expect(source.callback).toHaveBeenCalled();
                }else{
                    expect(source.callback).not.toHaveBeenCalled();
                }
            }
        })

        it('should throw exceptions in failcases',function(){
            expect(function(){
                G(null, {_$(){}, __$(){}})
            }).toThrowError()
        })

    })

    describe("reactive value io", function(){

        it("should set a context value passively", function(){

            var g = G(null,{
                _X:undefined,
                _Y:0,
                r(x){
                    return [this.X, this.Y]
                }
            }).prepare();


            var res = g.resolve();
            expect(res[0]).toBeUndefined();
            expect(res[1]).toBe(0);

            g.io.inputs.X(1);
            g.io.inputs.Y(2);

            res = g.resolve();
            expect(res[0]).toBe(1);
            expect(res[1]).toBe(2);
        });

        it("should trigger on change for eager only", function(){

            var g = G(null,{
                __X:undefined,
                __Y:0,
                _Z:"bleep",
                r(x){
                    return [this.X, this.Y, this.Z]
                }
            }).prepare();
            g.io.outputs.$.callback = function(x){
                console.log("spied out")
            }

            spyOn(g.io.outputs.$, 'callback');

            g.io.inputs.Y(0); //not a change;
            expect(g.io.outputs.$.callback).not.toHaveBeenCalled();

            g.io.inputs.Z("trash") // is a change but not eager
            expect(g.io.outputs.$.callback).not.toHaveBeenCalled();

            g.io.inputs.X(1);
            expect(g.io.outputs.$.callback).toHaveBeenCalledWith([1, 0, 'trash']);
        });

        it("should output value", function(){
            var g = G(null,{
                W_:2,
                X_:undefined,
                Y__:0,
                Z__:"bleep",
                r(obj, arg){
                    [this.W, this.X, this.Y, this.Z] = arg;
                }
            }).prepare();

            g.io.outputs.W.callback = function(x){}
            g.io.outputs.X.callback = function(x){}
            g.io.outputs.Y.callback = function(x){}
            g.io.outputs.Z.callback = function(x){}

            spyOn(g.io.outputs.W, 'callback');
            spyOn(g.io.outputs.X, 'callback');
            spyOn(g.io.outputs.Y, 'callback');
            spyOn(g.io.outputs.Z, 'callback');

            g.io.inputs.$([2, 1, 0, "trash"]);

            expect(g.io.outputs.W.callback).not.toHaveBeenCalled(); //unchanging lazy
            expect(g.io.outputs.X.callback).toHaveBeenCalledWith(1); //changing - lazy
            expect(g.io.outputs.Y.callback).toHaveBeenCalledWith(0); // unchanging eager
            expect(g.io.outputs.Z.callback).toHaveBeenCalledWith("trash");  // changing eager
        })

        it("should throughput value",function(){
            var g = G(null, {
                _W_:0,
                __X_:0,
                _Y__:0,
                __Z__:0,
                r(obj, arg){
                    [this.W, this.X, this.Y, this.Z] = arg;
                    return [this.W, this.X, this.Y, this.Z];
                }
            }).prepare();

            g.io.outputs.W.callback = function(x){}; spyOn(g.io.outputs.W, 'callback');
            g.io.outputs.X.callback = function(x){}; spyOn(g.io.outputs.X, 'callback');
            g.io.outputs.Y.callback = function(x){}; spyOn(g.io.outputs.Y, 'callback');
            g.io.outputs.Z.callback = function(x){}; spyOn(g.io.outputs.Z, 'callback');
            g.io.outputs.$.callback = function(x){}; spyOn(g.io.outputs.$, 'callback');

            g.io.inputs.$([0,0,0,0]);

            expect(g.io.outputs.W.callback).not.toHaveBeenCalled(); //trigate - unchanged
            expect(g.io.outputs.X.callback).not.toHaveBeenCalled(); //entrigate - unchanged
            expect(g.io.outputs.Y.callback).toHaveBeenCalledWith(0); // trigater - unchanged
            expect(g.io.outputs.Z.callback).toHaveBeenCalledWith(0); // entrigater -unchanged

            g.io.inputs.$([1,1,1,1]);

            expect(g.io.outputs.W.callback).toHaveBeenCalledWith(1); //trigate    - changed
            expect(g.io.outputs.X.callback).toHaveBeenCalledWith(1); //entrigate  - changed
            expect(g.io.outputs.Y.callback).toHaveBeenCalledWith(1); // trigater  - changed
            expect(g.io.outputs.Z.callback).toHaveBeenCalledWith(1); // entrigater -changed

            g.io.outputs.W.callback = function(x){}; spyOn(g.io.outputs.W, 'callback');
            g.io.outputs.X.callback = function(x){}; spyOn(g.io.outputs.X, 'callback');
            g.io.outputs.Y.callback = function(x){}; spyOn(g.io.outputs.Y, 'callback');
            g.io.outputs.Z.callback = function(x){}; spyOn(g.io.outputs.Z, 'callback');
            g.io.outputs.$.callback = function(x){}; spyOn(g.io.outputs.$, 'callback');

        })

    })
})
