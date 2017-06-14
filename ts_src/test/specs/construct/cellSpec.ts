
import * as Jungle from '../../../jungle'
const {Construct, Composite, Domain, Cell} = Jungle;
import {CallHook} from '../../../tertiary/hooks/call'
import * as Debug from '../../../util/debug'
import * as A from '../../../aliases/all'

fdescribe("A Cell", function () {

    Debug.Crumb.defaultOptions.log = console;
    Debug.Crumb.defaultOptions.debug = true;

    let cell;

    beforeAll(function(){

        cell = new Cell({

            form:{
                sections:[
                    "stomach:contents to nucleus as oesophagus"
                ],
                mesh:{

                }

            },

            mouth:new CallHook({
                direction:"in",
                mode:"push",
                hook(food){
                    console.log(`eating ${food},`,this)
                    this.hungry = false;
                    this.oesophagus['stomach:contents'] = food
                }
            }),

            stomach: A.Cell({
                contents:A.PushDeposit('empty')
            }),

            hungry:true
        });

        cell.prime();
    })

    it('should not be hungry when it has been fed', function () {

        expect(cell.shell.contacts.mouth).not.toBeUndefined();

        let crumb = new Debug.Crumb("Beginning")

        cell.shell.contacts.mouth.put("Nachos", crumb);

        expect(cell.nucleus.hungry).toBe(false);
    })

    it('should deposit to the stomach, via oesophagus', function(){
        cell.shell.contacts.mouth.put("Nachos");
        expect(cell.subconstructs.stomach.nucleus.contents).toBe("Nachos");
    })

    it('should properly dispose', function(){
        cell.dispose();

        expect(cell.alive).toBe(false);

        expect(cell.shell.designate(':mouth')[":mouth"]).toBe(undefined)
    })


});
