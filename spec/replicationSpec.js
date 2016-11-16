var G = require("../dist/gentyl.js");
var g = G.G;

describe("node replication", function(){

    beforeEach(function(){
        this.g = g({
            a:g({
                meaning:'peace'
            }),
            b:[
                0,1,2
            ]
        },{
            r(resolved, args){
                this.fearless += 1
                return `peace for ${this.fearless}`
            }
        },{
            fearless:0
        })
    })

    it("should replicate", function(){
        var g2 = this.g.replicate();
    });

    it("should remain unprepared when replicating unprepared nodes",function(){
        var g2 = this.g.replicate();
        expect(this.g.prepared).toBe(false)
        expect(g2.prepared).toBe(false)
    })

    it("should replicate independent state",function(){
        var g2 = this.g.replicate().prepare();
        this.g.prepare();

        g2.resolve();
        var res = g2.resolve();

        expect(res).toBe('peace for 2')
        expect(this.g.resolve()).toBe('peace for 1')

    })
    it("should deeply equate and not identify(is should replicate) after replication.", function (){
        pending("cannot replicate functions, these are identical to the defined function")
        var g2 = this.g.replicate()
        G.Util.isDeepReplicaThrow(g2, this.g)
    })

    describe("with prepared base", function(){

        beforeEach(function(){
            this.g.prepare();
        })

        it("means replica ancestor is the replicant's ancestor",function(){

            var g2 = this.g.replicate();
            expect(this.g.ancestor).toBe(g2.ancestor)

        })

    })

})
