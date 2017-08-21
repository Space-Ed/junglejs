
import * as Jungle from '../../../jungle'
const {Construct, Composite, Domain} = Jungle.CST;
const Cell = Jungle.TRT.Cell;

import * as Debug from '../../../util/debug'

describe("A Cell", function () {

    Debug.Crumb.defaultOptions.log = console;
    Debug.Crumb.defaultOptions.debug = true;

    let cell;

    beforeEach(function(){

        cell = new Cell();

        cell.init({

            form:{
                media:['direct'],
                laws:{
                    'direct':[
                        'mouth->stomach:oesophagus',
                        'stomach:fullness->fullness'
                    ]
                }
            },

            mouth:{
                basis:'contact:op',
                carry_in:true
            },

            stomach:{
                basis:'cell',
                form:{
                    exposure:'public'
                },

                oesophagus :{
                    basis:'contact:op',
                    form:{
                        exposure:'private'
                    },

                    resolve_in(food){
                        this.contents = food
                        this.hungry = false
                    }
                },
                contents:'empty',
                hungry:true
            },

        });
    })

    it('should not be hungry when it has been fed', function () {
        expect(cell.shell.contacts.mouth).not.toBeUndefined();
        let crumb = new Debug.Crumb("Beginning")

        cell.shell.contacts.mouth.put("Nachos", crumb);
        expect(cell.exposed.stomach.hungry).toBe(false);
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
