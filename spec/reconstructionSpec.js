const Jungle = require("../dist/jungle.js");
const {G, R} = Jungle;

describe("bundle creation",function(){
    pending("reconstruction overview")

    function fame(resolved, args){
        this.fearless += 1
        return `peace for ${this.fearless}`
    }

    function ID(x){return x}

    beforeEach(function(){
        this.g = G({
            a:G({
                meaning:'peace'
            })
        },{
            r:fame,
            fearless:0
        })

        //console.log(this.g.bundle())
        //console.log(R(this.g.bundle()).bundle())

    })

    it('should dump the appropriate object before preparation',function(){
        Jungle.Util.deeplyEqualsThrow(this.g.bundle(), {
            core:Jungle.ResolutionCell,
            crown:{
                a:{
                    core:Jungle.ResolutionCell,
                    form:{r:Jungle.Util.identity, c:Jungle.Util.identity, x:'', p:Jungle.Util.identity, d:undefined},
                    crown:{meaning:'peace'}
                }
            },
            form:{r:fame,
                x:'',
                c:Jungle.Util.identity,
                p:Jungle.Util.identity ,
                d:undefined,
                fearless:0},
        })
    })

    it('should dump the appropriate object after preparation',function(){
        this.g.prepare()

        Jungle.Util.isDeepReplica(this.g.bundle(), {
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

        Jungle.Util.isDeepReplica(this.g.bundle(), {
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
            var reconstructed = R(this.bundle)
        })

        it('should reconstruct to an equivalent structure', function(){
            var reconstructed = R(this.bundle)
            reconstructed.prepare()
            Jungle.Util.deeplyEqualsThrow(reconstructed, this.g)
        })
    })
})
