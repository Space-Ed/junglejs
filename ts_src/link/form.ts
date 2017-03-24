namespace Jungle {

     export interface IOLinkSpec{
         ports:IO.PortSpec[];
         linkFunciton:(a,b)=>void;
         links:string[]
     }

    export class LinkForm extends BaseForm{

         parse(formObj:FormSpec):{iospec:IOLinkSpec, contextspec:ContextSpec} {

             var ctxdeclare =  formObj.x || "";
             this.preparator = formObj.p || function(x){};

             var links = formObj.link || [];
             var linkf = formObj.lf || function(a, b){}

            var context = {};
            var specialInHook;
            var specialOutHook;

            var portlabels:IO.PortSpec[] = this.parsePorts(formObj.port||[])
            var labels = {};
            var contextprops:PropertySpec[] = []

            //create port intermediate representation

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
