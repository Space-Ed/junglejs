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

            var ports = formObj.port || [];
            var context = {};
            var specialInHook;
            var specialOutHook;

            var portlabels:IO.PortSpec[] = [];
            var labels = {};
            var contextprops:PropertySpec[] = []

            //create port intermediate representation
            var linkPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/
            for (let i = 0; i < ports.length; i++) {
                let pmatch = ports[i].match(linkPortRegex);

                if(pmatch){
                    let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                    if(inp){
                        portlabels.push({label:label, direction:IO.Orientation.INPUT})
                    }
                    if(out){
                        portlabels.push({label:label, direction:IO.Orientation.OUTPUT})
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

        consolidate(io:IO.LinkIO, ctx:GContext):FormSpec{
            return Util.melder({
                p:this.preparator,
                d:this.depreparator,
                x:ctx.declaration,
                link:io.links,
                lf:io.linker,
                port:io.ports
            },ctx.extract())
}
    }

}
