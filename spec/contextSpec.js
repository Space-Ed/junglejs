var jungle = require('../dist/jungle')
var G = jungle.G;

describe("A context labelled node",function(){

    it("should accept syntactically valid context declarations", function(){
        var declarations = [
            "Xpac use Yshi", "use Yshi", "Xea"
        ]
        for(var i = 0 ; i < declarations.length; i++){
            var gen = G({
                    a:G({},
                        {
                            x:declarations[i]
                        }
                    )
                },{
                    x:'Yshi'
                }
            )
            .prepare()
        }
    });

    it("should rejeect invalid context declarations", function (){
        var declarations =  ["X use", "use use", "X use Z use Y", "use"]

        for(var i = 0 ; i < declarations.length; i++){
            expect(function(){
                var gen = G({
                        a:G({},
                            {
                                x:declarations[i]
                            }
                        )
                    }
                )
                .prepare();
            }).toThrowError()
        }
    });

    it('should allow designation by context',function(){
        var gme = G(null,
            { x:"use testcontext", r(r,a){
                return this.dice;
            }})

        var g = G({
            c1:[gme]
        },{
            x:"testcontext",
            dice:5
        }).prepare();

        jungle.Util.deeplyEqualsThrow(g.resolve(), {c1:[5]});
    })

    it('will always choose the closest to the tip possible',function(){

    })
})
