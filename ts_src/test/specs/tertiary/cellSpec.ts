
import * as Jungle from '../../../jungle'
const {Construct, Composite, Domain} = Jungle.CST;
const Cell = Jungle.TRT.Cell;

import {CallHook} from '../../../tertiary/hooks/call'
import * as Debug from '../../../util/debug'
import * as A from '../../../aliases/all'

describe("A Cell", function () {

    Debug.Crumb.defaultOptions.log = console;
    Debug.Crumb.defaultOptions.debug = true;

    let cell;

    beforeEach(function(){

        cell = new Cell();

        cell.init({

            form:{
                mesh:{

                }
            },

            mouth:{
                basis:'hook:call',
                direction:"in",
                type:"hook",
                hook(food){//console.log(`eating ${food},`,this)
                    this.hungry = false;
                    this.stomach.contents = food
                }
            },

            stomach:{
                basis:'cell',
                contents:A.PushDeposit('empty')
            },

            hungry:true
        });
    })

    it('should not be hungry when it has been fed', function () {
        expect(cell.shell.contacts.mouth).not.toBeUndefined();
        let crumb = new Debug.Crumb("Beginning")
        cell.shell.contacts.mouth.put("Nachos", crumb);
        expect(cell.nucleus.hungry).toBe(false);
    })

    it('should deposit to the stomach, via oesophagus', function(){
        let crumb = new Debug.Crumb("Beginning Feed");
        cell.shell.contacts.mouth.put("Nachos", crumb);
        expect(cell.local.stomach.contents).toBe("Nachos");
    })

    it('should properly dispose', function(){
        cell.dispose();
        expect(cell.shell.designate(':mouth')[":mouth"]).toBe(undefined)
    })


});
