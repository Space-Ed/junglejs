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


}
