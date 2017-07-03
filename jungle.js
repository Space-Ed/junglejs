/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BasicContact {
    constructor() {
        this.hidden = false;
        this.plugged = false;
        this.gloved = false;
        this.claimed = false;
        this.inverted = false;
    }
    attach(host, name) {
        this.host = host;
    }
    detach() {
        this.host = undefined;
        this.partner = undefined;
    }
    invert() {
        if (this.partner === undefined && this.invertable === true) {
            this.partner = this.createPartner();
            this.inverted = true;
            this.partner.partner = this;
            this.partner.inverted = true;
        }
        return this.partner;
    }
}
exports.BasicContact = BasicContact;
//# sourceMappingURL=base.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(8);
function isPrimative(thing) {
    return thing == undefined || typeof (thing) !== 'object';
}
exports.isPrimative = isPrimative;
function isVanillaObject(thing) {
    return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing);
}
exports.isVanillaObject = isVanillaObject;
function isVanillaArray(thing) {
    return thing instanceof Array && Array.prototype == Object.getPrototypeOf(thing);
}
exports.isVanillaArray = isVanillaArray;
function isTree(thing, stack = []) {
    stack = stack.concat(thing);
    function decirc(proposed) {
        if ((stack.indexOf(proposed) === -1)) {
            return isTree(proposed, stack);
        }
        else {
            return false;
        }
    }
    return typesplit_1.typeCaseSplitR(decirc, decirc, function () { return true; })(thing, true, function (a, b, k) { return a && b; });
}
exports.isTree = isTree;
function isVanillaTree(thing, stack = []) {
    function decirc(proposed) {
        if ((isVanillaObject(proposed) || isVanillaArray(proposed) && stack.indexOf(proposed) === -1)) {
            return isVanillaTree(proposed, stack.concat(proposed));
        }
        else {
            return false;
        }
    }
    return typesplit_1.typeCaseSplitR(decirc, decirc, isPrimative)(thing, true, function (a, b, k) { return a && b; });
}
exports.isVanillaTree = isVanillaTree;
function deeplyEquals(node1, node2, allowIdentical = true) {
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
exports.deeplyEquals = deeplyEquals;
function deeplyEqualsThrow(node1, node2, derefstack, seen, allowIdentical = true) {
    var derefstack = derefstack || [];
    var seen = seen || [];
    if (seen.indexOf(node1) !== -1 || seen.indexOf(node2) !== -1) {
        return;
    }
    if (typeof (node1) != typeof (node2)) {
        throw new Error(`nodes not same type, derefs: [${derefstack}],  node1:${node1} of type ${typeof (node1)}, node2:${node2} of type ${typeof (node2)}`);
    }
    else if (node1 instanceof Object) {
        if (node1 === node2 && !allowIdentical) {
            throw new Error(`identical object not replica, derefs:[${derefstack}]`);
        }
        else {
            for (let k in node1) {
                if (!(k in node2)) {
                    throw new Error(`key ${k} in object1 but not object2, derefs:[${derefstack}]`);
                }
            }
            for (let q in node2) {
                if (!(q in node1)) {
                    throw new Error(`key ${q} in object2 but not object1, derefs:[${derefstack}]`);
                }
                else {
                    deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), seen.concat(node1, node2), allowIdentical);
                }
            }
            return true;
        }
    }
    else if (node1 !== node2) {
        throw new Error(`Terminals: "${node1}" and "${node2}" not equal, derefs:[${derefstack}]`);
    }
}
exports.deeplyEqualsThrow = deeplyEqualsThrow;
function isDeepReplica(node1, node2) {
    deeplyEquals(node1, node2, false);
}
exports.isDeepReplica = isDeepReplica;
function isDeepReplicaThrow(node1, node2) {
    deeplyEqualsThrow(node1, node2, undefined, undefined, false);
}
exports.isDeepReplicaThrow = isDeepReplicaThrow;
//# sourceMappingURL=checks.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(19));
__export(__webpack_require__(31));
__export(__webpack_require__(12));
__export(__webpack_require__(30));
__export(__webpack_require__(29));
__export(__webpack_require__(5));
__export(__webpack_require__(6));
__export(__webpack_require__(0));
__export(__webpack_require__(17));
//# sourceMappingURL=all.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(37));
__export(__webpack_require__(1));
const debug = __webpack_require__(22);
exports.Debug = debug;
__export(__webpack_require__(23));
__export(__webpack_require__(24));
__export(__webpack_require__(27));
//# sourceMappingURL=all.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(28));
__export(__webpack_require__(11));
__export(__webpack_require__(9));
//# sourceMappingURL=all.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(7);
const base_1 = __webpack_require__(0);
const callout_1 = __webpack_require__(6);
const Debug = __webpack_require__(22);
const junction_1 = __webpack_require__(23);
class CallIn extends base_1.BasicContact {
    constructor(spec) {
        super();
        this.spec = spec;
        this.symmetric = false;
        this.invertable = true;
        this.put = (data, tracking) => {
            let crumb;
            if (this.spec.tracking && tracking !== undefined) {
                crumb = tracking.drop("CallIn Contact")
                    .with(data)
                    .at("contact label: " + this.spec.label);
            }
            if (this.partner !== undefined && this.partner.emit !== undefined) {
                if (crumb) {
                    return this.partner.emit(data, crumb);
                }
                else {
                    return this.partner.emit(data);
                }
            }
            else {
                if (tracking) {
                    tracking.raise("CallIn contact has no corresponding CallOut with emit defined");
                }
            }
        };
    }
    invert() {
        return super.invert();
    }
    createPartner() {
        return new callout_1.CallOut(this.spec);
    }
    inject(into, key) {
        this.hook = into;
        if (this.spec.mode == I.CALL_MODE.PUSH) {
            Object.defineProperty(into, key, {
                set: (value) => {
                    let crumb;
                    if (this.spec.tracking) {
                        crumb = new Debug.Crumb("Context injection Push Beginning");
                    }
                    this.put(value, crumb);
                    this.spec.default = value;
                }, get: () => {
                    return this.spec.default;
                },
                enumerable: true
            });
        }
        else if (this.spec.mode == I.CALL_MODE.GET) {
            Object.defineProperty(into, key, {
                get: () => {
                    let crumb;
                    if (this.spec.tracking) {
                        crumb = new Debug.Crumb("Context injection get Beginning");
                    }
                    let promised = this.put(undefined, crumb);
                    if (this.spec.syncOnly) {
                        let zalgo = promised.realize();
                        if (zalgo instanceof junction_1.Junction) {
                            zalgo.then((result) => {
                                this.spec.default = result;
                            });
                            return this.spec.default;
                        }
                        else {
                            return zalgo;
                        }
                    }
                    else {
                        return promised;
                    }
                },
                enumerable: true
            });
        }
        else if (this.spec.mode == I.CALL_MODE.REQUEST) {
            Object.defineProperty(into, key, {
                get: () => {
                    return this.put.bind(this);
                },
                enumerable: true
            });
        }
    }
    retract(context, key) {
        delete context.key;
    }
}
exports.CallIn = CallIn;
//# sourceMappingURL=callin.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(7);
const base_1 = __webpack_require__(0);
const callin_1 = __webpack_require__(5);
class CallOut extends base_1.BasicContact {
    constructor(spec) {
        super();
        this.spec = spec;
        this.invertable = true;
        this.symmetric = false;
        if (spec.mode !== I.CALL_MODE.PROXY) {
            this.hidden = true;
        }
    }
    invert() {
        return super.invert();
    }
    createPartner() {
        return new callin_1.CallIn(this.spec);
    }
    inject(into, key) {
        let _spec = this.spec;
        if (_spec.mode == I.CALL_MODE.PUSH) {
            if (_spec.hook instanceof Function) {
                this.emit = (inp, crumb) => {
                    if (crumb && _spec.tracking) {
                        let end = crumb.drop("Hook Call Terminal")
                            .with(inp)
                            .at(key);
                    }
                    _spec.hook.call(into, inp, crumb);
                };
            }
            else {
                into[key] = _spec.default;
                this.emit = (inp, crumb) => {
                    if (crumb && _spec.tracking) {
                        let end = crumb.drop("Value Deposit Hook")
                            .with(inp)
                            .at(key);
                    }
                    into[key] = inp;
                };
            }
        }
        else if (_spec.mode == I.CALL_MODE.GET) {
            into[key] = _spec.default;
            this.emit = (inp, crumb) => {
                let gotten = into[key];
                if (crumb && _spec.tracking) {
                    crumb.drop("Synchronous Value Retrieval(Get) Hook")
                        .with(inp)
                        .at(key)
                        .as(gotten);
                }
                return gotten;
            };
        }
        else if (_spec.mode == I.CALL_MODE.REQUEST) {
            this.emit = (inp, crumb) => {
                if (crumb && _spec.tracking) {
                    crumb.drop("Function Hook")
                        .with(inp)
                        .at(key);
                }
                return _spec.hook.call(into, inp, crumb);
            };
        }
    }
    retract(context, key) {
    }
}
exports.CallOut = CallOut;
//# sourceMappingURL=callout.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CALL_MODE;
(function (CALL_MODE) {
    CALL_MODE[CALL_MODE["PUSH"] = 0] = "PUSH";
    CALL_MODE[CALL_MODE["GET"] = 1] = "GET";
    CALL_MODE[CALL_MODE["REQUEST"] = 2] = "REQUEST";
    CALL_MODE[CALL_MODE["PROXY"] = 3] = "PROXY";
})(CALL_MODE = exports.CALL_MODE || (exports.CALL_MODE = {}));
var LINK_FILTERS;
(function (LINK_FILTERS) {
    LINK_FILTERS[LINK_FILTERS["PROCEED"] = 0] = "PROCEED";
    LINK_FILTERS[LINK_FILTERS["DECEED"] = 1] = "DECEED";
    LINK_FILTERS[LINK_FILTERS["ELSEWHERE"] = 2] = "ELSEWHERE";
    LINK_FILTERS[LINK_FILTERS["NONE"] = 3] = "NONE";
})(LINK_FILTERS = exports.LINK_FILTERS || (exports.LINK_FILTERS = {}));
exports.FreePolicy = {
    fussy: false,
    allowAddition: true,
    allowRemoval: true
};
//# sourceMappingURL=interfaces.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(1);
function identity(x) {
    return x;
}
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
    return function (inThing, initial = null, reductor = function (a, b, k) { }) {
        var result = initial;
        if (checks_1.isVanillaArray(inThing)) {
            for (var i = 0; i < inThing.length; i++) {
                var subBundle = inThing[i];
                result = reductor(result, afunc(subBundle, i), i);
            }
        }
        else if (checks_1.isVanillaObject(inThing)) {
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
exports.typeCaseSplitR = typeCaseSplitR;
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
        if (checks_1.isVanillaArray(inThing)) {
            outThing = [];
            outThing.length = inThing.length;
            for (var i = 0; i < inThing.length; i++) {
                var subBundle = inThing[i];
                outThing[i] = afunc(subBundle, i);
            }
        }
        else if (checks_1.isVanillaObject(inThing)) {
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
exports.typeCaseSplitF = typeCaseSplitF;
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
        if (checks_1.isVanillaArray(inThing)) {
            for (var i = 0; i < inThing.length; i++) {
                var subBundle = inThing[i];
                inThing[i] = afunc(subBundle, i);
            }
        }
        else if (checks_1.isVanillaObject(inThing)) {
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
exports.typeCaseSplitM = typeCaseSplitM;
//# sourceMappingURL=typesplit.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const hierarchical_1 = __webpack_require__(15);
const designator_1 = __webpack_require__(14);
class Domain {
    constructor(init = {}, isolated = false) {
        this.isolated = isolated;
        this.registry = {};
        this.subdomain = {};
        this.melder = hierarchical_1.deepMeldF();
        for (let key in init) {
            let val = init[key];
            if (val instanceof Domain) {
                this.addSubdomain(key, val);
            }
            else if (val instanceof Function) {
                this.addNature(key, val);
            }
            else if ('nature' in val) {
                this.addNature(key, val.nature, val.patch);
            }
            else {
                throw new Error("invalid domain constructor value");
            }
        }
    }
    addSubdomain(key, val) {
        if (!val.isolated) {
            val.parent = this;
        }
        if (key in this.subdomain) {
            throw new Error(`Subdomain ${key} already exists cannot redefine`);
        }
        else {
            this.subdomain[key] = val;
        }
    }
    branch(key) {
        let branched = new Domain({}, false);
        this.addSubdomain(key, branched);
        return branched;
    }
    locateDomain(dotpath) {
        if (dotpath.match(/^(?:[\w\$]+\.)*(?:[\w\$]+)$/)) {
            let subdomains = dotpath.split(/\./);
            let ns = this;
            for (let spacederef of subdomains) {
                if (spacederef in this.subdomain) {
                    ns = this.subdomain[spacederef];
                }
                else {
                    throw new Error(`Unable to locate Domain from ${dotpath}`);
                }
            }
            return ns;
        }
        else if (dotpath === "") {
            return this;
        }
        else {
            throw new Error(`invalid dotpath syntax: ${dotpath}`);
        }
    }
    locateBasis(basis) {
        let scan = new designator_1.Designator('subdomain', 'registry', basis);
        let result = scan.scan(this);
        let nresult = Object.keys(result).length;
        if (nresult === 0) {
            if (this.parent === undefined) {
                console.log("Domain:", this);
                throw new Error(`Unable to locate the basis '${basis}' is not registered to the Domain`);
            }
            else {
                this.parent.locateBasis(basis);
            }
        }
        else if (nresult === 1) {
            return result[Object.keys(result)[0]];
        }
        else {
            throw new Error(`Must designate exactly one basis object`);
        }
    }
    recover(construct) {
        let { nature, patch } = this.locateBasis(construct.basis);
        try {
            let spec = this.melder(patch, construct);
            return new nature(spec);
        }
        catch (e) {
            console.error("basis: ", construct.basis, " not a constructor in registry");
            throw e;
        }
    }
    register(key, basis, patch = {}) {
        if (typeof (basis) === 'string') {
            this.extend(basis, key, patch);
        }
        else {
            this.addNature(key, basis, patch);
        }
    }
    addNature(key, nature, patch = {}) {
        if (key in this.registry) {
            throw new Error(`Domain cannot contain duplicates "${key}" is already registered`);
        }
        else {
            this.registry[key] = {
                nature: nature,
                patch: patch
            };
        }
    }
    extend(seat, target, newSpec = {}) {
        let { targetDomain, targetName } = this.targetPlacement(target);
        let { nature, patch } = this.locateBasis(seat);
        let upspec = this.melder(patch, newSpec);
        targetDomain.addNature(targetName, nature, upspec);
    }
    targetPlacement(targetExp) {
        let desig = new designator_1.Designator('subdomain', 'registry', targetExp);
        let targetName = desig.getTerminal();
        let targetDomain = this.locateDomain(desig.getLocale());
        return { targetName: targetName, targetDomain: targetDomain };
    }
    use(otherDomain) {
        let allOther = new designator_1.Designator('subdomain', 'registry', "**:*").scan(otherDomain);
        for (let token in allOther) {
            let { nature, patch } = allOther[token];
            let { targetDomain, targetName } = this.targetPlacement(token);
            targetDomain.addNature(targetName, nature, patch);
        }
    }
}
exports.Domain = Domain;
//# sourceMappingURL=domain.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(35));
__export(__webpack_require__(20));
__export(__webpack_require__(21));
__export(__webpack_require__(33));
__export(__webpack_require__(36));
__export(__webpack_require__(34));
//# sourceMappingURL=all.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(9);
const Util = __webpack_require__(3);
const hierarchical_1 = __webpack_require__(15);
class Construct {
    constructor(spec) {
        this.cache = this.ensureObject(spec);
        this.cache.basis = this.cache.basis || 'object';
        this.alive = false;
    }
    ensureObject(spec) {
        if (spec === undefined) {
            return {};
        }
        else if (Util.isVanillaArray(spec)) {
            return {
                basis: 'array',
                anon: spec
            };
        }
        else if (Util.isVanillaObject(spec)) {
            return spec;
        }
        else {
            throw new Error("Invalid Specification for base Construct, must be object or undefined");
        }
    }
    applyForm(form = {}) {
        this.primeTractor = form.prime;
        this.disposeTractor = form.dispose;
    }
    clearForm(form = {}) {
        this.primeTractor = undefined;
        this.disposeTractor = undefined;
    }
    attach(anchor, alias) {
        this.anchor = anchor;
        this.alias = alias;
    }
    detach(anchor, alias) {
        this.anchor = undefined;
        this.alias = undefined;
    }
    prime(providedDomain) {
        if (providedDomain instanceof domain_1.Domain) {
            this.domain = providedDomain;
        }
        else if (providedDomain === undefined) {
            this.domain = Construct.DefaultDomain;
        }
        else {
            throw new Error(`The provided domain must be Domain type, or undefined`);
        }
        if (this.cache.domain !== undefined) {
            if (typeof this.cache.domain === 'string') {
                this.domain = this.domain.locateDomain(this.cache.domain);
            }
            else if (this.cache.domain instanceof domain_1.Domain) {
                this.domain = this.cache.domain;
            }
        }
        this.alive = true;
        this.applyForm(this.cache.form);
        if (this.primeTractor) {
            this.primeTractor.call(this.nucleus);
        }
    }
    ;
    dispose() {
        if (this.disposeTractor) {
            this.disposeTractor.call(this.nucleus);
        }
        this.alive = false;
    }
    extract() {
        return this.cache;
    }
    patch(patch) {
        if (this.alive && !patch.form != undefined) {
            this.dispose();
            this.patch(patch);
            this.prime(this.domain);
        }
        else {
            this.cache = hierarchical_1.deepMeldF()(this.cache, patch);
        }
    }
    extend(patch) {
        let ext = Util.B()
            .init(this.extract())
            .merge(patch)
            .dump();
        return this.domain.recover(ext);
    }
}
exports.Construct = Construct;
//# sourceMappingURL=construct.js.map

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BaseMedium {
    constructor(spec) {
        this.exclusive = false;
        this.multiA = true;
        this.multiB = true;
        this.matrix = { to: {}, from: {}, sym: {} };
        this.exposed = spec.exposed || {};
    }
    suppose(supposedLink) {
        let { tokenA, tokenB, contactA, contactB } = supposedLink;
        if (this.check(supposedLink)) {
            if (this.matrix.to[tokenA] === undefined) {
                this.matrix.to[tokenA] = {};
                this.inductA(tokenA, contactA);
            }
            if (this.matrix.from[tokenB] === undefined) {
                this.matrix.from[tokenB] = {};
                this.inductB(tokenB, contactB);
            }
            this.matrix.to[tokenA][tokenB] = supposedLink;
            this.matrix.from[tokenB][tokenA] = supposedLink;
            this.connect(supposedLink);
            return true;
        }
        else {
            return false;
        }
    }
    hasToken(token) {
        return token in this.matrix.to || token in this.matrix.from || token in this.matrix.sym;
    }
    hasLink(link) {
        if (link.directed) {
            if (link.tokenA in this.matrix.to && this.matrix.to[link.tokenA][link.tokenB] !== undefined) {
                return this.matrix.to[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA];
            }
            else {
                return false;
            }
        }
        else {
            if (link.tokenA in this.matrix.sym) {
                return this.matrix.sym[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA];
            }
            else {
                return false;
            }
        }
    }
    hasClaim(link) {
        return this.exclusive && (link.directed && (link.tokenA in this.matrix.to || link.tokenB in this.matrix.from))
            || (!link.directed && link.tokenA in this.matrix.sym);
    }
    breakA(token, a) {
        let connections = this.matrix.to[token];
        for (let other in connections) {
            this.disconnect(connections[other]);
        }
    }
    breakB(token, b) {
        let connections = this.matrix.from[token];
        for (let other in connections) {
            this.disconnect(connections[other]);
        }
    }
    check(link) {
        if (link.directed) {
            return (this.multiA || (this.matrix.to[link.tokenA] == undefined) || this.matrix.to[link.tokenA][link.tokenB] === undefined) &&
                (this.multiB || (this.matrix.from[link.tokenB] == undefined) || this.matrix.from[link.tokenB][link.tokenA] === undefined) &&
                link.contactA instanceof this.typeA && link.contactB instanceof this.typeB;
        }
        else {
            return (this.multiA || this.matrix.sym[link.tokenA][link.tokenB] === undefined) &&
                (this.multiB || this.matrix.sym[link.tokenB][link.tokenA] === undefined);
        }
    }
    ;
    disconnect(link) {
        if (link.directed) {
            delete this.matrix.to[link.tokenA][link.tokenB];
            delete this.matrix.from[link.tokenB][link.tokenA];
        }
    }
    ;
}
exports.BaseMedium = BaseMedium;
exports.mediaConstructors = {};
//# sourceMappingURL=medium.js.map

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(11);
class CellAccessory extends construct_1.Construct {
    attach(host, alias) {
        super.attach(host, alias);
    }
    detach(host, alias) {
        super.detach(host, alias);
    }
    prime(domain) {
        super.prime(domain);
    }
    ;
    dispose() {
        return this.cache;
    }
    extract() {
        return this.cache;
    }
    patch(patch) {
    }
}
exports.CellAccessory = CellAccessory;
//# sourceMappingURL=accessory.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const hierarchical_1 = __webpack_require__(15);
const operations_1 = __webpack_require__(25);
const f = __webpack_require__(26);
exports.DesignatorRegExp = /^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/;
function regexifyDesignationTerm(term) {
    if (term == '*') {
        return /.*/;
    }
    else if (term == '**') {
        return '**';
    }
    else {
        return new RegExp(`\^${term}\$`);
    }
}
exports.regexifyDesignationTerm = regexifyDesignationTerm;
function parseDesignatorString(desigstr) {
    let colonSplit = desigstr.match(exports.DesignatorRegExp);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, terminal] = colonSplit;
    }
    let subranedesig = (chain ? chain.split(/\./) : []).map((value, index) => {
        return regexifyDesignationTerm(value);
    });
    return {
        groups: subranedesig,
        end: regexifyDesignationTerm(terminal)
    };
}
exports.parseDesignatorString = parseDesignatorString;
function designatorToRegex(desigstr) {
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, terminal] = colonSplit;
    }
    let subranedesig = chain ? chain.split(/\./) : [];
    let regex = '';
    for (let i = 0; i < subranedesig.length; i++) {
        let term = subranedesig[i], first = i === 0, last = i === subranedesig.length - 1;
        if (term == '*') {
            regex += first ? '^(\\w+)' : '\.\\w+';
        }
        else if (term == '**') {
            regex += first ? '^(\\w+(\.\\w+)*?)?' : '(\.\\w+)*';
        }
        else {
            regex += first ? `^${term}` : `\.${term}`;
        }
    }
    regex += `:${terminal == '*' ? '(\\w+)' : terminal}$`;
    return new RegExp(regex);
}
exports.designatorToRegex = designatorToRegex;
function tokenDesignatedBy(token, designator) {
    let [match, allSubs, terminal] = token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)$/);
    let splitSubs = allSubs ? allSubs.split(/\./) : [];
    for (let i = 0; i < splitSubs.length; i++) {
        if (!matchDesignationTerm(splitSubs[i], designator.groups[i])) {
            return false;
        }
    }
    if (!matchDesignationTerm(terminal, designator.end)) {
        return false;
    }
    return true;
}
exports.tokenDesignatedBy = tokenDesignatedBy;
function matchDesignationTerm(target, term) {
    if (typeof (term) == 'string') {
        return target === term;
    }
    if (term instanceof Function) {
        return term(target);
    }
    else if (term instanceof RegExp) {
        return target.match(term);
    }
    else {
        return target.match(regexifyDesignationTerm(term));
    }
}
exports.matchDesignationTerm = matchDesignationTerm;
class Designator {
    constructor(groupName, finalName, designatorExp) {
        this.groupName = groupName;
        this.finalName = finalName;
        let desExp = designatorExp;
        if (designatorExp.match(/^[a-z0-9A-Z_\$]*$/)) {
            desExp = ":" + designatorExp;
        }
        this.designatorIR = parseDesignatorString(desExp);
        this.regex = designatorToRegex(desExp);
        this.expression = desExp;
        this.screens = [];
    }
    getLocale() {
        let colonSplit = this.expression.match(exports.DesignatorRegExp);
        return colonSplit[1] || "";
    }
    getTerminal() {
        let colonSplit = this.expression.match(exports.DesignatorRegExp);
        return colonSplit[2];
    }
    mergePaths(patha, pathb) {
        let merged = {
            groups: {},
            end: {}
        };
        for (let k in patha.groups || {}) {
            if (k in pathb.groups) {
                merged.groups[k] = this.mergePaths(patha.groups[k], pathb.groups[k]);
            }
            else {
                merged.groups[k] = patha.groups[k];
            }
        }
        for (let k in pathb.groups || {}) {
            if (!(k in patha.groups)) {
                merged.groups[k] = pathb.groups[k];
            }
        }
        for (let k in patha.end || {}) {
            merged.end[k] = patha.end[k];
        }
        for (let k in pathb.end || {}) {
            merged.end[k] = pathb.end[k];
        }
        return merged;
    }
    treeDesignate(target, negative = false) {
        let result = this._treeDesignate(target, { thumb: 0, glob: false });
        for (let screen of this.screens) {
            let dmask = screen._treeDesignate(result, { thumb: 0, glob: false });
            let term = (obj1, obj2, k) => { return k === 'end'; };
            let endmask = operations_1.meld((a, b) => { return a; });
            let endinvert = operations_1.invert(f.negate.existential);
            let inv = hierarchical_1.deepInvertF(term, endinvert)(dmask);
            result = hierarchical_1.deepMeldF(term, endmask)(result, inv);
        }
        return result;
    }
    _treeDesignate(target, recurState) {
        let rState = recurState;
        let collected = {
            groups: {},
            end: {}
        };
        let terminal = false;
        let groups = this.designatorIR.groups;
        let end = this.designatorIR.end;
        let current = groups[rState.thumb];
        if (current !== undefined) {
            if (current === "**") {
                rState.glob = true;
                if (rState.thumb === groups.length - 1) {
                    terminal = true;
                }
                else {
                    rState.thumb += 1;
                    current = groups[rState.thumb];
                }
            }
            let collectedSubs = [];
            for (let mk in target[this.groupName]) {
                let subgroup = target[this.groupName][mk];
                if (matchDesignationTerm(mk, current)) {
                    let proceedwithoutGlob = { thumb: rState.thumb + 1, glob: false };
                    let eager = this._treeDesignate(subgroup, proceedwithoutGlob);
                    if (rState.glob) {
                        let keepWithGlob = { thumb: rState.thumb, glob: true };
                        let patient = this._treeDesignate(subgroup, keepWithGlob);
                        collected.groups[mk] = this.mergePaths(eager, patient);
                    }
                    else {
                        collected.groups[mk] = eager;
                    }
                }
                else if (rState.glob) {
                    let rUpdate = { thumb: rState.thumb, glob: true };
                    collected.groups[mk] = this._treeDesignate(subgroup, rUpdate);
                }
            }
        }
        else {
            terminal = true;
        }
        if (terminal) {
            let terminalsHere = target[this.finalName];
            for (let tlabel in terminalsHere) {
                let t = terminalsHere[tlabel];
                if (matchDesignationTerm(tlabel, end)) {
                    collected.end[tlabel] = t;
                }
            }
        }
        return collected;
    }
    flatDesignate(target) {
        let recur = function (dtree, collection) {
            for (let k in dtree.end) {
                let v = dtree.end[k];
                collection.push(v);
            }
            for (let k in dtree.groups) {
                let v = dtree.groups[k];
                recur(v, collection);
            }
        };
        return recur(this.treeDesignate(target), []);
    }
    tokenDesignate(target) {
        let recur = function (dtree, tokens, chain) {
            for (let k in dtree.end) {
                let v = dtree.end[k];
                tokens[chain + ':' + k] = v;
            }
            for (let k in dtree.groups) {
                let v = dtree.groups[k];
                let lead = chain === '' ? chain : chain + '.';
                recur(v, tokens, lead + k);
            }
            return tokens;
        };
        return recur(this.treeDesignate(target), {}, '');
    }
    screen(desexp) {
        this.screens.push(new Designator('groups', 'end', desexp));
    }
    scan(target, flat = false, negative = false) {
        if (flat) {
            return this.flatDesignate(target);
        }
        else {
            return this.tokenDesignate(target);
        }
    }
    matches(token) {
        return token.match(this.regex);
    }
}
exports.Designator = Designator;
//# sourceMappingURL=designator.js.map

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const f = __webpack_require__(26);
const op = __webpack_require__(25);
function mustTerminate(obj1, obj2, q) {
    obj1 instanceof Object;
}
function deepMeldF(terminator = f.terminate.isPrimative, reduce = f.reduce.latest) {
    function recur(obj1, obj2, q) {
        if (terminator(obj1, obj2, q)) {
            return reduce(obj1, obj2, q);
        }
        else {
            return op.meld(recur)(obj1, obj2);
        }
    }
    return recur;
}
exports.deepMeldF = deepMeldF;
function deepMaskF(terminator, reduce) {
    function recur(obj1, obj2, q) {
        return op.mask((innerObj1, innerObj2, q) => {
            if (terminator(innerObj1, innerObj2, q)) {
                return reduce(innerObj1, innerObj2, q);
            }
            else {
                return recur(innerObj1, innerObj2, q);
            }
        })(obj1, obj2);
    }
    return recur;
}
exports.deepMaskF = deepMaskF;
function deepInvertF(terminator, negater) {
    function recur(obj, q) {
        return op.invert((innerObj, k) => {
            if (terminator(innerObj, undefined, k)) {
                return negater(innerObj, k);
            }
            else {
                return recur(innerObj, k);
            }
        })(obj);
    }
    return recur;
}
exports.deepInvertF = deepInvertF;
//# sourceMappingURL=hierarchical.js.map

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(0);
const offering_1 = __webpack_require__(18);
class AccessContact extends base_1.BasicContact {
    constructor(accessPolicy) {
        super();
        this.accessPolicy = accessPolicy;
        this.symmetric = false;
        this.invertable = true;
        this.handler = {
            set(target, property, value, reciever) {
                target[property] = value;
                return true;
            },
            get(target, property, reciever) {
                let gotten = target[property];
                return gotten;
            }
        };
    }
    invert() {
        return super.invert();
    }
    createPartner() {
        return new offering_1.OfferContact(this.accessPolicy);
    }
    setAccessed(accessed) {
        this.proxy = new Proxy(accessed, this.handler);
    }
    inject(context, key) {
        context[key] = this.proxy;
    }
    ;
    retract(context, key) {
        delete context[key];
    }
    ;
}
exports.AccessContact = AccessContact;
//# sourceMappingURL=access.js.map

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(16));
__export(__webpack_require__(18));
//# sourceMappingURL=common.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(0);
const access_1 = __webpack_require__(16);
class OfferContact extends base_1.BasicContact {
    constructor(accessPolicy) {
        super();
        this.accessPolicy = accessPolicy;
        this.symmetric = false;
        this.invertable = true;
        this.linkedAccess = {};
    }
    invert() {
        return super.invert();
    }
    createPartner() {
        let partner = new access_1.AccessContact(this.accessPolicy);
        partner.setAccessed(this.linkedAccess);
        return partner;
    }
    inject(context, key) {
        this.hidden = true;
        if (key === undefined) {
            this.partner.setAccessed(context);
        }
        else {
            this.partner.setAccessed(context[key]);
        }
    }
    ;
    retract(context, key) {
        this.partner.setAccessed(this.linkedAccess);
    }
    ;
}
exports.OfferContact = OfferContact;
//# sourceMappingURL=offering.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const designator_1 = __webpack_require__(14);
var MembraneEvents;
(function (MembraneEvents) {
    MembraneEvents[MembraneEvents["AddContact"] = 0] = "AddContact";
    MembraneEvents[MembraneEvents["AddMembrane"] = 1] = "AddMembrane";
    MembraneEvents[MembraneEvents["RemoveContact"] = 2] = "RemoveContact";
    MembraneEvents[MembraneEvents["RemoveMembrane"] = 3] = "RemoveMembrane";
})(MembraneEvents = exports.MembraneEvents || (exports.MembraneEvents = {}));
function DemuxWatchMethodsF(target) {
    return (event, data, token) => {
        switch (event) {
            case (MembraneEvents.AddContact):
                target.onAddContact(data, token);
                break;
            case (MembraneEvents.RemoveContact):
                target.onRemoveContact(data, token);
                break;
            case (MembraneEvents.AddMembrane):
                target.onAddMembrane(data, token);
                break;
            case (MembraneEvents.RemoveMembrane):
                target.onRemoveMembrane(data, token);
                break;
        }
    };
}
exports.DemuxWatchMethodsF = DemuxWatchMethodsF;
class Section {
    constructor() {
        this.sections = [];
        this.watches = [];
    }
    addSection(desexp, alias) {
        let section = new Section();
        if (this instanceof Membrane) {
            section.source = this;
        }
        else {
            section.source = this.source;
        }
        Object.defineProperty(section, 'subranes', {
            get() {
                return this.source.subranes;
            }
        });
        Object.defineProperty(section, 'contacts', {
            get() {
                return this.source.contacts;
            }
        });
        section.designator = new designator_1.Designator('subranes', 'contacts', desexp);
        if (alias === undefined) {
            this.sections[Symbol("anon")] = section;
        }
        else {
            this.sections[alias] = section;
        }
        return section;
    }
    designate(dexp, flat = false) {
        let desig = new designator_1.Designator('subranes', 'contacts', dexp);
        for (let ik of Object.getOwnPropertySymbols(this.sections).concat(Object.keys(this.sections))) {
            desig.screen(this.sections[ik].designator.expression);
        }
        return desig.scan(this, flat);
    }
    addWatch(watcher, alias) {
        if (alias === undefined) {
            this.watches[Symbol("anon")] = watcher;
        }
        else {
            this.watches[alias] = watcher;
        }
    }
    removeWatch(key) {
        delete this.watches[key];
    }
    removeAllWatches() {
        this.watches = [];
    }
    nextToken(token, key) {
        if (!(typeof key === 'symbol')) {
            if (token === undefined) {
                return key;
            }
            else if (token.match(/^\:\w+$/)) {
                return `${key}${token}`;
            }
            else {
                return `${key}.${token}`;
            }
        }
        else {
            return token || "";
        }
    }
    changeOccurred(event, subject, token) {
        for (let skey of Object.getOwnPropertySymbols(this.sections).concat(Object.keys(this.sections))) {
            let section = this.sections[skey];
            if (section.designator === undefined || section.designator.matches(token)) {
                section.changeOccurred(event, subject, this.nextToken(token, skey));
                return;
            }
        }
        for (let wKey of Object.getOwnPropertySymbols(this.watches).concat(Object.keys(this.watches))) {
            let watch = this.watches[wKey];
            if (watch.designator === undefined || watch.designator.matches(token)) {
                watch.changeOccurred(event, subject, this.nextToken(token, wKey));
            }
        }
    }
}
exports.Section = Section;
class Membrane extends Section {
    constructor() {
        super();
        this.contacts = {};
        this.subranes = {};
        this.notify = true;
    }
    invert() {
        if (this.inverted === undefined) {
            this.inverted = new Membrane();
            this.inverted.inverted = this;
            for (let rk in this.contacts) {
                let contact = this.contacts[rk];
                if (contact.invertable) {
                    this.inverted.addContact(contact.invert(), rk);
                }
            }
        }
        return this.inverted;
    }
    addSubrane(membrane, label) {
        this.subranes[label] = membrane;
        membrane.addWatch(this, label);
        this.notifyMembraneAdd(membrane, label);
        let allNew = membrane.designate("**:*", false);
        for (let token in allNew) {
            this.changeOccurred(MembraneEvents.AddContact, allNew[token], this.nextToken(token, label));
        }
    }
    removeSubrane(label) {
        let removing = this.subranes[label];
        delete this.subranes[label];
        let allNew = removing.designate("**:*", false);
        for (let token in allNew) {
            this.changeOccurred(MembraneEvents.RemoveContact, allNew[token], this.nextToken(token, label));
        }
        this.notifyMembraneRemove(removing, label);
        return removing;
    }
    addContact(contact, label) {
        let existing = this.contacts[label];
        if (existing !== undefined) {
        }
        else {
            contact.attach(this, label);
            this.contacts[label] = contact;
            if (this.inverted !== undefined) {
                if (contact.invertable && !contact.inverted) {
                    let partner = contact.invert();
                    this.inverted.addContact(partner, label);
                    if (this.inverted.contacts[label] !== partner) {
                    }
                }
            }
            this.notifyContactAdd(contact, label);
        }
    }
    removeContact(label) {
        let removing = this.contacts[label];
        if (removing !== undefined) {
            removing.detach();
            delete this.contacts[label];
            if (this.inverted && removing.invertable) {
                this.inverted.removeContact(label);
            }
            this.notifyContactRemove(removing, label);
        }
        return removing;
    }
    notifyContactAdd(contact, label) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.AddContact, contact, ":" + label);
        }
    }
    notifyContactRemove(contact, label) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.RemoveContact, contact, ":" + label);
        }
    }
    notifyMembraneAdd(membrane, token) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.AddMembrane, membrane, "" + token);
        }
    }
    notifyMembraneRemove(membrane, token) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.RemoveMembrane, membrane, "" + token);
        }
    }
}
exports.Membrane = Membrane;
//# sourceMappingURL=membrane.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(2);
const CS = __webpack_require__(4);
class Cell extends CS.Composite {
    constructor(spec) {
        spec.domain = spec.domain;
        spec.basis = 'cell';
        super(spec);
        this.nucleus = {};
        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
    }
    applyForm(form = {}) {
        super.applyForm(form);
        let media = {};
        for (let mediumBasis of form.media || []) {
            media[mediumBasis] = this.domain.recover({
                basis: 'media:' + mediumBasis,
                label: mediumBasis,
                exposed: this.nucleus
            });
        }
        let rules = form.mesh || {};
        this.mesh = new IO.RuleMesh({
            membrane: this.lining,
            rules: rules,
            media: media,
            exposed: this.nucleus
        });
        this.anchor = {
            nucleus: this.nucleus,
            lining: this.lining,
            mesh: this.mesh
        };
        if (form.sections !== undefined) {
            for (let sectionkey in form.sections) {
                this.parseSectionRule(form.sections[sectionkey]);
            }
        }
    }
    clearForm() {
    }
    parseSectionRule(rule) {
        let match = rule.match(/^([\w\:\.\*]*)\s*to\s*(nucleus|shell)\s*(?:as\s*(\w*))?$/);
        if (match) {
            let desexp = match[1];
            let target = match[2];
            let alias = match[3];
            let sect = this.lining.addSection(desexp);
            if (target === 'shell') {
                this.shell.addSubrane(sect, alias);
            }
            else if (target === 'nucleus') {
                if (alias !== undefined) {
                    this.nucleus[alias] = {};
                }
                sect.addWatch({
                    changeOccurred: (event, subject, token) => {
                        if (event == IO.MembraneEvents.AddContact) {
                            let injectsite = alias === undefined ? this.nucleus : this.nucleus[alias];
                            subject.inject(injectsite, token);
                        }
                    }
                });
            }
        }
        else {
            throw `Invalid section expression: ${rule}`;
        }
    }
    attach(anchor, alias) {
        anchor.lining.addSubrane(this.shell, alias);
    }
    detach(anchor, alias) {
        anchor.lining.removeSubrane(alias);
    }
    addConstruct(k, construct) {
        super.addConstruct(k, construct);
    }
    addStrange(k, v) {
        this.nucleus[k] = v;
    }
    addPrimative(k, v) {
        this.nucleus[k] = v;
    }
    addObject(k, v) {
        let construct = new Cell(v);
        this.addConstruct(k, construct);
    }
}
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const cell_1 = __webpack_require__(20);
const common_1 = __webpack_require__(17);
class DefaultCell extends cell_1.Cell {
    constructor(object) {
        super(object);
    }
    applyForm(form = {}) {
        super.applyForm(form);
        this.parseSectionRule('*:access to nucleus');
        this.parseSectionRule('*.**:* to shell');
        this.offering = new common_1.OfferContact(form.accessPolicy);
        this.accessor = this.offering.invert();
        this.offering.inject(this, 'nucleus');
        this.lining.addContact(this.offering, 'access');
        this.shell.addContact(this.accessor, 'access');
    }
    clearForm() {
        this.offering.retract(this.nucleus, undefined);
        this.lining.removeContact('access');
        super.clearForm();
    }
    attach(anchor, key) {
        if (anchor.nucleus) {
            this.accessor.inject(anchor.nucleus, key);
        }
        anchor.lining.addSubrane(this.shell, key);
    }
    detach(anchor, key) {
        this.accessor.retract(anchor.nucleus, key);
        anchor.lining.removeSubrane(key);
    }
}
exports.DefaultCell = DefaultCell;
//# sourceMappingURL=default.js.map

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(1);
const transforms_1 = __webpack_require__(27);
function dumpToDepthF(maxdepth, indentSym = "  ") {
    let recur = function (depth, indentation, item) {
        let outstr = "\n";
        if (checks_1.isPrimative(item) || depth <= 0) {
            outstr = String(item);
        }
        else if (item instanceof Array) {
            outstr = "[\n";
            item.forEach((item) => { outstr += (indentation + recur(depth - 1, indentation + indentSym, item) + '\n'); });
            outstr += "\n]";
        }
        else if (item instanceof Object) {
            outstr = "{\n";
            for (let k in item) {
                outstr += (indentation + indentSym + k + ': ' + recur(depth - 1, indentation + indentSym, item[k]) + '\n');
            }
            outstr += "\n" + indentation + "}";
        }
        return outstr;
    };
    return (x) => {
        return recur(maxdepth, "", x);
    };
}
exports.dumpToDepthF = dumpToDepthF;
class JungleError {
    constructor(message, fileName, lineNumber) {
        this.message = message;
        this.fileName = fileName;
        this.lineNumber = lineNumber;
        var err = new Error();
    }
}
exports.JungleError = JungleError;
class Crumb {
    constructor(label) {
        this.label = label;
        this.raised = false;
        if (label in Crumb.customOptions) {
            this.setOptions(Crumb.customOptions[label]);
        }
        else {
            this.options = Crumb.defaultOptions;
        }
    }
    setOptions(optionObj) {
        if (Crumb.defaultOptions.debug instanceof Array) {
            if (Crumb.defaultOptions.debug.indexOf(this.label) !== -1) {
                (Crumb.customOptions[this.label] = Crumb.customOptions[this.label] || { debug: true }).debug = true;
            }
        }
        this.options = transforms_1.melder(Crumb.defaultOptions, optionObj);
    }
    drop(label) {
        let crumb = new Crumb(label);
        crumb.previous = this;
        return crumb;
    }
    excursion(label, callback) {
        let catcher = this.drop(label)
            .catch((crumback) => {
            this.raise(`
Excursion Failure: ${crumback.message}

While Attempting:
${crumback.describe()}
`);
        });
        try {
            callback(catcher);
        }
        catch (e) {
            catcher.raise(e);
        }
    }
    at(position) {
        if (this.options.debug) {
            this.position = (this.options.at || this.options.format)(position);
            if (this.options.log !== undefined) {
                let logmsg = (`[${this.label}] at: ${this.position}`);
                this.options.log.log(logmsg);
            }
        }
        return this;
    }
    in(location) {
        if (this.options.debug) {
            this.location = (this.options.within || this.options.format)(location);
            if (this.options.log !== undefined) {
                let logmsg = (`[${this.label}] in: ${this.location}`);
                this.options.log.log(logmsg);
            }
        }
        return this;
    }
    as(situation) {
        if (this.options.debug) {
            this.situation = (this.options.as || this.options.format)(situation);
            if (this.options.log !== undefined) {
                let logmsg = (`[${this.label}] as: ${this.situation}`);
                this.options.log.log(logmsg);
            }
        }
        return this;
    }
    with(data) {
        if (this.options.debug) {
            this.data = (this.options.with || this.options.format)(data);
            if (this.options.log !== undefined) {
                let logmsg = (`[${this.label}] with: ${this.data}`);
                this.options.log.log(logmsg);
            }
        }
        return this;
    }
    dump() {
        return `
${this.message !== undefined ? `Error: ${this.message}` : ''}

Crumb Trail(most recent at top):
${this.traceback(this.options.traceDepth)}\
        `;
    }
    traceback(depth = -1) {
        if (this.previous !== undefined && (depth > 0 || depth === -1)) {
            return `
${this.describe()}
|
${this.previous.traceback(depth === -1 ? depth : depth - 1)}
`;
        }
        else {
            return this.describe();
        }
    }
    describe() {
        return `\
* ${this.options.header}: ${this.label}\
${this.position !== undefined ? `\n|    at stage: ${this.position}` : ''}\
${this.location !== undefined ? `\n|    within location: ${this.location}` : ''}\
${this.situation !== undefined ? `\n|    as situation: ${this.situation}` : ''}\
${this.data !== undefined ? `\n|    with data: ${this.data}` : ''}\
`;
    }
    catch(callback) {
        this.catchCallback = callback;
        return this;
    }
    raise(error) {
        if (this.catchCallback && !this.raised) {
            this.raised = true;
            this.message = error;
            this.catchCallback(this);
        }
        else {
            this.message = error;
            throw this.dump();
        }
    }
    deflect(exception) {
        if (this.previous) {
            this.previous.raise(`
Deflected:
from: ${this.label}
message: ${exception}`);
        }
        else {
            this.raise(exception);
        }
    }
}
Crumb.defaultOptions = {
    header: "Crumb",
    traceDepth: -1,
    debug: false,
    log: console,
    format: (x) => { return x; },
    with: undefined,
    at: undefined,
    within: undefined,
    as: undefined,
};
Crumb.customOptions = {};
exports.Crumb = Crumb;
//# sourceMappingURL=debug.js.map

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(8);
var JResultNatures;
(function (JResultNatures) {
    JResultNatures[JResultNatures["Single"] = 0] = "Single";
    JResultNatures[JResultNatures["Keyed"] = 1] = "Keyed";
    JResultNatures[JResultNatures["Indexed"] = 2] = "Indexed";
    JResultNatures[JResultNatures["Appended"] = 3] = "Appended";
    JResultNatures[JResultNatures["Uninferred"] = 4] = "Uninferred";
})(JResultNatures || (JResultNatures = {}));
const WAITING = "WAIT";
class Junction {
    constructor() {
        this.leashed = [];
        this.silentIndex = 0;
        this.silentAwaits = [];
        this.resultNature = JResultNatures.Uninferred;
        this.blocked = false;
        this.cleared = false;
        this.fried = false;
    }
    proceedThen() {
        this.cleared = true;
        if (this.thenCallback !== undefined) {
            let propagate, handle;
            handle = new Junction();
            let future = this.future;
            propagate = this.thenCallback(this.awaits, handle);
            if (handle.isClean()) {
                future.unleash(propagate);
            }
            else {
                handle.then(function (result, handle) {
                    future.unleash(result);
                });
            }
        }
        else {
            this.future.unleash(this.awaits);
        }
    }
    unleash(propagated) {
        let [release, raise] = this._hold(this.thenkey);
        this.blocked = false;
        for (let i = 0; i < this.leashed.length; i++) {
            this.leashed[i]();
        }
        delete this.leashed;
        release(propagated);
    }
    proceedCatch(error) {
        if (this.catchCallback !== undefined) {
            this.catchCallback(error);
        }
        else if (this.future !== undefined) {
            this.future.proceedCatch(error);
        }
        else {
            throw new Error(`Error raised from hold, arriving from ${error.key} with message ${error.message}`);
        }
    }
    successor() {
        if (this.cleared || !this.hasFuture()) {
            return this;
        }
        else {
            return this.future.successor();
        }
    }
    frontier() {
        if (this.future) {
            return this.future.frontier();
        }
        else {
            return this;
        }
    }
    realize() {
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
    }
    isClean() {
        return !this.hasFuture() && !this.isTampered() && this.isPresent();
    }
    isIdle() {
        return this.allDone() && this.isPresent();
    }
    isReady() {
        return this.allDone() && this.isPresent() && this.hasFuture() && !this.fried;
    }
    isTampered() {
        return !(this.silentAwaits.length <= 1 && this.resultNature === JResultNatures.Uninferred);
    }
    isPresent() {
        return !(this.blocked || this.cleared);
    }
    hasFuture() {
        return this.future != undefined;
    }
    allDone() {
        let awaitingAnySilent = false;
        this.silentAwaits.forEach((swaiting) => { awaitingAnySilent = swaiting || awaitingAnySilent; });
        let awaitingAny;
        if (this.resultNature === JResultNatures.Single) {
            awaitingAny = this.awaits === WAITING;
        }
        else {
            awaitingAny = typesplit_1.typeCaseSplitR(function (thing, key) {
                return thing === WAITING;
            })(this.awaits, false, function (a, b, k) { return a || b; });
        }
        return this.cleared || (!awaitingAny && !awaitingAnySilent);
    }
    hold(returnkey) {
        return this.frontier()._hold(returnkey);
    }
    _hold(returnkey) {
        let accessor, silent = false;
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
            ((res) => {
                if ((accessor !== undefined) && !silent) {
                    this.awaits[accessor] = res;
                }
                else if ((accessor !== undefined) && silent) {
                    this.silentAwaits[accessor] = false;
                }
                else if (accessor === undefined) {
                    this.awaits = res;
                }
                if (this.isReady()) {
                    this.proceedThen();
                }
            }),
            ((err) => {
                this.fried = true;
                this.error = {
                    message: err, key: accessor
                };
                if (this.fried && this.hasFuture()) {
                    this.proceedCatch(this.error);
                }
            })
        ];
    }
    await(act, label) {
        let frontier = this.frontier();
        let [done, raise] = frontier.hold(label);
        if (frontier.blocked) {
            frontier.leashed.push(act.bind(null, done, raise));
        }
        else {
            act(done, raise);
        }
        return frontier;
    }
    merge(upstream, holdstyle) {
        let frontier = this.frontier();
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
    }
    then(callback, thenkey) {
        let frontier = this.frontier();
        frontier.future = new Junction();
        frontier.future.thenkey = thenkey;
        frontier.future.blocked = true;
        frontier.thenCallback = callback;
        if (frontier.isReady()) {
            frontier.proceedThen();
        }
        return frontier.future;
    }
    catch(callback) {
        let frontier = this.frontier();
        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.catchCallback = callback;
        if (frontier.fried && frontier.hasFuture()) {
            frontier.proceedCatch(frontier.error);
        }
        return frontier.future;
    }
}
exports.Junction = Junction;
//# sourceMappingURL=junction.js.map

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isSubset(seq1, seq2) {
    for (let k of seq1) {
        if (seq2.indexOf(k) === -1) {
            return false;
        }
    }
    return true;
}
exports.isSubset = isSubset;
function isSetEqual(seq1, seq2) {
    return isSubset(seq1, seq2) && isSubset(seq2, seq1);
}
exports.isSetEqual = isSetEqual;
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
exports.weightedChoice = weightedChoice;
function range(...args) {
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
        for (let i = beg; i > end; i += step) {
            rng.push(i);
        }
    }
    else if (beg < end && step > 0) {
        for (let i = beg; i < end; i += step) {
            rng.push(i);
        }
    }
    else {
        throw new Error("invalid range parameters");
    }
    return rng;
}
exports.range = range;
//# sourceMappingURL=math.js.map

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function meld(reduce) {
    return function (obj1, obj2) {
        let melded = {};
        let keys1 = Object.keys(obj1);
        let keys2 = Object.keys(obj2);
        for (let k of keys1) {
            if (!(k in obj2)) {
                melded[k] = obj1[k];
            }
        }
        for (let k of keys2) {
            if ((k in obj1)) {
                if (obj1[k] === Symbol.for('delete') || obj2[k] === Symbol.for('delete')) {
                    continue;
                }
                melded[k] = reduce(obj1[k], obj2[k], k);
            }
            else {
                melded[k] = obj2[k];
            }
        }
        return melded;
    };
}
exports.meld = meld;
function mask(reduce) {
    return function (obj1, obj2) {
        let masked = {};
        let keys1 = Object.keys(obj1);
        for (var k of keys1) {
            if (k in obj2) {
                if (obj1[k] === Symbol.for('delete') || obj2[k] === Symbol.for('delete')) {
                    continue;
                }
                masked[k] = reduce(obj1[k], obj2[k], k);
            }
        }
        return masked;
    };
}
exports.mask = mask;
function invert(negate) {
    return function (obj) {
        let inverted = {};
        let keys = Object.keys(obj);
        for (let k of keys) {
            inverted[k] = negate(obj[k], k);
        }
        return inverted;
    };
}
exports.invert = invert;
//# sourceMappingURL=operations.js.map

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var map;
(function (map) {
    function identity(x) {
        return x;
    }
    map.identity = identity;
})(map = exports.map || (exports.map = {}));
var reduce;
(function (reduce) {
    function latest(a, b) {
        return b;
    }
    reduce.latest = latest;
})(reduce = exports.reduce || (exports.reduce = {}));
var scan;
(function (scan) {
    function enumerable(obj) {
        return Object.keys(obj);
    }
    scan.enumerable = enumerable;
})(scan = exports.scan || (exports.scan = {}));
var terminate;
(function (terminate) {
    function isPrimative(test, obj2, key) {
        return !(test instanceof Object);
    }
    terminate.isPrimative = isPrimative;
})(terminate = exports.terminate || (exports.terminate = {}));
var negate;
(function (negate) {
    function existential(some) {
        return Symbol.for("delete");
    }
    negate.existential = existential;
})(negate = exports.negate || (exports.negate = {}));
//# sourceMappingURL=primary-functions.js.map

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(1);
const typesplit_1 = __webpack_require__(8);
function identity(x) {
    return x;
}
exports.identity = identity;
function collapseValues(obj) {
    if (!checks_1.isVanillaTree(obj)) {
        throw new Error("cant collapse circular structure");
    }
    let valArr = [];
    function nodeProcess(node) {
        valArr.push(node);
    }
    function recursor(node) {
        typesplit_1.typeCaseSplitF(recursor, recursor, nodeProcess)(node);
    }
    recursor(obj);
    return valArr;
}
exports.collapseValues = collapseValues;
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
exports.translator = translator;
function melder(node1, node2, merge = function (a, b) { return b; }, concatArrays = false, typeConstrain = true) {
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
exports.melder = melder;
function softAssoc(from, onto) {
    for (var k in from) {
        onto[k] = melder(from[k], onto[k]);
    }
}
exports.softAssoc = softAssoc;
function parassoc(from, onto) {
    for (var k in from) {
        onto[k] = melder(onto[k], from[k], function (a, b) {
            return [a, b];
        }, true);
    }
}
exports.parassoc = parassoc;
function assoc(from, onto) {
    for (var k in from) {
        onto[k] = melder(onto[k], from[k]);
    }
}
exports.assoc = assoc;
function deepCopy(thing) {
    return typesplit_1.typeCaseSplitF(deepCopy, deepCopy)(thing);
}
exports.deepCopy = deepCopy;
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
exports.applyMixins = applyMixins;
function objectArrayTranspose(objArr, key) {
    var invert;
    if (typeof (key) !== 'string') {
        throw new Error("Value error: key must be string literal");
    }
    if (checks_1.isVanillaArray(objArr)) {
        invert = {};
        objArr.forEach(function (value, index) {
            invert[value[key]] = value;
        });
    }
    else if (checks_1.isVanillaObject(objArr)) {
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
exports.objectArrayTranspose = objectArrayTranspose;
function flattenObject(obj, depth = -1, values = []) {
    for (let k in obj) {
        let v = obj[k];
        if (checks_1.isVanillaObject(v) && (depth >= 0 || depth >= -1)) {
            flattenObject(v, depth - 1, values);
        }
        else {
            values.push(v);
        }
    }
    return values;
}
exports.flattenObject = flattenObject;
function mapObject(obj, func) {
    let mapped = {};
    for (let k in obj) {
        let v = obj[k];
        mapped[k] = func(k, v);
    }
    return mapped;
}
exports.mapObject = mapObject;
function projectObject(obj, keys) {
    if (obj instanceof Object) {
        let result;
        if (obj instanceof Array) {
            result = [];
            for (let k of keys) {
                if (k in obj) {
                    result.push(obj[k]);
                }
            }
        }
        else {
            result = {};
            for (let k of keys) {
                if (k in obj) {
                    result[k] = obj[k];
                }
            }
        }
        return result;
    }
    else {
        return obj;
    }
}
exports.projectObject = projectObject;
//# sourceMappingURL=transforms.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(11);
const all_1 = __webpack_require__(3);
class Composite extends construct_1.Construct {
    constructor(spec) {
        super(spec);
        this.keywords = { basis: null, domain: null, form: null, anon: null };
        this.subconstructs = [];
    }
    prime(domain) {
        super.prime(domain);
        for (let k in this.cache) {
            if (!(k in this.keywords)) {
                let v = this.cache[k];
                this.add(v, k);
            }
        }
        if (this.cache.anon !== undefined) {
            for (let i = 0; i < this.cache.anon.length; i++) {
                this.add(this.cache.anon[i]);
            }
        }
        if (this.beginTractor) {
            this.beginTractor.call(this.nucleus);
        }
    }
    applyForm(form) {
        super.applyForm(form);
        this.beginTractor = form.begin;
        this.endTractor = form.end;
    }
    clearForm() {
        this.beginTractor = undefined;
        this.endTractor = undefined;
        super.clearForm();
    }
    add(v, key) {
        let k = key === undefined ? this.subconstructs.length++ : key;
        if (this.alive) {
            if (all_1.isPrimative(v)) {
                this.addPrimative(k, v);
            }
            else if (v instanceof construct_1.Construct) {
                let spec = v.extract();
                let recovered = this.domain.recover(spec);
                this.addConstruct(k, recovered);
            }
            else if (all_1.isVanillaObject(v)) {
                if ('basis' in v) {
                    let recovered = this.domain.recover(v);
                    this.addConstruct(k, recovered);
                }
                else {
                    v.basis = 'object';
                    let recovered = this.domain.recover(v);
                    this.addConstruct(k, recovered);
                }
            }
            else if (all_1.isVanillaArray(v)) {
                let patch = {
                    basis: 'array',
                    anon: v
                };
                let recovered = this.domain.recover(patch);
                this.addConstruct(k, recovered);
            }
            else {
                this.addStrange(k, v);
            }
        }
        else {
            this.cache[k] = v;
        }
    }
    addConstruct(k, construct) {
        construct.prime(this.domain);
        this.subconstructs[k] = construct;
        construct.attach(this.anchor, k);
    }
    addStrange(k, v) {
    }
    addPrimative(k, v) {
    }
    remove(k) {
        let removing = this.subconstructs[k];
        if (removing !== undefined) {
            removing.detach(this.anchor, k);
            let final = removing.dispose();
            delete this.subconstructs[k];
            return final;
        }
    }
    dispose() {
        if (this.endTractor) {
            this.endTractor.call(this.nucleus);
        }
        for (let key in this.subconstructs) {
            let construct = this.subconstructs[key];
            construct.detach(this.anchor, key);
            construct.dispose();
        }
        this.clearForm();
        super.dispose();
    }
    extract() {
        if (this.alive) {
            let extracted = {};
            for (let key in this.subconstructs) {
                let construct = this.subconstructs[key];
                extracted[key] = construct.extract();
            }
            return all_1.B()
                .init(this.cache)
                .blend(extracted)
                .dump();
        }
        else {
            return this.cache;
        }
    }
    patch(patch) {
    }
    extend(patch) {
        let ext = all_1.B()
            .init(this.extract())
            .merge(patch)
            .dump();
        return this.domain.recover(ext);
    }
}
exports.Composite = Composite;
//# sourceMappingURL=composite.js.map

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(12);
const callout_1 = __webpack_require__(6);
const callin_1 = __webpack_require__(5);
class DirectMedium extends medium_1.BaseMedium {
    constructor(spec) {
        super(spec);
        this.typeA = callout_1.CallOut;
        this.typeB = callin_1.CallIn;
        this.exclusive = true;
        this.multiA = false,
            this.multiB = false;
    }
    inductA(token, a) {
    }
    inductB(token, b) {
    }
    connect(link) {
        link.contactA.emit = link.contactB.put;
    }
    disconnect(link) {
        link.contactA.emit = undefined;
        super.disconnect(link);
    }
}
exports.DirectMedium = DirectMedium;
medium_1.mediaConstructors['direct'] = DirectMedium;
//# sourceMappingURL=directed.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(12);
const callout_1 = __webpack_require__(6);
const callin_1 = __webpack_require__(5);
class DistributeMedium extends medium_1.BaseMedium {
    constructor(spec) {
        super(spec);
        this.typeA = callout_1.CallOut;
        this.typeB = callin_1.CallIn;
    }
    distribute(sourceToken, data, crumb) {
        for (let sinkToken in this.matrix.to[sourceToken]) {
            let allFromA = this.matrix.to[sourceToken];
            let sink = allFromA[sinkToken].contactB;
            sink.put(data, crumb);
        }
    }
    inductA(token, a) {
        a.emit = this.distribute.bind(this, token);
    }
    inductB(token, b) {
    }
    connect(link) {
    }
    disconnect(link) {
        super.disconnect(link);
        link.contactA.emit = undefined;
    }
}
exports.DistributeMedium = DistributeMedium;
medium_1.mediaConstructors['distribute'] = DistributeMedium;
//# sourceMappingURL=distributive.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(7);
const membrane_1 = __webpack_require__(19);
const designator_1 = __webpack_require__(14);
class RuleMesh {
    constructor(initArgs) {
        this.changeOccurred = membrane_1.DemuxWatchMethodsF(this);
        this.primary = initArgs.membrane;
        this.primary.addWatch(this);
        this.exposed = initArgs.exposed;
        this.rules = {};
        this.media = {};
        this.locations = {};
        for (let mediakey in initArgs.media) {
            this.addMedium(mediakey, initArgs.media[mediakey]);
        }
        for (let mediakey in initArgs.rules) {
            this.parseRules(initArgs.rules[mediakey], mediakey);
        }
    }
    addMedium(key, medium) {
        this.rules[key] = [];
        this.media[key] = medium;
    }
    parseRules(ruleset, mediumkey) {
        for (let link of ruleset) {
            let linkIR = this.parseLink(link);
            this.addRule(linkIR, mediumkey);
        }
    }
    parseLink(link) {
        let m = link.match(/^([\w\*\:\.]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.]+)/);
        if (!m) {
            throw new Error(`Unable to parse link description, expression ${link} did not match regex`);
        }
        ;
        let [match, srcDesig, srcClose, viceVersa, filter, matching, persistent, snkClose, snkDesig] = m;
        return {
            designatorA: new designator_1.Designator('subranes', 'contacts', srcDesig),
            designatorB: new designator_1.Designator('subranes', 'contacts', snkDesig),
            closeSource: srcClose === '|',
            closeSink: snkClose === '|',
            matching: matching === "=",
            propogation: filter !== '' ? { '+': I.LINK_FILTERS.PROCEED, '-': I.LINK_FILTERS.DECEED, '!': I.LINK_FILTERS.ELSEWHERE }[filter] : I.LINK_FILTERS.NONE
        };
    }
    addRule(rule, mediumkey, ruleID) {
        if (this.rules[mediumkey] === undefined) {
            throw new Error(`Unable to create rule ${mediumkey} is not a recognised media type`);
        }
        if (typeof rule === 'string') {
            this.addRule(this.parseLink(rule), mediumkey, ruleID);
        }
        else {
            if (ruleID !== undefined) {
                this.rules[mediumkey][ruleID] = rule;
            }
            else {
                this.rules[mediumkey].push(rule);
            }
            let dA = rule.designatorA.tokenDesignate(this.primary);
            let dB = rule.designatorB.tokenDesignate(this.primary);
            this.square(rule, dA, dB, mediumkey);
        }
    }
    removeRule(mediumID, ruleID) {
        let rule = this.rules[mediumID][ruleID];
        if (rule === undefined) {
            throw new Error(`The rule: ${rule} being removed does not exist in medium ${mediumID}`);
        }
        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
        this.unsquare(rule, dA, dB, mediumID);
    }
    unsquare(rule, desigA, desigB, mediumkey) {
        for (let tokenA in desigA) {
            let contactA = desigA[tokenA];
            for (let tokenB in desigB) {
                let doSuppose = true;
                let contactB = desigB[tokenB];
                let medium = this.media[mediumkey];
                let link = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    contactA: contactA,
                    contactB: contactB,
                    directed: true
                };
                if (medium.hasLink(link)) {
                    medium.disconnect(link);
                    if (!medium.hasToken(tokenA)) {
                        delete this.locations[tokenA][mediumkey];
                    }
                    if (!medium.hasToken(tokenA)) {
                        delete this.locations[tokenB][mediumkey];
                    }
                }
            }
        }
    }
    square(rule, desigA, desigB, mediumkey) {
        let firstGlove = false;
        for (let tokenA in desigA) {
            let contactA = desigA[tokenA];
            for (let tokenB in desigB) {
                let doSuppose = true;
                let contactB = desigB[tokenB];
                let medium = this.media[mediumkey];
                let link = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    contactA: contactA,
                    contactB: contactB,
                    directed: true
                };
                for (let mk in this.media) {
                    let claimer = this.media[mk];
                    if (mk !== mediumkey && claimer.hasClaim(link)) {
                        throw new Error('Unable to suppose link when another medium has claimed the token');
                    }
                }
                if (rule.matching) {
                    let label1 = link.tokenA.match(/:(\w+)$/)[1];
                    let label2 = link.tokenB.match(/:(\w+)$/)[1];
                    if (label1 !== label2) {
                        doSuppose = false;
                    }
                }
                if (doSuppose) {
                    if (medium.suppose(link)) {
                        this.locations[tokenA] = this.locations[tokenA] || {};
                        this.locations[tokenB] = this.locations[tokenB] || {};
                        this.locations[tokenA][mediumkey] = medium;
                        this.locations[tokenB][mediumkey] = medium;
                    }
                }
            }
        }
    }
    onAddContact(contact, token) {
        for (let mediumkey in this.media) {
            let medium = this.media[mediumkey];
            let linkRules = this.rules[mediumkey];
            if (contact instanceof medium.typeA) {
                for (let ruleID in linkRules) {
                    let rule = linkRules[ruleID];
                    if (rule.designatorA.matches(token)) {
                        let dB = rule.designatorB.tokenDesignate(this.primary);
                        let dA = {};
                        dA[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }
            }
            else if (contact instanceof medium.typeB) {
                for (let ruleID in linkRules) {
                    let rule = linkRules[ruleID];
                    if (rule.designatorB.matches(token)) {
                        let dA = rule.designatorA.tokenDesignate(this.primary);
                        let dB = {};
                        dB[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }
            }
            else {
            }
        }
    }
    onRemoveContact(contact, token) {
        for (let loc in this.locations[token]) {
            let location = this.locations[token][loc];
            if (contact instanceof location.typeA) {
                location.breakA(token, contact);
            }
            else if (contact instanceof location.typeB) {
                location.breakB(token, contact);
            }
        }
    }
    onAddMembrane(membrane, token) {
    }
    onRemoveMembrane(membrane, token) {
    }
}
exports.RuleMesh = RuleMesh;
//# sourceMappingURL=ruleMesh.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(9);
const _Util = __webpack_require__(3);
const _IO = __webpack_require__(2);
const _TRT = __webpack_require__(10);
const _CST = __webpack_require__(4);
exports.Util = _Util;
exports.IO = _IO;
exports.TRT = _TRT;
exports.CST = _CST;
__export(__webpack_require__(4));
__export(__webpack_require__(10));
exports.Core = new domain_1.Domain({
    media: new domain_1.Domain({
        direct: _IO.DirectMedium,
        distribute: _IO.DistributeMedium
    }),
    cell: {
        nature: exports.TRT.Cell,
        patch: {
            form: {
                sections: [],
                mesh: {}
            }
        }
    },
    object: exports.TRT.DefaultCell,
    array: exports.TRT.ArrayCell,
    link: exports.TRT.Connector,
    hook: new domain_1.Domain({
        call: exports.TRT.CallHook,
        access: exports.TRT.AccessHook
    })
});
exports.CST.Construct.DefaultDomain = exports.Core;
//# sourceMappingURL=jungle.js.map

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const default_1 = __webpack_require__(21);
class ArrayCell extends default_1.DefaultCell {
    constructor(spec) {
        super(spec);
        this.nucleus = [];
    }
}
exports.ArrayCell = ArrayCell;
//# sourceMappingURL=array.js.map

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(2);
const accessory_1 = __webpack_require__(13);
class AccessHook extends accessory_1.CellAccessory {
    constructor(spec) {
        spec.basis = 'hook:access';
        super(spec);
        this.policy = spec.policy;
    }
    attach(anchor, k) {
        super.attach(anchor, k);
        this.contact = new IO.OfferContact();
        anchor.lining.addContact(this.contact, k);
        if (this.cache.expose && anchor.nucleus) {
            this.contact.inject(anchor.nucleus, undefined);
        }
    }
    detach() {
        this.contact.retract(this.anchor, this.alias);
        this.anchor.lining.removeContact(this.alias);
    }
}
exports.AccessHook = AccessHook;
//# sourceMappingURL=access.js.map

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(2);
const all_1 = __webpack_require__(3);
const accessory_1 = __webpack_require__(13);
const interfaces_1 = __webpack_require__(7);
class CallHook extends accessory_1.CellAccessory {
    constructor(spec) {
        spec.basis = 'hook:call';
        super(spec);
    }
    attach(anchor, k) {
        super.attach(anchor, k);
        let contactargs = {
            label: this.alias,
            tracking: true,
            hook: this.cache.hook,
            syncOnly: this.cache.sync,
            default: this.cache.default,
            mode: {
                'push': interfaces_1.CALL_MODE.PUSH,
                'pull': (this.cache.sync) ? interfaces_1.CALL_MODE.GET : interfaces_1.CALL_MODE.REQUEST
            }[this.cache.mode]
        };
        if (this.cache.hook === false) {
        }
        else if (this.cache.hook instanceof Function) {
        }
        else if (this.cache.hook === true) {
        }
        if (this.cache.sync) {
        }
        this.contact = this.cache.direction == "in" ? new IO.CallOut(contactargs) : new IO.CallIn(contactargs);
        this.contact.inject(anchor.nucleus, k);
        anchor.lining.addContact(this.contact, k);
    }
    detach() {
        this.contact.retract(this.anchor, this.alias);
        this.anchor.lining.removeContact(this.alias);
    }
    patch(patch) {
        this.dispose();
    }
    extract() {
        let cp = all_1.deepCopy(this.cache);
        if (this.alive) {
            cp.default = this.anchor.nucleus[this.alias];
        }
        return cp;
    }
}
exports.CallHook = CallHook;
//# sourceMappingURL=call.js.map

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const accessory_1 = __webpack_require__(13);
class Connector extends accessory_1.CellAccessory {
    constructor(spec) {
        super(spec);
    }
    attach(anchor, label) {
        console.log("create link", this.cache.rule);
        if (!(this.cache.medium in anchor.mesh.media)) {
            anchor.mesh.addMedium(this.cache.medium, this.domain.recover({
                basis: 'media:' + this.cache.medium,
                label: this.cache.medium,
                exposed: this.nucleus
            }));
        }
        anchor.mesh.addRule(this.cache.rule, this.cache.medium, label);
    }
    detach(anchor, label) {
        anchor.mesh.removeRule(this.cache.medium, label);
    }
}
exports.Connector = Connector;
//# sourceMappingURL=connector.js.map

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(8);
const checks_1 = __webpack_require__(1);
const math_1 = __webpack_require__(24);
function B(crown = {}, form = {}) {
    return new Blender(crown, form);
}
exports.B = B;
class Blender {
    constructor(crown, form = {}) {
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
    static defaultReduce(a, b) {
        if (Blender.strictTypeReduce && (typeof (a) != typeof (b))) {
            var errmsg = "Expected melding to be the same type \n" +
                "existing: " + a + "\n" +
                "incoming: " + b + "\n";
            throw TypeError(errmsg);
        }
        return b === undefined ? a : b;
    }
    ;
    static defaultMap(x) {
        return x;
    }
    init(obj) {
        if (this.term === false) {
            this.crown = typesplit_1.typeCaseSplitF(this.initChurn.bind(this))(obj);
        }
        else {
            this.crown = obj;
        }
        return this;
    }
    initChurn(inner, k) {
        var result;
        if (k === undefined && checks_1.isPrimative(inner)) {
            result = inner;
            this.term = inner !== undefined;
        }
        else if (k in this.crown) {
            let val = this.crown[k];
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
    }
    dump() {
        if (this.term) {
            return this.crown;
        }
        else {
            return typesplit_1.typeCaseSplitF(function (child) {
                return child !== undefined ? child.dump() : undefined;
            })(this.crown);
        }
    }
    blend(obj) {
        this._blend(obj);
        return this;
    }
    _blend(obj) {
        let mapped = this.mapper(obj);
        let reduced;
        if (this.term) {
            reduced = this.reducer(this.crown, mapped);
            this.crown = reduced;
        }
        else {
            reduced = this.merge(mapped);
        }
        return reduced;
    }
    merge(income) {
        let result, superkeys;
        if (this.crown === undefined && income !== undefined) {
            this.init(income);
            return income;
        }
        else if (income !== undefined) {
            if (this.crown instanceof Array) {
                result = [];
                superkeys = math_1.range(Math.max((income || []).length || 0, this.crown.length));
            }
            else {
                result = {};
                superkeys = Object.keys(this.crown || {});
                Object.keys(income || {}).forEach(key => {
                    if (superkeys.indexOf(key) === -1) {
                        superkeys.push(key);
                    }
                });
            }
            for (let key of superkeys) {
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
    }
}
Blender.strictTypeReduce = false;
exports.Blender = Blender;
//# sourceMappingURL=blender.js.map

/***/ })
/******/ ]);