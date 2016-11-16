namespace Gentyl {

    export interface FormSpec {
        r?:(obj, args?)=>any;
        c?:(args?)=>any;
        s?:(keys, arg?)=>any;
        p?:(arg)=>void;
        m?:string;
        i?:(arg)=>any;
        o?:(arg)=>any;
        il?:string;
        ol?:string;
        t?:any;
        cl?:string;
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

         //form io
         targeting:any;
         inputLabel:string;
         outputLabel:string;
        inputFunction:(arg)=>any;
         outputFunction:(arg)=>any;

         contextLabel:string

         constructor(formObj:FormSpec){
             this.ctxmode =  formObj.m || "";
             this.carrier = formObj.c || Gentyl.Util.identity;
             this.resolver = formObj.r || Gentyl.Util.identity;
             this.selector = formObj.s || function(keys, carg){return true}
             this.preparator = formObj.p || function(x){}
             this.inputLabel = formObj.il;
             this.outputLabel = formObj.ol;
             this.inputFunction = formObj.i || Gentyl.Util.identity;
             this.outputFunction = formObj.o || Gentyl.Util.identity;
             this.targeting = formObj.t;
             this.contextLabel = formObj.cl;
         }

        extract():FormSpec{
            return {
                r:this.resolver,
                c:this.carrier ,
                m:this.ctxmode ,
                p:this.preparator,
                il:this.inputLabel,
                ol:this.outputLabel,
                i:this.inputFunction,
                o:this.outputFunction,
                t:this.targeting,
                s:this.selector,
                cl:this.contextLabel
            }
        }
     }

}
