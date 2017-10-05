
import * as Jungle from '../../../jungle'
const {Construct, Composite, Domain, Cell, j, J} = Jungle;


import * as Debug from '../../../util/debug'

fdescribe("A Cell", function () {

    Debug.Crumb.defaultOptions.log = console;
    Debug.Crumb.defaultOptions.debug = true;

    let cell;

    beforeEach(function(){

        cell = new Cell(J);

        cell.init(j({
            head:{
            },

            oesophagus:j('media:direct', {
                law:[
                    ':mouth->stomach:swallow'
                ]
            }),

            mouth:{
                basis:'op',
                carry_in:true
            },

            stomach:{
                basis:'cell',
                form:{
                    exposure:'public'
                },

                swallow :{
                    basis:'op',
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

        }))
    })

    fit('should not be hungry when it has been fed', function () {
        expect(cell.shell.contacts.mouth).not.toBeUndefined();
        let crumb = new Debug.Crumb("Beginning")

        console.log('contact ', cell.shell.contacts.mouth)

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
