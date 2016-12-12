namespace Gentyl {

    export interface FormSpec {
        r?:(obj, args?)=>any;
        c?:(args?)=>any;
        s?:(keys, arg?)=>any;
        p?:(arg)=>void;
        m?:string;
    }

    /**
     * The idea here is to create a form object that handles defaulting, aliasing
     */

     export class GForm {

         //form fundamental
         ctxmode:string;
         carrier:(arg)=>any;
         resolver:(obj, arg)=>any;
         selector:(keys, arg)=>any;
         preparator:(arg)=>void;
         depreparator:(arg)=>void;



         constructor(private host:GNode){}

         parse(formObj:FormSpec):{hooks:IO.Hook[]} {

             this.ctxmode =  formObj.m || "";
             this.carrier = formObj.c || Gentyl.Util.identity;
             this.resolver = formObj.r || Gentyl.Util.identity;
             this.selector = formObj.s || function(keys, carg){return true}
             this.preparator = formObj.p || function(x){};

            var ioRegex = /^_([a-zA-Z_]*[a-zA-Z]+|\$)$|([a-zA-Z]+|\$)_$/;

            // parse for io functions ignoring uncompliant names and non functions
            var hooks = [];

            for (var k in formObj){
                var res = k.match(ioRegex);
                if (res && formObj[k] instanceof Function){
                   var inp = res[1], out = res[2];
                   var labelOrientation = inp != undefined ? IO.Orientation.INPUT : IO.Orientation.OUTPUT;
                   var label = inp || out;
                   hooks.push({label:label, tractor:formObj[k], orientation:labelOrientation, host:this.host})
               }
            }

            return {hooks:hooks};
         }

        extract():FormSpec{
            return {
                r:this.resolver,
                c:this.carrier ,
                m:this.ctxmode ,
                p:this.preparator,
                s:this.selector,
            }
        }
     }

}
