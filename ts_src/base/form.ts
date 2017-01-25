namespace Gentyl {

    export interface FormSpec {
        r?:(obj, args?)=>any;
        c?:(args?)=>any;
        s?:(keys, arg?)=>any;
        p?:(arg)=>void;
        d?:(arg)=>void;
        x?:string;
        links?:string[];
        ports?:string[];
        lf?:(porta, portb)=>any;
    }

    export interface FormResult {
        iospec?:any;
        contextspec?:ContextSpec;
    }

    /**
     * The idea here is to create a form object that handles defaulting, aliasing
     */

     export class BaseForm {

         preparator:(arg)=>void;
         depreparator:(arg)=>void;

         constructor(public host:BaseNode){
         }

         parse(formObj:FormSpec):{iospec:any, contextspec:{properties:any, declaration:string}} {
              var ctxdeclare =  formObj.x || "";
              this.preparator = formObj.p || function(x){};
              this.preparator = formObj.p || function(x){};


              var contextprops = [];
              //Forbid the use of underscores
              var linkPropRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
              for (var k in formObj){
                  if(GForm.RFormProps.indexOf(k) > -1) continue;

                  if(k.match(linkPropRegex)){
                      contextprops.push({key:k, type:CTXPropertyTypes.NORMAL, value:formObj[k]})
                  }else{
                      throw new Error("Invalid property for link context, use ports")
                  }
              }

              return{iospec:null , contextspec:{properties:contextprops, declaration:ctxdeclare}}
         }


         consolidate(io:IO.IOComponent, ctx:GContext):FormSpec{
             return Util.melder({
                 p:this.preparator,
                 d:this.depreparator,
                 x:ctx.declaration,
             },ctx.extract())
         }

     }

     export interface IOLinkSpec{
         ports:any;
         linkFunciton:(a,b)=>void;
         links:string[]
     }

     export class LForm extends BaseForm {

         parse(formObj:FormSpec):{iospec:IOLinkSpec, contextspec:ContextSpec} {

             var ctxdeclare =  formObj.x || "";
             this.preparator = formObj.p || function(x){};

             var links = formObj.links || [];
             var linkf = formObj.lf || function(a, b){}

            var ports = formObj.ports || [];
            var context = {};
            var specialInHook;
            var specialOutHook;

            var portlabels = {};
            var labels = {};
            var contextprops:PropertySpec[] = []

            //create port intermediate representation
            var linkPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/
            for (let i = 0; i < ports.length; i++) {
                let pmatch = ports[i].match(linkPortRegex);

                if(pmatch){
                    let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                    if(inp){
                        portlabels[label] = {label:label, direction:IO.Orientation.INPUT}
                    }
                    if(out){
                        portlabels[label] = {label:label, direction:IO.Orientation.OUTPUT}
                    }
                }
            }

            //Forbid the use of underscores
            var linkPropRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
            for (var k in formObj){
                if(GForm.RFormProps.indexOf(k) > -1) continue;

                if(k.match(linkPropRegex)){
                    contextprops.push({key:k, type:CTXPropertyTypes.NORMAL, value:formObj[k]})
                }else{
                    throw new Error("Invalid property for link context, use ports")
                }
            }


            return {iospec:{ports:portlabels, links:links, linkFunciton:linkf}, contextspec:{properties:contextprops, declaration:ctxdeclare}}

        }
     }

}
