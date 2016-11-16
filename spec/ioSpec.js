var Gentyl = require('../dist/gentyl.js');
var signals = require('signals')
var G = Gentyl.G, I = Gentyl.I, O = Gentyl.O;

Gentyl.IO.setDefaultDispatchObject(signals.Signal, 'dispatch')

describe("input-output", function(){
    var g1;

    beforeEach(function(){
        g1 = G({
            arc:G({

                },{
                    il:'arc',
                    i(input){
                        this.saved = input
                    },
                    r(){
                        return this.saved
                    },
                    o(out){
                        return `I have saved ${out}`
                    },
                    t(inp){
                        return inp
                    }
                },{
                    saved:null
                }),
            beam:G(
                0
                ,{
                    il:'beamin',
                    ol:'beamout',
                    i(inp){
                        this.buffer.push(inp)
                    },
                    r(obj, arg){
                        return this.buffer.pop() || obj
                    }
                },{
                    buffer:[]
                }),
            crux:G(
                0
                ,{
                    ol:'crux',
                    i(inp){
                        this.storage = inp
                    },
                    o(obj, arg){
                        return this.storage
                    }
                },{
                    storage:null
                })

        },{
            t:['beamout', '_']
        },{

        })
    })

    it('should throw error when shelling unprepared', function(){
        expect(function(){
            g1.shell()
        }).toThrowError("unable to shell unprepared node")

    })

    it('should shell up', function(){
        g1.prepare()
        g1.shell()

    })

    describe("prepared shell",function(){

        beforeEach(function(){
            g1.prepare()
            g1.shell()

            //spyOn(this, 'outcatch')

        })


        it("should allow me to call input label",function(){
            g1.ioShell.ins['beamin']("fallacies")
        });

        it('should modify state using input function',function(){
            g1.ioShell.ins.arc("hello?")

            expect(g1.resolve().arc).toBe("hello?")

        })

        it('should have a signal instance on outputs', function(){
            expect(g1.ioShell.outs._ instanceof signals.Signal).toBe(true)
            expect(g1.ioShell.outs.beamout instanceof signals.Signal).toBe(true)
            expect(g1.ioShell.outs.crux instanceof signals.Signal).toBe(true)
        })

        describe('with output detectors',function(){

            beforeEach(function(){
                this.outcatch = function(out){
                    console.log('depositing')
                    this.deposit = out
                }.bind(this);
                this.deposit = undefined
                g1.ioShell.outs["beamout"].add(this.outcatch, this)
                g1.ioShell.outs["crux"].add(this.outcatch, this)
                g1.ioShell.outs["_"].add(this.outcatch, this)
            })



            it('should allow signal subscription', function(){
                var s = g1.ioShell;
                //console.log(s)
                s.ins.beamin("Buckets")
                s.ins.arc("beamout");
                expect(this.deposit).toBe("Buckets")

                //spyOn(s.outs.beamout, "dispatch")
                //expect(s.outs.beamout.dispatch).toHaveBeenCalled()
            })

        })

    })

    it('should do root io', function(){
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

    describe('callback methodologies', function(){
        var testctx

        beforeEach(function(){
            this.deposit = undefined;
            testctx = this;
        })

        it('should allow a callback without context',function(){
            pending('fixes to io system');

            // Gentyl.IO.setDefaultDispatchFunction(function(output, label){
            //     testctx.deposit = `output: ${output} from ${label}`;
            // })

            var g = G("thing",{t:'_'}).prepare();

            g.shell()

            g.ioShell.ins._();
            expect(testctx.deposit).toBe('output: thing from _')
        })

        it('should allow a callback factory',function(){

        })

        it('should allow an object context with method name')

    })

})
