namespace Gentyl {
    export enum ASSOCMODE {
        INHERIT,
        SHARE,
        TRACK
    }
    export interface ContextLayer {
        source:GContext;
        mode:ASSOCMODE;
    }

    /**
     * The state manager for a resolution node. Handles the association of contexts and modification therin
     */
    export class GContext {
        label:string;
        nominal:boolean;
        declaration:string;

        internalProperties:any;
        propertyLayerMap:any;
        closed:boolean;

        constructor(private host:BaseNode, contextspec){
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

                closed:{
                    value:false,
                    writable:true,
                    enumerable:false,
                    configurable:false,
                },

                label:{
                    value:"",
                    writable:true,
                    enumerable:false,
                    configurable:false
                },
                nominal:{
                    value:false,
                    writable:true,
                    enumerable:false,
                    configurable:false
                }
            });

            //create internally held properties.
            for(var k in properties){
                this.addOwnProperty(k, properties[k])
            }
        }

        /**
            extract the context used by tractors, thereby safegaurding the reference to the core values, only exposing properties and special handles. .
        */
        borrowTractorContext(){
            return this;
        }

        /**
            return the context after the tractor call,
        */
        returnTractorContext(returned:any){

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
            return Util.deepCopy(this.internalProperties)
        }

        /**
         * create the layers, at each stage looking up contexts relative to the host.
         */
        parseMode(modestr:string):ContextLayer[] {
            var layers:ContextLayer[] = []

            // header, inheritance
            console.log("declaration @ parse mode", modestr);

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
        addOwnProperty(name:string, defaultValue){
            //console.log("addOwnProperty(name:%s, defaultValue:%s)", name, defaultValue)

            // TODO: Handle own property derivation conflict
            this.internalProperties[name] = defaultValue;
            this.propertyLayerMap[name] = {source:this, mode:ASSOCMODE.SHARE};

            Object.defineProperty(this, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable:true,
                configurable:true
            });

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
                this.addOwnProperty(prop, propVal)

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

                    Object.defineProperty(this, prop, {
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
