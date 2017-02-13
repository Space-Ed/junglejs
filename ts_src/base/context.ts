namespace Jungle {
    export enum ASSOCMODE {
        INHERIT,
        SHARE,
        TRACK
    }

    export interface ContextSpec {
        properties:PropertySpec[],
        declaration:string
    }
    export interface ContextLayer {
        source:GContext;
        mode:ASSOCMODE;
    }

    export interface PropertySpec {
        type:CTXPropertyTypes;
        key:any;
        value:any;
        reference?:any;
        original?:any;
    }

    export enum CTXPropertyTypes {
        NORMAL,
        BOUND,
        HOOK
    }

    /**
     * The state manager for a resolution node. Handles the association of contexts and modification therin
     */
    export class GContext {
        label:string;
        nominal:boolean;
        declaration:string;
        path:(string|number)[];

        exposed:any;

        internalProperties:any;
        propertyLayerMap:any;

        activePropertyRegister:any;

        closed:boolean;

        originals:any;
        cache:any;

        constructor(private host:BaseCell, contextspec:ContextSpec){
            var {properties, declaration} = contextspec;
            this.declaration = declaration;

            //parse modes

            Object.defineProperties(this,{
                internalProperties:{
                    value:{},
                    writable:false,
                    enumerable:false,
                    configurable:false
                },

                propertyLayerMap:{
                    value:{},
                    writable:false,
                    enumerable:false,
                    configurable:false
                },
            });


            this.originals = {};
            this.cache = {};
            this.closed = false;
            this.label = "";
            this.nominal = false;
            this.path = [];
            this.exposed = {path:this.path};

            //create internally held properties.
            properties.forEach(function(value, index){

                this.addInternalProperty(value);
            }, this);
        }

        addInternalProperty(spec:PropertySpec){
            switch(spec.type){
                case CTXPropertyTypes.NORMAL: this.addExposedProperty(spec.key,spec.value);break;
                case CTXPropertyTypes.BOUND: this.addExposedProperty(spec.key,spec.value.bind(this.exposed)); break;
                case CTXPropertyTypes.HOOK: this.addHookedProperty(spec);
            }
        }

        addHookedProperty(spec:PropertySpec){

            /*possible issue: bound functions cant be applied to other exposures so the io-ctx relationship must be 1:1.
            that is these bound functions must not persist beyond the lifetime of the counterpart shell
            */

            this.originals[spec.key] = spec;
            this.cache[spec.key] = spec.value;

            if(spec.reference instanceof Array){ // then it is [input output] hooks
                this.addThroughProperty(spec);
            }else{
                let href:IO.Hook = spec.reference
                if(href.orientation === IO.Orientation.INPUT){
                    this.addInputProperty(spec);
                }else{
                    this.addOutputProperty(spec);
                }
            }

            this.addExposedProperty(spec.key, spec.value);
        }

        addThroughProperty(spec:PropertySpec){
            //shallow spec copy to achieve tractor difference
            var ospec:PropertySpec = {type:spec.type, key:spec.key, value:spec.value, reference:spec.reference[1], original:spec.original};
            spec.reference = spec.reference[0];
            this.addInputProperty(spec);
            this.addOutputProperty(ospec);
        }

        addInputProperty(spec:PropertySpec){
            spec.reference.reactiveValue = true;

            //This is binding to access the cache and set the exposed to the input

            (<IO.Hook>spec.reference).tractor = (function(inp){
                this.exposed[spec.key] = inp;

                //console.log(`injected input, key:${spec.key}, input: ${inp}, cached ${this.cache[spec.key]}`);
                if(spec.reference.eager && this.cache[spec.key] !== inp){
                    this.cache[spec.key] = inp;
                }else{
                    return IO.HALT;
                }
            }).bind(this);


        }

        addOutputProperty(spec){
            spec.reference.reactiveValue = true;

            //This is binding to access the cache so when it changes the next output trigger will grab it

            (<IO.Hook>spec.reference).tractor = (function(output){

                let current = this.exposed[spec.key]
                //console.log(`injected output tractor, key:${spec.key}, current: ${current}, cached ${this.cache[spec.key]}`)

                if(spec.reference.eager || this.cache[spec.key] !== current){
                    this.cache[spec.key] = current;
                    return current;
                }else{
                    return IO.HALT;
                }
            }).bind(this);
        }


        prepare(){
            var layers = this.parseMode(this.declaration)

            for (let i = 0; i < layers.length; i++) {
                let layer = layers[i];

                switch(layer.mode){
                    case (ASSOCMODE.INHERIT):{
                        this.addInherentLayer(layer.source)
                        break;
                    }
                    default:{
                        this.addSourceLayer(layer)
                        break
                    }
                }

            }
            //freeze context here so that modifier functions cannot add, change or delete properties
        }

        extract(){

            //internals include labels that should be recovered from the original spec
            let patch = {};
            for (let k in this.internalProperties){
                let v = this.internalProperties[k];

                if(k in this.originals){
                    let orig = this.originals[k]
                    patch[orig.original || orig.key] = orig.value;
                }else{
                    patch[k] = Util.deepCopy(v);
                }
            }
            return patch;
        }

        /**
         * create the layers, at each stage looking up contexts relative to the host.
         */
        parseMode(modestr:string):ContextLayer[] {
            var layers:ContextLayer[] = []

            // header, inheritance

            var usesplit = modestr.split(/use/);

            var header, usage
            if(usesplit.length > 2){
                //
                throw new Error("inappropriate appearance of keyword 'use'")
            }else if(usesplit.length == 2){
                if(usesplit[1] == ''){
                    throw new Error("expected at lease one context label after use")
                }else{
                    [header, usage] = usesplit;
                }
            }else{ // length is 1

                header = usesplit[0];
            }

            var headerexp = /^\s*(\w*)\s*$/;
            var headermatch = header.match(headerexp)

            if (headermatch === undefined) {
                throw new Error("only one label before the header is allowed")
            }

            this.label = headermatch[1];
            if(this.label !== ''){
                this.nominal = true;
            }

            if (usage){

                var uses = usage.split(/\s/).filter(function(a){return a !== ''});

                for (let i = 0; i < uses.length; i += 1) {
                    var layer:ContextLayer = {mode:ASSOCMODE.SHARE, source:null}


                    var sourceKey = uses[i];

                    layer.source = this.host.getNominal(sourceKey).ctx;
                    layers.push(layer);
                }
            }

            return layers
        }

        /**
         *
         */
        addExposedProperty(name:string, defaultValue){
            //console.log("addExposedProperty(name:%s, defaultValue:%s)", name, defaultValue)

            // TODO: Handle own property derivation conflict
            this.internalProperties[name] = defaultValue;
            this.propertyLayerMap[name] = {source:this, mode:ASSOCMODE.SHARE};

            Object.defineProperty(this.exposed, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable:true,
                configurable:true
            });
        }

        removeExposedProperty(name:string){
            delete this.internalProperties[name];
            delete this.propertyLayerMap[name];
            delete this.exposed[name]
        }

        /**
         * Access the property-source map and appropriately adjust the value.
         If the context holds this property(the property source maps to this) then set the value of the property.
         If the property is tracked then throw a Unable to modify error
         If the property is not in the property layer map throw an unavailable property error
         */
        setItem(key, data){
            let layer:ContextLayer = this.propertyLayerMap[key];

            if(layer.mode == ASSOCMODE.TRACK){
                throw new Error("Unable to modify key whose source is tracking only");
            } else{
                layer.source.internalProperties[key] = data;
            }
        }


        getItem(key):any{
            let layer:ContextLayer = this.propertyLayerMap[key];
            let result = layer.source.internalProperties[key];

            //console.log("getItem %s resulting in:", key , result);
            return result;

        }

        /**
         * get the actual source of the desired property. use to set/getItems
         */
        getItemSource(key):GContext{
            if(key in this.propertyLayerMap){
                return this.propertyLayerMap[key].source;
            }else{
                throw new Error(`key %s not found in the context`)
            }
        }
        /**
         * add all the properties of the target layer to the internalPropertiesMap.
         */
        addInherentLayer(layerctx:GContext){
            for (let prop in layerctx.internalProperties) {

                // TODO: Maybe not just target layerctxs own properties.
                var propVal = layerctx.internalProperties[prop];
                this.addExposedProperty(prop, propVal)

            }
        }

        /**
         * add a context source layer so that the properties of that layer are accessible in this context.
         */
        addSourceLayer(layer:ContextLayer){
            for (let prop in layer.source.propertyLayerMap) {

                var propVal:ContextLayer = layer.source.propertyLayerMap[prop];

                if(this.propertyLayerMap[prop] != undefined && (this.propertyLayerMap[prop].mode != propVal.mode || this.propertyLayerMap[prop].source != propVal.source) ){
                    throw new Error("source layer introduces incompatible source/mode of property")
                }else{
                    //the source is the holder of the information whereas the mode is attributed to this contexts layer perspective
                    this.propertyLayerMap[prop] = {source:propVal.source, mode:layer.mode};

                    //console.log("add source layer property prop:%s", prop)

                    Object.defineProperty(this.exposed, prop, {
                        set: this.setItem.bind(this, prop),
                        get:this.getItem.bind(this, prop),
                        enumerable:true,
                        configurable:true
                    });
                }


            }

        }


    }
}
