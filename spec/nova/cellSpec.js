
const Jungle = require('../../dist/jungle.js');
const Nova = Jungle.Nova;
const {Construct, Composite, Domain, Cell, CallHook} = Nova;

describe("A Cell", function () {

    let cell;

    beforeEach(function(){

        cell = new Cell({

            oesophagus:new VisorHook({
                visor:'stomach:contents/called',
                exclusive:true
            }),

            mouth:new CallHook({
                target:"shell",
                contact:"called",
                hook(food){
                    this.hungry = false;
                    this.oesophagus(food)
                }
            }),

            stomach: new Cell({
                contents:new CallHook({
                    target:"shell",
                    contact:"called",
                    mode:"push",
                    default:"empty",
                    contact:called
                })
            }),

            hungry:true
        });

        cell.prime();
    })

    it('should not be hungry when it has been fed', function () {

        expect(cell.membranes.shell.roles.called.mouth).not.toBeUndefined();

        cell.membranes.shell.roles.called.mouth.roles.called.func("Nachos");
        expect(cell.nucleus.hungry).toBe(false);
    })

    it('should properly dispose', function(){
        cell.dispose();

        expect(cell.alive).toBe(false);

        expect(cell.membranes.shell.designate(':mouth','called')[":mouth/called"]).toBe(undefined)
    })

    it('should deposit to the stomach, via oesophagus', function(){
        cell.membranes.shell.roles.called.mouth.roles.called.func("Nachos");
        expect(cell.crown.stomach.nucleus.contents).toBe("Nachos");
    })

});
