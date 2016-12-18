var gentyl = require('../dist/gentyl')
var G = gentyl.G;

describe("A context labelled node",function(){

    it('should allow designation by context',function(){
        var gme = G(null,
            { m:"&testcontext", r(r,a){
                return this.dice;
            }})

        var g = G({
            c1:[gme]
        },{
            cl:"testcontext"
        },{
            dice:5
        }).prepare();

        expect(function(){gentyl.Util.deeplyEquals(g.resolve())}).not.toThrowError()
    })

    it('will always choose the closest to the tip possible',function(){

    })
})
