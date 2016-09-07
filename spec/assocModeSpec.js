


/*
    test contextual association syntax and functionality
*/

var G = require("../dist/gentyl.js");
var g = G.g;


describe("context construction mode validity", function(){

    it("should accept syntactically valid construction modes", function(){
        var modes = [
            "&+", "&_", "|+", "|_", "|_ &+","|+ &_", "! &_ &+"
        ]
        for(var i = 0 ; i < modes.length; i++){
            var gen = g({
                    a:g(
                        {},
                        {
                            m:modes[i]
                        }
                    )
                }
            )
            .prepare()
        }
    });

    it("should rejeect invalid construction modes", function (){
        var modes =  ["&", "_", "|+&", "|_*", "|_&+","|+ _"]


        for(var i = 0 ; i < modes.length; i++){
            expect(function(){
                var gen = g({
                        a:g(
                            {},
                            {
                                m:modes[i]
                            }
                        )
                    }
                )
                .prepare()
            }).toThrowError()
        }
    });

    it("should now allow sharing of locked contexts" ,function(){
        var gen = g({
                a:g(
                    {},
                    {
                        m:'&+',
                        f:function(){
                            return this.propx
                        }
                    }
                )
            },{
                c:function(r){
                    this.propx = r
                },
                f:function(n, r){
                    return n.a
                m:"!"
                }
            },{
                propx:0
            }
        )
        .prepare();
    })
})

describe("context construction",function(){
    it("should access the state of the parent", function(){
        var gen = g({
                a:g(
                    {},
                    {
                        m:'=+',
                        f:function(){
                            return this.propx
                        }
                    }
                )
            },{
                c:function(r){
                    this.propx = r
                },
                f:function(n, r){
                    return n.a
                }
            },{
                propx:0
            }
        )
        .prepare();

        expect(gen.node.a.ctx.propertyLayerMap['propx'].source).toBe(gen.ctx)
        expect(gen.ctx.propertyLayerMap["propx"].source).toBe(gen.ctx)

        console.log(gen.ctx.ownProperties)
        expect(gen.resolve("a")).toBe("a")
        console.log(gen.ctx.ownProperties)
        expect(gen.resolve("b")).toBe("b")
        console.log(gen.ctx.ownProperties)
    });

    it("should modify the state of the parent", function(){
        var gen = g({
                a:g(
                    {},
                    {
                        m:'&+',
                        f:function(){
                            this.propy += 1;
                            return this.propy
                        }
                    }

                )
            },{
                f:function(n, r){
                    return this.propy
                }
            },{
                propy:0
            }
        )
        .prepare();

        expect(gen.resolve()).toBe(1)
        expect(gen.resolve()).toBe(2)
    });
    it("should access the state of the root", function() {

        var gen = g({
                a:g(
                    {},
                    {
                        m:'=_',
                        f:function(){
                            return this.propy
                        }
                    }

                )
            },{
                c:function(r){
                    this.propy += 1;
                },
                f:function(n, r){
                    return n.a
                }
            },{
                propy:0
            }
        )
        .prepare();
        expect(gen.node.a.ctx.propertyLayerMap["propy"].mode).toBe(2)
        expect(gen.resolve()).toBe(1)
        expect(gen.resolve()).toBe(2)
    });

    it("should modify the state of the root",function(){
        var gen = g({
                a:g(
                    {},
                    {
                        m:'&_',
                        f:function(){
                            this.propy += 1;
                            return this.propy
                        }
                    }

                )
            },{
                f:function(n, r){
                    return this.propy
                }
            },{
                propy:0
            }
        )
        .prepare();

        expect(gen.resolve()).toBe(1)
        expect(gen.resolve()).toBe(2)
    });

    it("should allow inheritance of parent context",function(){
        function inc_ret_y (){
            this.propy += 1;
            return this.propy
        }

        var gen = g({
                a:g({},
                    {
                        m:'|+',
                        f:inc_ret_y
                    }
                ),
                b:g({},
                    {
                        m:'|+',
                        f:inc_ret_y
                    }
                )
            },{
                f:function(n, r){
                    return n.a + n.b + this.propy
                }
            },{
                propy:0
            }
        )
        .prepare();

        expect(gen.resolve()).toBe(2)
        expect(gen.resolve()).toBe(4)
    });

    it("should not allow multiple sources with clashing properties", function(){
        expect(function() {
            var gen =
            g({
                a:g({

                },{
                    m:'&+',
                },{
                    propy:0
                })

            },{

            },{
                propy:0
            }
        )
        .prepare();
    }).toThrowError()
    });

    it("should not allow modification of tracked contexts",function(){
        var gen = g({
                a:g({},
                    {
                        m:'=+',
                        f:function(){
                            this.propy = 1;
                        }
                    }
                )
            },{
                f:function(n, r){
                    return this.propy
                }
            },{
                propy:0
            }
        )
        .prepare();

        expect(gen.node.a.ctx.propertyLayerMap["propy"].mode).toBe(2)

        expect(function(){
            gen.resolve()
        }).toThrowError()
    })
})
