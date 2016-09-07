namespace Gentyl {
    export enum ASSOCMODE {
        INHERIT,
        SHARE,
        TRACK
    }
    export interface ContextLayer {
        source:ResolutionContext;
        mode:ASSOCMODE;
    }

    /**
     * The state manager for a resolution node. Handles the association of contexts and modification therin
     */
    export class ResolutionContext {


        ownProperties:any;
        propertyLayerMap:any;
        closed:boolean;


        constructor(private host:ResolutionNode, hostContext:any, private mode:string){
            //parse modes

            Object.defineProperties(this,{
                ownProperties:{
                    value:{},
                    writable:true,
                    enumerable:false,
                    configurable:false
                },

                propertyLayerMap:{
                    value:{},
                    writable:true,
                    enumerable:false,
                    configurable:false
                },

                closed:{
                    value:false,
                    writable:true,
                    enumerable:false,
                    configurable:false,                }
            });


            //create argumented layer

            for(var k in hostContext){
                this.addOwnProperty(k, hostContext[k])
            }
        }

        prepare(){
            var layers = this.parseMode(this.mode)

            for (let i = 0; i < layers.length; i++) {
                let layer = layers[i];

                switch(layer.mode){
                    case (ASSOCMODE.INHERIT):{
                        this.addInherentLayer(layer.source)
                        break;
                    }
                    // if sharing needs extra setup
                    // case (ASSOCMODE.SHARE):{
                    //     break;
                    // }
                    // case (ASSOCMODE.TRACK):{
                    //     this.addTrackedLayer()
                    //     break;
                    // }
                    default:{
                        this.addSourceLayer(layer)
                        break
                    }
                }

            }
        }

        /**
         * create the layers, at each stage looking up contexts relative to the host.
         *
         */
        parseMode(modestr:string):ContextLayer[] {
            var layers:ContextLayer[] = []
            var splitexp = modestr.split(/\s/);
            const validmode = /^[&|=]$/;
            const validsource = /^[+_]$/;
            const validwhole = /^([&|=])([+_])$/

            let i = 0
            if (splitexp[0] === '!'){
                this.closed = true;
                i = 1;
            }

            if (splitexp[i] === '' || splitexp[i] == undefined){
                return layers
            }

            for (; i < splitexp.length; i += 1) {
                var layer:ContextLayer = {mode:null, source:null}

                var typeSourceKey = splitexp[i]
                var match = typeSourceKey.match(validwhole)

                if(!match){
                    throw Error("Invalid source mode expression " + typeSourceKey +" must fit /^([&\|=])([\+_])$/ ")
                }

                var tKey = match[1];
                var sKey = match[2]; //will be parsed to give depth control;

                console.log("tkey: %s , sKey: %s",tKey, sKey)

                layer.mode =  {"&":ASSOCMODE.SHARE, "|":ASSOCMODE.INHERIT, "=":ASSOCMODE.TRACK}[tKey]
                layer.source =  (sKey == "+" ? this.host.getParent(1) : sKey == "_" ? this.host.getRoot() : this.host).ctx
                layers.push(layer)
            }

            return layers
        }

        /**
         *
         */
        addOwnProperty(name:string, defaultValue){
            console.log("addOwnProperty(name:%s, defaultValue:%s)", name, defaultValue)

            // TODO: Handle own property derivation conflict
            this.ownProperties[name] = defaultValue;
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
                layer.source.ownProperties[key] = data;
            }
        }


        getItem(key):any{
            let layer:ContextLayer = this.propertyLayerMap[key];
            let result = layer.source.ownProperties[key];

            console.log("getItem %s resulting in:", key , result);
            return result;

        }

        /**
         * get the actual source of the desired property. use to set/getItems,
         should be recursive with a base of either reaching a node without the key or which hold the key
         */
        getItemSource(key):ResolutionContext{
            if(key in this.propertyLayerMap){
                return this.propertyLayerMap[key].source;
            }else{
                throw new Error(`key %s not found in the context`)
            }
        }
        /**
         * add all the properties of the target layer to the ownPropertiesMap.
         */
        addInherentLayer(layerctx:ResolutionContext){
            for (let prop in layerctx.ownProperties) {

                // TODO: Maybe not just target layerctxs own properties.
                var propVal = layerctx.ownProperties[prop];
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

                    console.log("add source layer property prop:%s", prop)

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
