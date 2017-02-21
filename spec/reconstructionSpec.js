var G = require("../dist/jungle.js");
var g = G.G;

describe("bundle creation",function(){
    beforeEach(function(){
        this.g = g({
            a:g({
                meaning:'peace'
            })
        },{
            r(resolved, args){
                this.fearless += 1
                return `peace for ${this.fearless}`
            },
            fearless:0
        })
    })

    it('should dump the appropriate object before preparation',function(){
        G.Util.isDeepReplica(this.g.bundle(), {
            node:{
                a:{
                    node:{},
                    form:{f:'identity', c:'identity', m:''},
                    state:{}
                }
            },
            form:{f:'fame', c:'identity', m:''},
            state:{fearless:0}
        })
    })

    it('should dump the appropriate object after preparation',function(){
        this.g.prepare()

        G.Util.isDeepReplica(this.g.bundle(), {
            node:{
                a:{
                    node:{},
                    form:{f:'identity', c:'identity', m:''},
                    state:{}
                }
            },
            form:{f:'fame', c:'identity', m:''},
            state:{fearless:0}
        })
    })

    it('should dump the appropriate object after resolution',function(){

        this.g.prepare()
        this.g.resolve()

        G.Util.isDeepReplica(this.g.bundle(), {
            node:{
                a:{
                    node:{},
                    form:{f:'identity', c:'identity', m:''},
                    state:{}
                }
            },
            form:{f:'fame', c:'identity', m:''},
            state:{fearless:1}
        })
    })

    describe("and then reconstruct",function(){
        beforeEach(function(){
            this.g.prepare()
            this.bundle = this.g.bundle()
        })

        it('should reconstruct without error', function(){
            var reconstructed = new G.Reconstruction(this.bundle)
        })

        it('should reconstruct to an equivalent structure', function(){
            var reconstructed = new G.Reconstruction(this.bundle)
            reconstructed.prepare()
            G.Util.deeplyEqualsThrow(reconstructed, this.g)
        })
    })
})
