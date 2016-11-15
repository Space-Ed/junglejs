var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Gentyl;
(function (Gentyl) {
    function G(components, form, state) {
        return new Gentyl.ResolutionNode(components, form, state);
    }
    Gentyl.G = G;
    function F(func, components, state) {
        return new Gentyl.ResolutionNode(components, { f: func }, state);
    }
    Gentyl.F = F;
    function I(label, target, inputFunction, resolveFunction, state) {
        if (target === void 0) { target = []; }
        if (inputFunction === void 0) { inputFunction = Gentyl.Inventory.placeInput; }
        if (resolveFunction === void 0) { resolveFunction = Gentyl.Inventory.pickupInput; }
        return new Gentyl.ResolutionNode({}, { i: inputFunction, t: target, il: label, f: resolveFunction }, state || { _placed: null });
    }
    Gentyl.I = I;
    function O(label, outputFunction) {
        return new Gentyl.ResolutionNode({}, { ol: label, o: outputFunction, f: Gentyl.Inventory.retract }, {});
    }
    Gentyl.O = O;
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
    var ResolutionContext = (function () {
        function ResolutionContext(host, hostContext, mode) {
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
                    default: {
                        this.addSourceLayer(layer);
                        break;
                    }
                }
            }
        };
        ResolutionContext.prototype.extract = function () {
            return Gentyl.Util.deepCopy(this.ownProperties);
        };
        ResolutionContext.prototype.parseMode = function (modestr) {
            var layers = [];
            var splitexp = modestr.split(/\s/);
            var validmode = /^[&|=]$/;
            var validsource = /^[+_]|[a-zA-Z]+$/;
            var validwhole = /^([&|=])([+_]|[a-zA-Z]+)$/;
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
                var sKey = match[2];
                layer.mode = { "&": ASSOCMODE.SHARE, "|": ASSOCMODE.INHERIT, "=": ASSOCMODE.TRACK }[tKey];
                layer.source = (sKey == "+" ? this.host.getParent(1) : sKey == "_" ? this.host.getRoot() : this.host.getNominal(sKey)).ctx;
                layers.push(layer);
            }
            return layers;
        };
        ResolutionContext.prototype.addOwnProperty = function (name, defaultValue) {
            this.ownProperties[name] = defaultValue;
            this.propertyLayerMap[name] = { source: this, mode: ASSOCMODE.SHARE };
            Object.defineProperty(this, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable: true,
                configurable: true
            });
        };
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
            return result;
        };
        ResolutionContext.prototype.getItemSource = function (key) {
            if (key in this.propertyLayerMap) {
                return this.propertyLayerMap[key].source;
            }
            else {
                throw new Error("key %s not found in the context");
            }
        };
        ResolutionContext.prototype.addInherentLayer = function (layerctx) {
            for (var prop in layerctx.ownProperties) {
                var propVal = layerctx.ownProperties[prop];
                this.addOwnProperty(prop, propVal);
            }
        };
        ResolutionContext.prototype.addSourceLayer = function (layer) {
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
        return ResolutionContext;
    }());
    Gentyl.ResolutionContext = ResolutionContext;
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
                if (inThing instanceof Array) {
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
                    pfunc(inThing);
                }
            };
        }
        Util.typeCaseSplitM = typeCaseSplitM;
    })(Util = Gentyl.Util || (Gentyl.Util = {}));
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var ResolutionNode = (function () {
        function ResolutionNode(components, form, state) {
            if (form === void 0) { form = {}; }
            if (state === void 0) { state = {}; }
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.targeted = false;
            this.form = new Gentyl.GForm(form);
            var context = Gentyl.Util.deepCopy(state);
            this.ctx = new Gentyl.ResolutionContext(this, context, this.form.ctxmode);
            var inductor = this.inductComponent.bind(this);
            this.node = Gentyl.Util.typeCaseSplitF(inductor, inductor, null)(components);
        }
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
        ResolutionNode.prototype.prepare = function (prepargs) {
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
                this.prepareIO();
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
            if (typeof (this.form.inputLabel) == 'string') {
                this.inputNodes[this.form.inputLabel] = [this];
            }
            this.outputNodes = {};
            if (typeof (this.form.outputLabel) == 'string') {
                this.outputNodes[this.form.outputLabel] = this;
            }
        };
        ResolutionNode.prototype.replicate = function () {
            if (this.prepared) {
                return this.ancestor.replicate();
            }
            else {
                var repl = new ResolutionNode(this.node, this.form.extract(), this.ctx.extract());
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
                return targets;
            }
            if (typeof (this.form.targeting) == 'function') {
                return strtargs(this.form.targeting(input), input, root);
            }
            else {
                return strtargs(this.form.targeting, input, root);
            }
        };
        ResolutionNode.prototype.shell = function () {
            if (!this.prepared) {
                throw new Error("unable to shell unprepared node");
            }
            var root = this.getRoot();
            root.form.inputLabel = root.form.inputLabel || "_";
            root.form.outputLabel = root.form.outputLabel || "_";
            root.outputNodes["_"] = root;
            root.inputNodes["_"] = [root];
            var inpnodesmap = root.inputNodes;
            var outnodemap = root.outputNodes;
            var shell = {
                ins: {},
                outs: {}
            };
            for (var k in outnodemap) {
                if (Gentyl.IO.ioShellDefault.dispatch === undefined) {
                    shell.outs[k] = outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.setup(k);
                    outnodemap[k].outputContext = undefined;
                }
                else if (Gentyl.IO.ioShellDefault.setup === undefined) {
                    shell.outs[k] = outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.dispatch;
                    outnodemap[k].outputContext = undefined;
                }
                else {
                    var ctx = new Gentyl.IO.ioShellDefault.setup(k);
                    outnodemap[k].outputContext = shell.outs[k] = ctx;
                    outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.dispatch;
                }
            }
            for (var k in inpnodesmap) {
                var v = { inps: inpnodesmap[k], root: root };
                shell.ins[k] = function (data) {
                    var allTargets = {};
                    var rootInput;
                    for (var i = 0; i < this.inps.length; i++) {
                        var inode = this.inps[i];
                        var iresult = inode.form.inputFunction.call(inode.ctx, data);
                        if (inode == this.root) {
                            rootInput = iresult;
                        }
                        var targets = inode.getTargets(data, this.root);
                        Gentyl.Util.assoc(targets, allTargets);
                    }
                    if (Object.keys(allTargets).length == 0) {
                        return;
                    }
                    for (var key in allTargets) {
                        allTargets[key].targeted = true;
                    }
                    this.root.resolve(data);
                    for (var key in allTargets) {
                        allTargets[key].targeted = false;
                    }
                }.bind(v);
            }
            root.ioShell = shell;
            return shell;
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
        ResolutionNode.prototype.getNominal = function (label) {
            if (this.form.contextLabel === label) {
                return this;
            }
            else {
                if (this.parent == undefined) {
                    throw new Error("Required context label is not found");
                }
                else {
                    return this.parent.getNominal(label);
                }
            }
        };
        ResolutionNode.prototype.setParent = function (parentNode) {
            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        };
        ResolutionNode.prototype.resolveArray = function (array, resolveArgs, selection) {
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
        ResolutionNode.prototype.terminalScan = function (recursive, collection, locale) {
            if (recursive === void 0) { recursive = false; }
            if (collection === void 0) { collection = []; }
            if (locale === void 0) { locale = null; }
            var locale = locale || this;
            Gentyl.Util.typeCaseSplitF(function (thing, dereferent) {
                if (thing instanceof Gentyl.Terminal) {
                    collection.push({ node: locale, term: thing, deref: dereferent });
                }
                else if (recursive && thing instanceof ResolutionNode) {
                    thing.terminalScan(true, collection, locale = thing);
                }
            })(this.node);
            return collection;
        };
        ResolutionNode.prototype.checkComplete = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            var result = true;
            Gentyl.Util.typeCaseSplitF(function (thing) {
                if (thing instanceof Gentyl.Terminal) {
                    result = false;
                }
                else if (recursive && thing instanceof ResolutionNode) {
                    thing.checkComplete(true);
                }
            })(this.node);
            return result;
        };
        ResolutionNode.prototype.add = function (keyOrVal, val) {
            this.inductComponent(val);
            var al = arguments.length;
            var ins = null;
            if (!(al === 1 || al === 2)) {
                throw Error("Requires 1 or 2 arguments");
            }
            else if (al === 1) {
                if (this.node instanceof Array) {
                    ins = this.node.length;
                    this.node.push(val);
                }
                else if (Gentyl.Util.isVanillaObject(this.node)) {
                    throw Error("Requires key and value to add to object crown");
                }
                else if (this.node instanceof Gentyl.Terminal) {
                    if (this.node.check(val)) {
                        this.node = val;
                    }
                }
                else {
                    throw Error("Unable to clobber existing value");
                }
            }
            else {
                if (Gentyl.Util.isVanillaObject(this.node)) {
                    ins = keyOrVal;
                    this.node[keyOrVal] = val;
                }
                else {
                    throw Error("Requires single arg for non object crown");
                }
            }
            if (this.prepared) {
                this.node[ins] = this.prepareChild(null, this.node[ins]);
            }
        };
        ResolutionNode.prototype.seal = function (typespec) {
        };
        ResolutionNode.prototype.resolveNode = function (node, resolveArgs, selection) {
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
                if (node instanceof ResolutionNode) {
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
        ResolutionNode.prototype.resolveUnderscore = function (resolver, resolveArgs) {
            var result = resolver.resolve(resolveArgs);
            return result;
        };
        ResolutionNode.prototype.resolve = function (resolveArgs) {
            if (!this.prepared) {
                this.prepare();
            }
            Object.freeze(resolveArgs);
            var carried = this.form.carrier.call(this.ctx, resolveArgs);
            var resolvedNode;
            if (this.node != undefined) {
                var selection = this.form.selector.call(this.ctx, Object.keys(this.node), resolveArgs);
                resolvedNode = this.resolveNode(this.node, carried, selection);
            }
            var result = this.form.resolver.call(this.ctx, resolvedNode, resolveArgs);
            if (this.targeted) {
                var outresult = this.form.outputFunction.call(this.ctx, result);
                console.log("Output call back called on output", this.form.outputLabel);
                this.outputContext[this.outputCallback](outresult, this.form.outputLabel);
                this.targeted = false;
            }
            return result;
        };
        return ResolutionNode;
    }());
    Gentyl.ResolutionNode = ResolutionNode;
})(Gentyl || (Gentyl = {}));
var Gentyl;
(function (Gentyl) {
    var GForm = (function () {
        function GForm(formObj) {
            this.ctxmode = formObj.m || "";
            this.carrier = formObj.c || Gentyl.Util.identity;
            this.resolver = formObj.f || Gentyl.Util.identity;
            this.selector = formObj.s || function (keys, carg) { return true; };
            this.preparator = formObj.p || function (x) { };
            this.inputLabel = formObj.il;
            this.outputLabel = formObj.ol;
            this.inputFunction = formObj.i || Gentyl.Util.identity;
            this.outputFunction = formObj.o || Gentyl.Util.identity;
            this.targeting = formObj.t;
            this.contextLabel = formObj.cl;
        }
        GForm.prototype.extract = function () {
            return {
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
            };
        };
        return GForm;
    }());
    Gentyl.GForm = GForm;
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
            f: fromNode.form.resolver,
            c: fromNode.form.carrier,
            m: fromNode.form.ctxmode
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
            _super.call(this, node, form, state);
        }
        return Reconstruction;
    }(Gentyl.ResolutionNode));
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
var Gentyl;
(function (Gentyl) {
    var IO;
    (function (IO) {
        IO.ioShellDefault = {
            setup: function (label) {
            },
            dispatch: function (output, label) {
            }
        };
        function setDefaultShell(shellConstructor) {
            Gentyl.IO.ioShellDefault = {
                setup: shellConstructor,
                dispatch: undefined
            };
        }
        IO.setDefaultShell = setDefaultShell;
        function setDefaultDispatchFunction(dispatchF) {
            Gentyl.IO.ioShellDefault = {
                setup: function (label) { return dispatchF; },
                dispatch: undefined
            };
        }
        IO.setDefaultDispatchFunction = setDefaultDispatchFunction;
        function setDefaultDispatchObject(object, method) {
            var ctxconstructor;
            var cb;
            var error;
            if (object instanceof Function) {
                ctxconstructor = object;
            }
            else if (object instanceof Object) {
                ctxconstructor = function () { return object; };
            }
            else {
                error = 'object must be Object or Function';
            }
            if (error) {
                throw new Error(error);
            }
            Gentyl.IO.ioShellDefault = {
                setup: ctxconstructor,
                dispatch: method
            };
        }
        IO.setDefaultDispatchObject = setDefaultDispatchObject;
    })(IO = Gentyl.IO || (Gentyl.IO = {}));
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
