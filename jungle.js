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
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(29));
__export(__webpack_require__(1));
const debug = __webpack_require__(15);
exports.Debug = debug;
__export(__webpack_require__(17));
__export(__webpack_require__(18));
__export(__webpack_require__(19));


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(4);
const Util = __webpack_require__(2);
class Construct {
    constructor(spec) {
        this.cache = this.ensureObject(spec);
        this.cache.basis = this.cache.basis || 'cell';
        console.log("Create Construct, ", this.cache);
        if (spec.domain instanceof domain_1.Domain) {
            this.domain = spec.domain;
        }
        else {
            this.locator = spec.domain || "";
        }
        this.alive = false;
    }
    ensureObject(spec) {
        if (spec === undefined) {
            return {};
        }
        else if (Util.isVanillaObject(spec)) {
            return spec;
        }
        else {
            throw new Error("Invalid Specification for base Construct, must be object or undefined");
        }
    }
    induct(host, key) {
        this.parent = host;
        this.domain = this.domain || host.domain.locateDomain(this.locator);
    }
    ;
    extract() {
        return this.cache;
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Domain {
    constructor() {
        this.registry = {};
        this.subdomain = {};
    }
    branch(key) {
        this.subdomain[key] = new Domain();
        return this.subdomain[key];
    }
    register(key, construct) {
        this.registry[key] = construct;
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
                    throw new Error(`Unable to locate Domain of basis`);
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
    recover(construct) {
        let basis = this.registry[construct.basis];
        try {
            return new basis(construct);
        }
        catch (e) {
            console.error("basis: ", construct.basis, " not a constructor in registry");
            throw e;
        }
    }
}
exports.Domain = Domain;
exports.JungleDomain = new Domain();


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(0);
const base_1 = __webpack_require__(10);
const callout_1 = __webpack_require__(6);
const Debug = __webpack_require__(15);
const junction_1 = __webpack_require__(17);
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
                    tracking.raise("Called contact with no out call");
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
            into[key] = {
                set: (value) => {
                    let crumb;
                    if (this.spec.tracking) {
                        crumb = new Debug.Crumb("Context injection Push Beginning");
                    }
                    this.put(value, crumb);
                    this.spec.default = value;
                }, get: () => {
                    return this.spec.default;
                }
            };
        }
        else if (this.spec.mode == I.CALL_MODE.GET) {
            into[key] = {
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
                }
            };
        }
        else if (this.spec.mode == I.CALL_MODE.REQUEST) {
            into[key] = {
                get: () => {
                    return this.put.bind(this);
                }
            };
        }
    }
    retract(context, key) {
        this.hook.unhook();
    }
}
exports.CallIn = CallIn;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(0);
const base_1 = __webpack_require__(10);
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
        if (this.spec.mode == I.CALL_MODE.PUSH) {
            this.emit = (inp, crumb) => {
                crumb.drop("Value Deposit Hook");
                into[key] = inp;
            };
        }
        else if (this.spec.mode == I.CALL_MODE.GET) {
            this.emit = (inp, crumb) => {
                crumb.drop("Synchronous Value Retrieval(Get) Hook");
                return into[key];
            };
        }
        else if (this.spec.mode == I.CALL_MODE.REQUEST) {
            into.set(this.spec.hook);
            this.emit = (inp, crumb) => {
                crumb.drop("Function Hook");
                return into[key](inp, crumb);
            };
        }
    }
    retract(context, key) {
    }
}
exports.CallOut = CallOut;


