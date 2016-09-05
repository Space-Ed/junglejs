var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
                }
            });
            var layers = this.parseMode(mode);
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
                    //     break;
                    // }
                    default: {
                        this.addSourceLayer(layer);
                        break;
                    }
                }
            }
            //create argumented layer
            for (var k in hostContext) {
                this.addOwnProperty(k, hostContext[k]);
            }
        }
        /**
         * create the layers, at each stage looking up contexts relative to the host.
         *
         */
        ResolutionContext.prototype.parseMode = function (modestr) {
            var layers = [];
            var splitexp = modestr.split(',');
            if (splitexp[0] == '') {
                return layers;
            }
            for (var i = 0; i < splitexp.length; i += 1) {
                var layer = { mode: null, source: null };
                var typeSourceKey = splitexp[i];
                var tKey = typeSourceKey[0];
                var sKey = typeSourceKey[1][0];
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
            return layer.source.ownProperties[key];
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
         * take
         */
        ResolutionContext.prototype.addSourceLayer = function (layer) {
            for (var prop in layer.source.propertyLayerMap) {
                var propVal = layer.source.propertyLayerMap[prop];
                if (this.propertyLayerMap[prop] != undefined && (this.propertyLayerMap[prop].mode != propVal.mode || this.propertyLayerMap[prop].source != propVal.source)) {
                    throw new Error("source layer introduces incompatible source/mode of property");
                }
                else {
                    this.propertyLayerMap[prop] = { source: propVal.source, mode: propVal.mode };
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
        function ResolutionNode(resolver, components, carrier, mode) {
            //scan for all underscores splitting context node
            if (carrier === void 0) { carrier = function (x) { return x; }; }
            if (mode === void 0) { mode = ''; }
            this.resolver = resolver;
            this.carrier = carrier;
            //Initialised properties of state
            var context = {};
            var node;
            //construct the node of array object or primative type
            if (components instanceof Array) {
                node = [];
                node.lenth = components.length;
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    var c = this.prepareComponent(component);
                    node[i] = c;
                }
            }
            else if (components instanceof Object) {
                node = {};
                for (var k in components) {
                    var component = components[k];
                    //convert all objects into resolution nodes, for consistent depth referencing.
                    var c = this.prepareComponent(component);
                    if (k[0] == "_") {
                        context[k.slice(1)] = c;
                    }
                    else {
                        node[k] = c;
                    }
                }
            }
            else {
                node = components;
            }
            this.node = node;
            //find the resolution nodes buried in the components arg:make this the parent of them
            this.ctx = new Gentyl.ResolutionContext(this, context, mode);
        }
        ResolutionNode.prototype.prepareComponent = function (component) {
            var c;
            if (component instanceof ResolutionNode) {
                c = component;
                c.setParent(this);
            }
            else if (component instanceof Object) {
                c = new BlankNode(component);
                c.setParent(this);
            }
            else {
                c = component;
            }
            return c;
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
            this.depth = parentNode.depth + 1;
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
            //recurse on the contained node
            var resolvedNode = this.resolveNode(this.node, resolveArgs);
            //modifies the resolved context and returns the processed result
            var result = this.resolver.call(this.ctx, resolvedNode, this.carrier(resolveArgs));
            return result;
        };
        return ResolutionNode;
    }());
    Gentyl.ResolutionNode = ResolutionNode;
    var BlankNode = (function (_super) {
        __extends(BlankNode, _super);
        function BlankNode(components) {
            _super.call(this, function (x) { return x; }, components);
        }
        return BlankNode;
    }(ResolutionNode));
    Gentyl.BlankNode = BlankNode;
    function _(components, resolver, carrier, mode) {
        if (resolver === void 0) { resolver = function (x, a) { return x; }; }
        if (carrier === void 0) { carrier = function (x) { return x; }; }
        if (mode === void 0) { mode = ''; }
        return new ResolutionNode(resolver, components, carrier, mode);
    }
    Gentyl._ = _;
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
