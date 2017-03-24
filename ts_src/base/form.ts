namespace Jungle {

    export interface FormSpec {
        r?:(obj, args?)=>any;
        c?:(args?)=>any;
        p?:(arg)=>void;
        d?:(arg)=>void;
        x?:string;
        link?:string[];
        port?:string[];
        lf?:(porta, portb)=>any;
        dl?:(porta, portb)=>any;
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

         constructor(public host:BaseCell){
         }

         parse(formObj:FormSpec):{iospec:any, contextspec:{properties:any, declaration:string}} {
              var ctxdeclare =  formObj.x || "";
              this.preparator = formObj.p || function(x){};
              this.preparator = formObj.p || function(x){};

              var contextprops = [];
              //Forbid the use of underscores
              var propertyRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
              for (var k in formObj){
                  if(GForm.RFormProps.indexOf(k) > -1) continue;
                  if(k.match(propertyRegex)){
                      contextprops.push({key:k, type:CTXPropertyTypes.NORMAL, value:formObj[k]})
                  }else{
                      throw new Error("Invalid property name for context")
                  }
              }

              return{iospec:null , contextspec:{properties:contextprops, declaration:ctxdeclare}}
         }

         parsePorts(portNames:string[]):IO.PortSpec[]{
             var portDescriptors = []

             var linkPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/
             for (let i = 0; i < portNames.length; i++) {
                 let pmatch = portNames[i].match(linkPortRegex);

                 if(pmatch){
                     let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                     if(inp){
                         portDescriptors.push({label:label, direction:IO.Orientation.INPUT})
                     }
                     if(out){
                         portDescriptors.push({label:label, direction:IO.Orientation.OUTPUT})
                     }
                 }else{
                     throw new Error("Invalid property label in Link Cell")
                 }
             }


             return portDescriptors
         }

         extract(){
             return {
                 p:this.preparator,
                 d:this.depreparator,
             }
         }

         consolidate(io:IO.IOComponent, ctx:GContext):FormSpec{
             let blended = Util.B().init(
                 this.extract()
             ).blend(
                 io.extract()
             ).blend(
                 ctx.extract()
             ).dump();

            //console.log('consolidated for replication/bundling: ', blended)

             return blended
         }

     }


}