/***/ }),
/* 7 */
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
    hasClaim(link) {
        return this.exclusive && (link.directed && (link.tokenA in this.matrix.to)
            || (!link.directed && link.tokenA in this.matrix.sym));
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
        console.log('disconnect');
        if (link.directed) {
            delete this.matrix.to[link.tokenA][link.tokenB];
            delete this.matrix.from[link.tokenB][link.tokenA];
        }
    }
    ;
}
exports.BaseMedium = BaseMedium;
exports.mediaConstructors = {};


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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(14));
__export(__webpack_require__(26));
__export(__webpack_require__(13));
__export(__webpack_require__(27));
__export(__webpack_require__(7));
__export(__webpack_require__(25));
__export(__webpack_require__(24));
__export(__webpack_require__(5));
__export(__webpack_require__(6));


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BasicContact {
    constructor() {
        this.hidden = false;
        this.plugged = false;
        this.gloved = false;
        this.claimed = false;
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
            this.partner.host = this.host.invert();
            this.partner.partner = this;
        }
        return this.partner;
    }
}
exports.BasicContact = BasicContact;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(3);
const all_1 = __webpack_require__(2);
class Composite extends construct_1.Construct {
    constructor(spec) {
        super(spec);
        this.keywords = { basis: null, domain: null };
        this.subconstructs = {};
        this.context = {};
    }
    prime() {
        this.alive = true;
        console.log("Composite prime: ", this.cache);
        for (let k in this.cache) {
            if (!(k in this.keywords)) {
                let v = this.cache[k];
                this.add(k, v);
            }
        }
    }
    add(k, v) {
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
                    this.addObject(k, v);
                }
            }
            else {
                this.addStrange(k, v);
            }
        }
        else {
            this.cache[k] = v;
        }
    }
    addStrange(k, v) {
        this.context[k] = v;
    }
    addPrimative(k, v) {
        this.context[k] = v;
    }
    addObject(k, v) {
        let construct = new Composite(v);
        this.addConstruct(k, construct);
    }
    addConstruct(k, construct) {
        construct.induct(this, k);
        construct.prime();
        this.subconstructs[k] = construct;
        Object.defineProperty(this.context, k, {
            enumerable: false,
            value: construct.context
        });
    }
    remove(k) {
        let removing = this.subconstructs[k];
        if (removing !== undefined) {
            let final = removing.dispose();
            delete this.subconstructs[k];
            return final;
        }
    }
    dispose() {
        for (let key in this.subconstructs) {
            let construct = this.subconstructs[key];
            construct.dispose();
        }
        this.alive = false;
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
                .blend(this.context)
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


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(3);
class Nucleus extends construct_1.Construct {
    constructor(spec) {
        super(spec);
        this.target = {};
        this.exposed = new Proxy(this.target, this);
    }
    set(oTarget, key, value) {
        return true;
    }
    get(oTarget, key) {
        return oTarget[key];
    }
    prime() {
    }
    patch() {
    }
    dispose() {
    }
}
exports.Nucleus = Nucleus;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(10);
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
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, contact] = colonSplit;
    }
    let subranedesig = chain ? chain.split(/\./) : [];
    subranedesig = subranedesig.map((value, index) => {
        return regexifyDesignationTerm(value);
    });
    return {
        mDesignators: subranedesig,
        cDesignator: regexifyDesignationTerm(contact)
    };
}
exports.parseDesignatorString = parseDesignatorString;
function designatorToRegex(desigstr) {
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, contact] = colonSplit;
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
    regex += `:${contact == '*' ? '(\\w+)' : contact}$`;
    return new RegExp(regex);
}
exports.designatorToRegex = designatorToRegex;
function tokenDesignatedBy(token, designator) {
    let [match, allSubs, contact] = token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)$/);
    let splitSubs = allSubs ? allSubs.split(/\./) : [];
    for (let i = 0; i < splitSubs.length; i++) {
        if (!matchDesignationTerm(splitSubs[i], designator.mDesignators[i])) {
            return false;
        }
    }
    if (!matchDesignationTerm(contact, designator.cDesignator)) {
        return false;
    }
    return true;
}
exports.tokenDesignatedBy = tokenDesignatedBy;
function matchDesignationTerm(target, term) {
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
class BasicDesignable {
    constructor(groupName, finalName) {
        this.groupName = groupName;
        this.finalName = finalName;
    }
    treeDesignate({ mDesignators, cDesignator }) {
        let collected = {}, glob = false, terminal = false;
        if (mDesignators.length > 0) {
            let deref;
            if (mDesignators[0] == '**') {
                glob = true;
                if (mDesignators.length == 1) {
                    terminal = true;
                }
                else {
                    deref = mDesignators[1];
                }
            }
            else {
                deref = mDesignators[0];
            }
            let collectedSubs = [];
            for (let mk in this[this.groupName]) {
                if (!terminal &&
                    ((deref instanceof Function && deref(this[this.groupName][mk], mk)) ||
                        (deref instanceof RegExp && mk.match(deref)))) {
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators: glob ? ([mDesignators[0]].concat(mDesignators.slice(2))) : (mDesignators.slice(1)),
                        cDesignator: cDesignator
                    });
                }
                else if (glob) {
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators: mDesignators,
                        cDesignator: cDesignator
                    });
                }
            }
        }
        else {
            terminal = true;
        }
        if (terminal) {
            let bucket = this[this.finalName];
            for (let contactlabel in bucket) {
                let contact = bucket[contactlabel];
                if (matchDesignationTerm(contactlabel, cDesignator)) {
                    collected[contactlabel] = contact;
                }
            }
        }
        return collected;
    }
    flatDesignate(designator) {
        let recur = function (dtree, collection) {
            for (let k in dtree) {
                let v = dtree[k];
                if (v instanceof base_1.BasicContact) {
                    collection.push(v);
                }
                else {
                    recur(v, collection);
                }
            }
            return collection;
        };
        return recur(this.treeDesignate(designator), []);
    }
    tokenDesignate(designator) {
        let recur = function (dtree, tokens, chain) {
            for (let k in dtree) {
                let v = dtree[k];
                if (v instanceof base_1.BasicContact) {
                    tokens[chain + ':' + k] = v;
                }
                else {
                    let lead = chain === '' ? chain : chain + '.';
                    recur(v, tokens, lead + k);
                }
            }
            return tokens;
        };
        return recur(this.treeDesignate(designator), {}, '');
    }
    designate(str, tokenize = true) {
        if (tokenize) {
            return this.tokenDesignate(parseDesignatorString(str));
        }
        else {
            return this.flatDesignate(parseDesignatorString(str));
        }
    }
}
exports.BasicDesignable = BasicDesignable;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const designator_1 = __webpack_require__(16);
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
            this.sections.push(section);
        }
        else {
            this.sections[alias] = section;
        }
    }
    addWatch(watcher, alias) {
        if (alias === undefined) {
            this.watches.push(watcher);
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
        if (isNaN(Number(key))) {
            if (token === undefined) {
                return key;
            }
            else if (token.match(/^:[\w+]$/)) {
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
        for (let skey in this.sections) {
            let section = this.sections[skey];
            if (section.designator === undefined || section.designator.matches(token)) {
                section.changeOccurred(event, subject, this.nextToken(token, skey));
                return;
            }
        }
        for (let wKey in this.watches) {
            let watch = this.watches[wKey];
            if (watch.designator === undefined || watch.designator.matches(token)) {
                watch.changeOccurred(event, subject, this.nextToken(token, wKey));
            }
        }
    }
}
class Membrane extends Section {
    constructor() {
        super();
        this.contacts = {};
        this.subranes = {};
        this.notify = true;
    }
    designate(dexp, flat) {
        let desig = new designator_1.Designator('subranes', 'contacts', dexp);
        return desig.scan(this, flat);
    }
    invert() {
        if (this.inverted === undefined) {
            this.inverted = new Membrane();
            this.inverted.inverted = this;
            for (let rk in this.contacts) {
                let contact = this.contacts[rk];
                if (contact.invertable) {
                    this.inverted.addContact(rk, contact.invert());
                }
            }
        }
        return this.inverted;
    }
    addSubrane(membrane, label) {
        this.subranes[label] = membrane;
        membrane.addWatch(this, label);
        this.notifyMembraneAdd(membrane);
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
        this.notifyMembraneRemove(removing);
        return removing;
    }
    addContact(label, contact) {
        let existing = this.contacts[label];
        if (existing !== undefined) {
        }
        else {
            contact.attach(this, label);
            this.contacts[label] = contact;
            let invertContact;
            if (this.inverted !== undefined && (invertContact = contact.invert())) {
                this.inverted.addContact(label, invertContact);
            }
            this.notifyContactAdd(label, contact);
        }
    }
    removeContact(label) {
        let existing = this.contacts[label];
        if (existing !== undefined) {
            existing.detach();
            delete this.contacts[label];
            if (this.inverted && existing.invertable) {
                this.inverted.removeContact(label);
            }
            this.notifyContactRemove(label, existing);
        }
    }
    notifyContactAdd(label, contact) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.AddContact, contact, ":" + label);
        }
    }
    notifyContactRemove(label, contact) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.RemoveContact, contact, ":" + label);
        }
    }
    notifyMembraneAdd(membrane) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.AddMembrane, membrane);
        }
    }
    notifyMembraneRemove(membrane, token) {
        if (this.notify) {
            this.changeOccurred(MembraneEvents.RemoveMembrane, membrane);
        }
    }
}
exports.Membrane = Membrane;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(1);
const transforms_1 = __webpack_require__(19);
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
            throw new JungleError(this.dump());
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


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
        this.designatorIR = parseDesignatorString(designatorExp);
        this.regex = designatorToRegex(designatorExp);
        this.expression = designatorExp;
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
    treeDesignate(target, recurState) {
        let rState = recurState || { thumb: 0, glob: false };
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
                    let eager = this.treeDesignate(subgroup, proceedwithoutGlob);
                    if (rState.glob) {
                        let keepWithGlob = { thumb: rState.thumb, glob: true };
                        let patient = this.treeDesignate(subgroup, keepWithGlob);
                        collected.groups[mk] = this.mergePaths(eager, patient);
                    }
                    else {
                        collected.groups[mk] = eager;
                    }
                }
                else if (rState.glob) {
                    let rUpdate = { thumb: rState.thumb, glob: true };
                    collected.groups[mk] = this.treeDesignate(subgroup, rUpdate);
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
    scan(target, flat = false) {
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


/***/ }),
/* 17 */
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


