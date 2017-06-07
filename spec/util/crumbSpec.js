

const {Util, Debug} = require('../../build/jungle.js');
let fs = require('fs')

describe('crumbs', function(){
    pending("Manual Review Only")


    var crumb1;

    beforeAll(function(){
        fs.writeFileSync('test.log', '')
    })

    beforeEach(function(){
        fs.appendFileSync('test.log', '\n')

        Debug.Crumb.defaultOptions.debug = true;
        Debug.Crumb.defaultOptions.log = {log:(...args)=>{
            fs.appendFileSync('test.log', args[0] +'\n')
        }};

        crumb1 = new Debug.Crumb("Entry")
            .at("the edge of the woods")
            .in("the glade of Tarazon");
    })

    it('should create crumbs', function(){
        expect(crumb1 instanceof Debug.Crumb).toBe(true, 'crumb is a crumb')
    })

    it('should be able to drop crumbs', function(){
        crumb1.drop("Walking");
    })

    it('should raise to handler or callback on dropped crumbs', function(){
        let spy = jasmine.createSpy('wolf')

        let crumb2 = crumb1.drop("Walking")
            .at("The musty path")
            .in("the brown bracken wood")
            .catch((crumb)=>{
                spy(crumb.dump())
            })

        crumb2.raise("A benign issue")

        expect(spy.calls.allArgs()[0][0]).toBe(
`
Crumb Error: Walking
    message: A benign issue
    at: The musty path
    within: the brown bracken wood
`
)
    })

    it('should be able to deflect handling to the historical cause',function(){
        let spy = jasmine.createSpy('wolf')

        crumb1.catch((crumb, error)=>{
            //handle deflection
            spy(crumb.dump())
        })

        let crumb2 = crumb1.drop("Swimming")
            .at("The tumbling rapids")
            .in("the stoney brushlands")
            .catch((crumb)=>{
                if(crumb.message == "waters too rapid"){
                    crumb.raise()
                }else{
                    crumb.deflect(crumb.message)
                }
            })

        crumb2.raise("No Swimming togs")

        expect(spy.calls.allArgs()[0][0]).toBe(
`
Crumb Error: Walking
    message: A benign issue
    at: The musty path
    within: the brown bracken wood
`
        )

        try{
            crumb2.raise("waters too rapid")
        }catch (e){
            expect(e.message).toBe(`
Error: waters too rapid

* Crumb: Swimming
|    at: The tumbling rapids
|    in: the stoney brushlands
|
* Crumb: Entry
|    at: the edge of the woods
|    within: the glade of Tarazon
`
        )}
    })

    it('should catch issues in an excursion', function(){

        let spy = jasmine.createSpy('exception watch')
        crumb1.catch((crumb, error)=>{
            //handle deflection
            spy(crumb.dump())
        })

        crumb1.excursion("Scramble", function(crumb){
            crumb
                .at("descencion")
                .in("gravestone valley")
                .raise("Got lost")
        })

        expect(spy.calls.allArgs()[0][0]).toBe(`

        `)

    })

    describe('custom options', function(){
        let originalDefaults = Debug.Crumb.defaultOptions;

        beforeAll(function(){
            Debug.Crumb.customOptions = {
                Fishing:{
                    format:Debug.dumpToDepthF(2),
                    as(sitch){
                        return "weather: ", sitch.weather
                    }
                },
            }
        })

        afterAll(function(){
            Debug.Crumb.defaultOptions = originalDefaults
            Debug.Crumb.customOptions = {}
        })

        it('should allow formatter to scrape data', function(){

            let crumb2 = crumb1.drop("Fishing")
                .at("The dock")
                .in("Little Samson Cove")
                .with({
                    gear:{
                        rod:{
                            reel:"Carver",
                            line:"Surecast",
                            pole:"Beefneck"
                        },
                        tackle:"Tripple hook + sinker"
                    },
                    attitude:"patience"
                })
                .as({
                    weather:"stormy",
                    fish:{
                        populations:{
                            "Snapper":100,
                            "Spotty":1000,
                            "Cod":300
                        }
                    }
                })


        })
    })

})
