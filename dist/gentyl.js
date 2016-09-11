var Gentyl;
(function (Gentyl) {
    var Util;
    (function (Util) {
        function translator(node, translation) {
            var translated;
            //array?
            if (typeof (node) == "object" && !(node instanceof Array)) {
                translated = {};
                for (var k in node) {
                    var tval = translation[k];
                    if (typeof (tval) == "function") {
                        //rename to the function name with function value
                        translated[tval.name] = tval(node[k]);
                    }
                    if (typeof (tval) == "string") {
                        //rename the leaf
                        translated[tval] = node[k];
                    }
                    else if (tval != undefined) {
                        translated[k] = translator(node[k], tval);
                    }
                    else {
                        //dont bother recurring if the translator wont come
                        translated[k] = node[k];
                    }
                }
                return translated;
            }
            else {
                return node;
            }
        }
        Util.translator = translator;
        function melder(node1, node2, merge, concatArrays) {
            if (merge === void 0) { merge = function (a, b) { return b; }; }
            if (concatArrays === void 0) { concatArrays = false; }
            if (node1 == undefined) {
                return node2;
            }
            if (node2 == undefined) {
                return node1;
            }
            if (typeof (node1) != typeof (node2)) {
                var errmsg = "Expected melding nodes to be the same type \n" +
                    "type of node1: " + typeof (node1) + "\n" +
                    "type of node2: " + typeof (node2) + "\n";
                throw TypeError(errmsg);
            }
            var melded;
            if (node1 instanceof Array) {
                melded = concatArrays ? node1.concat(node2) : merge(node1, node2);
            }
            else if (typeof (node1) == 'object') {
                melded = {};
                //in one or the other
                for (var k in node1) {
                    melded[k] = node1[k];
                }
                for (var q in node2) {
                    melded[q] = node2[q];
                }
                //in both
                for (var k in node1) {
                    for (var q in node2) {
                        if (k == q) {
                            melded[k] = melder(node1[k], node2[k], merge, concatArrays);
                        }
                    }
                }
            }
            else {
                // if they are not objects just take the second argument
                melded = merge(node1, node2);
            }
            return melded;
        }
        Util.melder = melder;
        function isDeepReplica(node1, node2) {
            if (typeof (node1) != typeof (node2)) {
                return false; // nodes not same type
            }
            else if (node1 instanceof Object) {
                if (node1 === node2) {
                    return false; // identical object
                }
                else {
                    for (var k in node1) {
                        if (!(k in node2)) {
                            return false; // key in node1 but node node2
                        }
                    }
                    for (var q in node2) {
                        if (!(q in node1)) {
                            return false; // key in node2 and not node1
                        }
                        else if (!isDeepReplica(node1[q], node2[q])) {
                            return false; //recursive came up false.
                        }
                    }
                    return true; // no false flag
                }
            }
            else {
                return (node1 === node2); ///primitive equality
            }
        }
        Util.isDeepReplica = isDeepReplica;
        //merge, when there is a conflict, neither is taken
        function softAssoc(from, onto) {
            for (var k in from) {
                onto[k] = melder(from[k], onto[k]);
            }
        }
        Util.softAssoc = softAssoc;
        function assoc(from, onto) {
            for (var k in from) {
                onto[k] = melder(onto[k], from[k]);
            }
        }
        Util.assoc = assoc;
        function copyObject(object) {
            var cp = {};
            assoc(object, cp);
            return cp;
        }
        Util.copyObject = copyObject;
        function applyMixins(derivedCtor, baseCtors) {
            baseCtors.forEach(function (baseCtor) {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                });
            });
        }
        Util.applyMixins = applyMixins;
    })(Util = Gentyl.Util || (Gentyl.Util = {}));
})(Gentyl || (Gentyl = {}));
module.exports = Gentyl;
var Gentyl;
(function (Gentyl) {
    (function (ASSOCMODE) {
        ASSOCMODE[ASSOCMODE["INHERIT"] = 0] = "INHERIT";
        ASSOCMODE[ASSOCMODE["SHARE"] = 1] = "SHARE";
        ASSOCMODE[ASSOCMODE["TRACK"] = 2] = "TRACK";
    })(Gentyl.ASSOCMODE || (Gentyl.ASSOCMODE = {}));
    var ASSOCMODE = Gentyl.ASSOCMODE;
    /**
     * The state manager for a resolution node. Handles the association of contexts and modification therin
     */
    var ResolutionContext = (function () {
        function ResolutionContext(host, hostContext, mode) {
            //parse modes
            this.host = host;
            this.mode = mode;
            Object.defineProperties(this, {
                ownProperties: {
                    value: {},
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                propertyLayerMap: {
                    value: {},
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                closed: {
                    value: false,
                    writable: true,
                    enumerable: false,
                    configurable: false, }
            });
            //create argumented layer
            for (var k in hostContext) {
                this.addOwnProperty(k, hostContext[k]);
            }
        }
        ResolutionContext.prototype.prepare = function () {
            var layers = this.parseMode(this.mode);
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                switch (layer.mode) {
                    case (ASSOCMODE.INHERIT): {
                        this.addInherentLayer(layer.source);
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
                    default: {
                        this.addSourceLayer(layer);
                        break;
                    }
                }
            }
        };
        /**
         * create the layers, at each stage looking up contexts relative to the host.
         *
         */
        ResolutionContext.prototype.parseMode = function (modestr) {
            var layers = [];
            var splitexp = modestr.split(/\s/);
            var validmode = /^[&|=]$/;
            var validsource = /^[+_]$/;
            var validwhole = /^([&|=])([+_])$/;
            var i = 0;
            if (splitexp[0] === '!') {
                this.closed = true;
                i = 1;
            }
            if (splitexp[i] === '' || splitexp[i] == undefined) {
                return layers;
            }
            for (; i < splitexp.length; i += 1) {
                var layer = { mode: null, source: null };
                var typeSourceKey = splitexp[i];
                var match = typeSourceKey.match(validwhole);
                if (!match) {
                    throw Error("Invalid source mode expression " + typeSourceKey + " must fit /^([&\|=])([\+_])$/ ");
                }
                var tKey = match[1];
                var sKey = match[2]; //will be parsed to give depth control;
                console.log("tkey: %s , sKey: %s", tKey, sKey);
                layer.mode = { "&": ASSOCMODE.SHARE, "|": ASSOCMODE.INHERIT, "=": ASSOCMODE.TRACK }[tKey];
                layer.source = (sKey == "+" ? this.host.getParent(1) : sKey == "_" ? this.host.getRoot() : this.host).ctx;
                layers.push(layer);
            }
            return layers;
        };
        /**
         *
         */
        ResolutionContext.prototype.addOwnProperty = function (name, defaultValue) {
            console.log("addOwnProperty(name:%s, defaultValue:%s)", name, defaultValue);
            // TODO: Handle own property derivation conflict
            this.ownProperties[name] = defaultValue;
            this.propertyLayerMap[name] = { source: this, mode: ASSOCMODE.SHARE };
            Object.defineProperty(this, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable: true,
                configurable: true
            });
        };
        /**
         * Access the property-source map and appropriately adjust the value.
         If the context holds this property(the property source maps to this) then set the value of the property.
         If the property is tracked then throw a Unable to modify error
         If the property is not in the property layer map throw an unavailable property error
         */
        ResolutionContext.prototype.setItem = function (key, data) {
            var layer = this.propertyLayerMap[key];
            if (layer.mode == ASSOCMODE.TRACK) {
                throw new Error("Unable to modify key whose source is tracking only");
            }
            else {
                layer.source.ownProperties[key] = data;
            }
        };
        ResolutionContext.prototype.getItem = function (key) {
            var layer = this.propertyLayerMap[key];
            var result = layer.source.ownProperties[key];
            console.log("getItem %s resulting in:", key, result);
            return result;
        };
        /**
         * get the actual source of the desired property. use to set/getItems,
         should be recursive with a base of either reaching a node without the key or which hold the key
         */
        ResolutionContext.prototype.getItemSource = function (key) {
            if (key in this.propertyLayerMap) {
                return this.propertyLayerMap[key].source;
            }
            else {
                throw new Error("key %s not found in the context");
            }
        };
        /**
         * add all the properties of the target layer to the ownPropertiesMap.
         */
        ResolutionContext.prototype.addInherentLayer = function (layerctx) {
            for (var prop in layerctx.ownProperties) {
                // TODO: Maybe not just target layerctxs own properties.
                var propVal = layerctx.ownProperties[prop];
                this.addOwnProperty(prop, propVal);
            }
        };
        /**
         * add a context source layer so that the properties of that layer are accessible in this context.
         */
        ResolutionContext.prototype.addSourceLayer = function (layer) {
            for (var prop in layer.source.propertyLayerMap) {
                var propVal = layer.source.propertyLayerMap[prop];
                if (this.propertyLayerMap[prop] != undefined && (this.propertyLayerMap[prop].mode != propVal.mode || this.propertyLayerMap[prop].source != propVal.source)) {
                    throw new Error("source layer introduces incompatible source/mode of property");
                }
                else {
                    //the source is the holder of the information whereas the mode is attributed to this contexts layer perspective
                    this.propertyLayerMap[prop] = { source: propVal.source, mode: layer.mode };
                    console.log("add source layer property prop:%s", prop);
                    Object.defineProperty(this, prop, {
                        set: this.setItem.bind(this, prop),
                        get: this.getItem.bind(this, prop),
                        enumerable: true,
                        configurable: true
                    });
                }
            }
        };
        return ResolutionContext;
    }());
    Gentyl.ResolutionContext = ResolutionContext;
})(Gentyl || (Gentyl = {}));
/// <reference path="./util.ts"/>
/// <reference path="./context.ts"/>
var Gentyl;
(function (Gentyl) {
    var ResolutionNode = (function () {
        function ResolutionNode(components, form, state) {
            if (form === void 0) { form = {}; }
            if (state === void 0) { state = {}; }
            var node;
            //Initialised properties of state
            this.ctxcache = state || {};
            var context = Gentyl.Util.copyObject(this.ctxcache);
            var mode = this.ctxmode = form.m || "";
            this.carrier = form.c || function (x) { return x; };
            this.resolver = form.f || function (x) { return x; };
            this.depth = 0;
            this.isRoot = true;
            //construct the node of array object or primative type
            if (components instanceof Array) {
                node = [];
                node.lenth = components.length;
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    var c = this.inductComponent(component);
                    node[i] = c;
                }
            }
            else if (components instanceof Object) {
                node = {};
                for (var k in components) {
                    var component = components[k];
                    //convert all objects into resolution nodes, for consistent depth referencing.
                    var c = this.inductComponent(component);
                    node[k] = c;
                }
            }
            else {
                node = components;
            }
            this.node = node;
            this.ctx = new Gentyl.ResolutionContext(this, context, mode);
        }
        /**
         * setup the state tree, recursively preparing the contexts
         */
        ResolutionNode.prototype.prepare = function () {
            //TODO:if already prepared
            this.ancestor = this.replicate();
            this.prepared = true;
            if (!this.functional) {
                this.ctx.prepare();
            }
            if (this.node instanceof Array) {
                for (var i = 0; i < this.node.length; i++) {
                    var val = this.node[i];
                    if (val instanceof ResolutionNode) {
                        var rep = val.replicate();
                        rep.setParent(this);
                        rep.prepare();
                        this.node[i] = rep;
                    }
                }
            }
            else if (this.node instanceof Object) {
                for (var k in this.node) {
                    var val = this.node[k];
                    if (val instanceof ResolutionNode) {
                        var rep = val.replicate();
                        rep.setParent(this);
                        rep.prepare();
                        this.node[k] = rep;
                    }
                }
            }
            else {
                if (this.node instanceof ResolutionNode) {
                    var rep = this.node.replicate();
                    rep.prepare();
                    this.node = rep;
                }
            }
            return this;
        };
        ResolutionNode.prototype.inductComponent = function (component) {
            var c;
            if (component instanceof ResolutionNode) {
                c = component;
            }
            else if (component instanceof Object) {
                c = new ResolutionNode(component);
            }
            else {
                c = component;
            }
            return c;
        };
        ResolutionNode.prototype.replicate = function () {
            if (this.prepared) {
                //this node is prepared so we will be creating a new based off the ancestor;
                return this.ancestor.replicate();
            }
            else {
                //this is a raw node, either an ancestor
                return new ResolutionNode(this.node, { f: this.resolver, c: this.carrier, m: this.ctxmode }, this.ctxcache);
            }
        };
        ResolutionNode.prototype.getParent = function (toDepth) {
            if (toDepth === void 0) { toDepth = 1; }
            if (toDepth == 1) {
                return this.parent;
            }
            else if (this.parent == undefined) {
                throw new Error("requested parent depth too great");
            }
            else {
                return this.parent.getParent(toDepth - 1);
            }
        };
        ResolutionNode.prototype.getRoot = function () {
            return this.getParent(this.depth);
        };
        ResolutionNode.prototype.setParent = function (parentNode) {
            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        };
        ResolutionNode.prototype.resolveArray = function (array, resolveArgs) {
            var resolution = [];
            for (var i = 0; i < array.length; i++) {
                resolution[i] = this.resolveNode(array[i], resolveArgs);
            }
            return resolution;
        };
        ResolutionNode.prototype.resolveObject = function (node, resolveArgs) {
            //log("Object to resolve: ", node)
            var resolution = {};
            for (var k in node) {
                var val = node[k];
                //we have an ordinary item
                resolution[k] = Gentyl.Util.melder(resolution[k], this.resolveNode(val, resolveArgs));
            }
            return resolution;
        };
        //main recursion
        ResolutionNode.prototype.resolveNode = function (node, resolveArgs) {
            //log("node to resolve: ", node)
            var resolution;
            if (node == undefined) {
                return null;
            }
            else if (node instanceof Array) {
                resolution = this.resolveArray(node, resolveArgs);
            }
            else if (typeof (node) == "object") {
                if (node instanceof ResolutionNode) {
                    resolution = node.resolve(resolveArgs);
                }
                else {
                    //now all nodes are converted into G nodes
                    resolution = this.resolveObject(node, resolveArgs);
                }
            }
            else {
                //we have a string or number
                resolution = node;
            }
            return resolution;
        };
        ResolutionNode.prototype.resolveUnderscore = function (resolver, resolveArgs) {
            //now this is the parent context
            var result = resolver.resolve(resolveArgs);
            return result;
        };
        ResolutionNode.prototype.resolve = function (resolveArgs) {
            if (!this.prepared && !this.functional) {
                throw Error("Node with state is not prepared, unable to resolve");
            }
            //recurse on the contained node
            var resolvedNode = this.resolveNode(this.node, this.carrier.call(this.ctx, resolveArgs));
            //modifies the resolved context and returns the processed result
            var result = this.resolver.call(this.ctx, resolvedNode, resolveArgs);
            return result;
        };
        return ResolutionNode;
    }());
    Gentyl.ResolutionNode = ResolutionNode;
    function g(components, form, state) {
        return new ResolutionNode(components, form, state);
    }
    Gentyl.g = g;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    function sA(components, resolveArgs) {
        var resolution = {};
        this.index = this.index || 0;
        this.mode = this.mode || "revolve";
        for (var k in components) {
            if (components[k] instanceof Array) {
                //Todo: Should be resolving the items
                var rarray = components[k];
                if (this.mode == "revolve") {
                    resolution[k] = rarray[this.index % rarray.length];
                }
                else if (this.mode == "cap") {
                    resolution[k] = rarray[Math.min(this.index, rarray.length)];
                }
                else {
                    throw Error("invalid mode in array revolver");
                }
            }
            else {
                throw Error("expected all properties in array selection to be arrays");
            }
        }
        this.index++;
        return resolution;
    }
    Gentyl.sA = sA;
})(Gentyl || (Gentyl = {}));
///compile this file with --outFile for commonjs module environment
/// <reference path="../typings/index.d.ts"/>
/// <reference path="util.ts"/>
/// <reference path="core.ts"/>
/// <reference path="nodes.ts"/>
// require("./core.ts")
// require("./nodes.ts")
// require("./util.ts")
module.exports = Gentyl;