/***/ }),
/* 18 */
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


/***/ }),
/* 19 */
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


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(23));
__export(__webpack_require__(22));


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(11));
__export(__webpack_require__(3));
__export(__webpack_require__(4));
__export(__webpack_require__(12));


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(9);
const composite_1 = __webpack_require__(11);
const interfaces_1 = __webpack_require__(0);
const domain_1 = __webpack_require__(4);
const state_1 = __webpack_require__(12);
class Cell extends composite_1.Composite {
    constructor(spec) {
        spec.domain = spec.domain || domain_1.JungleDomain;
        super(spec);
        this.nucleus = new state_1.Nucleus(spec.state);
        this.policy = interfaces_1.FreePolicy;
        this.membranes = {};
        this.membranes.shell = new IO.Membrane();
        this.membranes.lining = this.membranes.shell.invert();
        this.mesh = new IO.RuleMesh({
            membranes: this.membranes,
            rules: {
                'distribute': []
            },
            exposed: this.nucleus.exposed
        });
    }
    addStrange(k, v) {
        this.nucleus.exposed[k] = v;
    }
    prime() {
        this.nucleus.prime();
        super.prime();
    }
}
exports.Cell = Cell;
domain_1.JungleDomain.register('Cell', Cell);


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(4);
const construct_1 = __webpack_require__(3);
const all_1 = __webpack_require__(2);
const IO = __webpack_require__(9);
const interfaces_1 = __webpack_require__(0);
class CallHook extends construct_1.Construct {
    constructor(spec) {
        spec.basis = 'CallHook';
        super(spec);
    }
    induct(host, key) {
        super.induct(host, key);
        this.key = key;
        console.log('Induct Hook Yay!');
        let contactargs = {
            label: key,
            tracking: true,
            hook: this.cache.hook,
            syncOnly: this.cache.sync,
            default: this.cache.default,
            mode: {
                'push': interfaces_1.CALL_MODE.PUSH,
                'pull': this.cache.sync ? interfaces_1.CALL_MODE.GET : interfaces_1.CALL_MODE.REQUEST
            }[this.cache.mode]
        };
        this.contact = this.cache.contact == "caller" ? new IO.CallOut(contactargs) : new IO.CallIn(contactargs);
        host.membranes[this.cache.target].addContact(key, this.contact);
        this.contact.inject(host.nucleus[key]);
    }
    prime() {
    }
    patch(patch) {
    }
    dispose() {
        this.parent.membranes[this.cache.target].removeContact(this.contact, this.cache.contact);
    }
    extract() {
        let cp = all_1.deepCopy(this.cache);
        if (this.alive) {
            cp.default = this.parent.nucleus[this.key];
        }
        return cp;
    }
}
exports.CallHook = CallHook;
domain_1.JungleDomain.register('CallHook', CallHook);


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(7);
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


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(7);
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


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const designable_1 = __webpack_require__(13);
class Visor extends designable_1.BasicDesignable {
    constructor(target, designator) {
        super('subranes', 'roles');
        this.target = target;
    }
}
exports.Visor = Visor;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const I = __webpack_require__(0);
const membrane_1 = __webpack_require__(14);
const medium_1 = __webpack_require__(7);
const designator_1 = __webpack_require__(16);
class RuleMesh {
    constructor(initArgs) {
        this.changeOccurred = membrane_1.DemuxWatchMethodsF(this);
        this.primary = new membrane_1.Membrane();
        this.primary.addWatch(this);
        this.rules = {};
        this.media = {};
        this.locations = {};
        this.exposed = initArgs.exposed;
        for (let membraneKey in initArgs.membranes) {
            this.primary.addSubrane(initArgs.membranes[membraneKey], membraneKey);
        }
        for (let mediakey in initArgs.rules) {
            let newMedium = new medium_1.mediaConstructors[mediakey]({ label: mediakey, exposed: this.exposed });
            this.addMedium(mediakey, newMedium);
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
    addRule(rule, mediumkey) {
        this.rules[mediumkey].push(rule);
        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
        this.square(rule, dA, dB, mediumkey);
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
                    directed: true,
                    destructive: false
                };
                for (let mk in this.media) {
                    let claimer = this.media[mk];
                    if (mk !== mediumkey && claimer.hasClaim()) {
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
                for (let rule of linkRules) {
                    if (rule.designatorB.matches(token)) {
                        let dB = rule.designatorB.tokenDesignate(this.primary);
                        let dA = {};
                        dA[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }
            }
            else if (contact instanceof medium.typeB) {
                for (let rule of linkRules) {
                    if (rule.designatorA.matches(token)) {
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


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const _Util = __webpack_require__(2);
const _IO = __webpack_require__(9);
__export(__webpack_require__(20));
__export(__webpack_require__(21));
exports.Util = _Util;
exports.IO = _IO;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(8);
const checks_1 = __webpack_require__(1);
const math_1 = __webpack_require__(18);
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


/***/ })
/******/ ]);