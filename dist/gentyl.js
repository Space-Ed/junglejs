var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Gentyl;
(function (Gentyl) {
    function G(components, form) {
        return new Gentyl.GNode(components, form);
    }
    Gentyl.G = G;
    function F(func, components) {
        return new Gentyl.GNode(components, { r: func });
    }
    Gentyl.F = F;
    function R(reconstructionBundle) {
        return new Gentyl.Reconstruction(reconstructionBundle);
    }
    Gentyl.R = R;
    function T(type) {
        return new Gentyl.Terminal(type);
    }
    Gentyl.T = T;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    (function (ASSOCMODE) {
        ASSOCMODE[ASSOCMODE["INHERIT"] = 0] = "INHERIT";
        ASSOCMODE[ASSOCMODE["SHARE"] = 1] = "SHARE";
        ASSOCMODE[ASSOCMODE["TRACK"] = 2] = "TRACK";
    })(Gentyl.ASSOCMODE || (Gentyl.ASSOCMODE = {}));
    var ASSOCMODE = Gentyl.ASSOCMODE;
    var GContext = (function () {
        function GContext(host, hostContext, mode) {
            this.host = host;
            this.mode = mode;
            Object.defineProperties(this, {
                internalProperties: {
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
                },
                label: {
                    value: "",
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                nominal: {
                    value: false,
                    writable: true,
                    enumerable: false,
                    configurable: false
                }
            });
            for (var k in hostContext) {
                this.addOwnProperty(k, hostContext[k]);
            }
        }
        GContext.prototype.prepare = function () {
            var layers = this.parseMode(this.mode);
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                switch (layer.mode) {
                    case (ASSOCMODE.INHERIT): {
                        this.addInherentLayer(layer.source);
                        break;
                    }
                    default: {
                        this.addSourceLayer(layer);
                        break;
                    }
                }
            }
        };
        GContext.prototype.extract = function () {
            return Gentyl.Util.deepCopy(this.internalProperties);
        };
        GContext.prototype.parseMode = function (modestr) {
            var layers = [];
            var usesplit = modestr.split(/use/);
            var header, usage;
            if (usesplit.length > 2) {
                throw new Error("inappropriate appearance of keyword 'use'");
            }
            else if (usesplit.length == 2) {
                if (usesplit[1] == '') {
                    throw new Error("expected at lease one context label after use");
                }
                else {
                    header = usesplit[0], usage = usesplit[1];
                }
            }
            else {
                header = usesplit[0];
            }
            var headerexp = /^\s*(\w*)\s*$/;
            var headermatch = header.match(headerexp);
            if (headermatch === undefined) {
                throw new Error("only one label before the header is allowed");
            }
            this.label = headermatch[1];
            if (this.label !== '') {
                this.nominal = true;
            }
            if (usage) {
                var uses = usage.split(/\s/).filter(function (a) { return a !== ''; });
                console.log("uses of contexts:", uses);
                for (var i = 0; i < uses.length; i += 1) {
                    var layer = { mode: ASSOCMODE.SHARE, source: null };
                    var sourceKey = uses[i];
                    layer.source = this.host.getNominal(sourceKey).ctx;
                    layers.push(layer);
                }
            }
            return layers;
        };
        GContext.prototype.addOwnProperty = function (name, defaultValue) {
            this.internalProperties[name] = defaultValue;
            this.propertyLayerMap[name] = { source: this, mode: ASSOCMODE.SHARE };
            Object.defineProperty(this, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable: true,
                configurable: true
            });
        };
        GContext.prototype.setItem = function (key, data) {
            var layer = this.propertyLayerMap[key];
            if (layer.mode == ASSOCMODE.TRACK) {
                throw new Error("Unable to modify key whose source is tracking only");
            }
            else {
                layer.source.internalProperties[key] = data;
            }
        };
        GContext.prototype.getItem = function (key) {
            var layer = this.propertyLayerMap[key];
            var result = layer.source.internalProperties[key];
            return result;
        };
        GContext.prototype.getItemSource = function (key) {
            if (key in this.propertyLayerMap) {
                return this.propertyLayerMap[key].source;
            }
            else {
                throw new Error("key %s not found in the context");
            }
        };
        GContext.prototype.addInherentLayer = function (layerctx) {
            for (var prop in layerctx.internalProperties) {
                var propVal = layerctx.internalProperties[prop];
                this.addOwnProperty(prop, propVal);
            }
        };
        GContext.prototype.addSourceLayer = function (layer) {
            for (var prop in layer.source.propertyLayerMap) {
                var propVal = layer.source.propertyLayerMap[prop];
                if (this.propertyLayerMap[prop] != undefined && (this.propertyLayerMap[prop].mode != propVal.mode || this.propertyLayerMap[prop].source != propVal.source)) {
                    throw new Error("source layer introduces incompatible source/mode of property");
                }
                else {
                    this.propertyLayerMap[prop] = { source: propVal.source, mode: layer.mode };
                    Object.defineProperty(this, prop, {
                        set: this.setItem.bind(this, prop),
                        get: this.getItem.bind(this, prop),
                        enumerable: true,
                        configurable: true
                    });
                }
            }
        };
        return GContext;
    }());
    Gentyl.GContext = GContext;
})(Gentyl || (Gentyl = {}));
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
            if (typeof (node) == "object" && !(node instanceof Array)) {
                translated = {};
                for (var k in node) {
                    var tval = translation[k];
                    if (typeof (tval) == "function") {
                        translated[tval.name] = tval(node[k]);
                    }
                    if (typeof (tval) == "string") {
                        translated[tval] = node[k];
                    }
                    else if (tval != undefined) {
                        translated[k] = translator(node[k], tval);
                    }
                    else {
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
                for (var k in node1) {
                    melded[k] = node1[k];
                }
                for (var q in node2) {
                    melded[q] = node2[q];
                }
                for (var k in node1) {
                    for (var q in node2) {
                        if (k == q) {
                            if (node1[k] == node2[k]) {
                                melded[k] = node1[k];
                            }
                            else {
                                melded[k] = melder(node1[k], node2[k], merge, concatArrays);
                            }
                        }
                    }
                }
            }
            else {
                melded = merge(node1, node2);
            }
            return melded;
        }
        Util.melder = melder;
        function deeplyEquals(node1, node2, allowIdentical) {
            if (allowIdentical === void 0) { allowIdentical = true; }
            if (typeof (node1) != typeof (node2)) {
                return false;
            }
            else if (node1 instanceof Object) {
                if (node1 === node2 && !allowIdentical) {
                    return false;
                }
                else {
                    for (var k in node1) {
                        if (!(k in node2)) {
                            return false;
                        }
                    }
                    for (var q in node2) {
                        if (!(q in node1)) {
                            return false;
                        }
                        else if (!deeplyEquals(node1[q], node2[q], allowIdentical)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            else {
                return (node1 === node2);
            }
        }
        Util.deeplyEquals = deeplyEquals;
        function deeplyEqualsThrow(node1, node2, derefstack, seen, allowIdentical) {
            if (allowIdentical === void 0) { allowIdentical = true; }
            var derefstack = derefstack || [];
            var seen = seen || [];
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
                            throw new Error("key " + k + " in object2 but not object1, derefs:[" + derefstack + "]");
                        }
                        else {
                            deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), allowIdentical);
                        }
                    }
                    return true;
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
        function objectArrayTranspose(objArr, key) {
            var invert;
            if (typeof (key) !== 'string') {
                throw new Error("Value error: key must be string literal");
            }
            if (isVanillaArray(objArr)) {
                invert = {};
                objArr.forEach(function (value, index) {
                    invert[value[key]] = value;
                });
            }
            else if (isVanillaObject(objArr)) {
                invert = [];
                for (var k in objArr) {
                    var obj = objArr[k];
                    obj[key] = k;
                    invert.push(obj);
                }
            }
            else {
                throw new Error("Value error: can only transpose object and array literals");
            }
        }
        Util.objectArrayTranspose = objectArrayTranspose;
        function isPrimative(thing) {
            return typeof (thing) !== 'object';
        }
        Util.isPrimative = isPrimative;
        function isVanillaObject(thing) {
            return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing);
        }
        Util.isVanillaObject = isVanillaObject;
        function isVanillaArray(thing) {
            return thing instanceof Array && Array.prototype == Object.getPrototypeOf(thing);
        }
        Util.isVanillaArray = isVanillaArray;
        function isTree(thing, stack) {
            if (stack === void 0) { stack = []; }
            stack = stack.concat(thing);
            function decirc(proposed) {
                if ((stack.indexOf(proposed) === -1)) {
                    return isTree(proposed, stack);
                }
                else {
                    return false;
                }
            }
            return typeCaseSplitR(decirc, decirc, function () { return true; })(thing, true, function (a, b, k) { return a && b; });
        }
        Util.isTree = isTree;
        function isVanillaTree(thing, stack) {
            if (stack === void 0) { stack = []; }
            function decirc(proposed) {
                if ((isVanillaObject(proposed) || isVanillaArray(proposed) && stack.indexOf(proposed) === -1)) {
                    return isVanillaTree(proposed, stack.concat(proposed));
                }
                else {
                    return false;
                }
            }
            return typeCaseSplitR(decirc, decirc, isPrimative)(thing, true, function (a, b, k) { return a && b; });
        }
        Util.isVanillaTree = isVanillaTree;
        function typeCaseSplitR(objectOrAllFunction, arrayFunc, primativeFunc) {
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
            return function (inThing, initial, reductor) {
                if (initial === void 0) { initial = null; }
                if (reductor === void 0) { reductor = function (a, b, k) { }; }
                var result = initial;
                if (isVanillaArray(inThing)) {
                    for (var i = 0; i < inThing.length; i++) {
                        var subBundle = inThing[i];
                        result = reductor(result, afunc(subBundle, i), i);
                    }
                }
                else if (isVanillaObject(inThing)) {
                    for (var k in inThing) {
                        var subBundle = inThing[k];
                        result = reductor(result, ofunc(subBundle, k), k);
                    }
                }
                else {
                    result = pfunc(inThing);
                }
                return result;
            };
        }
        Util.typeCaseSplitR = typeCaseSplitR;
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
                if (isVanillaArray(inThing)) {
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
                if (isVanillaArray(inThing)) {
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
                    pfunc(inThing);
                }
            };
        }
        Util.typeCaseSplitM = typeCaseSplitM;
    })(Util = Gentyl.Util || (Gentyl.Util = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var GNode = (function () {
        function GNode(components, form) {
            if (form === void 0) { form = {}; }
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.form = new Gentyl.GForm(this);
            var _a = this.form.parse(form), hooks = _a.hooks, context = _a.context, specialIn = _a.specialIn, specialOut = _a.specialOut;
            this.io = new Gentyl.IO.Component(this, hooks, specialIn, specialOut);
            console.log("context from form parse: ", context);
            this.ctx = new Gentyl.GContext(this, context, this.form.ctxmode);
            var inductor = this.inductComponent.bind(this);
            this.crown = Gentyl.Util.typeCaseSplitF(inductor, inductor, null)(components);
        }
        GNode.prototype.inductComponent = function (component) {
            var c;
            if (component instanceof GNode) {
                c = component;
            }
            else if (component instanceof Object) {
                c = new GNode(component);
            }
            else {
                c = component;
            }
            return c;
        };
        GNode.prototype.prepare = function (prepargs) {
            if (prepargs === void 0) { prepargs = null; }
            if (this.isAncestor) {
                throw Error("Ancestors cannot be prepared for resolution");
            }
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;
            if (!this.prepared) {
                this.prepared = true;
                this.ctx.prepare();
                this.form.preparator.call(this.ctx, prepargs);
                this.io.prepare();
                this.crown = Gentyl.Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.crown);
            }
            else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }
            return this;
        };
        GNode.prototype.prepareChild = function (prepargs, child) {
            if (child instanceof GNode) {
                var replica = child.replicate();
                replica.setParent(this);
                replica.prepare(prepargs);
                return replica;
            }
            else {
                return child;
            }
        };
        GNode.prototype.replicate = function () {
            if (this.prepared) {
                return this.ancestor.replicate();
            }
            else {
                var repl = new GNode(this.crown, Gentyl.Util.melder(this.ctx.extract(), Gentyl.Util.melder(this.form.extract(), this.io.extract())));
                if (this.isAncestor) {
                    repl.ancestor = this;
                }
                return repl;
            }
        };
        GNode.prototype.bundle = function () {
            function bundler(node) {
                if (node instanceof GNode) {
                    var product = node.bundle();
                    return product;
                }
                else {
                    return node;
                }
            }
            var recurrentNodeBundle = Gentyl.Util.typeCaseSplitF(bundler, bundler, null)(this.crown);
            var product = {
                node: recurrentNodeBundle,
                form: Gentyl.deformulate(this),
                state: this.ctx.extract()
            };
            return product;
        };
        GNode.prototype.getParent = function (toDepth) {
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
        GNode.prototype.getRoot = function () {
            return this.isRoot ? this : this.getParent().getRoot();
        };
        GNode.prototype.getNominal = function (label) {
            if (this.ctx.label == label) {
                return this;
            }
            else {
                if (this.parent == undefined) {
                    throw new Error("Required context label " + label + " is not found");
                }
                else {
                    return this.parent.getNominal(label);
                }
            }
        };
        GNode.prototype.setParent = function (parentNode) {
            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        };
        GNode.prototype.resolveArray = function (array, resolveArgs, selection) {
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
        GNode.prototype.resolveObject = function (node, resolveArgs, selection) {
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
        GNode.prototype.terminalScan = function (recursive, collection, locale) {
            if (recursive === void 0) { recursive = false; }
            if (collection === void 0) { collection = []; }
            if (locale === void 0) { locale = null; }
            var locale = locale || this;
            Gentyl.Util.typeCaseSplitF(function (thing, dereferent) {
                if (thing instanceof Gentyl.Terminal) {
                    collection.push({ node: locale, term: thing, deref: dereferent });
                }
                else if (recursive && thing instanceof GNode) {
                    thing.terminalScan(true, collection, locale = thing);
                }
            })(this.crown);
            return collection;
        };
        GNode.prototype.checkComplete = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            var result = true;
            Gentyl.Util.typeCaseSplitF(function (thing) {
                if (thing instanceof Gentyl.Terminal) {
                    result = false;
                }
                else if (recursive && thing instanceof GNode) {
                    thing.checkComplete(true);
                }
            })(this.crown);
            return result;
        };
        GNode.prototype.add = function (keyOrVal, val) {
            this.inductComponent(val);
            var al = arguments.length;
            var ins = null;
            if (!(al === 1 || al === 2)) {
                throw Error("Requires 1 or 2 arguments");
            }
            else if (al === 1) {
                if (this.crown instanceof Array) {
                    ins = this.crown.length;
                    this.crown.push(val);
                }
                else if (Gentyl.Util.isVanillaObject(this.crown)) {
                    throw Error("Requires key and value to add to object crown");
                }
                else if (this.crown instanceof Gentyl.Terminal) {
                    if (this.crown.check(val)) {
                        this.crown = val;
                    }
                }
                else {
                    throw Error("Unable to clobber existing value");
                }
            }
            else {
                if (Gentyl.Util.isVanillaObject(this.crown)) {
                    ins = keyOrVal;
                    this.crown[keyOrVal] = val;
                }
                else {
                    throw Error("Requires single arg for non object crown");
                }
            }
            if (this.prepared) {
                this.crown[ins] = this.prepareChild(null, this.crown[ins]);
            }
        };
        GNode.prototype.seal = function (typespec) {
        };
        GNode.prototype.enshell = function (callback, context_factory) {
            this.io.enshell(callback, context_factory);
            return this;
        };
        GNode.prototype.resolveNode = function (node, resolveArgs, selection) {
            var cut = false;
            if (!selection) {
                cut = true;
            }
            else if (selection === true && node instanceof Object) {
                selection = Object.keys(node);
            }
            if (node instanceof Array) {
                return cut ? [] : this.resolveArray(node, resolveArgs, selection);
            }
            else if (typeof (node) === "object") {
                if (node instanceof GNode) {
                    return cut ? null : node.resolve(resolveArgs);
                }
                else {
                    return cut ? {} : this.resolveObject(node, resolveArgs, selection);
                }
            }
            else {
                return cut ? null : node;
            }
        };
        GNode.prototype.resolve = function (resolveArgs) {
            Object.freeze(resolveArgs);
            if (!this.prepared) {
                this.prepare();
            }
            if (this.io.isShellBase && !this.io.specialGate) {
                var sInpHook = this.io.specialInput;
                var sInpResult = sInpHook.tractor.call(this.ctx, resolveArgs);
                var sResult;
                if (sInpResult != Gentyl.IO.HALT && (sInpHook.eager || sInpResult !== undefined)) {
                    this.io.specialGate = true;
                    sResult = this.resolve(sInpResult);
                    this.io.specialGate = false;
                    return sResult;
                }
                else {
                    return this.io.specialOutput.tractor.call(this.ctx, sInpResult);
                }
            }
            else {
                var carried = this.form.carrier.call(this.ctx, resolveArgs);
                var resolvedNode;
                if (this.crown != undefined) {
                    var selection = this.form.selector.call(this.ctx, Object.keys(this.crown), resolveArgs);
                    resolvedNode = this.resolveNode(this.crown, carried, selection);
                }
                var result = this.form.resolver.call(this.ctx, resolvedNode, resolveArgs, carried);
                return this.io.dispatchResult(result);
            }
        };
        return GNode;
    }());
    Gentyl.GNode = GNode;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    (function (LabelTypes) {
        LabelTypes[LabelTypes["PASSIVE"] = 0] = "PASSIVE";
        LabelTypes[LabelTypes["TRIG"] = 1] = "TRIG";
        LabelTypes[LabelTypes["ENTRIG"] = 2] = "ENTRIG";
        LabelTypes[LabelTypes["GATE"] = 3] = "GATE";
        LabelTypes[LabelTypes["GATER"] = 4] = "GATER";
        LabelTypes[LabelTypes["TRIGATE"] = 5] = "TRIGATE";
        LabelTypes[LabelTypes["TRIGATER"] = 6] = "TRIGATER";
        LabelTypes[LabelTypes["ENTRIGATE"] = 7] = "ENTRIGATE";
        LabelTypes[LabelTypes["ENTRIGATER"] = 8] = "ENTRIGATER";
    })(Gentyl.LabelTypes || (Gentyl.LabelTypes = {}));
    var LabelTypes = Gentyl.LabelTypes;
    var TrigateLabelTypesMap = {
        '': { '': LabelTypes.PASSIVE, '_': LabelTypes.GATE, '__': LabelTypes.GATER },
        '_': { '': LabelTypes.TRIG, '_': LabelTypes.TRIGATE, '__': LabelTypes.TRIGATER },
        '__': { '': LabelTypes.ENTRIG, '_': LabelTypes.ENTRIGATE, '__': LabelTypes.ENTRIGATER }
    };
    var RFormProps = ["x", "p", "d", "c", "r", "s", "prepare", "destroy", "carry", "resolve", "select"];
    var labelTypeCompatibility = {
        0: {},
        1: { 3: true, 4: true },
        2: { 3: true, 4: true },
        3: { 1: true, 2: true },
        4: { 1: true, 2: true },
        5: {},
        6: {},
        7: {},
        8: {},
        9: {}
    };
    var GForm = (function () {
        function GForm(host) {
            this.host = host;
        }
        GForm.prototype.parse = function (formObj) {
            this.ctxmode = formObj.x || "";
            this.carrier = formObj.c || Gentyl.Util.identity;
            this.resolver = formObj.r || Gentyl.Util.identity;
            this.selector = formObj.s || function (keys, carg) { return true; };
            this.preparator = formObj.p || function (x) { };
            var ioRegex = /^(_{0,2})([a-zA-Z](?:\w*[a-zA-Z])?|\$)(_{0,2})$/;
            var hooks = [];
            var context = {};
            var specialInHook;
            var specialOutHook;
            var labels = {};
            for (var k in formObj) {
                var res = k.match(ioRegex);
                if (res) {
                    var inp = res[1], label = res[2], out = res[3], formVal = formObj[k];
                    var labelType = TrigateLabelTypesMap[inp][out];
                    if (RFormProps.indexOf(label) >= 0) {
                        continue;
                    }
                    if (label in labels) {
                        if (labelTypeCompatibility[labelType][labels[label]]) {
                            labels[label] = LabelTypes.PASSIVE;
                        }
                        else {
                            throw new Error("Duplicate incompatible label " + label + " in form parsing, labelType1:" + labelType + ", labelType2:" + labels[label]);
                        }
                    }
                    else {
                        labels[label] = labelType;
                    }
                    if (label === '$') {
                        var hook = { label: label, tractor: formObj[k], orientation: undefined, host: this.host, eager: undefined };
                        if (labelType === LabelTypes.TRIG) {
                            hook.orientation = Gentyl.IO.Orientation.INPUT;
                            hook.eager = false;
                            specialInHook = hook;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            hook.orientation = Gentyl.IO.Orientation.INPUT;
                            hook.eager = true;
                            specialInHook = hook;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            hook.orientation = Gentyl.IO.Orientation.OUTPUT;
                            hook.eager = false;
                            specialOutHook = hook;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            hook.orientation = Gentyl.IO.Orientation.OUTPUT;
                            hook.eager = true;
                            specialOutHook = hook;
                        }
                        else {
                            throw new Error("Special label must be input or output, not mixed");
                        }
                    }
                    else if (formVal instanceof Function) {
                        var hook = { label: label, tractor: formObj[k], orientation: undefined, host: this.host, eager: undefined };
                        if (labelType === LabelTypes.PASSIVE) {
                            context[label] = formVal;
                            continue;
                        }
                        else if (labelType === LabelTypes.TRIG) {
                            hook.orientation = Gentyl.IO.Orientation.INPUT, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            hook.orientation = Gentyl.IO.Orientation.INPUT, hook.eager = true;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            hook.orientation = Gentyl.IO.Orientation.OUTPUT, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            hook.orientation = Gentyl.IO.Orientation.OUTPUT, hook.eager = true;
                        }
                        else if (labelType === LabelTypes.TRIGATE) {
                            hook.orientation = Gentyl.IO.Orientation.MIXED, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.TRIGATER) {
                            console.warn("This label configuration doesn't make sense for functions");
                        }
                        else if (labelType === LabelTypes.ENTRIGATE) {
                            console.warn("This label configuration doesn't make sense for functions");
                        }
                        else if (labelType === LabelTypes.ENTRIGATER) {
                            hook.orientation = Gentyl.IO.Orientation.MIXED, hook.eager = true;
                        }
                        hooks.push(hook);
                    }
                    else if (Gentyl.Util.isPrimative(formVal)) {
                        var changeCheckValueReturn = function (input) {
                            if (this[label] === this.cache[label]) {
                                return Gentyl.IO.HALT;
                            }
                            return this[label];
                        };
                        var hookI = { label: label, tractor: function (input) { this[label] = input; }, orientation: Gentyl.IO.Orientation.INPUT, host: this.host, eager: undefined };
                        var hookO = { label: label, tractor: function (input) { return this.label; }, orientation: Gentyl.IO.Orientation.OUTPUT, host: this.host, eager: true };
                        var I = false;
                        var O = false;
                        if (labelType === LabelTypes.PASSIVE) {
                            context[label] = formVal;
                            continue;
                        }
                        else if (labelType === LabelTypes.TRIG) {
                            context[label] = formVal;
                            hookI.eager = false;
                            I = true;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            context[label] = formVal;
                            hookI.eager = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            context[label] = formVal;
                            O = true;
                            hookO.tractor = changeCheckValueReturn;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            context[label] = formVal;
                            O = true;
                        }
                        else if (labelType === LabelTypes.TRIGATE) {
                            context[label] = formVal;
                            hookI.eager = false;
                            O = true;
                            I = true;
                            hookO.tractor = changeCheckValueReturn;
                        }
                        else if (labelType === LabelTypes.TRIGATER) {
                            context[label] = formVal;
                            hookI.eager = false;
                            O = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.ENTRIGATE) {
                            context[label] = formVal;
                            hookI.eager = true;
                            O = true;
                            I = true;
                            hookO.tractor = changeCheckValueReturn;
                        }
                        else if (labelType === LabelTypes.ENTRIGATER) {
                            context[label] = formVal;
                            hookI.eager = true;
                            O = true;
                            I = true;
                        }
                        if (I) {
                            hooks.push(hookI);
                        }
                        ;
                        if (O) {
                            hooks.push(hookO);
                        }
                        ;
                        labels[label] = LabelTypes.PASSIVE;
                    }
                    else {
                        if (labelType === LabelTypes.PASSIVE) {
                            context[label] = formVal;
                            continue;
                        }
                        throw new Error("Unsupported form value type");
                    }
                }
                else {
                    throw new Error("Invalid label format, must have up to two leading and trailing underscores");
                }
            }
            return { hooks: hooks, context: context, specialIn: specialInHook, specialOut: specialOutHook };
        };
        GForm.prototype.extract = function () {
            return {
                r: this.resolver,
                c: this.carrier,
                x: this.ctxmode,
                p: this.preparator,
                s: this.selector,
            };
        };
        return GForm;
    }());
    Gentyl.GForm = GForm;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Inv;
    (function (Inv) {
        function retract(obj, arg) {
            return arg;
        }
        Inv.retract = retract;
    })(Inv = Gentyl.Inv || (Gentyl.Inv = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Inv;
    (function (Inv) {
        function selectNone() {
            return [];
        }
        Inv.selectNone = selectNone;
    })(Inv = Gentyl.Inv || (Gentyl.Inv = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Inv;
    (function (Inv) {
        function pass(x) {
            return x;
        }
        Inv.pass = pass;
        function abstain(x) {
        }
        Inv.abstain = abstain;
    })(Inv = Gentyl.Inv || (Gentyl.Inv = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var IO;
    (function (IO) {
        IO.HALT = {};
        Object.freeze(IO.HALT);
        function halting(arg) {
            return IO.HALT;
        }
        function passing(arg) {
            return arg;
        }
        function defined(arg) {
            return arg === undefined ? IO.HALT : arg;
        }
        function always(arg) {
            return true;
        }
        function nothing(arg) {
            return undefined;
        }
        function host(arg) {
            return this.host;
        }
        (function (Orientation) {
            Orientation[Orientation["INPUT"] = 0] = "INPUT";
            Orientation[Orientation["OUTPUT"] = 1] = "OUTPUT";
            Orientation[Orientation["NEUTRAL"] = 2] = "NEUTRAL";
            Orientation[Orientation["MIXED"] = 3] = "MIXED";
        })(IO.Orientation || (IO.Orientation = {}));
        var Orientation = IO.Orientation;
        var Port = (function () {
            function Port(label) {
                this.label = label;
                this.shells = [];
            }
            Port.prototype.addShell = function (shell) {
                this.shells.push(shell);
            };
            Port.prototype.handle = function (input) {
                if (this.callback) {
                    if (this.callbackContext) {
                        this.callback.call(this.callbackContext, input);
                    }
                    else {
                        this.callback.call(this, input);
                    }
                }
            };
            return Port;
        }());
        IO.Port = Port;
        var ResolveInputPort = (function (_super) {
            __extends(ResolveInputPort, _super);
            function ResolveInputPort(label) {
                var shells = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    shells[_i - 1] = arguments[_i];
                }
                _super.call(this, label);
                this.callback = this.handleInput;
                this.callbackContext = this;
                for (var _a = 0, shells_1 = shells; _a < shells_1.length; _a++) {
                    var shell = shells_1[_a];
                    this.addShell(shell);
                }
            }
            ResolveInputPort.prototype.handleInput = function (input) {
                for (var _i = 0, _a = this.shells; _i < _a.length; _i++) {
                    var shell = _a[_i];
                    var inputGate = false;
                    var baseInput = [];
                    var hooks = [].concat(shell.inputHooks[this.label] || []);
                    for (var _b = 0, hooks_1 = hooks; _b < hooks_1.length; _b++) {
                        var hook = hooks_1[_b];
                        var host = hook.host;
                        var iresult = hook.tractor.call(host.ctx, input);
                        inputGate = inputGate || (iresult != IO.HALT && (hook.eager || iresult !== undefined));
                        baseInput = baseInput.concat(iresult);
                        console.log("[input handle hook %s] Handle input: %s", hook.label, iresult);
                    }
                    if (inputGate) {
                        console.log("[base trigger resolve ] Handle input: ", baseInput);
                        shell.base.host.io.specialGate = true;
                        shell.base.host.resolve(baseInput);
                        shell.base.host.io.specialGate = false;
                    }
                }
            };
            return ResolveInputPort;
        }(Port));
        IO.ResolveInputPort = ResolveInputPort;
        var SpecialInputPort = (function (_super) {
            __extends(SpecialInputPort, _super);
            function SpecialInputPort(base) {
                _super.call(this, '$');
                this.base = base;
            }
            SpecialInputPort.prototype.handleInput = function (input) {
                console.log("[SpecialInputPort::handleInput]");
                var hook = this.base.specialInput;
                var iresult = hook.tractor.call(this.base.host.ctx, input);
                var inputGate = iresult != IO.HALT && (hook.eager || iresult !== undefined);
                if (inputGate) {
                    this.base.specialGate = true;
                    this.base.host.resolve(iresult);
                    this.base.specialGate = false;
                }
            };
            return SpecialInputPort;
        }(ResolveInputPort));
        IO.SpecialInputPort = SpecialInputPort;
        var ResolveOutputPort = (function (_super) {
            __extends(ResolveOutputPort, _super);
            function ResolveOutputPort(label, outputCallback, outputContext) {
                _super.call(this, label);
                this.callback = outputCallback;
                this.callbackContext = this.prepareContext(outputContext);
            }
            ResolveOutputPort.prototype.prepareContext = function (outputContext) {
                if (typeof (outputContext) == 'function') {
                    return new outputContext(this);
                }
                else if (typeof (outputContext) == 'object') {
                    return outputContext;
                }
                else {
                    return this;
                }
            };
            return ResolveOutputPort;
        }(Port));
        IO.ResolveOutputPort = ResolveOutputPort;
        function orientationChange(child, node) {
            if (child === Orientation.OUTPUT && node === Orientation.INPUT) {
                return Orientation.INPUT;
            }
            else if (child === Orientation.INPUT && node === Orientation.OUTPUT) {
                return Orientation.OUTPUT;
            }
            else if (node === Orientation.MIXED) { }
        }
        function orientationConflict(child1, child2) {
            return (child1 === Orientation.OUTPUT && child2 === Orientation.INPUT)
                || (child1 === Orientation.INPUT && child2 === Orientation.OUTPUT);
        }
        var Component = (function () {
            function Component(host, initHooks, specialIn, specialOut) {
                this.host = host;
                this.isShellBase = false;
                this.specialGate = false;
                this.orientation = Orientation.NEUTRAL;
                this.inputs = {};
                this.outputs = {};
                this.initialiseHooks(initHooks, specialIn, specialOut);
            }
            Component.prototype.prepare = function () {
            };
            Component.prototype.extract = function () {
                var ext = {};
                for (var _i = 0, _a = this.hooks; _i < _a.length; _i++) {
                    var tractor = _a[_i].tractor;
                    ext[tractor.name] = tractor;
                }
                return ext;
            };
            Component.prototype.initialiseHooks = function (hooks, specialIn, specialOut) {
                this.hooks = [];
                this.specialInput = specialIn;
                this.specialOutput = specialOut;
                this.inputHooks = {};
                this.outputHooks = {};
                for (var _i = 0, hooks_2 = hooks; _i < hooks_2.length; _i++) {
                    var hook = hooks_2[_i];
                    this.addHook(hook);
                }
            };
            Component.prototype.addHook = function (hook) {
                var label = hook.label, tractor = hook.tractor, orientation = hook.orientation;
                if (this.orientation == Orientation.NEUTRAL) {
                    this.orientation = orientation;
                }
                else if (orientation != this.orientation) {
                    this.orientation = Orientation.MIXED;
                }
                var label = label;
                if (orientation == Orientation.INPUT) {
                    this.inputHooks[label] = hook;
                }
                else if (orientation == Orientation.OUTPUT) {
                    this.outputHooks[label] = hook;
                }
                this.hooks.push(hook);
            };
            Component.prototype.enshell = function (opcallback, opcontext) {
                if (!this.host.prepared) {
                    throw new Error("unable to shell unprepared node");
                }
                this.reorient();
                this.isShellBase = true;
                this.collect(opcallback, opcontext);
                return this.shell;
            };
            Component.prototype.reorient = function () {
                var inverted = false;
                var upperOrientation;
                if (!Gentyl.Util.isPrimative(child)) {
                    for (var _i = 0, _a = this.host.crown; _i < _a.length; _i++) {
                        var child = _a[_i];
                        if (child instanceof Gentyl.GNode) {
                            child.io.reorient();
                            var upo = child.io.orientation;
                            if (child.io.isShellBase && upo != Orientation.NEUTRAL) {
                                continue;
                            }
                            else if (!upperOrientation || !orientationConflict(upperOrientation, upo)) {
                                upperOrientation = upo;
                            }
                            else {
                                throw new Error("Cannot have siblings with dissimilar io orientation");
                            }
                        }
                    }
                }
                else {
                    upperOrientation = Orientation.NEUTRAL;
                }
                if (orientationConflict(upperOrientation, this.orientation)) {
                    this.isShellBase = true;
                }
                if (this.orientation === Orientation.MIXED) {
                    this.isShellBase = true;
                }
                if (this.orientation == Orientation.NEUTRAL) {
                    this.orientation = upperOrientation;
                    this.isShellBase = false;
                }
            };
            Component.prototype.collect = function (opcallback, opcontext) {
                var accumulatedHooks = [].concat(this.hooks);
                var accumulatedShells = [];
                for (var k in this.host.crown) {
                    var child = this.host.crown[k];
                    if (child.io != undefined) {
                        var _a = child.io.collect(opcallback, opcontext), hooks = _a.hooks, shells = _a.shells;
                        accumulatedHooks = accumulatedHooks.concat(hooks);
                        accumulatedShells = accumulatedShells.concat(shells);
                    }
                }
                if (this.isShellBase) {
                    this.specialInput = this.specialInput || { tractor: nothing, label: '$', host: this.host, orientation: Orientation.INPUT, eager: false };
                    this.specialOutput = this.specialOutput || { tractor: nothing, label: '$', host: this.host, orientation: Orientation.OUTPUT, eager: false };
                    this.shell = new HookShell(this, accumulatedHooks, accumulatedShells, opcallback, opcontext);
                    var _loop_1 = function(k_1) {
                        this_1.inputs[k_1] = (function (input) {
                            console.log("[input closure] Handle input: ", input);
                            this.shell.sinks[k_1].handle(input);
                        }).bind(this_1);
                    };
                    var this_1 = this;
                    for (var k_1 in this.shell.sinks) {
                        _loop_1(k_1);
                    }
                    for (var k_2 in this.shell.sources) {
                        this.outputs[k_2] = this.shell.sources[k_2];
                    }
                    return { shells: [this.shell], hooks: [] };
                }
                else {
                    return { hooks: accumulatedHooks, shells: accumulatedShells };
                }
            };
            Component.prototype.dispatchResult = function (result) {
                var baseResult;
                for (var k in this.outputHooks) {
                    var hook = this.outputHooks[k];
                    var oresult = hook.tractor.call(this.host.ctx, result);
                    if ((oresult != IO.HALT && (hook.eager || oresult != undefined))) {
                        var port = this.base.shell.sources[k];
                        port.handle(oresult);
                    }
                }
                if (this.isShellBase) {
                    baseResult = this.specialOutput.tractor.call(this.specialOutput.host.ctx, result);
                    if ((baseResult != IO.HALT && (this.specialOutput.eager || baseResult != undefined))) {
                        var port = this.shell.sources.$;
                        port.handle(baseResult);
                    }
                }
                else {
                    baseResult = result;
                }
                return baseResult;
            };
            return Component;
        }());
        IO.Component = Component;
        var HookShell = (function () {
            function HookShell(base, midrantHooks, subshells, opcallback, opcontext) {
                this.base = base;
                this.sources = {};
                this.sinks = {};
                this.inputHooks = {};
                this.outputHooks = {};
                for (var _i = 0, midrantHooks_1 = midrantHooks; _i < midrantHooks_1.length; _i++) {
                    var hook = midrantHooks_1[_i];
                    this.addMidrantHook(hook);
                }
                for (var label in this.inputHooks) {
                    this.sinks[label] = new ResolveInputPort(label, this);
                }
                for (var label in this.outputHooks) {
                    this.sources[label] = new ResolveOutputPort(label, opcallback, opcontext);
                }
                for (var _a = 0, subshells_1 = subshells; _a < subshells_1.length; _a++) {
                    var shell = subshells_1[_a];
                    this.addShell(shell);
                }
                this.sinks['$'] = new SpecialInputPort(this.base);
                this.sources['$'] = new ResolveOutputPort('$', opcallback, opcontext);
            }
            HookShell.prototype.addMidrantHook = function (hook) {
                hook.host.io.base = this.base;
                if (hook.orientation === Orientation.INPUT) {
                    this.inputHooks[hook.label] = (this.inputHooks[hook.label] || []).concat(hook);
                }
                else if (hook.orientation === Orientation.OUTPUT) {
                    this.outputHooks[hook.label] = (this.outputHooks[hook.label] || []).concat(hook);
                }
            };
            HookShell.prototype.addShell = function (shell) {
                for (var _i = 0, _a = shell.sinks; _i < _a.length; _i++) {
                    var sink = _a[_i];
                    if (sink.label in this.sinks) {
                        var outerSink = this.sinks[sink.label];
                        outerSink.addShell(this);
                        for (var _b = 0, _c = sink.shells; _b < _c.length; _b++) {
                            var shell_1 = _c[_b];
                            shell_1.sinks[sink.label] = outerSink;
                        }
                    }
                    else {
                        this.sinks[sink.label] = sink;
                    }
                }
                for (var _d = 0, _e = shell.sources; _d < _e.length; _d++) {
                    var source = _e[_d];
                    if (source.label in this.sources) {
                        var outerSource = this.sources[source.label];
                        outerSource.addShell(this);
                        for (var _f = 0, _g = source.shells; _f < _g.length; _f++) {
                            var shell_2 = _g[_f];
                            shell_2.sources[source.label] = outerSource;
                        }
                    }
                    else {
                        this.sources[source.label] = source;
                    }
                }
            };
            return HookShell;
        }());
        IO.HookShell = HookShell;
    })(IO = Gentyl.IO || (Gentyl.IO = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var LNode = (function (_super) {
        __extends(LNode, _super);
        function LNode(crown, formspec) {
            _super.call(this, crown, formspec);
        }
        return LNode;
    }(Gentyl.GNode));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    function isBundle(object) {
        return object instanceof Object && "form" in object && "state" in object && "node" in object;
    }
    Gentyl.isBundle = isBundle;
    var ObjectFunctionCache = (function () {
        function ObjectFunctionCache() {
            this.functions = {};
        }
        ObjectFunctionCache.prototype.storeFunction = function (func) {
            var name = (["", 'anonymous', undefined].indexOf(func.name) == -1) ? func.name : 'anonymous';
            this.functions[name] = func;
            return name;
        };
        ObjectFunctionCache.prototype.recoverFunction = function (id) {
            return this.functions[id];
        };
        return ObjectFunctionCache;
    }());
    var liveCache = new ObjectFunctionCache();
    function deformulate(fromNode) {
        var preform = {
            r: fromNode.form.resolver,
            c: fromNode.form.carrier,
            x: fromNode.form.ctxmode
        };
        var exForm = {};
        for (var k in preform) {
            var val = preform[k];
            if (val instanceof Function) {
                exForm[k] = liveCache.storeFunction(val);
            }
            else {
                exForm[k] = val;
            }
        }
        return exForm;
    }
    Gentyl.deformulate = deformulate;
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
            function debundle(bundle) {
                if (isBundle(bundle)) {
                    return new Reconstruction(bundle);
                }
                else {
                    return bundle;
                }
            }
            var node = Gentyl.Util.typeCaseSplitF(debundle)(bundle.node);
            var form = Gentyl.reformulate(bundle.form);
            var state = bundle.state;
            _super.call(this, node, Gentyl.Util.melder(form, state));
        }
        return Reconstruction;
    }(Gentyl.GNode));
    Gentyl.Reconstruction = Reconstruction;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var Terminal = (function () {
        function Terminal(type) {
            this.type = type;
        }
        Terminal.prototype.check = function (obj) {
            return true;
        };
        return Terminal;
    }());
    Gentyl.Terminal = Terminal;
})(Gentyl || (Gentyl = {}));
(function () {
    var root = this;
    var define = define || undefined;
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Gentyl;
        }
        exports.Gentyl = Gentyl;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define('Gentyl', (function () { return root.Gentyl = Gentyl; })());
    }
    else {
        root.Gentyl = Gentyl;
    }
}).call(this);
