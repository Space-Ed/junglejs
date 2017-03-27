namespace Jungle {

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

     export class GForm extends BaseForm{

         static RFormProps = ["x", "p", "d", "c", "r", "port", "prepare", "destroy", "carry", "resolve", "select"]

         carrier:(arg)=>any;
         resolver:(obj, arg)=>any;

         constructor(host:ResolutionCell){
             super(host);
         }

         parse(formObj:FormSpec):{iospec:any, contextspec:ContextSpec} {

             var ctxdeclare =  formObj.x || "";

             this.carrier = formObj.c || Jungle.Util.identity;
             this.resolver = formObj.r || Jungle.Util.identity;
            this.preparator = formObj.p || function(x){};
            this.special = formObj.$;


            //create port intermediate representation
            var portlabels = this.parsePorts(formObj.port||[])

            const hookIORegex = /^(_{0,2})([a-zA-Z]+(?:\w*[a-zA-Z])?|\$)(_{0,2})$/;

            // parse for io functions ignoring uncompliant names and non functions
            var hooks = [];
            var context:ContextSpec  = {properties:[], declaration:ctxdeclare};
            var props = context.properties;

            var specialInHook;
            var specialOutHook;

            var labels = {};

            for (var k in formObj){
                var res = k.match(hookIORegex);

                if(res){
                    var inp = res[1], label = res[2], out = res[3], formVal = formObj[k];
                    var labelType:LabelTypes = TrigateLabelTypesMap[inp][out]

                    //producing a tractor value gets you ignored
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

                        if(labelType === LabelTypes.PASSIVE)        {props.push({key:label, type:CTXPropertyTypes.BOUND, value:formVal}); continue}
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

                       //INPUT SETTER AND RETURNER
                       let hookI = {label:label, tractor:null, orientation:IO.Orientation.INPUT, host:this.host, eager:undefined}
                       let hookO = {label:label, tractor:null, orientation:IO.Orientation.OUTPUT, host:this.host, eager:true}

                       let I = false
                       let O = false

                       if(labelType === LabelTypes.PASSIVE)         {props.push({type:CTXPropertyTypes.NORMAL, key:label, value:formVal}); continue}
                       else if(labelType === LabelTypes.TRIG)       {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:hookI, original:k}); hookI.eager = false; I=true}
                       else if(labelType === LabelTypes.ENTRIG)     {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:hookI, original:k}); hookI.eager = true ; I=true}
                       else if(labelType === LabelTypes.GATE)       {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:hookO, original:k}); hookO.eager = false; O=true}
                       else if(labelType === LabelTypes.GATER)      {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:hookO, original:k}); hookO.eager = true ; O=true}
                       else if(labelType === LabelTypes.TRIGATE)    {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:[hookI,hookO], original:k}); hookI.eager=true; hookO.eager = false;  O=true; I=true;}
                       else if(labelType === LabelTypes.TRIGATER)   {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:[hookI,hookO], original:k}); hookI.eager=true; hookO.eager = true ;  O=true; I=true; }
                       else if(labelType === LabelTypes.ENTRIGATE)  {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:[hookI,hookO], original:k}); hookI.eager=false;hookO.eager = false;  O=true; I=true; }
                       else if(labelType === LabelTypes.ENTRIGATER) {props.push({type:CTXPropertyTypes.HOOK,   key:label, value:formVal, reference:[hookI,hookO], original:k}); hookI.eager=false;hookO.eager = true ;  O=true; I=true; }

                       if(I){hooks.push(hookI)};
                       if(O){hooks.push(hookO)};

                       //only one value hook pair per label is possible
                       labels[label] = LabelTypes.PASSIVE;
                   }else{
                       if(labelType === LabelTypes.PASSIVE){props.push({type:CTXPropertyTypes.NORMAL, key:label, value:formVal});continue}
                       throw new Error(`Unsupported form value type label: ${label}, label-type:${labelType}, value-type:${typeof(formVal)}`)
                   }
                }
                else{
                    throw new Error(`Invalid label format, raw label:${k} must have up to two leading and trailing underscores`);
               }
            }

            return {iospec:{hooks:hooks, specialIn:specialInHook, specialOut:specialOutHook, ports:portlabels}, contextspec:{properties:props, declaration:ctxdeclare}};
         }

         extract(){
             return {
                 r:this.resolver,
                 c:this.carrier ,
                 p:this.preparator,
                 d:this.depreparator
             }
         }

        //
        // consolidate(io:IO.IOComponent, ctx:GContext):FormSpec{
        //
        //     return Util.B()
        //         .blend({
        //             r:this.resolver,
        //             c:this.carrier ,
        //             p:this.preparator,
        //             d:this.depreparator,
        //             x:ctx.declaration
        //         })
        //         .blend(
        //             io.extract()
        //         )
        //         .blend(
        //             ctx.extract()
        //         ).dump();
        //
        //     // var consolidated = Util.melder({
        //     //     r:this.resolver,
        //     //     c:this.carrier ,
        //     //     p:this.preparator,
        //     //     d:this.depreparator,
        //     //     x:ctx.declaration
        //     // },Util.melder(io.extract(), ctx.extract(), void 0, void 0, false));
        //
        //     // console.log("Consolidated Form: ", consolidated);
        //     //
        //     // return consolidated;
        // }
     }
}
