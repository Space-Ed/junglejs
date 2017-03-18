var Jungle = require('../dist/jungle.js')

var G = Jungle.G;
var L = Jungle.L;

describe("Link Cells", function () {
    var io = G(null,{
        __i:0,
        o__(x){return x},
        r(obj, arg){return this.i}
    });
    //
    // var io2 = G(null, {
    //     _passive:"default",
    //     passive_(resout){
    //         return resout;
    //     },
    //     __active:"default",
    //     active__(resout){
    //         return resout;
    //     },
    //     r(obj){
    //         return this.passive+this.active
    //     }
    //
    // })

    function portResponseTest(cell, inp, outp, input, expected, count=1){
        let spy = jasmine.createSpy();

        cell.io.shell.sources[outp].callback = spy;
        cell.io.shell.sinks[inp].handle(input);

        expect(spy.calls.count()).toBe(count);
        expect(spy).toHaveBeenCalledWith(expected);
    }

    it("should direct link",function(){

        var directLink = L({
            a:io,
            b:io
        },{
            link:['_.ri->a.i', 'a.o->b.i', 'b.o->_.ro'],
            port:['_ri','ro_']
        })

        directLink.prepare();

        portResponseTest(directLink, 'ri', 'ro', 1, 1);

    });

    it('should wildcard link',function(){
        var wildLink = L({
            a:io,
            b:io,
            c:io
        },{
            port:['_ri','ro_'],
            link:['_.ri->*.i', '*.o->_.ro', '_.$->x.*'],
        })

        wildLink.prepare();

        portResponseTest(wildLink, 'ri', 'ro', 1, 1, 3);

    })

    it('should match link', function(){
        let matchLink = L({
        },{
            port:['_sig', 'sig_'],
            link:['_.*->_.*']
        })

        matchLink.prepare();

        portResponseTest(matchLink, '$', '$', 1, 1, 1);
        portResponseTest(matchLink, 'sig', 'sig', 1, 1, 1);
    });

    /*
        a closed link is a link causing all future links to a port to be unmatchable
    */
    it('should close link',function(){
        let closeLink = L({

        },{

        })
    })

    it('should propogate',function(){

    })

    it('should antireflex')

    it('should have ommission defaults')

    it('should persistence link')

    it('should chain link')


})
