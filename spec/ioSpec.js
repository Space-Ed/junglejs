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
            console.log(g1.io)
            g1.io.inputs.beamin("fallacies")
        });

        it('should modify state using input function',function(){
            g1.io.inputs.arc("hello?")

            expect(g1.crown.arc.ctx.saved).toBe("hello?")

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
                    console.log('depositing:', out)
                    this.deposit = out
                };
                this.deposit = undefined

                g1.io.outputs["beamout"].callbackContext.add(this.outcatch, this);
            })

            it('should allow signal subscription', function(){
                var s = g1.io;
                //console.log(s)
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

            g2.io.enshell(function(x){
                console.log(`output: ${x}`);
            }, {});

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

    describe('multiple inputs', function(){
        pending("IO reconfiguration")
        var g2, shell

        beforeEach(function(){
            g2 = G({
                i1:I('i1','_'),
                i2:I('i2'),
                i3:I('i1')
            },{
                r(obj, arg){
                    return obj.i1 + obj.i2 + obj.i3;
                },
                o:Gentyl.Util.identity
            }).prepare()

            shell = g2.shell();

            spyOn(shell.outs._, 'dispatch')
        })

        it('should not trigger untargeting',function(){
            shell.ins.i2("world");
            expect(shell.outs._.dispatch).not.toHaveBeenCalled();
        })

        it('should trigger on targeted', function(){
            shell.ins.i2(" breaks ");
            shell.ins.i1("ice");

            //g2.resolve("hello");

            expect(g2.crown.i1.form.inputFunction).toBe(Gentyl.Inv.placeInput)

            expect(g2.crown.i1.ctx._placed).toBe('ice')
            expect(g2.crown.i2.ctx._placed).toBe(' breaks ')

            expect(shell.outs._.dispatch).toHaveBeenCalledWith('ice breaks ice', '_');
        })
    })

    describe('filter select', function(){
        pending("IO reconfiguration")
        var g2, shell

        beforeEach(function(){
            g2 = G(
                O('out')
            ,{
                s(keys, carArg){
                    console.log('arg in', carArg)
                    return carArg > 5
                },
                t:'out',
            }).prepare()

            shell = g2.shell();

            spyOn(shell.outs.out, 'dispatch');

        })

        it('input should proceed from root to tip when argument is unfiltered', function(){
            shell.ins._(10);

            expect(shell.outs.out.dispatch).toHaveBeenCalledWith(10, 'out')
        })

        it('input should not proceed when selector returns false', function(){
            shell.ins._(0);
            expect(shell.outs.out.dispatch).not.toHaveBeenCalled()
        })

    })
})
