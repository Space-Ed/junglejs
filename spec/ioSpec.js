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
                    }
                },{
                    saved:null
                }),
            beam:G(null
                ,{
                    _beamin(inp){
                        this.buffer.push(inp)
                        return Gentyl.IO.HALT; //dont trigger.
                    },
                    r(obj, arg){
                        return this.buffer.pop() || obj
                    }
                },{
                    buffer:[]
                }),
            crux:G(
                null
                ,{
                    _trigger(input){
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

    it('should do root io', function(){
        pending("IO reconfiguration")
        var g2 = G({
            x:0
        },{
            i(input){
                this.store = input;
                this.stack.push(input)
            },
            o(output){
                return `store: ${this.store} stack: ${this.stack[0]}`
            },
            t:"_"
        },{
            store:"dead",
            stack:[]
        }).prepare()

        var s = g2.shell()
        spyOn(s.outs._, "dispatch")
        s.outs._.add(function(op){
            console.log(op)
        });

        s.ins._("stagnation")
        s.ins._("calamity")

        expect(s.outs._.dispatch).toHaveBeenCalled()

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

            expect(g2.crown.i1.form.inputFunction).toBe(Gentyl.Inventory.placeInput)

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
