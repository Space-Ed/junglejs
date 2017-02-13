var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Jungle;
(function (Jungle) {
    function G(components, form) {
        return new Jungle.ResolutionCell(components, form);
    }
    Jungle.G = G;
    function F(func, components) {
        return new Jungle.ResolutionCell(components, { r: func });
    }
    Jungle.F = F;
    function R(reconstructionBundle) {
        return new Jungle.Reconstruction(reconstructionBundle);
    }
    Jungle.R = R;
    function T(type) {
        return new Jungle.Terminal(type);
    }
    Jungle.T = T;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Actions;
    (function (Actions) {
        var Component = (function () {
            function Component(host) {
                this.host = host;
            }
            Component.prototype.add = function (keyOrVal, val) {
                this.host.inductComponent(val);
                var al = arguments.length;
                var ins = null;
                if (!(al === 1 || al === 2)) {
                    throw Error("Requires 1 or 2 arguments");
                }
                else if (al === 1) {
                    if (this.host.crown instanceof Array) {
                        ins = this.host.crown.length;
                        this.host.crown.push(val);
                    }
                    else if (Jungle.Util.isVanillaObject(this.host.crown)) {
                        throw Error("Requires key and value to add to object crown");
                    }
                    else if (this.host.crown instanceof Jungle.Terminal) {
                        if (this.host.crown.check(val)) {
                            this.host.crown = val;
                        }
                    }
                    else {
                        throw Error("Unable to clobber existing value");
                    }
                }
                else {
                    if (Jungle.Util.isVanillaObject(this.host.crown)) {
                        ins = keyOrVal;
                        this.host.crown[keyOrVal] = val;
                    }
                    else {
                        throw Error("Requires single arg for non object crown");
                    }
                }
            };
            return Component;
        }());
        Actions.Component = Component;
    })(Actions = Jungle.Actions || (Jungle.Actions = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    (function (ASSOCMODE) {
        ASSOCMODE[ASSOCMODE["INHERIT"] = 0] = "INHERIT";
        ASSOCMODE[ASSOCMODE["SHARE"] = 1] = "SHARE";
        ASSOCMODE[ASSOCMODE["TRACK"] = 2] = "TRACK";
    })(Jungle.ASSOCMODE || (Jungle.ASSOCMODE = {}));
    var ASSOCMODE = Jungle.ASSOCMODE;
    (function (CTXPropertyTypes) {
        CTXPropertyTypes[CTXPropertyTypes["NORMAL"] = 0] = "NORMAL";
        CTXPropertyTypes[CTXPropertyTypes["BOUND"] = 1] = "BOUND";
        CTXPropertyTypes[CTXPropertyTypes["HOOK"] = 2] = "HOOK";
    })(Jungle.CTXPropertyTypes || (Jungle.CTXPropertyTypes = {}));
    var CTXPropertyTypes = Jungle.CTXPropertyTypes;
    var GContext = (function () {
        function GContext(host, contextspec) {
            this.host = host;
            var properties = contextspec.properties, declaration = contextspec.declaration;
            this.declaration = declaration;
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
            });
            this.originals = {};
            this.cache = {};
            this.closed = false;
            this.label = "";
            this.nominal = false;
            this.path = [];
            this.exposed = { path: this.path };
            properties.forEach(function (value, index) {
                this.addInternalProperty(value);
            }, this);
        }
        GContext.prototype.addInternalProperty = function (spec) {
            switch (spec.type) {
                case CTXPropertyTypes.NORMAL:
                    this.addExposedProperty(spec.key, spec.value);
                    break;
                case CTXPropertyTypes.BOUND:
                    this.addExposedProperty(spec.key, spec.value.bind(this.exposed));
                    break;
                case CTXPropertyTypes.HOOK: this.addHookedProperty(spec);
            }
        };
        GContext.prototype.addHookedProperty = function (spec) {
            this.originals[spec.key] = spec;
            this.cache[spec.key] = spec.value;
            if (spec.reference instanceof Array) {
                this.addThroughProperty(spec);
            }
            else {
                var href = spec.reference;
                if (href.orientation === Jungle.IO.Orientation.INPUT) {
                    this.addInputProperty(spec);
                }
                else {
                    this.addOutputProperty(spec);
                }
            }
            this.addExposedProperty(spec.key, spec.value);
        };
        GContext.prototype.addThroughProperty = function (spec) {
            var ospec = { type: spec.type, key: spec.key, value: spec.value, reference: spec.reference[1], original: spec.original };
            spec.reference = spec.reference[0];
            this.addInputProperty(spec);
            this.addOutputProperty(ospec);
        };
        GContext.prototype.addInputProperty = function (spec) {
            spec.reference.reactiveValue = true;
            spec.reference.tractor = (function (inp) {
                this.exposed[spec.key] = inp;
                if (spec.reference.eager && this.cache[spec.key] !== inp) {
                    this.cache[spec.key] = inp;
                }
                else {
                    return Jungle.IO.HALT;
                }
            }).bind(this);
        };
        GContext.prototype.addOutputProperty = function (spec) {
            spec.reference.reactiveValue = true;
            spec.reference.tractor = (function (output) {
                var current = this.exposed[spec.key];
                if (spec.reference.eager || this.cache[spec.key] !== current) {
                    this.cache[spec.key] = current;
                    return current;
                }
                else {
                    return Jungle.IO.HALT;
                }
            }).bind(this);
        };
        GContext.prototype.prepare = function () {
            var layers = this.parseMode(this.declaration);
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
            var patch = {};
            for (var k in this.internalProperties) {
                var v = this.internalProperties[k];
                if (k in this.originals) {
                    var orig = this.originals[k];
                    patch[orig.original || orig.key] = orig.value;
                }
                else {
                    patch[k] = Jungle.Util.deepCopy(v);
                }
            }
            return patch;
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
                for (var i = 0; i < uses.length; i += 1) {
                    var layer = { mode: ASSOCMODE.SHARE, source: null };
                    var sourceKey = uses[i];
                    layer.source = this.host.getNominal(sourceKey).ctx;
                    layers.push(layer);
                }
            }
            return layers;
        };
        GContext.prototype.addExposedProperty = function (name, defaultValue) {
            this.internalProperties[name] = defaultValue;
            this.propertyLayerMap[name] = { source: this, mode: ASSOCMODE.SHARE };
            Object.defineProperty(this.exposed, name, {
                set: this.setItem.bind(this, name),
                get: this.getItem.bind(this, name),
                enumerable: true,
                configurable: true
            });
        };
        GContext.prototype.removeExposedProperty = function (name) {
            delete this.internalProperties[name];
            delete this.propertyLayerMap[name];
            delete this.exposed[name];
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
                this.addExposedProperty(prop, propVal);
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
                    Object.defineProperty(this.exposed, prop, {
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
    Jungle.GContext = GContext;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var BaseCell = (function () {
        function BaseCell(components, form) {
            if (form === void 0) { form = {}; }
            this.async = false;
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.engaged = false;
            this.form = this.constructForm();
            var _a = this.form.parse(form), iospec = _a.iospec, contextspec = _a.contextspec;
            this.ctx = this.constructContext(contextspec);
            this.io = this.constructIO(iospec);
            this.act = this.constructActions();
            var inductor = this.inductComponent.bind(this);
            this.crown = Jungle.Util.typeCaseSplitF(inductor, inductor, null)(components);
        }
        BaseCell.prototype.constructForm = function () {
            return new Jungle.BaseForm(this);
        };
        BaseCell.prototype.constructIO = function (iospec) {
            return new Jungle.IO.BaseIO();
        };
        BaseCell.prototype.constructContext = function (contextspec) {
            return new Jungle.GContext(this, contextspec);
        };
        BaseCell.prototype.constructActions = function () {
            return new Jungle.Actions.Component(this);
        };
        BaseCell.prototype.constructCore = function (crown, form) {
            return new BaseCell(crown, form);
        };
        BaseCell.prototype.inductComponent = function (component) {
            var c;
            if (component instanceof BaseCell) {
                c = component;
            }
            else if (component instanceof Object) {
                c = new Jungle.ResolutionCell(component);
            }
            else {
                c = component;
            }
            return c;
        };
        BaseCell.prototype.prepare = function (prepargs) {
            if (prepargs === void 0) { prepargs = null; }
            this.deplexer = new Jungle.IO.GatedPort('prepare', this, this.complete);
            this.ctx.exposed.gate = this.deplexer.gate;
            this.engaged = true;
            if (this.isAncestor) {
                throw Error("Ancestors cannot be prepared for resolution");
            }
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;
            if (!this.prepared) {
                this.ctx.prepare();
                this.form.preparator.call(this.ctx.exposed, prepargs);
                this.io.prepare(prepargs);
                this.crown = Jungle.Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.crown);
                if (this.async) {
                    if (this.deplexer.allHome()) {
                        this.complete();
                    }
                    return this.deplexer;
                }
                else {
                    if (!this.deplexer.allHome()) {
                        return this.deplexer;
                    }
                    return this.complete();
                }
            }
            else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }
        };
        BaseCell.prototype.complete = function () {
            this.deplexer.deposit = this;
            this.deplexer.returned = true;
            this.engaged = false;
            this.prepared = true;
            if (this.isRoot) {
                this.enshell();
            }
            return this;
        };
        BaseCell.prototype.prepareChild = function (prepargs, child, k) {
            if (child instanceof BaseCell) {
                var replica = child.replicate();
                replica.setParent(this, k);
                replica = replica.prepare(prepargs);
                if (replica instanceof Jungle.IO.GatedPort) {
                    if (!replica.returned) {
                        this.deplexer.addTributary(replica);
                    }
                    return replica.host;
                }
                else {
                    return replica;
                }
            }
            else {
                return child;
            }
        };
        BaseCell.prototype.setParent = function (parentCell, dereferent) {
            this.ctx.path = parentCell.ctx.path.concat(dereferent);
            this.parent = parentCell;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        };
        BaseCell.prototype.replicate = function () {
            if (this.prepared) {
                return this.ancestor.replicate();
            }
            else {
                var repl = this.constructCore(this.crown, this.form.consolidate(this.io, this.ctx));
                repl.async = this.async;
                if (this.isAncestor) {
                    repl.ancestor = this;
                }
                return repl;
            }
        };
        BaseCell.prototype.getParent = function (toDepth) {
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
        BaseCell.prototype.getRoot = function () {
            return this.isRoot ? this : this.getParent().getRoot();
        };
        BaseCell.prototype.getNominal = function (label) {
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
        BaseCell.prototype.terminalScan = function (recursive, collection, locale) {
            if (recursive === void 0) { recursive = false; }
            if (collection === void 0) { collection = []; }
            if (locale === void 0) { locale = null; }
            var locale = locale || this;
            Jungle.Util.typeCaseSplitF(function (thing, dereferent) {
                if (thing instanceof Jungle.Terminal) {
                    collection.push({ node: locale, term: thing, deref: dereferent });
                }
                else if (recursive && thing instanceof BaseCell) {
                    thing.terminalScan(true, collection, locale = thing);
                }
            })(this.crown);
            return collection;
        };
        BaseCell.prototype.checkComplete = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            var result = true;
            Jungle.Util.typeCaseSplitF(function (thing) {
                if (thing instanceof Jungle.Terminal) {
                    result = false;
                }
                else if (recursive && thing instanceof BaseCell) {
                    thing.checkComplete(true);
                }
            })(this.crown);
            return result;
        };
        BaseCell.prototype.bundle = function () {
            function bundler(node) {
                if (node instanceof BaseCell) {
                    var product = node.bundle();
                    return product;
                }
                else {
                    return node;
                }
            }
            var recurrentCellBundle = Jungle.Util.typeCaseSplitF(bundler, bundler, null)(this.crown);
            var product = {
                node: recurrentCellBundle,
                form: Jungle.deformulate(this),
                state: this.ctx.extract()
            };
            return product;
        };
        BaseCell.prototype.enshell = function () {
            this.io.enshell();
            return this;
        };
        BaseCell.prototype.resolve = function (arg) {
            if (!this.prepared) {
                if (this.engaged) {
                }
                this.prepare();
            }
            return null;
        };
        return BaseCell;
    }());
    Jungle.BaseCell = BaseCell;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var BaseForm = (function () {
        function BaseForm(host) {
            this.host = host;
        }
        BaseForm.prototype.parse = function (formObj) {
            var ctxdeclare = formObj.x || "";
            this.preparator = formObj.p || function (x) { };
            this.preparator = formObj.p || function (x) { };
            var contextprops = [];
            var linkPropRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
            for (var k in formObj) {
                if (Jungle.GForm.RFormProps.indexOf(k) > -1)
                    continue;
                if (k.match(linkPropRegex)) {
                    contextprops.push({ key: k, type: Jungle.CTXPropertyTypes.NORMAL, value: formObj[k] });
                }
                else {
                    throw new Error("Invalid property for link context, use ports");
                }
            }
            return { iospec: null, contextspec: { properties: contextprops, declaration: ctxdeclare } };
        };
        BaseForm.prototype.consolidate = function (io, ctx) {
            return Jungle.Util.melder({
                p: this.preparator,
                d: this.depreparator,
                x: ctx.declaration,
            }, ctx.extract());
        };
        return BaseForm;
    }());
    Jungle.BaseForm = BaseForm;
    var LForm = (function (_super) {
        __extends(LForm, _super);
        function LForm() {
            _super.apply(this, arguments);
        }
        LForm.prototype.parse = function (formObj) {
            var ctxdeclare = formObj.x || "";
            this.preparator = formObj.p || function (x) { };
            var links = formObj.links || [];
            var linkf = formObj.lf || function (a, b) { };
            var ports = formObj.ports || [];
            var context = {};
            var specialInHook;
            var specialOutHook;
            var portlabels = {};
            var labels = {};
            var contextprops = [];
            var linkPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/;
            for (var i = 0; i < ports.length; i++) {
                var pmatch = ports[i].match(linkPortRegex);
                if (pmatch) {
                    var inp = pmatch[1], label = pmatch[2], out = pmatch[3];
                    if (inp) {
                        portlabels[label] = { label: label, direction: Jungle.IO.Orientation.INPUT };
                    }
                    if (out) {
                        portlabels[label] = { label: label, direction: Jungle.IO.Orientation.OUTPUT };
                    }
                }
            }
            var linkPropRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
            for (var k in formObj) {
                if (Jungle.GForm.RFormProps.indexOf(k) > -1)
                    continue;
                if (k.match(linkPropRegex)) {
                    contextprops.push({ key: k, type: Jungle.CTXPropertyTypes.NORMAL, value: formObj[k] });
                }
                else {
                    throw new Error("Invalid property for link context, use ports");
                }
            }
            return { iospec: { ports: portlabels, links: links, linkFunciton: linkf }, contextspec: { properties: contextprops, declaration: ctxdeclare } };
        };
        return LForm;
    }(BaseForm));
    Jungle.LForm = LForm;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        IO.HALT = {};
        Object.freeze(IO.HALT);
        function halting(arg) {
            return IO.HALT;
        }
        IO.halting = halting;
        function passing(arg) {
            return arg;
        }
        IO.passing = passing;
        function defined(arg) {
            return arg === undefined ? IO.HALT : arg;
        }
        IO.defined = defined;
        function always(arg) {
            return true;
        }
        IO.always = always;
        function nothing(arg) {
            return undefined;
        }
        IO.nothing = nothing;
        function host(arg) {
            return this.host;
        }
        IO.host = host;
        (function (Orientation) {
            Orientation[Orientation["INPUT"] = 0] = "INPUT";
            Orientation[Orientation["OUTPUT"] = 1] = "OUTPUT";
            Orientation[Orientation["NEUTRAL"] = 2] = "NEUTRAL";
            Orientation[Orientation["MIXED"] = 3] = "MIXED";
        })(IO.Orientation || (IO.Orientation = {}));
        var Orientation = IO.Orientation;
        (function (DesignationTypes) {
            DesignationTypes[DesignationTypes["ALL"] = 0] = "ALL";
            DesignationTypes[DesignationTypes["MATCH"] = 1] = "MATCH";
            DesignationTypes[DesignationTypes["REGEX"] = 2] = "REGEX";
            DesignationTypes[DesignationTypes["FUNC"] = 3] = "FUNC";
        })(IO.DesignationTypes || (IO.DesignationTypes = {}));
        var DesignationTypes = IO.DesignationTypes;
        var BaseIO = (function () {
            function BaseIO() {
            }
            BaseIO.prototype.prepare = function () {
            };
            BaseIO.prototype.dress = function (designation, coat) {
            };
            BaseIO.prototype.enshell = function () {
                return this.shell;
            };
            BaseIO.prototype.extract = function () {
                return {};
            };
            return BaseIO;
        }());
        IO.BaseIO = BaseIO;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        var Port = (function () {
            function Port(label) {
                this.label = label;
                this.shells = [];
            }
            Port.prototype.addShell = function (shell) {
                this.shells.push(shell);
            };
            Port.prototype.designate = function (designator) {
                switch (designator.type) {
                    case IO.DesignationTypes.ALL: {
                        return true;
                    }
                    case IO.DesignationTypes.REGEX: {
                        return this.label.match(designator.data);
                    }
                    case IO.DesignationTypes.FUNC: {
                        return designator.data(this);
                    }
                    default:
                        return false;
                }
            };
            Port.prototype.dress = function (coat) {
                this.prepareContext(coat.context);
                this.prepareCallback(coat.callback);
            };
            Port.prototype.prepareCallback = function (callback) {
                if (!(typeof (callback) == 'string' || typeof (callback) == 'function')) {
                    throw new Error('Callback must be method name or');
                }
                this.callback = callback;
            };
            Port.prototype.prepareContext = function (outputContext) {
                if (typeof (outputContext) == 'function') {
                    this.callbackContext = new outputContext(this);
                }
                else if (outputContext instanceof Object) {
                    this.callbackContext = outputContext;
                }
                else {
                    throw Error("Invalid context fabrication, must be object or contructor");
                }
            };
            Port.prototype.handle = function (input) {
                if (this.callback) {
                    if (this.callbackContext) {
                        if (typeof (this.callback) == 'string') {
                            var method = this.callbackContext[this.callback];
                            if (method === undefined) {
                                throw new Error("method must be accessible in provided context");
                            }
                            method.call(this.callbackContext, input);
                        }
                        else {
                            this.callback.call(this.callbackContext, input);
                        }
                    }
                    else {
                        if (typeof (this.callback) == 'string') {
                            throw new Error("method name can only be given with context");
                        }
                        this.callback.call(null, input);
                    }
                }
            };
            return Port;
        }());
        IO.Port = Port;
        var GatedPort = (function (_super) {
            __extends(GatedPort, _super);
            function GatedPort(label, host, complete) {
                _super.call(this, label);
                this.host = host;
                this.complete = complete;
                this.gate = new Jungle.Util.Gate(this.handle, this);
                this.returned = false;
            }
            GatedPort.prototype.addTributary = function (tributary) {
                var unlock = this.gate.lock();
                tributary.callback = unlock;
            };
            GatedPort.prototype.handle = function (input) {
                this.complete.call(this.host, input);
                this.returned = true;
                _super.prototype.handle.call(this, this.deposit);
            };
            GatedPort.prototype.allHome = function () {
                return this.gate.allUnlocked();
            };
            GatedPort.prototype.reset = function (label, completer) {
                this.label = label;
                this.complete = completer;
                this.callbackContext = undefined;
                this.callback = undefined;
                this.returned = false;
                this.deposit = undefined;
                this.gate.reset();
            };
            return GatedPort;
        }(Port));
        IO.GatedPort = GatedPort;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Inv;
    (function (Inv) {
        function retract(obj, arg) {
            return arg;
        }
        Inv.retract = retract;
    })(Inv = Jungle.Inv || (Jungle.Inv = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Inv;
    (function (Inv) {
        function selectNone() {
            return [];
        }
        Inv.selectNone = selectNone;
    })(Inv = Jungle.Inv || (Jungle.Inv = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Inv;
    (function (Inv) {
        function pass(x) {
            return x;
        }
        Inv.pass = pass;
        function abstain(x) {
        }
        Inv.abstain = abstain;
    })(Inv = Jungle.Inv || (Jungle.Inv = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var LinkCell = (function (_super) {
        __extends(LinkCell, _super);
        function LinkCell(crown, formspec) {
            _super.call(this, crown, formspec);
        }
        LinkCell.prototype.constructIO = function (iospec) {
            return new Jungle.IO.LinkIO();
        };
        LinkCell.prototype.prepareChild = function (prepargs, child, k) {
            var pchild = _super.prototype.prepareChild.call(this, prepargs, child, k);
            pchild.enshell();
            return pchild;
        };
        return LinkCell;
    }(Jungle.BaseCell));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        var LinkIO = (function () {
            function LinkIO() {
            }
            LinkIO.prototype.enshell = function () {
                return this.shell;
            };
            ;
            LinkIO.prototype.dress = function (designator, coat) {
            };
            LinkIO.prototype.prepare = function (parg) {
            };
            ;
            LinkIO.prototype.extract = function () {
            };
            return LinkIO;
        }());
        IO.LinkIO = LinkIO;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
(function () {
    var root = this;
    var define = define || undefined;
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Jungle;
        }
        exports.Jungle = Jungle;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define('Jungle', (function () { return root.Jungle = Jungle; })());
    }
    else {
        root.Jungle = Jungle;
    }
}).call(this);
var Jungle;
(function (Jungle) {
    function isBundle(object) {
        return object instanceof Object && "form" in object && "state" in object && "node" in object;
    }
    Jungle.isBundle = isBundle;
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
    function deformulate(fromCell) {
        var rCell = fromCell;
        var preform = {
            r: rCell.form.resolver,
            c: rCell.form.carrier,
            x: rCell.ctx.declaration
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
    Jungle.deformulate = deformulate;
    function reformulate(formRef) {
        var recovered = {};
        for (var k in formRef) {
            recovered[k] = liveCache.recoverFunction(formRef[k]);
        }
        return recovered;
    }
    Jungle.reformulate = reformulate;
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
            var node = Jungle.Util.typeCaseSplitF(debundle)(bundle.node);
            var form = Jungle.reformulate(bundle.form);
            var state = bundle.state;
            _super.call(this, node, Jungle.Util.melder(form, state));
        }
        return Reconstruction;
    }(Jungle.BaseCell));
    Jungle.Reconstruction = Reconstruction;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    function cleanCrown(crown) {
        function clean(gem) {
            if (gem instanceof Jungle.IO.GatedPort) {
                if (!gem.allHome()) {
                    throw Error("Crown still contains unreturned ");
                }
                return gem.deposit;
            }
            else {
                return gem;
            }
        }
        return Jungle.Util.typeCaseSplitF(clean)(crown);
    }
    var ResolutionCell = (function (_super) {
        __extends(ResolutionCell, _super);
        function ResolutionCell() {
            _super.apply(this, arguments);
        }
        ResolutionCell.prototype.constructForm = function () {
            return new Jungle.GForm(this);
        };
        ResolutionCell.prototype.constructIO = function (iospec) {
            return new Jungle.IO.ResolveIO(this, iospec);
        };
        ResolutionCell.prototype.constructCore = function (crown, form) {
            return new ResolutionCell(crown, form);
        };
        ResolutionCell.prototype.resolveArray = function (array, resolveArgs, selection) {
            if (selection instanceof Array) {
                var resolution = [];
                for (var i = 0; i < selection.length; i++) {
                    resolution[i] = this.resolveCell(array[selection[i]], resolveArgs, true);
                }
                return resolution;
            }
            else {
                return this.resolveCell(array[selection], resolveArgs, true);
            }
        };
        ResolutionCell.prototype.resolveObject = function (node, resolveArgs, selection) {
            var resolution;
            if (selection instanceof Array) {
                resolution = {};
                for (var i = 0; i < selection.length; i++) {
                    var k = selection[i];
                    resolution[k] = this.resolveCell(node[k], resolveArgs, true);
                }
            }
            else {
                resolution = this.resolveCell(node[selection], resolveArgs, true);
            }
            return resolution;
        };
        ResolutionCell.prototype.resolveCell = function (node, resolveArgs, selection) {
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
                if (node instanceof Jungle.BaseCell) {
                    if (!cut) {
                        var resolved = node.resolve(resolveArgs);
                        if (resolved instanceof Jungle.IO.GatedPort) {
                            if (!resolved.returned) {
                                this.deplexer.addTributary(resolved);
                            }
                            return this.deplexer;
                        }
                        return resolved;
                    }
                }
                else {
                    return cut ? {} : this.resolveObject(node, resolveArgs, selection);
                }
            }
            else {
                return cut ? null : node;
            }
        };
        ResolutionCell.prototype.proceed = function (received) {
            switch (this.resolveCache.stage) {
                case 'resolve-carry': {
                    this.resolveCache.carried = received;
                    this.resolveSelect();
                    break;
                }
                case 'resolve-select': {
                    this.resolveCache.selection = received;
                    this.resolveCrown();
                    break;
                }
                case 'resolve-crown': {
                    this.resolveCache.resolvedCrown = cleanCrown(this.resolveCache.resolvedCrown);
                    this.resolveReturn();
                    break;
                }
                case 'resolve-return': {
                    this.resolveCache.resolvedValue = received;
                    this.resolveComplete();
                    break;
                }
            }
        };
        ResolutionCell.prototype.resolve = function (resolveArgs) {
            Object.freeze(resolveArgs);
            if (!this.prepared) {
                var pr = this.prepare();
                if (pr instanceof Jungle.IO.GatedPort) {
                    return pr;
                }
            }
            if (this.io.isShellBase && !this.io.specialGate) {
                var sInpHook = this.io.specialInput;
                var sInpResult = sInpHook.tractor.call(this.ctx.exposed, resolveArgs);
                var sResult;
                if (sInpResult != Jungle.IO.HALT && (sInpHook.eager || sInpResult !== undefined)) {
                    this.io.specialGate = true;
                    sResult = this.resolve(sInpResult);
                    this.io.specialGate = false;
                    return sResult;
                }
                else {
                    return this.io.specialOutput.tractor.call(this.ctx.exposed, sInpResult);
                }
            }
            else {
                this.resolveCache = {
                    stage: 'resolve-carry',
                    resolveArgs: resolveArgs,
                    carried: undefined,
                    selection: undefined,
                    resolvedCrown: undefined,
                    resolvedValue: undefined
                };
                this.deplexer.reset("resolve", this.proceed);
                this.engaged = true;
                var carried = this.form.carrier.call(this.ctx.exposed, resolveArgs);
                if (this.deplexer.allHome()) {
                    this.resolveCache.carried = carried;
                    return this.resolveSelect();
                }
                else {
                    return this.deplexer;
                }
            }
        };
        ResolutionCell.prototype.resolveSelect = function () {
            this.resolveCache.stage = 'resolve-select';
            var resolvedCell;
            if (this.crown != undefined) {
                var selection = this.form.selector.call(this.ctx.exposed, Object.keys(this.crown), this.resolveCache.resolveArgs);
                if (this.deplexer.allHome()) {
                    this.resolveCache.selection = selection;
                    return this.resolveCrown();
                }
                else {
                    return this.deplexer;
                }
            }
            else {
                return this.resolveReturn();
            }
        };
        ResolutionCell.prototype.resolveCrown = function () {
            this.resolveCache.stage = 'resolve-crown';
            var resolvedCrown = this.resolveCell(this.crown, this.resolveCache.carried, this.resolveCache.selection);
            this.resolveCache.resolvedCrown = resolvedCrown;
            if (this.deplexer.allHome()) {
                this.resolveCache.resolvedCrown = cleanCrown(resolvedCrown);
                return this.resolveReturn();
            }
            else {
                return this.deplexer;
            }
        };
        ResolutionCell.prototype.resolveReturn = function () {
            this.resolveCache.stage = 'resolve-return';
            var result = this.form.resolver.call(this.ctx.exposed, this.resolveCache.resolvedCrown, this.resolveCache.resolveArgs, this.resolveCache.carried);
            if (this.deplexer.allHome()) {
                this.resolveCache.resolvedValue = result;
                return this.resolveComplete();
            }
            else {
                return this.deplexer;
            }
        };
        ResolutionCell.prototype.resolveComplete = function () {
            this.engaged = false;
            var dispached = this.io.dispatchResult(this.resolveCache.resolvedValue);
            this.deplexer.deposit = dispached;
            return dispached;
        };
        return ResolutionCell;
    }(Jungle.BaseCell));
    Jungle.ResolutionCell = ResolutionCell;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
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
    })(Jungle.LabelTypes || (Jungle.LabelTypes = {}));
    var LabelTypes = Jungle.LabelTypes;
    var TrigateLabelTypesMap = {
        '': { '': LabelTypes.PASSIVE, '_': LabelTypes.GATE, '__': LabelTypes.GATER },
        '_': { '': LabelTypes.TRIG, '_': LabelTypes.TRIGATE, '__': LabelTypes.TRIGATER },
        '__': { '': LabelTypes.ENTRIG, '_': LabelTypes.ENTRIGATE, '__': LabelTypes.ENTRIGATER }
    };
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
    var GForm = (function (_super) {
        __extends(GForm, _super);
        function GForm(host) {
            _super.call(this, host);
        }
        GForm.prototype.parse = function (formObj) {
            var ctxdeclare = formObj.x || "";
            this.carrier = formObj.c || Jungle.Util.identity;
            this.resolver = formObj.r || Jungle.Util.identity;
            this.selector = formObj.s || function (keys, carg) { return true; };
            this.preparator = formObj.p || function (x) { };
            var hookIORegex = /^(_{0,2})([a-zA-Z]+(?:\w*[a-zA-Z])?|\$)(_{0,2})$/;
            var hooks = [];
            var context = { properties: [], declaration: ctxdeclare };
            var props = context.properties;
            var specialInHook;
            var specialOutHook;
            var labels = {};
            for (var k in formObj) {
                var res = k.match(hookIORegex);
                if (res) {
                    var inp = res[1], label = res[2], out = res[3], formVal = formObj[k];
                    var labelType = TrigateLabelTypesMap[inp][out];
                    if (GForm.RFormProps.indexOf(label) >= 0) {
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
                            hook.orientation = Jungle.IO.Orientation.INPUT;
                            hook.eager = false;
                            specialInHook = hook;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            hook.orientation = Jungle.IO.Orientation.INPUT;
                            hook.eager = true;
                            specialInHook = hook;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            hook.orientation = Jungle.IO.Orientation.OUTPUT;
                            hook.eager = false;
                            specialOutHook = hook;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            hook.orientation = Jungle.IO.Orientation.OUTPUT;
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
                            props.push({ key: label, type: Jungle.CTXPropertyTypes.BOUND, value: formVal });
                            continue;
                        }
                        else if (labelType === LabelTypes.TRIG) {
                            hook.orientation = Jungle.IO.Orientation.INPUT, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            hook.orientation = Jungle.IO.Orientation.INPUT, hook.eager = true;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            hook.orientation = Jungle.IO.Orientation.OUTPUT, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            hook.orientation = Jungle.IO.Orientation.OUTPUT, hook.eager = true;
                        }
                        else if (labelType === LabelTypes.TRIGATE) {
                            hook.orientation = Jungle.IO.Orientation.MIXED, hook.eager = false;
                        }
                        else if (labelType === LabelTypes.TRIGATER) {
                            console.warn("This label configuration doesn't make sense for functions");
                        }
                        else if (labelType === LabelTypes.ENTRIGATE) {
                            console.warn("This label configuration doesn't make sense for functions");
                        }
                        else if (labelType === LabelTypes.ENTRIGATER) {
                            hook.orientation = Jungle.IO.Orientation.MIXED, hook.eager = true;
                        }
                        hooks.push(hook);
                    }
                    else if (Jungle.Util.isPrimative(formVal)) {
                        var hookI = { label: label, tractor: null, orientation: Jungle.IO.Orientation.INPUT, host: this.host, eager: undefined };
                        var hookO = { label: label, tractor: null, orientation: Jungle.IO.Orientation.OUTPUT, host: this.host, eager: true };
                        var I = false;
                        var O = false;
                        if (labelType === LabelTypes.PASSIVE) {
                            props.push({ type: Jungle.CTXPropertyTypes.NORMAL, key: label, value: formVal });
                            continue;
                        }
                        else if (labelType === LabelTypes.TRIG) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: hookI, original: k });
                            hookI.eager = false;
                            I = true;
                        }
                        else if (labelType === LabelTypes.ENTRIG) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: hookI, original: k });
                            hookI.eager = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.GATE) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: hookO, original: k });
                            hookO.eager = false;
                            O = true;
                        }
                        else if (labelType === LabelTypes.GATER) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: hookO, original: k });
                            hookO.eager = true;
                            O = true;
                        }
                        else if (labelType === LabelTypes.TRIGATE) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: [hookI, hookO], original: k });
                            hookI.eager = true;
                            hookO.eager = false;
                            O = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.TRIGATER) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: [hookI, hookO], original: k });
                            hookI.eager = true;
                            hookO.eager = true;
                            O = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.ENTRIGATE) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: [hookI, hookO], original: k });
                            hookI.eager = false;
                            hookO.eager = false;
                            O = true;
                            I = true;
                        }
                        else if (labelType === LabelTypes.ENTRIGATER) {
                            props.push({ type: Jungle.CTXPropertyTypes.HOOK, key: label, value: formVal, reference: [hookI, hookO], original: k });
                            hookI.eager = false;
                            hookO.eager = true;
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
                            props.push({ type: Jungle.CTXPropertyTypes.NORMAL, key: label, value: formVal });
                            continue;
                        }
                        throw new Error("Unsupported form value type label: " + label + ", label-type:" + labelType + ", value-type:" + typeof (formVal));
                    }
                }
                else {
                    throw new Error("Invalid label format, raw label:" + k + " must have up to two leading and trailing underscores");
                }
            }
            return { iospec: { hooks: hooks, specialIn: specialInHook, specialOut: specialOutHook }, contextspec: { properties: props, declaration: ctxdeclare } };
        };
        GForm.prototype.consolidate = function (io, ctx) {
            var consolidated = Jungle.Util.melder({
                r: this.resolver,
                c: this.carrier,
                p: this.preparator,
                d: this.depreparator,
                s: this.selector,
                x: ctx.declaration,
            }, Jungle.Util.melder(io.extract(), ctx.extract(), void 0, void 0, false));
            return consolidated;
        };
        GForm.RFormProps = ["x", "p", "d", "c", "r", "s", "prepare", "destroy", "carry", "resolve", "select"];
        return GForm;
    }(Jungle.BaseForm));
    Jungle.GForm = GForm;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        function orientationChange(child, node) {
            if (child === IO.Orientation.OUTPUT && node === IO.Orientation.INPUT) {
                return IO.Orientation.INPUT;
            }
            else if (child === IO.Orientation.INPUT && node === IO.Orientation.OUTPUT) {
                return IO.Orientation.OUTPUT;
            }
            else if (node === IO.Orientation.MIXED) { }
        }
        function orientationConflict(child1, child2) {
            return (child1 === IO.Orientation.OUTPUT && child2 === IO.Orientation.INPUT)
                || (child1 === IO.Orientation.INPUT && child2 === IO.Orientation.OUTPUT);
        }
        var ResolveIO = (function () {
            function ResolveIO(host, iospec) {
                this.host = host;
                var hooks = iospec.hooks, specialIn = iospec.specialIn, specialOut = iospec.specialOut;
                this.isShellBase = false;
                this.specialGate = false;
                this.orientation = IO.Orientation.NEUTRAL;
                this.inputs = {};
                this.outputs = {};
                this.initialiseHooks(hooks, specialIn, specialOut);
            }
            ResolveIO.prototype.prepare = function () {
            };
            ResolveIO.prototype.extract = function () {
                var ext = {};
                var hook;
                for (var _i = 0, _a = this.hooks; _i < _a.length; _i++) {
                    hook = _a[_i];
                    var scores = hook.eager ? '__' : '_';
                    var isinp = hook.orientation == IO.Orientation.INPUT || hook.orientation == IO.Orientation.MIXED;
                    var isout = hook.orientation == IO.Orientation.OUTPUT || hook.orientation == IO.Orientation.MIXED;
                    var label = (isinp ? scores : '') + hook.label + (isout ? scores : '');
                    if (!hook.reactiveValue) {
                        ext[label] = hook.tractor;
                    }
                }
                return ext;
            };
            ResolveIO.prototype.initialiseHooks = function (hooks, specialIn, specialOut) {
                this.hooks = [];
                this.specialInput = specialIn;
                this.specialOutput = specialOut;
                this.inputHooks = {};
                this.outputHooks = {};
                for (var _i = 0, hooks_1 = hooks; _i < hooks_1.length; _i++) {
                    var hook = hooks_1[_i];
                    this.addHook(hook);
                }
            };
            ResolveIO.prototype.addHook = function (hook) {
                var label = hook.label, tractor = hook.tractor, orientation = hook.orientation;
                if (this.orientation == IO.Orientation.NEUTRAL) {
                    this.orientation = orientation;
                }
                else if (orientation != this.orientation) {
                    this.orientation = IO.Orientation.MIXED;
                }
                var label = label;
                if (orientation == IO.Orientation.INPUT) {
                    this.inputHooks[label] = hook;
                }
                else if (orientation == IO.Orientation.OUTPUT) {
                    this.outputHooks[label] = hook;
                }
                this.hooks.push(hook);
            };
            ResolveIO.prototype.enshell = function () {
                if (!this.host.prepared) {
                    throw new Error("unable to shell unprepared node");
                }
                this.reorient();
                this.isShellBase = true;
                this.collect();
                return this.shell;
            };
            ResolveIO.prototype.reorient = function () {
                var inverted = false;
                var upperOrientation;
                if (!Jungle.Util.isPrimative(child)) {
                    for (var _i = 0, _a = this.host.crown; _i < _a.length; _i++) {
                        var child = _a[_i];
                        if (child instanceof Jungle.ResolutionCell) {
                            child = child;
                            child.io.reorient();
                            var upo = child.io.orientation;
                            if (child.io.isShellBase && upo != IO.Orientation.NEUTRAL) {
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
                    upperOrientation = IO.Orientation.NEUTRAL;
                }
                if (orientationConflict(upperOrientation, this.orientation)) {
                    this.isShellBase = true;
                }
                if (this.orientation === IO.Orientation.MIXED) {
                    this.isShellBase = true;
                }
                if (this.orientation == IO.Orientation.NEUTRAL) {
                    this.orientation = upperOrientation;
                    this.isShellBase = false;
                }
            };
            ResolveIO.prototype.collect = function () {
                var accumulated = {
                    hooks: [].concat(this.hooks),
                    shells: []
                };
                var accumulator = function (child, k, accumulated) {
                    child = child;
                    var _a = child.io.collect(), hooks = _a.hooks, shells = _a.shells;
                    return { hooks: accumulated.hooks.concat(hooks), shells: accumulated.shells.concat(shells) };
                };
                if (!Jungle.Util.isVanillaObject(this.host.crown) && !Jungle.Util.isVanillaArray(this.host.crown)) {
                    if (this.host.crown instanceof Jungle.ResolutionCell) {
                        accumulated = accumulator(this.host.crown, null, accumulated);
                    }
                }
                else {
                    for (var k in this.host.crown) {
                        var child = this.host.crown[k];
                        if (child instanceof Jungle.ResolutionCell) {
                            child = child;
                            accumulated = accumulator(child, k, accumulated);
                        }
                        else if (child instanceof Jungle.BaseCell) {
                            child = child;
                            if (child.io.shell != undefined) {
                                accumulated.shells.push(child.io.shell);
                            }
                        }
                    }
                }
                if (this.isShellBase) {
                    this.specialInput = this.specialInput || { tractor: IO.passing, label: '$', host: this.host, orientation: IO.Orientation.INPUT, eager: true };
                    this.specialOutput = this.specialOutput || { tractor: IO.passing, label: '$', host: this.host, orientation: IO.Orientation.OUTPUT, eager: true };
                    this.shell = new IO.HookShell(this, accumulated.hooks, accumulated.shells);
                    var _loop_1 = function(k_1) {
                        this_1.inputs[k_1] = (function (input) {
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
                    return { hooks: accumulated.hooks, shells: accumulated.shells };
                }
            };
            ResolveIO.prototype.dress = function (designation, coat) {
                var designator = {
                    direction: IO.Orientation.OUTPUT,
                    type: IO.DesignationTypes.MATCH,
                    data: undefined,
                };
                if (typeof (designation) === 'string') {
                    if (designation === '*') {
                        designator.type = IO.DesignationTypes.ALL;
                    }
                    else {
                        designator.type = IO.DesignationTypes.REGEX;
                        designator.data = designation;
                    }
                }
                else {
                    throw new Error("Invalid Designator: string required");
                }
                this.shell.dress(designator, coat);
            };
            ResolveIO.prototype.dispatchResult = function (result) {
                var baseResult;
                for (var k in this.outputHooks) {
                    var hook = this.outputHooks[k];
                    var oresult = hook.tractor.call(this.host.ctx.exposed, result);
                    if ((oresult != IO.HALT && (hook.eager || oresult != undefined))) {
                        var port = this.base.shell.sources[k];
                        port.handle(oresult);
                    }
                }
                if (this.isShellBase) {
                    baseResult = this.specialOutput.tractor.call(this.specialOutput.host.ctx.exposed, result);
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
            return ResolveIO;
        }());
        IO.ResolveIO = ResolveIO;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
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
                    for (var _b = 0, hooks_2 = hooks; _b < hooks_2.length; _b++) {
                        var hook = hooks_2[_b];
                        var host = hook.host;
                        var iresult = hook.tractor.call(host.ctx.exposed, input);
                        inputGate = inputGate || (iresult != IO.HALT && (hook.eager || iresult !== undefined));
                        baseInput = baseInput.concat(iresult);
                    }
                    if (inputGate) {
                        shell.base.host.io.specialGate = true;
                        shell.base.host.resolve(baseInput);
                        shell.base.host.io.specialGate = false;
                    }
                }
            };
            return ResolveInputPort;
        }(IO.Port));
        IO.ResolveInputPort = ResolveInputPort;
        var SpecialInputPort = (function (_super) {
            __extends(SpecialInputPort, _super);
            function SpecialInputPort(base) {
                _super.call(this, '$');
                this.base = base;
            }
            SpecialInputPort.prototype.handleInput = function (input) {
                var hook = this.base.specialInput;
                var iresult = hook.tractor.call(this.base.host.ctx.exposed, input);
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
            function ResolveOutputPort(label) {
                _super.call(this, label);
            }
            ResolveOutputPort.prototype.handle = function (input) {
                _super.prototype.handle.call(this, input);
            };
            return ResolveOutputPort;
        }(IO.Port));
        IO.ResolveOutputPort = ResolveOutputPort;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        var HookShell = (function () {
            function HookShell(base, midrantHooks, subshells) {
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
                    this.sinks[label] = new IO.ResolveInputPort(label, this);
                }
                for (var label in this.outputHooks) {
                    this.sources[label] = new IO.ResolveOutputPort(label);
                }
                for (var _a = 0, subshells_1 = subshells; _a < subshells_1.length; _a++) {
                    var shell = subshells_1[_a];
                    this.addShell(shell);
                }
                this.sinks['$'] = new IO.SpecialInputPort(this.base);
                this.sources['$'] = new IO.ResolveOutputPort('$');
            }
            HookShell.prototype.addMidrantHook = function (hook) {
                hook.host.io.base = this.base;
                if (hook.orientation === IO.Orientation.INPUT) {
                    this.inputHooks[hook.label] = (this.inputHooks[hook.label] || []).concat(hook);
                }
                else if (hook.orientation === IO.Orientation.OUTPUT) {
                    this.outputHooks[hook.label] = (this.outputHooks[hook.label] || []).concat(hook);
                }
            };
            HookShell.prototype.addShell = function (shell) {
                for (var k in shell.sinks) {
                    var sink = shell.sinks[k];
                    if (sink.label in this.sinks) {
                        var outerSink = this.sinks[sink.label];
                        outerSink.addShell(this);
                        for (var _i = 0, _a = sink.shells; _i < _a.length; _i++) {
                            var shell_1 = _a[_i];
                            shell_1.sinks[sink.label] = outerSink;
                        }
                    }
                    else {
                        this.sinks[sink.label] = sink;
                    }
                }
                for (var k in shell.sources) {
                    var source = shell.sources[k];
                    if (source.label in this.sources) {
                        var outerSource = this.sources[source.label];
                        outerSource.addShell(this);
                        for (var _b = 0, _c = source.shells; _b < _c.length; _b++) {
                            var shell_2 = _c[_b];
                            shell_2.sources[source.label] = outerSource;
                        }
                    }
                    else {
                        this.sources[source.label] = source;
                    }
                }
            };
            HookShell.prototype.designate = function (designator) {
                var scanDomain;
                var designation = [];
                switch (designator.direction) {
                    case IO.Orientation.NEUTRAL: {
                        return [];
                    }
                    case IO.Orientation.INPUT: {
                        scanDomain = this.sinks;
                        break;
                    }
                    case IO.Orientation.OUTPUT: {
                        scanDomain = this.sources;
                        break;
                    }
                    case IO.Orientation.MIXED: {
                        scanDomain = Jungle.Util.collapseValues(this.sources).concat(Jungle.Util.collapseValues(this.sinks));
                        break;
                    }
                }
                for (var portlabel in scanDomain) {
                    var port = scanDomain[portlabel];
                    if (port.designate(designator)) {
                        designation.push(port);
                    }
                }
                return designation;
            };
            HookShell.prototype.dress = function (designator, coat) {
                designator.direction = IO.Orientation.OUTPUT;
                var designation = this.designate(designator);
                for (var k in designation) {
                    var outport = designation[k];
                    outport.dress(coat);
                }
            };
            return HookShell;
        }());
        IO.HookShell = HookShell;
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Terminal = (function () {
        function Terminal(type) {
            this.type = type;
        }
        Terminal.prototype.check = function (obj) {
            return true;
        };
        return Terminal;
    }());
    Jungle.Terminal = Terminal;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
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
        function melder(node1, node2, merge, concatArrays, typeConstrain) {
            if (merge === void 0) { merge = function (a, b) { return b; }; }
            if (concatArrays === void 0) { concatArrays = false; }
            if (typeConstrain === void 0) { typeConstrain = true; }
            if (node1 == undefined) {
                return node2;
            }
            if (node2 == undefined) {
                return node1;
            }
            if (typeConstrain && (typeof (node1) != typeof (node2))) {
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
            return thing == undefined || typeof (thing) !== 'object';
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
                else if (isVanillaObject(inThing)) {
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
        function collapseValues(obj) {
            if (!isVanillaTree(obj)) {
                throw new Error("cant collapse circular structure");
            }
            var valArr = [];
            function nodeProcess(node) {
                valArr.push(node);
            }
            function recursor(node) {
                typeCaseSplitF(recursor, recursor, nodeProcess)(node);
            }
            recursor(obj);
            return valArr;
        }
        Util.collapseValues = collapseValues;
        var Gate = (function () {
            function Gate(callback, context) {
                this.callback = callback;
                this.context = context;
                this.locks = [];
                this.locki = 0;
                this.data = [];
            }
            Gate.prototype.lock = function () {
                this.locks[this.locki] = true;
                return (function (locki, arg) {
                    if (arg != undefined) {
                        this.data = arg;
                    }
                    this.locks[locki] = false;
                    if (this.allUnlocked()) {
                        this.callback.call(this.context, this.data);
                    }
                }).bind(this, this.locki++);
            };
            Gate.prototype.reset = function () {
                this.locks = [];
                this.locki = 0;
            };
            Gate.prototype.allUnlocked = function () {
                return this.locks.filter(function (x) { return x; }).length === 0;
            };
            return Gate;
        }());
        Util.Gate = Gate;
    })(Util = Jungle.Util || (Jungle.Util = {}));
})(Jungle || (Jungle = {}));
