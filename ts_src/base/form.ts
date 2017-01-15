namespace Gentyl {

    export enum LabelTypes {
        PASSIVE, TRIG, ENTRIG, GATE, GATER, TRIGATE, TRIGATER, ENTRIGATE, ENTRIGATER
    }
    var TrigateLabelTypesMap = {
        '':{'':LabelTypes.PASSIVE,'_':LabelTypes.GATE, '__':LabelTypes.GATER},
        '_':{'':LabelTypes.TRIG,'_':LabelTypes.TRIGATE, '__':LabelTypes.TRIGATER},
        '__':{'':LabelTypes.ENTRIG,'_':LabelTypes.ENTRIGATE, '__':LabelTypes.ENTRIGATER}
    }



    var labelTypeCompatibility = {
        0:{},
        1:{3:true,4:true},
        2:{3:true,4:true},
        3:{1:true,2:true},
        4:{1:true,2:true},
        5:{},
        6:{},
        7:{},
        8:{},
        9:{}
    }

    export interface FormSpec {
        r?:(obj, args?)=>any;
        c?:(args?)=>any;
        s?:(keys, arg?)=>any;
        p?:(arg)=>void;
        x?:string;
    }

    /**
     * The idea here is to create a form object that handles defaulting, aliasing
     */

     export class GForm {

         static RFormProps = ["x", "p", "d", "c", "r", "s", "prepare", "destroy", "carry", "resolve", "select"]

         carrier:(arg)=>any;
         resolver:(obj, arg)=>any;
         selector:(keys, arg)=>any;
         preparator:(arg)=>void;
         depreparator:(arg)=>void;

         constructor(private host:BaseNode){}

         parse(formObj:FormSpec):{iospec:any, contextspec:{properties:any, declaration:string}} {

             var ctxdeclare =  formObj.x || "";

             this.carrier = formObj.c || Gentyl.Util.identity;
             this.resolver = formObj.r || Gentyl.Util.identity;
             this.selector = formObj.s || function(keys, carg){return true}
             this.preparator = formObj.p || function(x){};

            const ioRegex = /^(_{0,2})([a-zA-Z](?:\w*[a-zA-Z])?|\$)(_{0,2})$/;

            // parse for io functions ignoring uncompliant names and non functions
            var hooks = [];
            var context = {};
            var specialInHook;
            var specialOutHook;

            var labels = {};

            for (var k in formObj){
                var res = k.match(ioRegex);

                if(res){
                    var inp = res[1], label = res[2], out = res[3], formVal = formObj[k];
                    var labelType:LabelTypes = TrigateLabelTypesMap[inp][out]
                    if(GForm.RFormProps.indexOf(label) >= 0){continue}

                    if(label in labels){
                        //check compatibility of exi
                        if (labelTypeCompatibility[labelType][labels[label]]){
                            labels[label] = LabelTypes.PASSIVE // not compatible again in any case (no triples)
                        }else{
                            throw new Error(`Duplicate incompatible label ${label} in form parsing, labelType1:${labelType}, labelType2:${labels[label]}`)
                        }
                    }else{
                        labels[label] = labelType
                    }

                    if(label === '$'){
                        //special exception, fork off the created hook to

                        let hook = {label:label, tractor:formObj[k], orientation:undefined, host:this.host, eager:undefined}

                        if(labelType === LabelTypes.TRIG)           {hook.orientation = IO.Orientation.INPUT ; hook.eager = false; specialInHook = hook}
                        else if(labelType === LabelTypes.ENTRIG)    {hook.orientation = IO.Orientation.INPUT ; hook.eager = true ; specialInHook = hook}
                        else if(labelType === LabelTypes.GATE)      {hook.orientation = IO.Orientation.OUTPUT; hook.eager = false; specialOutHook = hook }
                        else if(labelType === LabelTypes.GATER)     {hook.orientation = IO.Orientation.OUTPUT; hook.eager = true ; specialOutHook = hook}
                        else{
                            throw new Error("Special label must be input or output, not mixed")
                        }
                    }else if (formVal instanceof Function){
                        let hook = {label:label, tractor:formObj[k], orientation:undefined, host:this.host, eager:undefined}

                        if(labelType === LabelTypes.PASSIVE)        {context[label] = formVal; continue}
                        else if(labelType === LabelTypes.TRIG)      {hook.orientation = IO.Orientation.INPUT, hook.eager = false}
                        else if(labelType === LabelTypes.ENTRIG)    {hook.orientation = IO.Orientation.INPUT, hook.eager = true }
                        else if(labelType === LabelTypes.GATE)      {hook.orientation = IO.Orientation.OUTPUT, hook.eager = false}
                        else if(labelType === LabelTypes.GATER)     {hook.orientation = IO.Orientation.OUTPUT, hook.eager = true}
                        else if(labelType === LabelTypes.TRIGATE)   {hook.orientation = IO.Orientation.MIXED, hook.eager = false}
                        else if(labelType === LabelTypes.TRIGATER)  {console.warn("This label configuration doesn't make sense for functions")}
                        else if(labelType === LabelTypes.ENTRIGATE) {console.warn("This label configuration doesn't make sense for functions")}
                        else if(labelType === LabelTypes.ENTRIGATER){hook.orientation = IO.Orientation.MIXED, hook.eager = true}

                       hooks.push(hook)
                   }else if(Util.isPrimative(formVal)){

                       var changeCheckValueReturn = function(input){
                           if(this[label] === this.cache[label]){
                               return IO.HALT
                           }
                           return this[label]
                       }

                       let hookI = {label:label, tractor(input){this[label] = input}, orientation:IO.Orientation.INPUT, host:this.host, eager:undefined}
                       let hookO = {label:label, tractor(input){return this.label}, orientation:IO.Orientation.OUTPUT, host:this.host, eager:true}

                       let I = false
                       let O = false

                       if(labelType === LabelTypes.PASSIVE)         {context[label]=formVal;continue}
                       else if(labelType === LabelTypes.TRIG)       {context[label]=formVal; hookI.eager = false; I=true}
                       else if(labelType === LabelTypes.ENTRIG)     {context[label]=formVal; hookI.eager = true ; I=true}
                       else if(labelType === LabelTypes.GATE)       {context[label]=formVal; O=true; hookO.tractor = changeCheckValueReturn}
                       else if(labelType === LabelTypes.GATER)      {context[label]=formVal; O=true}
                       else if(labelType === LabelTypes.TRIGATE)    {context[label]=formVal; hookI.eager=false; O=true; I=true; hookO.tractor = changeCheckValueReturn;}
                       else if(labelType === LabelTypes.TRIGATER)   {context[label]=formVal; hookI.eager=false; O=true; I=true; }
                       else if(labelType === LabelTypes.ENTRIGATE)  {context[label]=formVal; hookI.eager=true;  O=true; I=true; hookO.tractor = changeCheckValueReturn;}
                       else if(labelType === LabelTypes.ENTRIGATER) {context[label]=formVal; hookI.eager=true;  O=true; I=true; }

                       if(I){hooks.push(hookI)};
                       if(O){hooks.push(hookO)};

                       //only one value hook pair per label is possible
                       labels[label] = LabelTypes.PASSIVE;
                   }else{
                       if(labelType === LabelTypes.PASSIVE){context[label]=formVal;continue}
                       throw new Error("Unsupported form value type")
                   }
                }
               else{
                   throw new Error("Invalid label format, must have up to two leading and trailing underscores");
               }
            }
            console.log("declaration @ form parse", ctxdeclare)
            return {iospec:{hooks:hooks, specialIn:specialInHook, specialOut:specialOutHook}, contextspec:{properties:context, declaration:ctxdeclare}};
         }


        consolidate(io:IO.IOComponent, ctx:GContext):FormSpec{
            return Util.melder({
                r:this.resolver,
                c:this.carrier ,
                p:this.preparator,
                s:this.selector,
                x:ctx.declaration,
            },Util.melder(io.extract(), ctx.extract()))
        }
     }

}
