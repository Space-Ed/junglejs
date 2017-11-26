
import * as Jungle from '../../../jungle'
const {Construct, Composite, Domain, Cell, j, J} = Jungle;


import * as Debug from '../../../util/debug'

describe("A Cell", function () {

    Debug.Crumb.defaultOptions.log = console;
    Debug.Crumb.defaultOptions.debug = true;

    let cell;

    beforeEach(function(){

       cell = J.recover(j('cell', {
            head:{
                retain:true,
            },

            mouth:j('inward'),
            
            stomach:j('cell',{
                
                swallow :j('resolve',{
                    outer(food){
                        this.earth.contents = food
                    }
                }),
                
                contents:'empty'
            }),
          
            oesophagus:j('media:direct', {
                law:':mouth->stomach:swallow'
            }),
            
            
        }))
    })


    it('should deposit to the stomach, via oesophagus', function(){
        let crumb = new Debug.Crumb("Beginning Feed");
        cell.shell.contacts.mouth.put("Nachos", crumb);
        expect(cell.exposed.stomach.contents).toBe("Nachos");
    })

    it('should properly dispose', function(){
        cell.dispose();
        expect(cell.shell.scan(':mouth')[":mouth"]).toBe(undefined)
    })


});
