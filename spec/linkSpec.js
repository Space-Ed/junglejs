var Jungle = require('../dist/jungle.js')

var G = Jungle.G;
var L = Jungle.L;

describe("Link Cells", function () {
    var io = G(null,{
        __i:0,
        o__(x){return x},
        r(obj, arg){return this.i}
    });

    var io2 = G(null, {
        __i:0
    })

    it("should direct link",function(){

        var directLink = L({
            a:io,
            b:io
        },{
            link:['_.ri->a.i', 'a.o->b.i', 'b.o->_.ro'],
            port:['_ri','ro_']
        })

        directLink.prepare();
        directLink.io.shell.sources.ro.callback = function(){};
        spyOn(directLink.io.shell.sources.ro, 'callback');
        directLink.io.shell.sinks.ri.handle(1);
        expect(directLink.io.shell.sources.ro.callback).toHaveBeenCalledWith(1);

    });

    it('should wildcard link',function(){
        pending("real use of wildcards, deliberation on feedback and compaction")
        var directLink = L({
            a:io,
            b:io
        },{
            port:['_ri','ro_'],
            link:['_.ri->*.i', '*.*=>_.o1', '*.*=>_.o2'],
        })

        directLink.prepare();
        directLink.io.shell.sources.ro.callback = function(){};
        spyOn(directLink.io.shell.sources.ro, 'callback');
        directLink.io.shell.sinks.ri.handle(1);
        expect(directLink.io.shell.sources.ro.callback).toHaveBeenCalledWith(1);

    })

    it('should match link')

    it('should close link')

    it('should propogate')

    it('should antireflex')

    it('should have ommission defaults')

    it('should persistence link')


})
