var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Gentyl;
(function (Gentyl) {
    var Util;
    (function (Util) {
        function identity(x) {
            return x;
        }
        Util.identity = identity;
        function weightedChoice(weights) {
            var sum = weights.reduce(function (a, b) { return a + b; }, 0);
            var cdfArray = weights.reduce(function (coll, next, i) {
                var v = (coll[i - 1] || 0) + next / sum;
                return coll.concat([v]);
            }, []);
            var r = Math.random();
            var i = 0;
            //the cdf exceeds r increment
            while (i < weights.length - 1 && r > cdfArray[i]) {
                i++;
            }
            return i;
        }
        Util.weightedChoice = weightedChoice;
        function range() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var beg, end, step;
            switch (args.length) {
                case 1: {
                    end = args[0];
                    beg = 0;
                    step = 1;
                    break;
                }
                case 2: {
                    end = args[1];
                    beg = args[0];
                    step = 1;
                    break;
                }
                case 3: {
                    end = args[2];
                    beg = args[0];
                    step = args[1];
                    break;
                }
                default: {
                    end = 0;
                    beg = 0;
                    step = 1;
                    break;
                }
            }
            var rng = [];
            if (beg > end && step < 0) {
                for (var i = beg; i > end; i += step) {
                    rng.push(i);
                }
            }
            else if (beg < end && step > 0) {
                for (var i = beg; i < end; i += step) {
                    rng.push(i);
                }
            }
            else {
                throw new Error("invalid range parameters");
            }
            return rng;
        }
        Util.range = range;
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
                return concatArrays ? node1.concat(node2) : merge(node1, node2);
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
                            if (node1[k] == node2[k]) {
                                melded[k] = node1[k]; //co-contained
                            }
                            else {
                                melded[k] = melder(node1[k], node2[k], merge, concatArrays); //collision
                            }
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
        function deeplyEquals(node1, node2, allowIdentical) {
            if (allowIdentical === void 0) { allowIdentical = true; }
            if (typeof (node1) != typeof (node2)) {
                return false; // nodes not same type
            }
            else if (node1 instanceof Object) {
                if (node1 === node2 && !allowIdentical) {
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
                        else if (!deeplyEquals(node1[q], node2[q], allowIdentical)) {
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
        Util.deeplyEquals = deeplyEquals;
        function deeplyEqualsThrow(node1, node2, derefstack, seen, allowIdentical) {
            if (allowIdentical === void 0) { allowIdentical = true; }
            var derefstack = derefstack || [];
            var seen = seen || [];
            //circularity prevention
            if (seen.indexOf(node1) || seen.indexOf(node2)) {
                return;
            }
            if (typeof (node1) != typeof (node2)) {
                throw new Error("nodes not same type, derefs: [" + derefstack + "]");
            }
            else if (node1 instanceof Object) {
                if (node1 === node2 && !allowIdentical) {
                    throw new Error("identical object not replica, derefs:[" + derefstack + "]");
                }
                else {
                    for (var k in node1) {
                        if (!(k in node2)) {
                            throw new Error("key " + k + " in object1 but not object2, derefs:[" + derefstack + "]");
                        }
                    }
                    for (var q in node2) {
                        if (!(q in node1)) {
                            throw new Error("key " + k + " in object2 but not object1, derefs:[" + derefstack + "]"); // key in node2 and not node1
                        }
                        else {
                            deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), allowIdentical);
                        }
                    }
                    return true; // no false flag
                }
            }
            else if (node1 !== node2) {
                throw new Error(node1 + " and " + node2 + " not equal, derefs:[" + derefstack + "]");
            }
        }
        Util.deeplyEqualsThrow = deeplyEqualsThrow;
        function isDeepReplica(node1, node2) {
            deeplyEquals(node1, node2, false);
        }
        Util.isDeepReplica = isDeepReplica;
        function isDeepReplicaThrow(node1, node2, derefstack) {
            deeplyEqualsThrow(node1, node2, derefstack, null, false);
        }
        Util.isDeepReplicaThrow = isDeepReplicaThrow;
        //merge, when there is a conflict, neither is taken
        function softAssoc(from, onto) {
            for (var k in from) {
                onto[k] = melder(from[k], onto[k]);
            }
        }
        Util.softAssoc = softAssoc;
        function parassoc(from, onto) {
            for (var k in from) {
                onto[k] = melder(onto[k], from[k], function (a, b) {
                    return [a, b];
                }, true);
            }
        }
        Util.parassoc = parassoc;
        function assoc(from, onto) {
            for (var k in from) {
                onto[k] = melder(onto[k], from[k]);
            }
        }
        Util.assoc = assoc;
        function deepCopy(thing) {
            return typeCaseSplitF(deepCopy, deepCopy)(thing);
        }
        Util.deepCopy = deepCopy;
        function applyMixins(derivedCtor, baseCtors) {
            baseCtors.forEach(function (baseCtor) {
                Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                });
            });
        }
        Util.applyMixins = applyMixins;
        function isVanillaObject(thing) {
            return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing);
        }
        Util.isVanillaObject = isVanillaObject;
        function typeCaseSplitF(objectOrAllFunction, arrayFunc, primativeFunc) {
            var ofunc, afunc, pfunc;
            if (primativeFunc == undefined && arrayFunc == undefined) {
                ofunc = objectOrAllFunction || identity;
                afunc = objectOrAllFunction || identity;
                pfunc = objectOrAllFunction || identity;
            }
            else {
                ofunc = objectOrAllFunction || identity;
                afunc = arrayFunc || identity;
                pfunc = primativeFunc || identity;
            }
            return function (inThing) {
                var outThing;
                if (inThing instanceof Array) {
                    outThing = [];
                    outThing.length = inThing.length;
                    for (var i = 0; i < inThing.length; i++) {
                        var subBundle = inThing[i];
                        outThing[i] = afunc(subBundle, i);
                    }
                }
                else if (isVanillaObject(inThing)) {
                    outThing = {};
                    for (var k in inThing) {
                        var subBundle = inThing[k];
                        outThing[k] = ofunc(subBundle, k);
                    }
                }
                else {
                    outThing = pfunc(inThing);
                }
                return outThing;
            };
        }
        Util.typeCaseSplitF = typeCaseSplitF;
        function typeCaseSplitM(objectOrAllFunction, arrayFunc, primativeFunc) {
            var ofunc, afunc, pfunc;
            if (primativeFunc == undefined && arrayFunc == undefined) {
                ofunc = objectOrAllFunction || identity;
                afunc = objectOrAllFunction || identity;
                pfunc = objectOrAllFunction || identity;
            }
            else {
                ofunc = objectOrAllFunction || identity;
                afunc = arrayFunc || identity;
                pfunc = primativeFunc || identity;
            }
            return function (inThing) {
                if (inThing instanceof Array) {
                    for (var i = 0; i < inThing.length; i++) {
                        var subBundle = inThing[i];
                        inThing[i] = afunc(subBundle, i);
                    }
                }
                else if (isVanillaObject) {
                    for (var k in inThing) {
                        var subBundle = inThing[k];
                        inThing[k] = ofunc(subBundle, k);
                    }
                }
                else {
                }
                return inThing;
            };
        }
        Util.typeCaseSplitM = typeCaseSplitM;
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
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                propertyLayerMap: {
                    value: {},
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                closed: {
                    value: false,
                    writable: true,
                    enumerable: false,
                    configurable: false,
                }
            });
            //create internally held properties.
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
            //freeze context here so that modifier functions cannot add, change or delete properties
        };
        ResolutionContext.prototype.extract = function () {
            return Gentyl.Util.deepCopy(this.ownProperties);
        };
        /**
         * create the layers, at each stage looking up contexts relative to the host.
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
                //console.log("tkey: %s , sKey: %s",tKey, sKey)
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
            //console.log("addOwnProperty(name:%s, defaultValue:%s)", name, defaultValue)
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
            //console.log("getItem %s resulting in:", key , result);
            return result;
        };
        /**
         * get the actual source of the desired property. use to set/getItems
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
                    //console.log("add source layer property prop:%s", prop)
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
var signals = require('signals');
var Gentyl;
(function (Gentyl) {
    var ResolutionNode = (function () {
        function ResolutionNode(components, form, state) {
            if (form === void 0) { form = {}; }
            if (state === void 0) { state = {}; }
            var context = Gentyl.Util.deepCopy(state);
            var mode = this.ctxmode = form.m || "";
            this.carrier = form.c || Gentyl.Util.identity;
            this.resolver = form.f || Gentyl.Util.identity;
            this.selector = form.s || function (keys, carg) { return true; };
            this.preparator = form.p || function (x) { };
            this.inputLabel = form.il;
            this.outputLabel = form.ol;
            this.inputFunction = form.i || Gentyl.Util.identity;
            this.outputFunction = form.o || Gentyl.Util.identity;
            this.targeting = form.t;
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.targeted = false;
            var inductor = this.inductComponent.bind(this);
            this.node = Gentyl.Util.typeCaseSplitF(inductor, inductor, null)(components);
            this.ctx = new Gentyl.ResolutionContext(this, context, mode);
        }
        /**
         * setup the state tree, recursively preparing the contexts
         */
        ResolutionNode.prototype.prepare = function (prepargs) {
            if (prepargs === void 0) { prepargs = null; }
            if (this.isAncestor) {
                throw Error("Ancestors cannot be prepared for resolution");
            }
            //if already prepared the ancestor is reestablished
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;
            if (!this.prepared) {
                this.prepared = true;
                this.ctx.prepare();
                this.preparator.call(this.ctx, prepargs);
                //create io facilities for node.
                this.prepareIO();
                //prepare children, object, array, primative
                this.node = Gentyl.Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.node);
            }
            else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }
            return this;
        };
        ResolutionNode.prototype.prepareChild = function (prepargs, child) {
            if (child instanceof ResolutionNode) {
                var replica = child.replicate();
                replica.setParent(this);
                replica.prepare(prepargs);
                //collect nodes from children allowing parallel input not out
                Gentyl.Util.parassoc(replica.inputNodes, this.inputNodes);
                Gentyl.Util.assoc(replica.outputNodes, this.outputNodes);
                return replica;
            }
            else {
                return child;
            }
        };
        ResolutionNode.prototype.prepareIO = function () {
            this.inputNodes = {};
            if (typeof (this.inputLabel) == 'string') {
                this.inputNodes[this.inputLabel] = [this];
            }
            this.outputNodes = {};
            if (typeof (this.outputLabel) == 'string') {
                this.outputNodes[this.outputLabel] = this;
            }
        };
        ResolutionNode.prototype.replicate = function () {
            if (this.prepared) {
                //this node is prepared so we will be creating a new based off the ancestor;
                return this.ancestor.replicate();
            }
            else {
                //this is a raw node, either an ancestor
                var repl = new ResolutionNode(this.node, {
                    f: this.resolver,
                    c: this.carrier,
                    m: this.ctxmode,
                    p: this.preparator,
                    il: this.inputLabel,
                    ol: this.outputLabel,
                    i: this.inputFunction,
                    o: this.outputFunction,
                    t: this.targeting,
                    s: this.selector
                }, this.ctx.extract());
                //in the case of the ancestor it comes from prepared
                if (this.isAncestor) {
                    repl.ancestor = this;
                }
                return repl;
            }
        };
        ResolutionNode.prototype.bundle = function () {
            function bundler(node) {
                if (node instanceof ResolutionNode) {
                    var product = node.bundle();
                    return product;
                }
                else {
                    return node;
                }
            }
            var recurrentNodeBundle = Gentyl.Util.typeCaseSplitF(bundler, bundler, null)(this.node);
            var product = {
                node: recurrentNodeBundle,
                form: Gentyl.deformulate(this),
                state: this.ctx.extract()
            };
            return product;
        };
        ResolutionNode.prototype.getTargets = function (input, root) {
            //create submap of the output nodes being only those activted by the current node targeting
            function strtargs(targs, input, root) {
                var targets = {};
                if (targs == undefined) {
                }
                else if (targs instanceof Array) {
                    for (var i = 0; i < targs.length; i++) {
                        var val = targs[i];
                        if (val in root.outputNodes) {
                            targets[val] = root.outputNodes[val];
                        }
                    }
                }
                else {
                    if (targs in root.outputNodes) {
                        targets[targs] = root.outputNodes[targs];
                    }
                }
                //console.log("returned targets:", targets)
                return targets;
            }
            if (typeof (this.targeting) == 'function') {
                return strtargs(this.targeting(input), input, root);
            }
            else {
                return strtargs(this.targeting, input, root);
            }
        };
        ResolutionNode.prototype.shell = function () {
            if (!this.prepared) {
                throw new Error("unable to shell unprepared node");
            }
            //implicit root labelling;
            var root = this.getRoot();
            //only operate on root
            root.inputLabel = root.inputLabel || "_";
            root.outputLabel = root.outputLabel || "_";
            root.outputNodes["_"] = root;
            root.inputNodes["_"] = [root];
            var inpnodesmap = root.inputNodes;
            var outnodemap = root.outputNodes;
            var shell = {
                ins: {},
                outs: {}
            };
            //create the output signals.
            for (var k in outnodemap) {
                shell.outs[k] = new signals.Signal();
            }
            //create input functions
            for (var k in inpnodesmap) {
                var v = { inps: inpnodesmap[k], root: root };
                shell.ins[k] = function (data) {
                    //construct a map of olabel:Onode that will be activated this time
                    var allTargets = {};
                    var rootInput;
                    for (var i = 0; i < this.inps.length; i++) {
                        var inode = this.inps[i];
                        var iresult = inode.inputFunction.call(inode.ctx, data);
                        if (inode == this.root) {
                            rootInput = iresult;
                        }
                        var targets = inode.getTargets(data, this.root); //Quandry: should it be input function result
                        Gentyl.Util.assoc(targets, allTargets);
                    }
                    if (Object.keys(allTargets).length == 0) {
                        return;
                    } //no resolution if no targets
                    for (var key in allTargets) {
                        //console.log("target %s set targets", key, allTargets[key])
                        allTargets[key].targeted = true; //set allTargets
                    }
                    this.root.resolve(data); //trigger root resolution. Quandry: should it be input function result
                    for (var key in allTargets) {
                        allTargets[key].targeted = false; //clear targets
                    }
                }.bind(v);
            }
            root.signalShell = shell;
            return shell;
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
        ResolutionNode.prototype.getParent = function (toDepth) {
            if (toDepth === void 0) { toDepth = 1; }
            if (this.parent == undefined) {
                throw new Error("parent not set, or exceeding getParent depth");
            }
            else if (toDepth == 1) {
                return this.parent;
            }
            else {
                return this.parent.getParent(toDepth - 1);
            }
        };
        ResolutionNode.prototype.getRoot = function () {
            return this.isRoot ? this : this.getParent().getRoot();
        };
        ResolutionNode.prototype.setParent = function (parentNode) {
            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        };
        ResolutionNode.prototype.resolveArray = function (array, resolveArgs, selection) {
            //TODO:selector must produce index or array thereof
            if (selection instanceof Array) {
                var resolution = [];
                for (var i = 0; i < selection.length; i++) {
                    resolution[i] = this.resolveNode(array[selection[i]], resolveArgs, true);
                }
                return resolution;
            }
            else {
                return this.resolveNode(array[selection], resolveArgs, true);
            }
        };
        ResolutionNode.prototype.resolveObject = function (node, resolveArgs, selection) {
            if (selection instanceof Array) {
                var resolution = {};
                for (var i = 0; i < selection.length; i++) {
                    var k = selection[i];
                    resolution[k] = this.resolveNode(node[k], resolveArgs, true);
                }
                return resolution;
            }
            else {
                return this.resolveNode(node[selection], resolveArgs, true);
            }
        };
        //main recursion
        ResolutionNode.prototype.resolveNode = function (node, resolveArgs, selection) {
            //log("node to resolve: ", node)
            //cutting dictates that we select nothing and therefore will
            var cut = false;
            if (!selection) {
                cut = true;
            }
            else if (selection == true && node instanceof Object) {
                //select all
                selection = Object.keys(node);
            }
            //at this stage cut determines primitives are nullified and objects empty
            if (node instanceof Array) {
                return cut ? [] : this.resolveArray(node, resolveArgs, selection);
            }
            else if (typeof (node) == "object") {
                if (node instanceof ResolutionNode) {
                    return cut ? null : node.resolve(resolveArgs);
                }
                else {
                    return cut ? {} : this.resolveObject(node, resolveArgs, selection);
                }
            }
            else {
                //we have a primative
                return cut ? null : node;
            }
        };
        ResolutionNode.prototype.resolveUnderscore = function (resolver, resolveArgs) {
            //now this is the parent context
            var result = resolver.resolve(resolveArgs);
            return result;
        };
        ResolutionNode.prototype.resolve = function (resolveArgs) {
            if (!this.prepared) {
                this.prepare();
            }
            Object.freeze(resolveArgs);
            var carried = this.carrier.call(this.ctx, resolveArgs);
            var resolvedNode;
            if (this.node != undefined) {
                //form the selection for this node
                var selection = this.selector.call(this.ctx, Object.keys(this.node), resolveArgs);
                //recurse on the contained node
                resolvedNode = this.resolveNode(this.node, carried, selection);
            }
            //modifies the resolved context and returns the processed result
            var result = this.resolver.call(this.ctx, resolvedNode, resolveArgs);
            //dispatch if marked
            //console.log(`check Output stage with olabel ${this.outputLabel} reached targeted? , `,this.targeted)
            if (this.targeted) {
                var outresult = this.outputFunction.call(this.ctx, result);
                this.getRoot().signalShell.outs[this.outputLabel].dispatch(outresult);
            }
            return result;
        };
        return ResolutionNode;
    }());
    Gentyl.ResolutionNode = ResolutionNode;
})(Gentyl || (Gentyl = {}));
var uuid = require('uuid');
var Gentyl;
(function (Gentyl) {
    function isBundle(object) {
        return object instanceof Object && "form" in object && "state" in object && "node" in object;
    }
    Gentyl.isBundle = isBundle;
    /**
     * A rudimetary implementation not supporting failure cases or serialization
     * if a function is stored already this will override it will throw the
     * value error if the function is not there
     */
    var ObjectFunctionCache = (function () {
        function ObjectFunctionCache() {
            this.functions = {};
        }
        ObjectFunctionCache.prototype.storeFunction = function (func) {
            var name = (["", 'anonymous', undefined].indexOf(func.name) == -1) ? func.name : uuid.v1();
            this.functions[name] = func;
            return name;
        };
        ObjectFunctionCache.prototype.recoverFunction = function (id) {
            return this.functions[id];
        };
        return ObjectFunctionCache;
    }());
    var liveCache = new ObjectFunctionCache();
    /**
     * build a form ref object for the bundle by storing the function externally
     * and only storing in the bundle a uuid or function name;
     */
    function deformulate(fromNode) {
        var preform = {
            f: fromNode.resolver,
            c: fromNode.carrier,
            m: fromNode.ctxmode
        };
        var exForm = {};
        for (var k in preform) {
            var val = preform[k];
            if (val instanceof Function) {
                //TODO: Replacible with local storage mechanisms
                exForm[k] = liveCache.storeFunction(val);
            }
            else {
                //should only be a string or at least value
                exForm[k] = val;
            }
        }
        return exForm;
    }
    Gentyl.deformulate = deformulate;
    /**
    * rebuild the form object by recovering the stored function from the cache using the uuids and labels.
     */
    function reformulate(formRef) {
        var recovered = {};
        for (var k in formRef) {
            recovered[k] = liveCache.recoverFunction(formRef[k]);
        }
        return recovered;
    }
    Gentyl.reformulate = reformulate;
    var Reconstruction = (function (_super) {
        __extends(Reconstruction, _super);
        function Reconstruction(bundle) {
            //construct the node of array, object or primative,
            function debundle(bundle) {
                if (isBundle(bundle)) {
                    return new Reconstruction(bundle);
                }
                else {
                    return bundle;
                }
            }
            var node = Gentyl.Util.typeCaseSplitF(debundle)(bundle.node);
            //reconstruction is almost entirely for this, so that it can pass through reformulation.
            var form = Gentyl.reformulate(bundle.form);
            var state = bundle.state;
            _super.call(this, node, form, state);
        }
        return Reconstruction;
    }(Gentyl.ResolutionNode));
    Gentyl.Reconstruction = Reconstruction;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Inventory;
    (function (Inventory) {
        function placeInput(input) {
            this._placed = input;
        }
        Inventory.placeInput = placeInput;
        function pickupInput(obj, arg) {
            return this._placed;
        }
        Inventory.pickupInput = pickupInput;
        function retract(obj, arg) {
            return arg;
        }
        Inventory.retract = retract;
    })(Inventory = Gentyl.Inventory || (Gentyl.Inventory = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Inventory;
    (function (Inventory) {
        function selectNone() {
            return [];
        }
        Inventory.selectNone = selectNone;
    })(Inventory = Gentyl.Inventory || (Gentyl.Inventory = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    /**
     * Crete a G-Node in a Generic way
     * @param:component
     */
    function G(components, form, state) {
        return new Gentyl.ResolutionNode(components, form, state);
    }
    Gentyl.G = G;
    /**
     * Alias to create a functional G-node,
     */
    function F(func, components, state) {
        return new Gentyl.ResolutionNode(components, { f: func }, state);
    }
    Gentyl.F = F;
    /**
     * Create an input leaf node, defaulting to a passive point storage
     */
    function I(label, target, inputFunction, resolveFunction, state) {
        if (target === void 0) { target = []; }
        if (inputFunction === void 0) { inputFunction = Gentyl.Inventory.placeInput; }
        if (resolveFunction === void 0) { resolveFunction = Gentyl.Inventory.pickupInput; }
        return new Gentyl.ResolutionNode({}, { i: inputFunction, t: target, il: label, f: resolveFunction }, state || { _placed: null });
    }
    Gentyl.I = I;
    /**
     * Create an output leaf node, a node that passes
     */
    function O(label, outputFunction) {
        return new Gentyl.ResolutionNode({}, { ol: label, o: outputFunction, f: Gentyl.Inventory.retract }, {});
    }
    Gentyl.O = O;
    function R(reconstructionBundle) {
        return new Gentyl.Reconstruction(reconstructionBundle);
    }
    Gentyl.R = R;
})(Gentyl || (Gentyl = {}));
///compile this file with --outFile for commonjs module environment
/// <reference path="../typings/index.d.ts"/>
/// <reference path="util.ts"/>
/// <reference path="core.ts"/>
/// <reference path="reconstruction.ts"/>
/// <reference path="inventory/io.ts"/>
/// <reference path="inventory/select.ts"/>
/// <reference path="inventory/resolver.ts"/>
/// <reference path="aliases.ts"/>
// require("./core.ts")
// require("./nodes.ts")
// require("./util.ts")
//exports to multiple environments
var define = define || undefined;
if (typeof define === 'function' && define.amd) {
    define(function () { return Gentyl; });
}
else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gentyl;
}
else {
    //use string because of Google closure compiler ADVANCED_MODE
    /*jslint sub:true */
    this['gentyl'] = Gentyl;
}
