let Jungle = require('../../build/jungle.js');
let {Membrane, CallCrux, Crux, PortCrux} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')

fdescribe("Visor", function () {

    let host, membrane, visor, visorhost

    beforeEach(function(){

        host = new TestHost();
        membrane = host.primary;

        visorhost = new TestHost();

        host.populate(['_input','output_']);

        let visor = membrane.createVisor('**:output/caller', visorhost);

    })

    it('should create a side designation path',function(){
        let vdesig = visor.flatDesignate({
            mDesignator:[],
            cDesignator:'output',
            role:'caller'
        })[0];

        expect(vdesig).not.toBeUndefined();
    })

    it('should obscure the original designation path')

    it('should crux notify along only the appropriate path')


});
