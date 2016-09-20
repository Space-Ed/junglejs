var Gentyl = require('../dist/gentyl.js')
var G = Gentyl.g;

describe("input-output", function(){
    var g1;

    beforeEach(function(){
        g1 = G({
            arc:G({

                },{
                    il:'arc',
                    i:function(input){
                        this.saved = input
                    },
                    f:function(){
                        return this.saved
                    },
                    o:function(out){
                        return `I have saved ${out}`
                    },
                    t:function(inp){
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
                    i:function(inp){
                        this.buffer.push(inp)
                    },
                    f:function(obj, arg){
                        return this.buffer.pop() || obj
                    }
                },{
                    buffer:[]
                }),
            crux:G(
                0
                ,{
                    ol:'crux',
                    i:function(inp){
                        this.storage = inp
                    },
                    o:function(obj, arg){
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
            this.outcatch = function(out){}
            spyOn(this, 'outcatch')

        })

        it("should allow me to call input label",function(){
            g1.signalShell.ins['beamin']("fallacies")
        });

        fit('should modify state using input function',function(){
            g1.signalShell.ins.arc("hello?")

            expect(g1.resolve().arc).toBe("hello?")

        })

        fit('should allow signal subscription', function(){
            var s = g1.signalShell;
            s.outs["beamout"].add(this.outcatch)
            spyOn(s.outs.beamout, "dispatch")
            console.log(s)


            s.ins.arc(["beamout", "crux"])
            expect(s.outs.beamout.dispatch).toHaveBeenCalled()
        })
    })

    it('should do root io', function(){
        var g2 = G({
            x:0
        },{
            i:function(input){
                this.store = input;
                this.stack.push(input)
            },
            o:function(output){
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

})
