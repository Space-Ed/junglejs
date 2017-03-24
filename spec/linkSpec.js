const Jungle = require('../dist/jungle.js')
const {G,L,R} = Jungle;

describe("Link Cells", function () {
    // var io = G(null,{
    //     __i:0,
    //     o__(x){return x},
    //     r(obj, arg){return this.i}
    // });

    var io = G(null,{
        __i(x){
            this.lining.sinks['o'].handle(x)
        },
        port:['o_']
    });

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
    // })

    var bufferFlush = G(null, {
        _buffer(input){
            this.pushed.push(input);
        },
        __flush(){
            return "HEY"
        },
        drain__(){
            return this.pushed
        },
        pushed:[]
    })

    function portResponseTest(cell, inp, outp, input, expected, count=1, test = ""){
        let spy = jasmine.createSpy();

        cell.io.shell.sources[outp].callback = spy;
        cell.io.shell.sinks[inp].handle(input);

        expect(spy.calls.count()).toBe(count, `failure: ${test} : Number of calls did not match expected`);
        expect(spy).toHaveBeenCalledWith(expected);

        if(!test.match("reconstruction")){
            let reconstructed = Jungle.R(cell.bundle());
            reconstructed.prepare();
            portResponseTest(reconstructed, inp, outp, input, expected, count, test + "- under reconstruction")
        }
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
            link:['_.ri->*.i', '*.o->_.ro', '_->x.*'],
        })

        wildLink.prepare();

        portResponseTest(wildLink, 'ri', 'ro', 1, 1, 3, "all trigger");

    })

    it('should match link', function(){
        let matchLink = L({
            awk:{}
        },{
            port:['_sig', 'sig_'],
            link:['_.*->_.*']
        })

        matchLink.prepare();

        portResponseTest(matchLink, '$', '$', 1, 1, 1, '$ triggers');

        portResponseTest(matchLink, 'sig', 'sig', 1, 1, 1, "sig triggers");
    });

    /*
        a closed link is a link causing all future links to a port to be unmatchable
    */
    it('should close link',function(){
        let closeLink = L({
            a:io,
            b:io,
            c:io,
            d:bufferFlush
        },{
            port:['_bufin'],
            link:[
                "_->d.flush",
                '_.bufin->*.i',
                'a.o->d.buffer',
                'b.o->|d.buffer',
                'c.o->d.buffer',
                'd.drain->_.$'
            ],
            lf(srcCtx, snkCtx){
                //console.log(`sink context: ${srcCtx.path}, source context: ${snkCtx.path}`);
            }
        }).prepare();

        closeLink.io.shell.sinks.bufin.handle(1);

        portResponseTest(closeLink, '$', '$', 2, [1, 1], 1);
    })

    it('should propogate in arrays',function(){
        let propLink = L([
            io, io, io
        ],{
            link:['_.$->0.i', '*.o+->*.i', '2.o->_.$']
        }).prepare()

        portResponseTest(propLink, '$', '$', "x","x",1);
    })

    it('should propogate in reverse in arrays',function(){
        let propLink = L([
            io, io, io
        ],{
            link:['_->2.i', '*.o-->*.i', '0.o->_']
        }).prepare()

        portResponseTest(propLink, '$', '$', "x","x",1);
    })

    it('should antireflex')

    it('should have ommission defaults')

    it('should persistence link')

    it('should chain link')

    it('should link to methods and properties')

})
