var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    function T(type) {
        return new Jungle.Terminal(type);
    }
    Jungle.T = T;
    function L(crown, form) {
        return new Jungle.LinkCell(crown, form);
    }
    Jungle.L = L;
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
    var ASSOCMODE;
    (function (ASSOCMODE) {
        ASSOCMODE[ASSOCMODE["INHERIT"] = 0] = "INHERIT";
        ASSOCMODE[ASSOCMODE["SHARE"] = 1] = "SHARE";
        ASSOCMODE[ASSOCMODE["TRACK"] = 2] = "TRACK";
    })(ASSOCMODE = Jungle.ASSOCMODE || (Jungle.ASSOCMODE = {}));
    var CTXPropertyTypes;
    (function (CTXPropertyTypes) {
        CTXPropertyTypes[CTXPropertyTypes["NORMAL"] = 0] = "NORMAL";
        CTXPropertyTypes[CTXPropertyTypes["BOUND"] = 1] = "BOUND";
        CTXPropertyTypes[CTXPropertyTypes["HOOK"] = 2] = "HOOK";
    })(CTXPropertyTypes = Jungle.CTXPropertyTypes || (Jungle.CTXPropertyTypes = {}));
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
                    this.addExposedProperty(spec.key, spec.value);
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
            patch['x'] = this.declaration;
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
            this.kind = "Base";
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.junction = new Jungle.Util.Junction();
            this.inp = {};
            this.out = {};
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
            return new Jungle.IO.BaseIO(this, iospec);
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
            var _this = this;
            if (prepargs === void 0) { prepargs = null; }
            if (this.isAncestor) {
                throw Error("Ancestors cannot be prepared for resolution");
            }
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;
            if (!this.prepared) {
                this.ctx.prepare();
                this.junction = this.junction
                    .then(function (results, handle) {
                    _this.ctx.exposed.handle = handle;
                    _this.form.preparator.call(_this.ctx.exposed, prepargs);
                }).then(function (results, handle) {
                    Jungle.Util.typeCaseSplitF(function (child, k) { return _this.prepareChild(prepargs, handle, child, k); })(_this.crown);
                }, false).then(function (results, handle) {
                    _this.crown = results;
                    _this.completePrepare();
                    return _this;
                }, false);
                return this.junction.realize();
            }
            else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
                return this;
            }
        };
        BaseCell.prototype.completePrepare = function () {
            this.prepared = true;
            if (this.isRoot) {
                this.enshell();
            }
        };
        BaseCell.prototype.prepareChild = function (prepargs, handle, child, k) {
            var mergekey = k === undefined ? false : k;
            if (child instanceof BaseCell) {
                var replica = child.replicate();
                replica.setParent(this, k);
                var arg = (k in Object(prepargs)) ? prepargs[k] : prepargs;
                var prepared = replica.prepare(arg);
                handle.merge(prepared, mergekey);
            }
            else {
                handle.merge(child, mergekey);
            }
        };
        BaseCell.prototype.setParent = function (parentCell, dereferent) {
            this.ctx.exposed.path = parentCell.ctx.exposed.path.concat(dereferent);
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
            var recurrentCellBundle = Jungle.Util.typeCaseSplitF(bundler)(this.crown);
            var product = {
                core: this.kind,
                crown: recurrentCellBundle,
                form: this.form.consolidate(this.io, this.ctx)
            };
            return product;
        };
        BaseCell.prototype.enshell = function () {
            this.io.enshell();
            return this;
        };
        BaseCell.prototype.resolve = function (arg) {
            return null;
        };
        BaseCell.prototype.X = function (crown, form) {
            var deconstruction = this.bundle();
            return Jungle.R(Jungle.Util.melder(deconstruction, { crown: crown, form: form, core: this.kind }));
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
            var propertyRegex = /^[a-zA-Z](?:\w*[a-zA-Z])?$/;
            for (var k in formObj) {
                if (Jungle.GForm.RFormProps.indexOf(k) > -1)
                    continue;
                if (k.match(propertyRegex)) {
                    contextprops.push({ key: k, type: Jungle.CTXPropertyTypes.NORMAL, value: formObj[k] });
                }
                else {
                    throw new Error("Invalid property name for context");
                }
            }
            return { iospec: null, contextspec: { properties: contextprops, declaration: ctxdeclare } };
        };
        BaseForm.prototype.parsePorts = function (portNames) {
            var portDescriptors = [];
            var linkPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/;
            for (var i = 0; i < portNames.length; i++) {
                var pmatch = portNames[i].match(linkPortRegex);
                if (pmatch) {
                    var inp = pmatch[1], label = pmatch[2], out = pmatch[3];
                    if (inp) {
                        portDescriptors.push({ label: label, direction: Jungle.IO.Orientation.INPUT });
                    }
                    if (out) {
                        portDescriptors.push({ label: label, direction: Jungle.IO.Orientation.OUTPUT });
                    }
                }
                else {
                    throw new Error("Invalid property label in Link Cell");
                }
            }
            return portDescriptors;
        };
        BaseForm.prototype.extract = function () {
            return {
                p: this.preparator,
                d: this.depreparator,
            };
        };
        BaseForm.prototype.consolidate = function (io, ctx) {
            var blended = Jungle.Util.B().init(this.extract()).blend(io.extract()).blend(ctx.extract()).dump();
            return blended;
        };
        return BaseForm;
    }());
    Jungle.BaseForm = BaseForm;
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
        var Orientation;
        (function (Orientation) {
            Orientation[Orientation["INPUT"] = 0] = "INPUT";
            Orientation[Orientation["OUTPUT"] = 1] = "OUTPUT";
            Orientation[Orientation["NEUTRAL"] = 2] = "NEUTRAL";
            Orientation[Orientation["MIXED"] = 3] = "MIXED";
        })(Orientation = IO.Orientation || (IO.Orientation = {}));
        var DesignationTypes;
        (function (DesignationTypes) {
            DesignationTypes[DesignationTypes["ALL"] = 0] = "ALL";
            DesignationTypes[DesignationTypes["MATCH"] = 1] = "MATCH";
            DesignationTypes[DesignationTypes["REGEX"] = 2] = "REGEX";
            DesignationTypes[DesignationTypes["FUNC"] = 3] = "FUNC";
        })(DesignationTypes = IO.DesignationTypes || (IO.DesignationTypes = {}));
        var BaseIO = (function () {
            function BaseIO(host, iospec) {
                this.host = host;
            }
            BaseIO.prototype.dress = function (designation, coat) {
                var designator = {
                    direction: Orientation.OUTPUT,
                    type: DesignationTypes.MATCH,
                    data: undefined,
                };
                if (typeof (designation) === 'string') {
                    if (designation === '*') {
                        designator.type = DesignationTypes.ALL;
                    }
                    else {
                        designator.type = DesignationTypes.REGEX;
                        designator.data = designation;
                    }
                }
                else {
                    throw new Error("Invalid Designator: string required");
                }
                this.shell.dress(designator, coat);
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
            Port.prototype.hostctx = function () {
                return this.shells[this.shells.length - 1].base.host.ctx.exposed;
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
                    case IO.DesignationTypes.MATCH: {
                        return this.label === designator.data;
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
    })(IO = Jungle.IO || (Jungle.IO = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        var BaseShell = (function () {
            function BaseShell(base, ports) {
                this.base = base;
                this.ports = ports;
                this.sinks = { '$': new IO.Port('$') };
                this.sinks.$.addShell(this);
                this.sources = { '$': new IO.Port('$') };
                this.sources.$.addShell(this);
                for (var _i = 0, ports_1 = ports; _i < ports_1.length; _i++) {
                    var portSpec = ports_1[_i];
                    switch (portSpec.direction) {
                        case IO.Orientation.INPUT: {
                            this.sinks[portSpec.label] = new IO.Port(portSpec.label);
                            this.sinks[portSpec.label].addShell(this);
                            break;
                        }
                        case IO.Orientation.OUTPUT: {
                            this.sources[portSpec.label] = new IO.Port(portSpec.label);
                            this.sources[portSpec.label].addShell(this);
                            break;
                        }
                    }
                }
            }
            BaseShell.prototype.invert = function () {
                var inversion = new BaseShell(this.base, []);
                inversion.sinks = this.sources;
                inversion.sources = this.sinks;
                return inversion;
            };
            BaseShell.prototype.designate = function (designator) {
                var scanDomain;
                var designation = [];
                switch (designator.direction) {
                    case IO.Orientation.NEUTRAL: {
                        return [];
                    }
                    case IO.Orientation.INPUT: {
                        scanDomain = Jungle.Util.flattenObject(this.sinks, 1);
                        break;
                    }
                    case IO.Orientation.OUTPUT: {
                        scanDomain = Jungle.Util.flattenObject(this.sources, 1);
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
            BaseShell.prototype.dress = function (designator, coat) {
                designator.direction = IO.Orientation.OUTPUT;
                var designation = this.designate(designator);
                for (var k in designation) {
                    var outport = designation[k];
                    outport.dress(coat);
                }
            };
            BaseShell.prototype.extractPorts = function () {
                var extracted = this.ports.map(function (pspec) {
                    return (pspec.direction == IO.Orientation.INPUT ? '_' : '') + pspec.label + (pspec.direction == IO.Orientation.OUTPUT ? '_' : '');
                });
                return extracted;
            };
            return BaseShell;
        }());
        IO.BaseShell = BaseShell;
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
            var _this = _super.call(this, crown, formspec) || this;
            _this.kind = "Link";
            return _this;
        }
        LinkCell.prototype.constructIO = function (iospec) {
            return new Jungle.IO.LinkIO(this, iospec);
        };
        LinkCell.prototype.constructForm = function () {
            return new Jungle.LinkForm(this);
        };
        LinkCell.prototype.prepareChild = function (prepargs, handle, child, k) {
            var mergekey = k === undefined ? false : k;
            if (child instanceof Jungle.BaseCell) {
                var replica = child.replicate();
                replica.setParent(this, k);
                var prep = replica.prepare(prepargs);
                var aftershell = new Jungle.Util.Junction().merge(prep, false).then(function (preparedReplica) {
                    preparedReplica.enshell();
                    return preparedReplica;
                }, false);
                handle.merge(aftershell, mergekey);
            }
            else {
                handle.merge(child, mergekey);
            }
        };
        LinkCell.prototype.completePrepare = function () {
            this.prepared = true;
            this.enshell();
        };
        LinkCell.prototype.resolve = function (resarg) {
            _super.prototype.resolve.call(this, resarg);
        };
        return LinkCell;
    }(Jungle.BaseCell));
    Jungle.LinkCell = LinkCell;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var LinkForm = (function (_super) {
        __extends(LinkForm, _super);
        function LinkForm() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LinkForm.prototype.parse = function (formObj) {
            var ctxdeclare = formObj.x || "";
            this.preparator = formObj.p || function (x) { };
            var links = formObj.link || [];
            var linkf = formObj.lf || function (a, b) { };
            var context = {};
            var specialInHook;
            var specialOutHook;
            var portlabels = this.parsePorts(formObj.port || []);
            var labels = {};
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
            return { iospec: { ports: portlabels, links: links, linkFunciton: linkf }, contextspec: { properties: contextprops, declaration: ctxdeclare } };
        };
        return LinkForm;
    }(Jungle.BaseForm));
    Jungle.LinkForm = LinkForm;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var IO;
    (function (IO) {
        var LINK_FILTERS;
        (function (LINK_FILTERS) {
            LINK_FILTERS[LINK_FILTERS["PROCEED"] = 0] = "PROCEED";
            LINK_FILTERS[LINK_FILTERS["DECEED"] = 1] = "DECEED";
            LINK_FILTERS[LINK_FILTERS["ELSEWHERE"] = 2] = "ELSEWHERE";
            LINK_FILTERS[LINK_FILTERS["NONE"] = 3] = "NONE";
        })(LINK_FILTERS || (LINK_FILTERS = {}));
        var LinkIO = (function (_super) {
            __extends(LinkIO, _super);
            function LinkIO(host, spec) {
                var _this = _super.call(this, host, spec) || this;
                _this.links = spec.links;
                _this.ports = spec.ports;
                _this.linkmap = {};
                _this.linker = spec.linkFunciton;
                _this.emmissionGate = new Jungle.Util.Junction();
                _this.closed = { sinks: [], sources: [] };
                _this.shell = new IO.BaseShell(_this, _this.ports);
                _this.lining = _this.shell.invert();
                return _this;
            }
            LinkIO.prototype.enshell = function () {
                this.innerDress();
                this.applyLinks();
                var _loop_1 = function (k) {
                    this_1.host.inp[k] = (function (input) {
                        this.shell.sinks[k].handle(input);
                    }).bind(this_1);
                };
                var this_1 = this;
                for (var k in this.shell.sinks) {
                    _loop_1(k);
                }
                for (var k in this.shell.sources) {
                    this.host.out[k] = this.shell.sources[k];
                }
                return;
            };
            ;
            LinkIO.prototype.innerDress = function () {
                var _this = this;
                Jungle.Util.typeCaseSplitF(function (item, key) {
                    var cellSources = item.io.shell.sources;
                    var cellLinkMap = [];
                    for (var q in cellSources) {
                        var source = cellSources[q];
                        cellLinkMap[q] = [];
                        source.callback = _this.follow.bind(_this, key, source);
                    }
                    _this.linkmap[key === undefined ? "undefined" : key] = cellLinkMap;
                })(this.host.crown);
                this.linkmap['_'] = {};
                for (var q in this.lining.sources) {
                    var source = this.lining.sources[q];
                    this.linkmap["_"][q] = [];
                    source.callback = this.follow.bind(this, '_', source);
                }
            };
            LinkIO.prototype.applyLinks = function () {
                for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
                    var link = _a[_i];
                    var linkir = this.parseLink(link);
                    this.interpretLink(linkir);
                }
            };
            LinkIO.prototype.parseLink = function (link) {
                var m = link.match(/(\w+|\*)(?:\.(\w+|\*|\$))?(\|?)(<?)([\+\-\!]?)([=\-])(>{1,2})(\|?)(\w+|\*)(?:\.(\w+|\*|\$))?/);
                if (!m) {
                    throw new Error("Unable to parse link description, expression " + link + " did not match regex");
                }
                ;
                var match = m[0], srcCell = m[1], srcPort = m[2], srcClose = m[3], viceVersa = m[4], filter = m[5], matching = m[6], persistent = m[7], snkClose = m[8], snkCell = m[9], snkPort = m[10];
                var srcDesig = {
                    direction: IO.Orientation.OUTPUT,
                    type: (srcPort == '*') ? IO.DesignationTypes.ALL : IO.DesignationTypes.MATCH,
                    data: (!srcPort ? '$' : srcPort)
                };
                var snkDesig = {
                    direction: IO.Orientation.INPUT,
                    type: (snkPort == '*') ? IO.DesignationTypes.ALL : IO.DesignationTypes.MATCH,
                    data: (!snkPort ? '$' : snkPort)
                };
                return {
                    sourceCell: srcCell,
                    sourcePort: srcDesig,
                    sinkCell: snkCell,
                    sinkPort: snkDesig,
                    closeSource: srcClose === '|',
                    closeSink: snkClose === '|',
                    persistent: false,
                    matching: matching === "=",
                    propogation: filter !== '' ? { '+': LINK_FILTERS.PROCEED, '-': LINK_FILTERS.DECEED, '!': LINK_FILTERS.ELSEWHERE }[filter] : LINK_FILTERS.NONE
                };
            };
            LinkIO.prototype.interpretLink = function (linkspec) {
                var sourceShells = {};
                var sinkShells = {};
                var sourceShellLabels = [];
                var sinkShellLabels = [];
                if (linkspec.sourceCell === "*") {
                    sourceShells = Jungle.Util.mapObject(this.host.crown, function (k, src) { sourceShellLabels.push(k); return src.io.shell; });
                }
                else if (linkspec.sourceCell === '_') {
                    sourceShells['_'] = this.host.io.lining;
                    sourceShellLabels = ['_'];
                }
                else if (linkspec.sourceCell in this.host.crown) {
                    sourceShells[linkspec.sourceCell] = this.host.crown[linkspec.sourceCell].io.shell;
                    sourceShellLabels = [linkspec.sourceCell];
                }
                if (linkspec.sinkCell === "*") {
                    sinkShells = Jungle.Util.mapObject(this.host.crown, function (k, src) { sinkShellLabels.push(k); return src.io.shell; });
                }
                else if (linkspec.sinkCell === '_') {
                    sinkShells['_'] = this.host.io.lining;
                    sinkShellLabels = ['_'];
                }
                else if (linkspec.sinkCell in this.host.crown) {
                    sinkShells[linkspec.sinkCell] = this.host.crown[linkspec.sinkCell].io.shell;
                    sinkShellLabels = [linkspec.sinkCell];
                }
                for (var _i = 0, sourceShellLabels_1 = sourceShellLabels; _i < sourceShellLabels_1.length; _i++) {
                    var sourceLb = sourceShellLabels_1[_i];
                    for (var _a = 0, sinkShellLabels_1 = sinkShellLabels; _a < sinkShellLabels_1.length; _a++) {
                        var sinkLb = sinkShellLabels_1[_a];
                        var sourcePorts = sourceShells[sourceLb].designate(linkspec.sourcePort);
                        var sinkPorts = sinkShells[sinkLb].designate(linkspec.sinkPort);
                        for (var _b = 0, sourcePorts_1 = sourcePorts; _b < sourcePorts_1.length; _b++) {
                            var sourceP = sourcePorts_1[_b];
                            for (var _c = 0, sinkPorts_1 = sinkPorts; _c < sinkPorts_1.length; _c++) {
                                var sinkP = sinkPorts_1[_c];
                                if (this.checkLink(linkspec, sourceLb, sinkLb, sourceP, sinkP)) {
                                    this.forgeLink(linkspec, sourceLb, sinkLb, sourceP, sinkP);
                                }
                            }
                        }
                    }
                }
            };
            LinkIO.prototype.checkLink = function (linkspec, sourceCellLabel, sinkCellLabel, sourceP, sinkP) {
                var matched = (!linkspec.matching || sourceP.label === sinkP.label), openSource = (this.closed.sources.indexOf(sourceCellLabel) === -1), openSink = this.closed.sinks.indexOf(sinkCellLabel) === -1, unfiltered = this.filterCheck(sourceCellLabel, sinkCellLabel, linkspec);
                return matched && openSource && openSink && unfiltered;
            };
            LinkIO.prototype.filterCheck = function (sourceLabel, sinkLabel, linkspec) {
                var srcnum = Number(sourceLabel), snknum = Number(sinkLabel);
                if (!isNaN(srcnum) && !isNaN(snknum) && linkspec.propogation != LINK_FILTERS.NONE) {
                    if (linkspec.propogation == LINK_FILTERS.PROCEED) {
                        return srcnum === snknum - 1;
                    }
                    else if (linkspec.propogation == LINK_FILTERS.DECEED) {
                        return srcnum === snknum + 1;
                    }
                    else {
                        return srcnum !== snknum;
                    }
                }
                else {
                    if (linkspec.propogation == LINK_FILTERS.ELSEWHERE) {
                        return sourceLabel !== sinkLabel;
                    }
                    else {
                        return true;
                    }
                }
            };
            LinkIO.prototype.forgeLink = function (linkspec, sourceCell, sinkCell, sourcePort, sinkPort) {
                this.linkmap[sourceCell][sourcePort.label].push(sinkPort);
                this.linker.call(this.host.ctx.exposed, sourcePort.hostctx(), sinkPort.hostctx(), sourcePort.label, sinkPort.label);
                if (linkspec.closeSink) {
                    this.closed.sinks.push(sinkCell);
                }
                if (linkspec.closeSource) {
                    this.closed.sources.push(sourceCell);
                }
            };
            LinkIO.prototype.follow = function (sourceCell, source, throughput) {
                var targeted = this.linkmap[sourceCell][source.label];
                this.emmissionGate.then(function (result, handle) {
                    for (var _i = 0, targeted_1 = targeted; _i < targeted_1.length; _i++) {
                        var sink = targeted_1[_i];
                        sink.handle(throughput);
                    }
                });
            };
            LinkIO.prototype.prepare = function (parg) {
            };
            ;
            LinkIO.prototype.extract = function () {
                return {
                    port: this.shell.extractPorts(),
                    link: this.links,
                    lf: this.linker
                };
            };
            return LinkIO;
        }(IO.BaseIO));
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
    function isBundle(object) {
        return object instanceof Object && "form" in object && "crown" in object && "core" in object;
    }
    Jungle.isBundle = isBundle;
    function R(bundle) {
        function debundle(bundle) {
            if (isBundle(bundle)) {
                return R(bundle);
            }
            else {
                return bundle;
            }
        }
        var freshcrown = Jungle.Util.typeCaseSplitF(debundle)(bundle.crown);
        return new ({
            "Resolution": Jungle.ResolutionCell,
            "Link": Jungle.LinkCell
        }[bundle.core])(freshcrown, bundle.form);
    }
    Jungle.R = R;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var ResolutionCell = (function (_super) {
        __extends(ResolutionCell, _super);
        function ResolutionCell() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.kind = "Resolution";
            return _this;
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
        ResolutionCell.prototype.resolveDenizen = function (handle, args, denizen, reference) {
            var mergekey = reference === undefined ? false : reference;
            if (denizen instanceof Jungle.BaseCell && denizen !== undefined) {
                var denizenArg = args === undefined ? undefined : args[reference];
                var resolved = denizen.resolve(denizenArg);
                handle.merge(resolved, mergekey);
            }
            else {
                handle.merge(denizen, mergekey);
            }
        };
        ResolutionCell.prototype.resolveCell = function (handle, node, carriedArgs, selection) {
            var cut = false;
            if (!selection) {
                cut = true;
            }
            else if (selection === true && node instanceof Object) {
                selection = Object.keys(node);
            }
            var projectedCrown = this.crown;
            var core = this;
            var splitf = core.resolveDenizen.bind(core, handle, carriedArgs);
            Jungle.Util.typeCaseSplitF(splitf)(projectedCrown);
        };
        ResolutionCell.prototype.resolve = function (resolveArgs) {
            Object.freeze(resolveArgs);
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
                    args: resolveArgs,
                    carried: null,
                    crowned: null,
                    selection: null,
                    reduced: null
                };
                this.junction
                    .then(this.resolveCarryThen.bind(this), false)
                    .then(this.resolveCrownThen.bind(this), false)
                    .then(this.resolveReduceThen.bind(this), false)
                    .then(this.resolveCompleteThen.bind(this), false);
                return this.junction.realize();
            }
        };
        ResolutionCell.prototype.resolveCarryThen = function (results, handle) {
            this.ctx.exposed.handle = handle;
            return this.form.carrier.call(this.ctx.exposed, this.resolveCache.args);
        };
        ResolutionCell.prototype.resolveCrownThen = function (results, handle) {
            this.resolveCache.carried = results;
            return this.resolveCell(handle, this.crown, this.resolveCache.carried, true);
        };
        ResolutionCell.prototype.resolveReduceThen = function (results, handle) {
            this.resolveCache.crowned = results;
            this.ctx.exposed.handle = handle;
            return this.form.resolver.call(this.ctx.exposed, this.resolveCache.crowned, this.resolveCache.args, this.resolveCache.carried);
        };
        ResolutionCell.prototype.resolveCompleteThen = function (results, handle) {
            this.resolveCache.reduced = results;
            var dispached = this.io.dispatchResult(this.resolveCache.reduced);
            return dispached;
        };
        return ResolutionCell;
    }(Jungle.BaseCell));
    Jungle.ResolutionCell = ResolutionCell;
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var LabelTypes;
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
    })(LabelTypes = Jungle.LabelTypes || (Jungle.LabelTypes = {}));
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
            return _super.call(this, host) || this;
        }
        GForm.prototype.parse = function (formObj) {
            var ctxdeclare = formObj.x || "";
            this.carrier = formObj.c || Jungle.Util.identity;
            this.resolver = formObj.r || Jungle.Util.identity;
            this.preparator = formObj.p || function (x) { };
            var portlabels = this.parsePorts(formObj.port || []);
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
            return { iospec: { hooks: hooks, specialIn: specialInHook, specialOut: specialOutHook, ports: portlabels }, contextspec: { properties: props, declaration: ctxdeclare } };
        };
        GForm.prototype.extract = function () {
            return {
                r: this.resolver,
                c: this.carrier,
                p: this.preparator,
                d: this.depreparator
            };
        };
        return GForm;
    }(Jungle.BaseForm));
    GForm.RFormProps = ["x", "p", "d", "c", "r", "port", "prepare", "destroy", "carry", "resolve", "select"];
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
        var ResolveIO = (function (_super) {
            __extends(ResolveIO, _super);
            function ResolveIO(host, iospec) {
                var _this = _super.call(this, host, iospec) || this;
                var hooks = iospec.hooks, specialIn = iospec.specialIn, specialOut = iospec.specialOut;
                _this.isShellBase = false;
                _this.specialGate = false;
                _this.orientation = IO.Orientation.NEUTRAL;
                _this.inputs = {};
                _this.outputs = {};
                _this.initialiseHooks(hooks, specialIn, specialOut);
                _this.initialisePorts(iospec.ports);
                return _this;
            }
            ResolveIO.prototype.initialisePorts = function (ports) {
                this.portShell = new IO.BaseShell(this, ports);
                this.host.ctx.exposed.lining = this.portShell.invert();
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
                ext['port'] = this.portShell.extractPorts();
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
                    shells: [this.portShell]
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
                    var _loop_2 = function (k_1) {
                        this_2.host.inp[k_1] = (function (input) {
                            this.shell.sinks[k_1].handle(input);
                        }).bind(this_2);
                    };
                    var this_2 = this;
                    for (var k_1 in this.shell.sinks) {
                        _loop_2(k_1);
                    }
                    for (var k_2 in this.shell.sources) {
                        this.host.out[k_2] = this.shell.sources[k_2];
                    }
                    return { shells: [this.shell], hooks: [] };
                }
                else {
                    return { hooks: accumulated.hooks, shells: accumulated.shells };
                }
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
        }(IO.BaseIO));
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
                var _this = _super.call(this, label) || this;
                _this.callback = _this.handleInput;
                _this.callbackContext = _this;
                for (var _a = 0, shells_1 = shells; _a < shells_1.length; _a++) {
                    var shell = shells_1[_a];
                    _this.addShell(shell);
                }
                return _this;
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
                var _this = _super.call(this, '$') || this;
                _this.base = base;
                return _this;
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
                return _super.call(this, label) || this;
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
        var HookShell = (function (_super) {
            __extends(HookShell, _super);
            function HookShell(base, midrantHooks, subshells) {
                var _this = _super.call(this, base, []) || this;
                _this.base = base;
                _this.inputHooks = {};
                _this.outputHooks = {};
                for (var _i = 0, midrantHooks_1 = midrantHooks; _i < midrantHooks_1.length; _i++) {
                    var hook = midrantHooks_1[_i];
                    _this.addMidrantHook(hook);
                }
                for (var label in _this.inputHooks) {
                    _this.sinks[label] = new IO.ResolveInputPort(label, _this);
                }
                for (var label in _this.outputHooks) {
                    _this.sources[label] = new IO.ResolveOutputPort(label);
                    _this.sources[label].addShell(_this);
                }
                for (var _a = 0, subshells_1 = subshells; _a < subshells_1.length; _a++) {
                    var shell = subshells_1[_a];
                    _this.addShell(shell);
                }
                _this.sinks['$'] = new IO.SpecialInputPort(_this.base);
                _this.sinks['$'].addShell(_this);
                _this.sources['$'] = new IO.ResolveOutputPort('$');
                _this.sources['$'].addShell(_this);
                return _this;
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
                    var innerSink = shell.sinks[k];
                    if (innerSink.label in this.sinks) {
                        var outerSink = this.sinks[innerSink.label];
                        outerSink.addShell(this);
                        for (var _i = 0, _a = innerSink.shells; _i < _a.length; _i++) {
                            var shell_1 = _a[_i];
                            shell_1.sinks[innerSink.label] = outerSink;
                        }
                    }
                    else {
                        this.sinks[innerSink.label] = innerSink;
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
            return HookShell;
        }(IO.BaseShell));
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
                args[_i] = arguments[_i];
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
            if (seen.indexOf(node1) !== -1 || seen.indexOf(node2) !== -1) {
                return;
            }
            if (typeof (node1) != typeof (node2)) {
                throw new Error("nodes not same type, derefs: [" + derefstack + "],  node1:" + node1 + " of type " + typeof (node1) + ", node2:" + node2 + " of type " + typeof (node2));
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
                            throw new Error("key " + q + " in object2 but not object1, derefs:[" + derefstack + "]");
                        }
                        else {
                            deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), seen.concat(node1, node2), allowIdentical);
                        }
                    }
                    return true;
                }
            }
            else if (node1 !== node2) {
                throw new Error("Terminals: \"" + node1 + "\" and \"" + node2 + "\" not equal, derefs:[" + derefstack + "]");
            }
        }
        Util.deeplyEqualsThrow = deeplyEqualsThrow;
        function isDeepReplica(node1, node2) {
            deeplyEquals(node1, node2, false);
        }
        Util.isDeepReplica = isDeepReplica;
        function isDeepReplicaThrow(node1, node2) {
            deeplyEqualsThrow(node1, node2, undefined, undefined, false);
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
        function flattenObject(obj, depth, values) {
            if (depth === void 0) { depth = -1; }
            if (values === void 0) { values = []; }
            for (var k in obj) {
                var v = obj[k];
                if (isVanillaObject(v) && (depth >= 0 || depth >= -1)) {
                    flattenObject(v, depth - 1, values);
                }
                else {
                    values.push(v);
                }
            }
            return values;
        }
        Util.flattenObject = flattenObject;
        function mapObject(obj, func) {
            var mapped = {};
            for (var k in obj) {
                var v = obj[k];
                mapped[k] = func(k, v);
            }
            return mapped;
        }
        Util.mapObject = mapObject;
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
    })(Util = Jungle.Util || (Jungle.Util = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Util;
    (function (Util) {
        var JResultNatures;
        (function (JResultNatures) {
            JResultNatures[JResultNatures["Single"] = 0] = "Single";
            JResultNatures[JResultNatures["Keyed"] = 1] = "Keyed";
            JResultNatures[JResultNatures["Indexed"] = 2] = "Indexed";
            JResultNatures[JResultNatures["Appended"] = 3] = "Appended";
            JResultNatures[JResultNatures["Uninferred"] = 4] = "Uninferred";
        })(JResultNatures || (JResultNatures = {}));
        var WAITING = "WAIT";
        var Junction = (function () {
            function Junction() {
                this.leashed = [];
                this.silentIndex = 0;
                this.silentAwaits = [];
                this.resultNature = JResultNatures.Uninferred;
                this.blocked = false;
                this.cleared = false;
                this.fried = false;
            }
            Junction.prototype.proceedThen = function () {
                this.cleared = true;
                if (this.thenCallback !== undefined) {
                    var propagate = void 0, handle = void 0;
                    handle = new Junction();
                    var future_1 = this.future;
                    propagate = this.thenCallback(this.awaits, handle);
                    if (handle.isClean()) {
                        future_1.unleash(propagate);
                    }
                    else {
                        handle.then(function (result, handle) {
                            future_1.unleash(result);
                        });
                    }
                }
                else {
                    this.future.unleash(this.awaits);
                }
            };
            Junction.prototype.unleash = function (propagated) {
                var _a = this._hold(this.thenkey), release = _a[0], raise = _a[1];
                this.blocked = false;
                for (var i = 0; i < this.leashed.length; i++) {
                    this.leashed[i]();
                }
                delete this.leashed;
                release(propagated);
            };
            Junction.prototype.proceedCatch = function (error) {
                if (this.catchCallback !== undefined) {
                    this.catchCallback(error);
                }
                else if (this.future !== undefined) {
                    this.future.proceedCatch(error);
                }
                else {
                    throw new Error("Error raised from hold, arriving from " + error.key + " with message " + error.message);
                }
            };
            Junction.prototype.successor = function () {
                if (this.cleared || !this.hasFuture()) {
                    return this;
                }
                else {
                    return this.future.successor();
                }
            };
            Junction.prototype.frontier = function () {
                if (this.future) {
                    return this.future.frontier();
                }
                else {
                    return this;
                }
            };
            Junction.prototype.realize = function () {
                if (this.isIdle()) {
                    return this.awaits;
                }
                else {
                    if (this.hasFuture()) {
                        return this.future.realize();
                    }
                    else {
                        return this;
                    }
                }
            };
            Junction.prototype.isClean = function () {
                return !this.hasFuture() && !this.isTampered() && this.isPresent();
            };
            Junction.prototype.isIdle = function () {
                return this.allDone() && this.isPresent();
            };
            Junction.prototype.isReady = function () {
                return this.allDone() && this.isPresent() && this.hasFuture() && !this.fried;
            };
            Junction.prototype.isTampered = function () {
                return !(this.silentAwaits.length <= 1 && this.resultNature === JResultNatures.Uninferred);
            };
            Junction.prototype.isPresent = function () {
                return !(this.blocked || this.cleared);
            };
            Junction.prototype.hasFuture = function () {
                return this.future != undefined;
            };
            Junction.prototype.allDone = function () {
                var awaitingAnySilent = false;
                this.silentAwaits.forEach(function (swaiting) { awaitingAnySilent = swaiting || awaitingAnySilent; });
                var awaitingAny;
                if (this.resultNature === JResultNatures.Single) {
                    awaitingAny = this.awaits === WAITING;
                }
                else {
                    awaitingAny = Util.typeCaseSplitR(function (thing, key) {
                        return thing === WAITING;
                    })(this.awaits, false, function (a, b, k) { return a || b; });
                }
                return this.cleared || (!awaitingAny && !awaitingAnySilent);
            };
            Junction.prototype.hold = function (returnkey) {
                return this.frontier()._hold(returnkey);
            };
            Junction.prototype._hold = function (returnkey) {
                var _this = this;
                var accessor, silent = false;
                if (returnkey === true) {
                    if (this.resultNature === JResultNatures.Uninferred) {
                        this.resultNature = JResultNatures.Appended;
                        this.awaits = [];
                        this.index = 0;
                    }
                    if (this.resultNature !== JResultNatures.Appended) {
                        throw new Error("Cannot combine appended result with other");
                    }
                    ;
                    accessor = this.index;
                    this.awaits[accessor] = WAITING;
                    this.index++;
                }
                else if (returnkey === false) {
                    if (this.resultNature === JResultNatures.Uninferred) {
                        this.resultNature = JResultNatures.Single;
                    }
                    if (this.awaits !== undefined) {
                        throw new Error("Single result feed from : hold(false) is unable to recieve any more results");
                    }
                    this.awaits = WAITING;
                }
                else if (typeof (returnkey) === 'string') {
                    if (this.resultNature === JResultNatures.Uninferred) {
                        this.resultNature = JResultNatures.Keyed;
                        this.awaits = {};
                    }
                    if (this.resultNature !== JResultNatures.Keyed) {
                        throw new Error("cannot use hold(string) when it is used for something else");
                    }
                    accessor = returnkey;
                    this.awaits[accessor] = WAITING;
                }
                else if (typeof (returnkey) === 'number') {
                    if (this.resultNature === JResultNatures.Uninferred) {
                        this.resultNature = JResultNatures.Indexed;
                        this.awaits = [];
                    }
                    if (this.resultNature !== JResultNatures.Indexed) {
                        throw new Error("cannot use hold(number) when it is used for something else");
                    }
                    accessor = returnkey;
                    this.awaits[accessor] = WAITING;
                }
                else if (returnkey === undefined) {
                    accessor = this.silentIndex;
                    this.silentAwaits[this.silentIndex++] = true;
                    silent = true;
                }
                else {
                    throw new Error("Invalid hold argument, must be string, number, boolean or undefined");
                }
                return [
                    (function (res) {
                        if ((accessor !== undefined) && !silent) {
                            _this.awaits[accessor] = res;
                        }
                        else if ((accessor !== undefined) && silent) {
                            _this.silentAwaits[accessor] = false;
                        }
                        else if (accessor === undefined) {
                            _this.awaits = res;
                        }
                        if (_this.isReady()) {
                            _this.proceedThen();
                        }
                    }),
                    (function (err) {
                        _this.fried = true;
                        _this.error = {
                            message: err, key: accessor
                        };
                        if (_this.fried && _this.hasFuture()) {
                            _this.proceedCatch(_this.error);
                        }
                    })
                ];
            };
            Junction.prototype.await = function (act, label) {
                var frontier = this.frontier();
                var _a = frontier.hold(label), done = _a[0], raise = _a[1];
                if (frontier.blocked) {
                    frontier.leashed.push(act.bind(null, done, raise));
                }
                else {
                    act(done, raise);
                }
                return frontier;
            };
            Junction.prototype.merge = function (upstream, holdstyle) {
                var frontier = this.frontier();
                if (upstream instanceof Junction) {
                    return frontier.await(function (done, raise) {
                        upstream.then(done);
                        upstream.catch(raise);
                    }, holdstyle);
                }
                else {
                    frontier.hold(holdstyle)[0](upstream);
                    return frontier;
                }
            };
            Junction.prototype.then = function (callback, thenkey) {
                var frontier = this.frontier();
                frontier.future = new Junction();
                frontier.future.thenkey = thenkey;
                frontier.future.blocked = true;
                frontier.thenCallback = callback;
                if (frontier.isReady()) {
                    frontier.proceedThen();
                }
                return frontier.future;
            };
            Junction.prototype.catch = function (callback) {
                var frontier = this.frontier();
                frontier.future = new Junction();
                frontier.future.blocked = true;
                frontier.catchCallback = callback;
                if (frontier.fried && frontier.hasFuture()) {
                    frontier.proceedCatch(frontier.error);
                }
                return frontier.future;
            };
            return Junction;
        }());
        Util.Junction = Junction;
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
            Gate.prototype.isClean = function () {
                return this.locki === 0;
            };
            Gate.prototype.allUnlocked = function () {
                return this.locks.filter(function (x) { return x; }).length === 0;
            };
            return Gate;
        }());
        Util.Gate = Gate;
    })(Util = Jungle.Util || (Jungle.Util = {}));
})(Jungle || (Jungle = {}));
var Jungle;
(function (Jungle) {
    var Util;
    (function (Util) {
        function B(crown, form) {
            if (crown === void 0) { crown = {}; }
            if (form === void 0) { form = {}; }
            return new Blender(crown, form);
        }
        Util.B = B;
        var Blender = (function () {
            function Blender(crown, form) {
                if (form === void 0) { form = {}; }
                this.crown = crown;
                if (form instanceof Function) {
                    this.reducer = form;
                }
                else if (form.reducer instanceof Function) {
                    this.reducer = form.reducer;
                }
                else {
                    this.reducer = Blender.defaultReduce;
                }
                this.block = form.block || false;
                this.term = form.term || false;
                this.mapper = form.mapper || Blender.defaultMap;
            }
            Blender.defaultReduce = function (a, b) {
                if (Blender.strictTypeReduce && (typeof (a) != typeof (b))) {
                    var errmsg = "Expected melding to be the same type \n" +
                        "existing: " + a + "\n" +
                        "incoming: " + b + "\n";
                    throw TypeError(errmsg);
                }
                return b === undefined ? a : b;
            };
            ;
            Blender.defaultMap = function (x) {
                return x;
            };
            Blender.prototype.init = function (obj) {
                if (this.term === false) {
                    this.crown = Util.typeCaseSplitF(this.initChurn.bind(this))(obj);
                }
                else {
                    this.crown = obj;
                }
                return this;
            };
            Blender.prototype.initChurn = function (inner, k) {
                var result;
                if (k === undefined && Util.isPrimative(inner)) {
                    result = inner;
                    this.term = inner !== undefined;
                }
                else if (k in this.crown) {
                    var val = this.crown[k];
                    if (val instanceof Blender) {
                        result = val.init(inner);
                    }
                    else if (val instanceof Function) {
                        result = B(undefined, val).init(inner);
                    }
                    else {
                        result = B(this.crown[k], { mapper: this.mapper, reducer: this.reducer }).init(inner);
                    }
                }
                else {
                    result = B(undefined, { mapper: this.mapper, reducer: this.reducer }).init(inner);
                }
                return result;
            };
            Blender.prototype.dump = function () {
                if (this.term) {
                    return this.crown;
                }
                else {
                    return Util.typeCaseSplitF(function (child) {
                        return child !== undefined ? child.dump() : undefined;
                    })(this.crown);
                }
            };
            Blender.prototype.blend = function (obj) {
                this._blend(obj);
                return this;
            };
            Blender.prototype._blend = function (obj) {
                var mapped = this.mapper(obj);
                var reduced;
                if (this.term) {
                    reduced = this.reducer(this.crown, mapped);
                    this.crown = reduced;
                }
                else {
                    reduced = this.merge(mapped);
                }
                return reduced;
            };
            Blender.prototype.merge = function (income) {
                var result, superkeys;
                if (this.crown === undefined && income !== undefined) {
                    this.init(income);
                    return income;
                }
                else if (income !== undefined) {
                    if (this.crown instanceof Array) {
                        result = [];
                        superkeys = Util.range(Math.max((income || []).length || 0, this.crown.length));
                    }
                    else {
                        result = {};
                        superkeys = Object.keys(this.crown || {});
                        Object.keys(income || {}).forEach(function (key) {
                            if (superkeys.indexOf(key) === -1) {
                                superkeys.push(key);
                            }
                        });
                    }
                    for (var _i = 0, superkeys_1 = superkeys; _i < superkeys_1.length; _i++) {
                        var key = superkeys_1[_i];
                        if (key in income) {
                            if (key in this.crown) {
                                result[key] = this.crown[key]._blend(income[key]);
                            }
                            else {
                                this.crown[key] = B(undefined, { mapper: this.mapper, reducer: this.reducer }).init(income[key]);
                                result[key] = this.crown[key].dump();
                            }
                        }
                        else if (key in this.crown) {
                            result[key] = this.crown[key].dump();
                        }
                        else {
                        }
                    }
                    return result;
                }
            };
            return Blender;
        }());
        Blender.strictTypeReduce = false;
        Util.Blender = Blender;
    })(Util = Jungle.Util || (Jungle.Util = {}));
})(Jungle || (Jungle = {}));
