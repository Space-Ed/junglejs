var Jungle =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 30);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(3);
const all_1 = __webpack_require__(10);
class Construct {
    constructor(domain) {
        this.domain = domain;
    }
    init(desc) {
        this.origins = desc.origins;
        this.basis = desc.basis;
        this.applyHead(desc.head);
        this._patch(desc.body);
        let primeResult = this.head.prime ? this.head.prime.call(this.self) : undefined;
    }
    dispose() {
        if (this.head.dispose) {
            this.head.dispose.call(this.nucleus);
        }
        this.clearHead();
    }
    applyHead(head = {}) {
        this.head = head;
        this.applyExposed();
        this.applyHeart(head.heart || {});
        this.applySelf();
    }
    applyExposed() {
        Object.defineProperty(this, 'exposed', {
            configurable: true,
            get: () => {
                return this.nucleus;
            },
            set: (value) => {
                this.dark.patch(value);
                this.notify(value);
                return this.nucleus = value;
            }
        });
    }
    applyHeart(heartspec) {
        let { exposed, pooled } = all_1.createHeartBridge(heartspec.exposed);
        this.heart = exposed;
        this.dark = pooled;
        this.dark.notify = (nt) => {
            this.nucleus = nt;
            if (this.notify) {
                this.notify(nt);
            }
            return null;
        };
        this.dark.fetch = (ft) => {
            let res = this.nucleus;
            if (res == undefined) {
                if (this.fetch) {
                    res = this.fetch(ft);
                }
            }
            return res;
        };
    }
    applySelf() {
        this.self = {};
        Object.defineProperties(this.self, {
            body: {
                get: () => (this.exposed)
            },
            heart: {
                get: () => (this.heart)
            },
        });
    }
    clearHead() {
    }
    attach(host, id) {
        this.host = host;
        this.id = id;
        let visor = host.grantVisor(id, this);
        Object.defineProperties(this.self, {
            world: {
                configurable: true,
                get: () => (visor)
            },
            earth: {
                configurable: true,
                get: () => (visor.body)
            },
            agent: {
                configurable: true,
                get: () => (visor.heart)
            },
        });
        this.attachHostAgent(host, id);
        if (this.head.attach) {
            this.head.attach.call(this.self);
        }
    }
    attachHostAgent(host, id) {
        this.fetch = (extractor) => {
            let qualified = {};
            qualified[id] = extractor;
            return host.bed.fetch(qualified);
        };
        this.notify = (patch) => {
            let qualified = {};
            qualified[id] = patch;
            return host.bed.notify(qualified);
        };
    }
    detachHostAgent() {
        this.fetch = undefined;
        this.notify = undefined;
    }
    detach(host, id) {
        if (this.head.detach) {
            this.head.detach.call(this.self);
        }
        this.detachHostAgent();
        delete this.self.world;
        delete this.self.agent;
    }
    patch(patch) {
        this._patch(patch);
        this.dark.notify(patch);
    }
    _patch(patch) {
        this.nucleus = patch;
    }
    _extract(sucker) {
        if (domain_1.isDescription(sucker)) {
            return {
                basis: this.basis,
                head: this.head,
                origins: this.origins,
                body: this.nucleus
            };
        }
        return this.nucleus;
    }
    extract(sucker) {
        let extract = this._extract(sucker);
        if (extract == undefined) {
            extract = this.dark.fetch(sucker);
        }
        return extract;
    }
    move(to) {
        let landing = this.host.getAtLocation(to);
        let id = this.id;
        if (landing) {
            this.detach(this.host, this.id);
            this.attach(landing, this.id);
        }
    }
    getRoot() {
        if (this.host === undefined) {
            return this;
        }
        else {
            return this.host.getRoot();
        }
    }
    getLocation() {
        if (this.host !== undefined) {
            return this.host.getLocation() + '/' + this.id;
        }
        else {
            return '';
        }
    }
}
exports.Construct = Construct;
//# sourceMappingURL=construct.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(7));
__export(__webpack_require__(28));
__export(__webpack_require__(17));
__export(__webpack_require__(29));
__export(__webpack_require__(16));
__export(__webpack_require__(27));
__export(__webpack_require__(12));
__export(__webpack_require__(14));
//# sourceMappingURL=all.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(4));
const debug = __webpack_require__(18);
exports.Debug = debug;
__export(__webpack_require__(38));
__export(__webpack_require__(8));
__export(__webpack_require__(41));
//# sourceMappingURL=all.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __webpack_require__(8);
const construct_1 = __webpack_require__(0);
const checks_1 = __webpack_require__(4);
function parseBasisString(str) {
    let rx = /^(?:((?:\w+\.)*[\w]+)\:)?(\w+)$/;
    let m = str.match(rx);
    if (m) {
        let [full, loc, name] = m;
        let sloc = loc ? loc.split('.') : [];
        return {
            location: sloc,
            name: name,
            invasive: false
        };
    }
    else {
        throw new RangeError(`invalid basis desiginator expression ${str}`);
    }
}
function isNature(thing) {
    return thing instanceof Function && (thing.prototype instanceof construct_1.Construct || thing === construct_1.Construct);
}
exports.isNature = isNature;
function isDescription(thing) {
    return checks_1.isVanillaObject(thing) && 'basis' in thing;
}
exports.isDescription = isDescription;
function descmeld(entry, desc, k) {
    let meld = {
        basis: entry.basis,
        head: headmeld(entry.head || {}, desc.head || {}),
        body: all_1.safeMeld(bodyMeldItem)(entry.body || {}, desc.body || {}),
        domain: desc.domain || entry.domain
    };
    if (desc.anon)
        meld.anon = desc.anon;
    return meld;
}
exports.descmeld = descmeld;
function bodyMeldItem(entry, desc, k) {
    if (isDescription(entry)) {
        if (isDescription(desc)) {
            if (entry.basis !== desc.basis) {
                return desc;
            }
            else {
                return descmeld(entry, desc);
            }
        }
        else if (checks_1.isVanillaObject(desc)) {
            return descmeld(entry, { body: desc });
        }
        else if (checks_1.isVanillaArray(desc)) {
            return descmeld(entry, { anon: desc });
        }
        else if (desc === null) {
            return Symbol.for('delete');
        }
        else {
            return desc;
        }
    }
    else {
        return desc;
    }
}
let headmeld = all_1.deepMeldF();
function descdebase(desc, base) {
    let debased = {
        basis: base.basis,
        head: all_1.deepMeldF(all_1.terminate.isPrimative, all_1.reduce.negateEqual)(desc.head || {}, base.head || {}),
        body: all_1.safeMeld(debaseBodyItem)(desc.body, base.body),
    };
    if (desc.origins) {
        let [basis, ...origins] = desc.origins;
        debased.basis = basis;
        if (origins.length > 0) {
            debased.origins = origins;
        }
    }
    if (desc.anon && desc.anon.length !== 0) {
        debased.anon = desc.anon;
    }
    return debased;
}
function debaseBodyItem(desc, base, k) {
    if (isDescription(desc)) {
        if (isDescription(base)) {
            if (desc.basis !== base.basis) {
                return desc;
            }
            else {
                return descdebase(desc, base);
            }
        }
        else {
            return desc;
        }
    }
    else {
        return all_1.reduce.negateEqual(desc, base);
    }
}
class Domain {
    constructor() {
        this.registry = {};
        this.subdomain = {};
        this.exposed = {};
    }
    define(name, val) {
        let m = name.match(/^[a-zA-Z0-9_]+$/);
        if (m) {
            if (isDescription(val)) {
                this.addDescription(name, val);
            }
            else if (isNature(val)) {
                this.addDescription(name, {
                    basis: val,
                });
            }
            else {
                this.addStatic(name, val);
            }
            return this;
        }
        else {
            throw new Error("Invalid basis name");
        }
    }
    addDescription(name, desc) {
        if (!(name in this.registry)) {
            this.registry[name] = desc;
            if (typeof desc.domain === 'string') {
                let domloc = desc.domain.split('.');
                let domain = this.seekInherit({ location: domloc, name: null }).domain;
                if (domain != undefined) {
                    desc.domain = domain;
                }
                else {
                    throw new Error(`cant find domain "${desc.domain}" required for definition of "${name}"`);
                }
            }
            else if (desc.domain === undefined) {
            }
            else if (!(desc.domain instanceof Domain)) {
                throw new Error(`Invalid domain provided to description (should be string or Domain)`);
            }
        }
        else {
            throw new Error(`Cannot Redefine: "${name}" is already defined in this domain`);
        }
    }
    recover(desc) {
        let _desc = (typeof desc == 'string') ? { basis: desc } : desc;
        _desc.origins = [];
        let final = this.collapse(_desc);
        let nature = final.basis;
        let recovered = new nature(final.domain ? final.domain : this);
        recovered.init(final);
        return recovered;
    }
    collapse(desc) {
        if (isNature(desc.basis)) {
            return desc;
        }
        else if (typeof desc.basis === 'string') {
            let sresult;
            if (desc.basis === desc.origins[0]) {
                desc.origins = desc.origins.slice(1);
                if (this.parent) {
                    sresult = this.parent.seek(desc.basis, true);
                }
                else {
                    throw new Error(`Domain must be based on superdomain for redefinition of ${desc.basis}`);
                }
            }
            else {
                sresult = this.seek(desc.basis, true);
            }
            let { domain, entry } = sresult;
            let melded = descmeld(entry, desc);
            melded.origins = [desc.basis, ...desc.origins];
            return domain.collapse(melded);
        }
        else {
            throw new Error("Invalid recovery basis must be basis designator or Construct function");
        }
    }
    describe(construct, target = true) {
        let extracted = construct.extract({
            basis: undefined
        });
        let debased = this.debase(extracted, target);
        return debased;
    }
    debase(desc, target) {
        if (desc.origins === undefined || desc.origins.length == 0 || target === false || desc.basis === target) {
            return desc;
        }
        else {
            let find = this.seek(desc.origins[0], false);
            if (find.entry == null) {
                return desc;
            }
            else {
                let debased = descdebase(desc, find.entry);
                if (debased.basis === target) {
                    return debased;
                }
                else {
                    return this.debase(debased, target);
                }
            }
        }
    }
    seek(basis, fussy = false) {
        let parsed = parseBasisString(basis);
        let result = this.seekInherit(parsed);
        if (parsed.location.length === 0 && result.domain !== undefined) {
            result.domain = this;
        }
        if (fussy && result.domain == undefined) {
            throw new Error(`Unable to find domain designated for basis: ${basis}`);
        }
        else if (fussy && result.entry == undefined) {
            throw new Error(`Unable to find registry entry for basis: ${basis}`);
        }
        else {
            return result;
        }
    }
    seekInherit(place) {
        let result = this.seekDelve(place);
        if ((result.entry == undefined || result.domain == undefined) && this.parent !== undefined) {
            result = this.parent.seekInherit(place);
        }
        return result;
    }
    seekDelve({ location, name }) {
        let result;
        if (location.length === 0) {
            if (!(name in this.registry)) {
                result = {
                    domain: this,
                    name: name,
                    entry: null
                };
            }
            else {
                result = {
                    domain: this,
                    name: name,
                    entry: this.registry[name]
                };
            }
        }
        else {
            let [subdomain, ...rest] = location;
            if (subdomain in this.subdomain) {
                result = this.subdomain[subdomain].seekDelve({ location: rest, name: name });
            }
            else {
                result = {
                    domain: null,
                    name: name,
                    entry: null
                };
            }
        }
        return result;
    }
    sub(name) {
        if (name in this.subdomain) {
            return this.subdomain[name];
        }
        let domain = new Domain();
        domain.on(this.parent || this);
        this.addSubdomain(name, domain);
        return domain;
    }
    with(subdomains) {
        for (let k in subdomains) {
            this.addSubdomain(k, subdomains[k]);
        }
        return this;
    }
    up() {
        if (this.parent) {
            return this.parent;
        }
        else {
            return this;
        }
    }
    on(domain) {
        if (this.parent !== undefined) {
            throw new Error(`Domain must have exactly one ground but was already defined`);
        }
        this.parent = domain;
        return this;
    }
    addSubdomain(key, newsub) {
        if (key in this.subdomain) {
            throw new Error(`Subdomain ${key} already exists cannot redefine`);
        }
        else {
            this.subdomain[key] = newsub;
        }
    }
    addStatic(name, value) {
        this.exposed[name] = value;
    }
}
exports.Domain = Domain;
function isGroundedOn(domain, ground) {
    return ground !== undefined && (domain.parent === ground || isGroundedOn(domain, ground.parent));
}
//# sourceMappingURL=domain.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function ensureArray(sometimes) {
    return (sometimes instanceof Array) ? sometimes : (sometimes != undefined ? [sometimes] : []);
}
exports.ensureArray = ensureArray;
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(35));
__export(__webpack_require__(20));
__export(__webpack_require__(19));
__export(__webpack_require__(36));
__export(__webpack_require__(37));
//# sourceMappingURL=all.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(34));
__export(__webpack_require__(32));
__export(__webpack_require__(31));
__export(__webpack_require__(33));
//# sourceMappingURL=all.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const D = __webpack_require__(5);
class Layer {
    constructor() {
        this.watches = [];
    }
    createSection(desexp, alias, positive = true) {
        let section = new section_1.Section(positive, desexp);
        this.addWatch(section);
        return section;
    }
    addWatch(watcher, alias) {
        let sym;
        if (alias === undefined) {
            sym = Symbol("anon");
            this.watches[sym] = watcher;
        }
        else {
            sym = alias;
            this.watches[alias] = watcher;
        }
        let all = this.scan('**:*', true);
        for (let token in all) {
            let reparse = D.parseTokenSimple(token);
            let qpath = alias === undefined ? reparse : [[alias + "", ...reparse[0]], reparse[1]];
            watcher.contactChange(qpath, all[token]);
        }
        return sym;
    }
    removeWatch(key) {
        let watcher = this.watches[key];
        let all = this.scan('**:*', true);
        for (let token in all) {
            let reparse = D.parseTokenSimple(token);
            let qpath = typeof key !== 'string' ? reparse : [[key + '', ...reparse[0]], reparse[1]];
            watcher.contactChange(qpath);
        }
        delete this.watches[key];
    }
    removeAllWatches() {
        this.watches = [];
    }
    nextToken(token, key) {
        if (typeof key === 'string') {
            return [[key, ...token[0]], token[1]];
        }
        else {
            return token;
        }
    }
    contactChange(path, thing) {
        for (let wKey of Object.getOwnPropertySymbols(this.watches).concat(Object.keys(this.watches))) {
            let watch = this.watches[wKey];
            watch.contactChange(this.nextToken(path, wKey), thing);
        }
    }
    scan(exp, flat) {
    }
}
exports.Layer = Layer;
const section_1 = __webpack_require__(17);
//# sourceMappingURL=layer.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(40));
__export(__webpack_require__(21));
__export(__webpack_require__(22));
//# sourceMappingURL=all.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(11));
__export(__webpack_require__(0));
__export(__webpack_require__(3));
//# sourceMappingURL=all.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(23));
__export(__webpack_require__(24));
__export(__webpack_require__(25));
//# sourceMappingURL=all.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(0);
const domain_1 = __webpack_require__(3);
const state_1 = __webpack_require__(26);
const all_1 = __webpack_require__(10);
class Composite extends construct_1.Construct {
    constructor(domain) {
        super(domain);
        this.subconstructs = {};
        this.nucleus = [];
        this.index = [];
    }
    init(desc) {
        this.origins = desc.origins;
        this.basis = desc.basis;
        this.applyHead(desc.head);
        if (desc.body !== undefined)
            this._patch(desc.body);
        if (desc.anon !== undefined)
            this._patch(desc.anon);
        let primeResult = this.head.prime ? this.head.prime.call(this.self) : undefined;
    }
    dispose() {
        this.disposeBody();
        this.disposeAnon();
        if (this.head.dispose) {
            this.head.dispose.call(this.self);
        }
        this.clearHead();
    }
    applyExposed() {
        this.exposed = state_1.makeSplitStateProxy(this);
    }
    applyHeart(heartspec) {
        let { exposed, pooled } = all_1.createHeartBridge(heartspec.exposed);
        this.heart = exposed;
        this.dark = pooled;
        this.bed = new all_1.BedAgent(this, this.head.bed);
        this.anchor = new all_1.AnchorAgent(this, this.head.anchor);
        this.pool = this.createPool(this.head.pool);
        this.pool.add(this.dark, 'heart');
        this.pool.add(this.bed, 'bed');
        this.pool.add(this.anchor, 'anchor');
    }
    applySelf() {
        this.self = {};
        Object.defineProperties(this.self, {
            body: {
                get: () => (this.exposed)
            },
            heart: {
                get: () => {
                    return this.heart;
                }
            },
            domain: {
                get: () => (this.domain)
            }
        });
    }
    clearHead() {
        super.clearHead();
    }
    patch(patch) {
        if (domain_1.isDescription(patch)) {
            this.dispose();
            this.init(patch);
        }
        else {
            return this.anchor.notify(patch);
        }
    }
    _patch(patch) {
        if (patch == undefined) {
            this.disposeBody();
        }
        else if (!(patch instanceof Object)) {
            this._patch([patch]);
        }
        else if (patch instanceof Array) {
            for (let i = 0; i < patch.length; i++) {
                this.addAnon(patch[i]);
            }
        }
        else {
            for (let k in patch) {
                let v = patch[k];
                this.patchChild(k, v);
            }
        }
    }
    patchChild(k, v) {
        if (v == undefined) {
            this.remove(k);
        }
        else if (v in this.subconstructs) {
            this.subconstructs[k].patch(v);
        }
        else {
            this.add(v, k);
        }
    }
    addAnon(val) {
        let id = this.makeID(val);
        this.add(val, "" + id);
    }
    makeID(val) {
        return this.index.length++;
    }
    add(val, key) {
        if (key === undefined) {
            return this.addAnon(val);
        }
        if (domain_1.isDescription(val)) {
            let construct = this.domain.recover(val);
            this.attachChild(construct, key);
        }
        else {
            this.addStrange(key, val);
        }
    }
    remove(k) {
        let removing = this.subconstructs[k];
        if (removing !== undefined) {
            this.detachChild(k);
            let final = removing.dispose();
            return final;
        }
        else if (k in this.nucleus) {
            let removeState = this.nucleus[k];
            delete this.nucleus[k];
            delete this.index[k];
        }
    }
    disposeBody() {
        for (let key in this.index) {
            if (isNaN(key)) {
                if (this.index[key] == this.subconstructs) {
                    let construct = this.detachChild(key);
                    construct.dispose();
                }
                else {
                    this.removeStrange(key);
                }
            }
        }
    }
    disposeAnon() {
        for (let key in this.index) {
            if (!isNaN(key)) {
                if (this.index[key] == this.subconstructs) {
                    let construct = this.detachChild(key);
                    construct.dispose();
                }
                else {
                    this.removeStrange(key);
                }
            }
        }
    }
    attachChild(construct, key) {
        this.subconstructs[key] = construct;
        this.index[key] = this.subconstructs;
        this.nucleus.length = this.index.length;
        construct.attach(this, key);
    }
    detachChild(key) {
        let construct = this.subconstructs[key];
        delete this.subconstructs[key];
        delete this.index[key];
        construct.detach(this, key);
        return construct;
    }
    addStrange(k, v) {
        this.nucleus[k] = v;
        this.index[k] = this.nucleus;
    }
    removeStrange(k) {
        delete this.nucleus[k];
        delete this.index[k];
    }
    extract(suction) {
        return this.anchor.fetch(suction);
    }
    _extract(suction) {
        if (suction instanceof Array) {
            return this.extractAnon(suction);
        }
        else if (typeof suction === 'number') {
            let subsuck = [];
            if (suction === Infinity) {
                subsuck[0] = subsuck;
            }
            else {
                for (let i = 0; i < suction; i++) {
                    subsuck = [subsuck];
                }
            }
            return this.extractAnon(subsuck);
        }
        else if (domain_1.isDescription(suction)) {
            return this.extractBeing(suction);
        }
        else if (typeof suction === 'string') {
            let subsuck = {};
            subsuck[suction] = undefined;
            return this.extractBody(suction);
        }
        else {
            return this.extractBody(suction);
        }
    }
    extractBeing(suction) {
        let being = {
            basis: this.basis,
            head: this.head,
            origins: this.origins
        };
        being.body = this.extractBody(suction.body || { basis: undefined });
        being.anon = this.extractAnon(suction.anon || [{ basis: undefined }]);
        return being;
    }
    extractAnon(suction) {
        let result = [];
        this.index.forEach((location, i) => {
            let extract;
            if (suction.length > 0) {
                extract = this.extractChild(i, suction[0]);
            }
            else {
                extract = this.extractChild(i, []);
            }
            result.push(extract);
        });
        return result;
    }
    extractBody(suction) {
        let extracted = {};
        if (domain_1.isDescription(suction) || suction === undefined) {
            for (let k in this.index) {
                if (isNaN(k)) {
                    extracted[k] = this.extractChild(k, suction);
                }
            }
        }
        else if (suction instanceof Object) {
            for (let k in this.index) {
                if (isNaN(k) && k in suction) {
                    extracted[k] = this.extractChild(k, suction[k]);
                }
            }
        }
        else {
            throw new Error("Invalid Extract Argument");
        }
        return extracted;
    }
    extractChild(k, voidspace) {
        let extract;
        if (k in this.subconstructs) {
            extract = this.subconstructs[k].extract(voidspace);
            if (domain_1.isDescription(extract)) {
                extract = this.domain.debase(extract, domain_1.isDescription(voidspace) ? voidspace.basis : false);
            }
        }
        else if (k in this.nucleus) {
            extract = this.nucleus[k];
        }
        if (extract === undefined) {
            let qfetch = {};
            qfetch[k] = voidspace;
            extract = this.bed.fetch(qfetch);
        }
        return extract;
    }
    createPool(poolConfig) {
        return new all_1.AgentPool(poolConfig);
    }
    grantVisor(k, c) {
        let { exposed: agent, pooled } = all_1.createHeartBridge({});
        this.pool.add(pooled, k);
        return new Proxy(this.self, {
            set(oTarg, prop, val) {
                return false;
            },
            get(oTarg, prop) {
                if (prop === 'heart') {
                    return agent;
                }
                else {
                    return oTarg[prop];
                }
            }
        });
    }
    getAtLocation(to) {
        let items = to.split('/');
        let thumb;
        if (to[0] === '/') {
            thumb = this.getRoot();
            items.shift();
        }
        else {
            thumb = this;
        }
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item in thumb.subconstructs && thumb.subconstructs[item] instanceof Composite) {
                thumb = thumb.subconstructs[item];
            }
            else if (item === '..' && thumb.host !== undefined) {
                thumb = thumb.host;
            }
            else if (item !== '') {
                return undefined;
            }
        }
        return thumb;
    }
}
exports.Composite = Composite;
//# sourceMappingURL=composite.js.map

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BaseContact {
    constructor() {
        this.hidden = false;
        this.plugged = false;
        this.gloved = false;
        this.claimed = false;
        this.inverted = false;
    }
    claim(medium) {
        this.claims = true;
    }
    isContested() {
        return this.claims;
    }
    isClaimed() {
        return !this.isContested();
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
    createPartner() {
        return undefined;
    }
}
exports.BaseContact = BaseContact;
//# sourceMappingURL=base.js.map

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(12);
class Call extends base_1.BaseContact {
    constructor() {
        super(...arguments);
        this.invertable = true;
        this.isTargetable = false;
        this.isSeatable = false;
    }
}
exports.Call = Call;
//# sourceMappingURL=call.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Debug = __webpack_require__(18);
const all_1 = __webpack_require__(2);
const call_1 = __webpack_require__(13);
class StdOp extends call_1.Call {
    constructor(spec) {
        super();
        this.spec = spec;
        this.invertable = true;
        this.isSeatable = false;
        this.isTargetable = false;
    }
    invert() {
        let inverted = super.invert();
        this.attachInput();
        inverted.attachInput();
        this.hook = this.createHook();
        return inverted;
    }
    createPartner() {
        return new StdOp({
            label: 'outer:' + this.spec.label,
            mode: this.spec.mode,
            context: this.spec.context,
            inner_op: this.spec.outer_op
        });
    }
    attachInput() {
        if (this.spec.inner_op === true) {
            if (this.spec.mode !== 'resolve') {
                this.spec.inner_op = (inp, progress) => {
                    return progress(inp);
                };
            }
            else {
                this.spec.inner_op = (inp) => { };
            }
        }
        if (this.spec.inner_op instanceof Function) {
            if (this.spec.mode === 'carry') {
                this.partner.isSeatable = true;
            }
            else if (this.spec.mode === 'reflex') {
                this.isSeatable = true;
            }
            this.isTargetable = true;
            this.put = this.createInput();
        }
    }
    createInput() {
        return (inp, crumb) => {
            let returned = new all_1.Junction().mode('single');
            let mycrumb = (crumb || new Debug.Crumb("Begin tracking"))
                .drop("Op Contact Put")
                .at(this.spec.label)
                .with(inp);
            let targetF;
            if (this.spec.mode == 'carry') {
                let hookF = this.createHookFunction(this.partner);
                targetF = (inp) => {
                    let crumb = mycrumb.drop('op-contact-carry');
                    return hookF(inp, crumb);
                };
            }
            else if (this.spec.mode == 'reflex') {
                let hookF = this.createHookFunction(this);
                targetF = (inp) => {
                    let crumb = mycrumb.drop('op-contact-carry');
                    return hookF(inp, crumb);
                };
            }
            try {
                let result = this.spec.inner_op.call(this.spec.context, inp, targetF);
                returned.merge(result, true);
            }
            catch (e) {
                mycrumb.message = e.message;
                let crumback = mycrumb.dump();
                returned.raise({ message: crumback, key: 'OPCRASH' });
            }
            return returned;
        };
    }
    createHookFunction(target) {
        return (inp, crumb) => {
            let mycrumb = (crumb || new Debug.Crumb("Begin tracking"))
                .drop("Op Contact Hook")
                .at(this.spec.label)
                .with(inp);
            if (target.emit === undefined) {
                mycrumb.message = "Frayed End, contact reached not connected to Media";
                let crumback = mycrumb.dump();
                let rv = new all_1.Junction();
                rv.raise({ message: crumback, key: 'OP_NOT_CONNECTED' });
                return rv;
            }
            else {
                return target.emit(inp, mycrumb);
            }
        };
    }
    createHook() {
        this.partner.isSeatable = this.partner.isSeatable || this.spec.hook_outward === true;
        this.isSeatable = this.isSeatable || this.spec.hook_inward === true;
        return {
            inward: (this.isSeatable ? this.createHookFunction(this) : undefined),
            outward: (this.partner.isSeatable ? this.createHookFunction(this.partner) : undefined)
        };
    }
}
exports.StdOp = StdOp;
//# sourceMappingURL=stdops.js.map

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __webpack_require__(5);
const all_2 = __webpack_require__(1);
const linktype = '[-=~]';
const mediumMidExp = `-\\(\\w+\\)-|=\\(\\w+\\)=`;
const mediumBounds = `(${linktype})\\((\\w+)\\)${linktype}`;
const lawSplitExp = `(<)?(${mediumMidExp}|${linktype})(>)?`;
const lawExp = new RegExp(`${all_1.DFullExp}(?:${lawSplitExp}${all_1.DFullExp})+`);
const lawWhiteExp = '\\s';
function crack(target, cracker) {
    let m = target.match(cracker);
    return [m.input.slice(0, m.index), m[0], m.input.slice(m.index + m[0].length)];
}
function crackloop(target, cracker) {
    let [current, link, end] = crack(target, cracker);
    let tricks = [[current, null, link]];
    let trickdex = 0;
    while (end.match(cracker)) {
        [current, link, end] = crack(end, cracker);
        tricks[trickdex][1] = current;
        trickdex++;
        tricks[trickdex] = [current, null, link];
    }
    tricks[tricks.length - 1][1] = end;
    return tricks;
}
function parseLawExpression(linkexp, defaultMedium) {
    let stripped = linkexp.replace(/\s/g, '');
    let matched = stripped.match(lawExp);
    if (matched) {
        let tricks = crackloop(stripped, lawSplitExp);
        let laws = [];
        for (let [lexp, rexp, l] of tricks) {
            let [whole, left, mid, right] = l.match(lawSplitExp);
            let medium;
            let mediumMatch = mid.match(mediumBounds);
            if (mediumMatch) {
                medium = mediumMatch[2];
                mid = mediumMatch[1];
            }
            else if (defaultMedium) {
                medium = defaultMedium;
            }
            else {
                throw new Error("No medium provided to the law -(medium)-> ");
            }
            let matching = mid === '=' || mid == '+';
            if (right) {
                laws.push({
                    expression: linkexp,
                    designatorA: lexp,
                    designatorB: rexp,
                    matching: matching,
                    medium: medium,
                });
            }
            if (left) {
                laws.push({
                    expression: linkexp,
                    designatorA: rexp,
                    designatorB: lexp,
                    matching: matching,
                    medium: medium,
                });
            }
        }
        return laws;
    }
    else {
        throw new Error("Invalid law expression");
    }
}
exports.parseLawExpression = parseLawExpression;
const scan = all_1.scannerF();
class Pancedent extends all_2.Section {
    constructor(law, leftToRight) {
        super(true, law.spec[leftToRight ? 'designatorA' : 'designatorB']);
        this.law = law;
        this.leftToRight = leftToRight;
    }
    onAddContact(contact, token) {
        super.onAddContact(contact, token);
        if (this.leftToRight) {
            this.law.medium.claimSeat(all_1.compileToken(token), contact, this.law);
        }
        else {
            this.law.medium.claimTarget(all_1.compileToken(token), contact, this.law);
        }
    }
    onRemoveContact(token) {
        super.onRemoveContact(token);
        if (this.leftToRight) {
            this.law.medium.dropSeat(all_1.compileToken(token), this.law);
        }
        else {
            this.law.medium.dropTarget(all_1.compileToken(token), this.law);
        }
    }
    contactChange(token, contact) {
        let match = all_1.matches(this.designator, token);
        if (match) {
            let oscan = all_1.tokenize(all_1.scannerF('subranes', 'contacts')(this.partner.designator, this.partner));
            if (contact) {
                this.onAddContact(contact, token);
                let tokenstr = all_1.compileToken(token);
                match[tokenstr] = contact;
                if (this.leftToRight) {
                    this.law.square(match, oscan);
                }
                else {
                    this.law.square(oscan, match);
                }
            }
            else {
                this.onRemoveContact(token);
            }
        }
    }
    watchOn(layer) {
        this.watchsym = layer.addWatch(this);
    }
    watchOff(layer) {
        layer.removeWatch(this.watchsym);
    }
}
exports.Pancedent = Pancedent;
class Law {
    constructor(spec) {
        this.spec = spec;
        this.left = new Pancedent(this, true);
        this.right = new Pancedent(this, false);
        this.left.partner = this.right;
        this.right.partner = this.left;
    }
    engage(layer, medium) {
        this.medium = medium;
        this.target = layer;
        this.left.watchOn(layer);
        this.right.watchOn(layer);
    }
    disengage() {
        this.left.watchOff(this.target);
        this.right.watchOff(this.target);
    }
    square(from, to) {
        let pairs = all_1.pairByBinding(from, to);
        for (let pair of pairs) {
            let linkIR = this.produceLinkIR(pair);
            let linkSpec = {
                bindings: pair.bindings,
                seatToken: pair.tokenA,
                targetToken: pair.tokenB
            };
            let liveLink = this.medium.supposeLink(linkSpec, this);
            if (liveLink) {
            }
        }
    }
    produceLinkIR({ tokenA, tokenB, bindings }) {
        return {
            tokenA, tokenB, bindings, law: this
        };
    }
}
exports.Law = Law;
//# sourceMappingURL=law.js.map

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BaseMedium {
    constructor() {
        this.claims = {};
    }
    claimTarget(token, target, sponsor) {
        this.claimCommon(token, target, sponsor, false);
    }
    claimSeat(token, seat, sponsor) {
        this.claimCommon(token, seat, sponsor, true);
    }
    claimCommon(token, claim, sponsor, isSeat) {
        if (token in this.claims) {
            let existing = this.claims[token];
            existing.sponsors.add(sponsor);
            existing[isSeat ? 'outbound' : 'inbound'] = existing[isSeat ? 'outbound' : 'inbound'] || {};
        }
        else {
            let newclaim = {
                sponsors: new Set([sponsor]),
                contact: claim,
                token: token,
                valid: true
            };
            newclaim[isSeat ? 'outbound' : 'inbound'] = {};
            claim.claim(this);
            this[isSeat ? 'inductSeat' : 'inductTarget'](newclaim);
            this.claims[token] = newclaim;
        }
    }
    supposeLink(link, sponsor) {
        let seatClaim = this.claims[link.seatToken];
        let targetClaim = this.claims[link.targetToken];
        if (seatClaim == undefined || targetClaim == undefined) {
            throw Error('cannot link between unclaimed contacts');
        }
        let linked = this.claims[link.seatToken].outbound[link.targetToken];
        if (linked !== undefined) {
            let binding = this.reduceBindings(linked.bindings, link.bindings);
            if (binding) {
                linked.bindings = binding;
            }
            else {
                if (linked.active) {
                    linked.active = false;
                    this.disconnect(linked);
                }
            }
            linked.sponsors.add(sponsor);
        }
        else {
            let newlink = {
                active: true,
                bindings: link.bindings,
                seat: seatClaim,
                target: targetClaim,
                sponsors: new Set([sponsor])
            };
            this.claims[link.seatToken].outbound[link.targetToken] = newlink;
            this.claims[link.targetToken].inbound[link.seatToken] = newlink;
            this.connect(newlink);
        }
    }
    reduceBindings(existing, neu) {
        if (Object.keys(existing).length > 0) {
            if (Object.keys(neu).length > 0) {
                return false;
            }
            else {
                return existing;
            }
        }
        else if (Object.keys(neu).length > 0) {
            return neu;
        }
        else {
            return {};
        }
    }
    revokeLink(link, sponsor) {
        let existing = this.claims[link.seatToken].outbound[link.targetToken];
        existing.sponsors.delete(sponsor);
        if (existing.sponsors.size === 0) {
            this.removeLink(existing);
        }
    }
    dropTarget(token, sponsor) {
        this.dropCommon(token, sponsor, false);
    }
    dropSeat(token, sponsor) {
        this.dropCommon(token, sponsor, true);
    }
    dropCommon(token, sponsor, isSeat) {
        let existing = this.claims[token];
        if (existing) {
            existing.sponsors.delete(sponsor);
            if (existing.sponsors.size == 0) {
                let links = existing[isSeat ? 'outbound' : 'inbound'];
                for (let token in links) {
                    let link = links[token];
                    this.removeLink(link);
                }
                this[isSeat ? 'retractSeat' : 'retractTarget'](token);
                delete this.claims[token];
            }
        }
    }
    removeLink(link) {
        delete link.seat.outbound[link.target.token];
        delete link.target.inbound[link.seat.token];
        this.disconnect(link);
    }
    hasClaim(token) {
        return token in this.claims;
    }
    hasLink(seatToken, targetToken) {
        return this.hasClaim(seatToken) && this.hasClaim(targetToken) && this.claims[seatToken].outbound[targetToken] !== undefined;
    }
    canClaimSeat(token, contact) {
        return contact instanceof this.seatType && contact.isSeatable;
    }
    canClaimTarget(token, contact) {
        return contact instanceof this.targetType && contact.isTargetable;
    }
    canConnect(link) {
        return true;
    }
    exportMatrix(reverse = false) {
        let matrix = {};
        for (let aToken in this.claims) {
            if (Object.keys(this.claims[aToken][(reverse ? 'inbound' : 'outbound')]).length === 0)
                continue;
            matrix[aToken] = {};
            let opp = this.claims[aToken][(reverse ? 'inbound' : 'outbound')];
            for (let bToken in opp) {
                matrix[bToken] = opp[bToken];
            }
        }
        return matrix;
    }
}
exports.BaseMedium = BaseMedium;
//# sourceMappingURL=base.js.map

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = __webpack_require__(7);
const D = __webpack_require__(5);
class Section extends layer_1.Layer {
    constructor(positive, expression) {
        super();
        this.positive = positive;
        this.expression = expression;
        this.designator = D.parseDesignatorString(expression);
        this.contacts = {};
        this.subranes = {};
    }
    onAddContact(contact, token) {
        let [groups, end] = token;
        let loc = this;
        for (let g of groups) {
            if (!(g in loc.subranes)) {
                loc.subranes[g] = { subranes: {}, contacts: {} };
            }
            loc = loc.subranes[g];
        }
        loc.contacts[end] = contact;
    }
    onRemoveContact(token) {
        let [groups, end] = token;
        let loc = this;
        for (let g of groups) {
            loc = loc.subranes[g];
        }
        delete loc.contacts[end];
    }
    scan(dexp, flat = true) {
        let desig = D.scannerF('subranes', 'contacts');
        let scan = desig(D.parseDesignatorString(dexp), this);
        if (flat) {
            return D.tokenize(scan);
        }
        else {
            return scan;
        }
    }
    contactChange(token, contact) {
        let m = D.matches(this.designator, token);
        if (m) {
            m = D.compileToken(token) in m;
        }
        if (!m === !this.positive) {
            if (contact) {
                this.onAddContact(contact, token);
            }
            else {
                this.onRemoveContact(token);
            }
            super.contactChange(token, contact);
        }
    }
}
exports.Section = Section;
//# sourceMappingURL=section.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(4);
const all_1 = __webpack_require__(8);
function dumpToDepthF(maxdepth, indentSym = "  ") {
    let recur = function (depth, indentation, item) {
        let outstr = "\n";
        if (checks_1.isPrimative(item))
            outstr = String(item);
        else if (depth <= 0) {
            outstr = "Object";
        }
        else if (item instanceof Array) {
            outstr = "[\n";
            item.forEach((item) => { outstr += (indentation + indentSym + recur(depth - 1, indentation + indentSym, item) + '\n'); });
            outstr += indentation + "]";
        }
        else if (item instanceof Object) {
            outstr = "{\n";
            for (let k of Object.keys(item).concat(Object.getOwnPropertySymbols(item))) {
                let printk = String(k);
                outstr += (indentation + indentSym + printk + ': ' + recur(depth - 1, indentation + indentSym, item[k]) + '\n');
            }
            outstr += indentation + "}";
        }
        return outstr;
    };
    return (x) => {
        return recur(maxdepth, "", x);
    };
}
exports.dumpToDepthF = dumpToDepthF;
function logdump(head, obj) {
    console.log(`${head}: \n${dumpToDepthF(Infinity)(obj)}`);
}
exports.logdump = logdump;
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
        this.options = all_1.meld((a, b) => (b))(Crumb.defaultOptions, optionObj);
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const parsing_1 = __webpack_require__(20);
function matchDesignationTerm(target, term) {
    if (typeof (term) == 'string') {
        return { val: target === term ? target : undefined };
    }
    if (term instanceof Function) {
        return term(target);
    }
    else if (term instanceof RegExp) {
        let m = target.match(term);
        return { val: m ? m[0] : undefined };
    }
    else {
        throw new Error("Jungle Internal Error: Invalid DTerm");
    }
}
exports.matchDesignationTerm = matchDesignationTerm;
function mergeBindings(bindings1, bindings2) {
    if (!bindings1)
        return bindings2;
    if (!bindings2)
        return bindings1;
    let merged = {};
    for (let sym of Object.getOwnPropertySymbols(bindings1 || {})) {
        let bound = bindings1[sym];
        merged[sym] = bound;
    }
    for (let sym of Object.getOwnPropertySymbols(bindings2 || {})) {
        let bound = bindings2[sym];
        let resolved;
        if ((sym in merged)) {
            let existing = merged[sym];
            if (typeof bound === 'string' && typeof existing === 'string') {
                if (merged[sym] === bindings2[sym]) {
                    resolved = bound;
                }
                else {
                    delete merged[sym];
                }
            }
            else if (typeof bound === 'object' && typeof existing === 'object') {
                resolved = mergeBindings(merged[sym], bound);
            }
            else {
                throw new Error(`Invalid Designation: binding ${bound} is of different type to binding ${existing}`);
            }
        }
        else {
            resolved = bindings2[sym];
        }
        merged[sym] = resolved;
    }
    for (let token in bindings1) {
        merged[token] = bindings1[token];
    }
    for (let token in bindings2) {
        merged[token] = bindings2[token];
    }
    return merged;
}
function _matches(designatorIR, tokenIR, ti, di) {
    let [tgroup, tend] = tokenIR;
    let tAtEnd = ti === tgroup.length, dAtEnd = di === designatorIR.groups.length;
    let tokenDTerm = tAtEnd ? tend : tgroup[ti];
    let dTerm = dAtEnd ? designatorIR.end : designatorIR.groups[di];
    if (tAtEnd !== dAtEnd) {
        if (di === designatorIR.groups.length - 1 && dTerm === '**') {
            return _matches(designatorIR, tokenIR, ti, di + 1);
        }
        else {
            return false;
        }
    }
    let { val: tmatch, sym } = matchDesignationTerm(tokenDTerm, dTerm);
    if (tmatch || dTerm == '**') {
        let boundval;
        if (dAtEnd) {
            boundval = {};
            boundval[parsing_1.compileToken(tokenIR)] = null;
        }
        else {
            if (dTerm === '**') {
                let patient = _matches(designatorIR, tokenIR, ti + 1, di);
                let eager = _matches(designatorIR, tokenIR, ti + 1, di + 1);
                boundval = mergeBindings(patient, eager);
            }
            else {
                boundval = _matches(designatorIR, tokenIR, ti + 1, di + 1);
            }
        }
        if (sym) {
            let binding = {}, sbind = {};
            sbind[tmatch] = boundval;
            binding[sym] = sbind;
            return binding;
        }
        else {
            return boundval;
        }
    }
    else {
        return false;
    }
}
function matches(designator, token) {
    let m = _matches(designator, token, 0, 0);
    return m;
}
exports.matches = matches;
//# sourceMappingURL=matching.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DSetExp = "(?:\\*|\\{\\w+(?:\,\\w+)*\\})?";
exports.DSymBindingExp = `(?:\\w+#${exports.DSetExp})`;
exports.DSymBindingParse = `(?:(\\w+)#(${exports.DSetExp}))`;
exports.DTermExp = `(?:\\w+|\\*|${exports.DSymBindingExp})`;
exports.DGroupExp = `(?:\\w+|\\*{1,2}|${exports.DSymBindingExp})`;
exports.DFullExp = `(${exports.DGroupExp}(?:\\.${exports.DGroupExp})*)?\\:(${exports.DTermExp})`;
exports.DTotalExp = new RegExp(`^${exports.DFullExp}$`);
exports.TermChars = '[\\w\\$]';
exports.DSimpleExp = `(${exports.TermChars}+(?:\\.${exports.TermChars}+)*)?(?:\\:(${exports.DTermExp}))?`;
function parseDesignatorString(desigstr) {
    let [groups, terminal] = splitDesignatorString(desigstr);
    let groupTerms = groups.map((value, index) => {
        return parseDTerm(value);
    });
    return {
        groups: groupTerms,
        end: parseDTerm(terminal)
    };
}
exports.parseDesignatorString = parseDesignatorString;
function splitDesignatorString(desigstr) {
    let colonSplit = desigstr.match(exports.DTotalExp);
    if (colonSplit === null) {
        throw new SyntaxError("Incorrect syntax on designator " + desigstr);
    }
    else {
        var [total, chain, terminal] = colonSplit;
    }
    let groupLex = chain ? chain.split(/\./) : [];
    return [groupLex, terminal];
}
exports.splitDesignatorString = splitDesignatorString;
function parseTokenSimple(desigstr) {
    let colonSplit = desigstr.match(exports.DSimpleExp);
    if (colonSplit === null) {
        throw new SyntaxError("Incorrect syntax on token " + desigstr);
    }
    else {
        var [total, chain, terminal] = colonSplit;
    }
    let groupLex = chain ? chain.split(/\./) : [];
    return [groupLex, terminal];
}
exports.parseTokenSimple = parseTokenSimple;
function compileToken([groups, end]) {
    return groups.join('.') + ':' + end;
}
exports.compileToken = compileToken;
function parseDSet(DSetExp) {
    return checked => true;
}
exports.parseDSet = parseDSet;
function parseDTerm(term) {
    if (term == '*') {
        return /.*/;
    }
    else if (term == '**') {
        return '**';
    }
    else if (term !== undefined && term.match(exports.DSymBindingExp)) {
        let match = term.match(exports.DSymBindingParse);
        let set = parseDSet(match[2]);
        let sym = match[1];
        return function (exp) {
            if (set(exp)) {
                return { sym: Symbol.for(sym), val: exp };
            }
        };
    }
    else {
        return new RegExp(`\^${term}\$`);
    }
}
exports.parseDTerm = parseDTerm;
function designatorToRegex(desigstr) {
    let [subranedesig, terminal] = splitDesignatorString(desigstr);
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
//# sourceMappingURL=parsing.js.map

/***/ }),
/* 21 */
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
                let reduced = reduce(obj1[k], obj2[k], k);
                if (reduced !== Symbol.for('delete'))
                    melded[k] = reduced;
            }
            else {
                melded[k] = obj2[k];
            }
        }
        return melded;
    };
}
exports.meld = meld;
function safeMeld(reduce) {
    const omeld = meld(reduce);
    return function (obj1, obj2) {
        if (obj1 instanceof Object && obj2 instanceof Object) {
            return omeld(obj1, obj2);
        }
        else {
            if (obj1 == undefined) {
                return obj2;
            }
            if (obj2 == undefined) {
                return obj1;
            }
            if (obj1 == Symbol.for('delete')) {
                return obj1;
            }
            else {
                return obj2;
            }
        }
    };
}
exports.safeMeld = safeMeld;
function mask(reduce) {
    return function (obj1, obj2) {
        let masked = {};
        let keys1 = Object.keys(obj1);
        for (var k of keys1) {
            if (k in obj2) {
                if (obj1[k] === Symbol.for('delete') || obj2[k] === Symbol.for('delete')) {
                    continue;
                }
                let reduced = reduce(obj1[k], obj2[k], k);
                if (reduced !== Symbol.for('delete'))
                    masked[k] = reduced;
            }
        }
        return masked;
    };
}
exports.mask = mask;
function define(reducer) {
    return function (obj, prop, val) {
        let assoced = {};
        assoced[prop] = val;
        return meld(reducer)(obj, assoced);
    };
}
exports.define = define;
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
/* 22 */
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
    function foremost(a, b) {
        return a;
    }
    reduce.foremost = foremost;
    function negateEqual(a, b) {
        if (a === b) {
            return Symbol.for('delete');
        }
        else {
            return a;
        }
    }
    reduce.negateEqual = negateEqual;
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
    function existential(some, key) {
        return Symbol.for("delete");
    }
    negate.existential = existential;
})(negate = exports.negate || (exports.negate = {}));
//# sourceMappingURL=primary-functions.js.map

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BedAgent {
    constructor(home, config) {
        this.home = home;
        this.config = config;
    }
    patch(patch) {
        return this.home._patch(patch);
    }
    extract(voidspace) {
        return this.home._extract(voidspace);
    }
}
exports.BedAgent = BedAgent;
class AnchorAgent {
    constructor(home, config) {
        this.home = home;
        this.config = config;
    }
    patch(patch) {
        if (this.home.notify instanceof Function) {
            return this.home.notify(patch);
        }
    }
    extract(voidspace) {
        if (this.home.fetch instanceof Function) {
            return this.home.fetch(voidspace);
        }
    }
}
exports.AnchorAgent = AnchorAgent;
//# sourceMappingURL=construct.js.map

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createHeartBridge(spec) {
    let pooled = {
        config: spec,
        patch: (patch) => {
            if (exposed.notify instanceof Function) {
                return exposed.notify(patch);
            }
        },
        notify: null,
        extract: (voidspace) => {
            if (exposed.fetch instanceof Function) {
                return exposed.fetch(voidspace);
            }
        },
        fetch: null
    };
    let exposed = {
        patch: (patch) => {
            if (pooled.notify instanceof Function) {
                return pooled.notify(patch);
            }
        },
        notify: null,
        extract: (voidspace) => {
            if (pooled.fetch instanceof Function) {
                return pooled.fetch(voidspace);
            }
        },
        fetch: null
    };
    return {
        pooled: pooled,
        exposed: exposed
    };
}
exports.createHeartBridge = createHeartBridge;
//# sourceMappingURL=heart.js.map

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class AgentPool {
    constructor(config) {
        this.pool = {};
    }
    add(agent, key) {
        agent.notify = this.notifyIn(key);
        agent.fetch = this.fetchIn(key);
        this.pool[key] = agent;
    }
    remove(key) {
        let agent = this.pool[key];
        agent.notify = undefined;
        agent.fetch = undefined;
        delete this.pool[key];
        return agent;
    }
    notifyIn(key) {
        return (data) => {
            let cresult;
            for (let k in this.pool) {
                if (k !== key) {
                    let result = this.pool[k].patch(data);
                    if (result !== undefined) {
                        if (cresult == undefined) {
                            cresult = {};
                        }
                        cresult[k] = result;
                    }
                }
            }
            return cresult;
        };
    }
    fetchIn(key) {
        return (fetcher) => {
            let result;
            for (let k in this.pool) {
                if (k !== key) {
                    result = this.pool[k].extract(fetcher);
                    if (this.fetchComplete(result)) {
                        return result;
                    }
                }
            }
        };
    }
    fetchComplete(latestFetch) {
        return latestFetch !== undefined;
    }
}
exports.AgentPool = AgentPool;
//# sourceMappingURL=pool.js.map

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const composite_1 = __webpack_require__(11);
function makeSplitStateProxy(host) {
    let outsourced = host.subconstructs;
    let index = host.index;
    let ground = host.nucleus;
    return new Proxy(ground, {
        set: (target, prop, value) => {
            if (prop in outsourced) {
                let exposing = outsourced[prop];
                if (exposing instanceof composite_1.Composite) {
                    throw new Error("Unable to set composite body from internal context");
                }
                else {
                    exposing.exposed = value;
                }
            }
            else if (prop in target) {
                target[prop] = value;
            }
            else {
                host.add(value, prop);
            }
            let q = {};
            q[prop] = value;
            host.bed.notify(q);
            return true;
        },
        get: (target, prop) => {
            if (prop in outsourced) {
                let exposing = outsourced[prop];
                return exposing.exposed;
            }
            else {
                return target[prop];
            }
        },
        deleteProperty: (oTarget, sKey) => {
            if (sKey in outsourced) {
                host.remove(sKey);
            }
            else {
                delete this.scope[sKey];
            }
            let q = {};
            q[sKey] = null;
            host.bed.notify(q);
            return true;
        },
        ownKeys: function (oTarget) {
            return Reflect.ownKeys(index);
        },
        has: function (oTarget, sKey) {
            return Reflect.has(index, sKey);
        }
    });
}
exports.makeSplitStateProxy = makeSplitStateProxy;
//# sourceMappingURL=state.js.map

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(16);
const all_1 = __webpack_require__(2);
const call_1 = __webpack_require__(13);
var DEMUXARG;
(function (DEMUXARG) {
    DEMUXARG[DEMUXARG["ONE"] = 0] = "ONE";
    DEMUXARG[DEMUXARG["SOME"] = 1] = "SOME";
    DEMUXARG[DEMUXARG["DONT"] = 2] = "DONT";
    DEMUXARG[DEMUXARG["ALL"] = 3] = "ALL";
})(DEMUXARG = exports.DEMUXARG || (exports.DEMUXARG = {}));
var CALLTYPE;
(function (CALLTYPE) {
    CALLTYPE[CALLTYPE["DIRECT"] = 0] = "DIRECT";
    CALLTYPE[CALLTYPE["BREADTH_FIRST"] = 1] = "BREADTH_FIRST";
    CALLTYPE[CALLTYPE["DEPTH_FIRST"] = 2] = "DEPTH_FIRST";
    CALLTYPE[CALLTYPE["SERIAL"] = 3] = "SERIAL";
})(CALLTYPE = exports.CALLTYPE || (exports.CALLTYPE = {}));
var MUXRESP;
(function (MUXRESP) {
    MUXRESP[MUXRESP["RACE"] = 0] = "RACE";
    MUXRESP[MUXRESP["FIRST"] = 1] = "FIRST";
    MUXRESP[MUXRESP["LAST"] = 2] = "LAST";
    MUXRESP[MUXRESP["MAP"] = 3] = "MAP";
    MUXRESP[MUXRESP["ORDER"] = 4] = "ORDER";
    MUXRESP[MUXRESP["DROP"] = 5] = "DROP";
})(MUXRESP = exports.MUXRESP || (exports.MUXRESP = {}));
const JunctionModeKeys = {};
JunctionModeKeys[MUXRESP.RACE] = "race";
JunctionModeKeys[MUXRESP.FIRST] = "first";
JunctionModeKeys[MUXRESP.LAST] = "last";
JunctionModeKeys[MUXRESP.MAP] = "object";
JunctionModeKeys[MUXRESP.ORDER] = "array";
class MuxMedium extends base_1.BaseMedium {
    constructor(muxspec) {
        super();
        this.muxspec = muxspec;
        this.seatType = call_1.Call;
        this.targetType = call_1.Call;
        this.fanIn = true;
        this.fanOut = true;
        if (muxspec.emitCallType == CALLTYPE.DIRECT) {
            this.fanIn = false;
            this.fanOut = false;
        }
    }
    emitArgProcess(inpArg, crumb, sink, link) {
        let arg, escape;
        let eType = this.muxspec.emitArgType;
        if (eType === DEMUXARG.DONT) {
            arg = inpArg;
        }
        else {
            if (eType == DEMUXARG.ONE) {
                if (this.emitScope.oneDone) {
                    crumb.raise(`Incoming packet breaches single target constraint`);
                    return;
                }
                else {
                    this.emitScope.oneDone = true;
                }
            }
            let packet = inpArg;
            for (let symk in this.muxspec.symbols) {
                let sym = this.muxspec.symbols[symk];
                if (sym in link.bindings) {
                    let bound = link.bindings[sym];
                    if (!(packet instanceof Object)) {
                        crumb.raise(`incoming packet must be object to be demuxed`);
                    }
                    if (bound in packet) {
                        packet = packet[bound];
                    }
                    else {
                        if (eType === DEMUXARG.ALL) {
                            crumb.raise(`Incoming packet must include key: ${bound}, but only has ${Object.getOwnPropertyNames(packet)}`);
                        }
                    }
                }
                else {
                }
            }
            arg = packet;
        }
        return { arg: arg, escape: escape };
    }
    emitResponse(putResp, crumb, link) {
        let Rtype = this.muxspec.emitRetType;
        let emitResp = putResp;
        if (Rtype == MUXRESP.DROP) {
            return null;
        }
        else if (Rtype == MUXRESP.MAP) {
            let demuxterms = [];
            for (let symk in this.muxspec.symbols) {
                let sym = this.muxspec.symbols[symk];
                if (sym in link.bindings) {
                    let term = link.bindings[sym];
                    demuxterms.push(term);
                }
            }
            this.emitScope.junction.merge(putResp, demuxterms);
        }
        else if (Rtype == MUXRESP.FIRST || Rtype === MUXRESP.LAST || Rtype === MUXRESP.RACE) {
            this.emitScope.junction.merge(putResp);
        }
    }
    emitter(sourceToken, data, crumb) {
        let allFromA = this.claims[sourceToken].outbound;
        this.beginEmit();
        for (let sinkToken in allFromA) {
            let link = allFromA[sinkToken];
            let sink = link.target.contact;
            let { arg, escape } = this.emitArgProcess(data, crumb, sink, link);
            if (!escape) {
                let putResp = sink.put(arg, crumb);
                this.emitResponse(putResp, crumb, link);
            }
        }
        return this.endEmit();
    }
    beginEmit() {
        this.emitScope = {};
        this.emitScope.junction = new all_1.Junction();
        if (this.muxspec.emitRetType in JunctionModeKeys) {
            this.emitScope.junction.mode(JunctionModeKeys[this.muxspec.emitRetType]);
        }
        if (this.muxspec.emitArgType == DEMUXARG.ONE) {
            this.emitScope.oneDone = false;
        }
        this.emitScope.packet = {};
    }
    endEmit() {
        let junc = this.emitScope.junction;
        this.emitScope = undefined;
        return junc;
    }
    inductSeat(claim) {
        if (this.muxspec.emitCallType !== CALLTYPE.DIRECT) {
            claim.contact.emit = this.emitter.bind(this, claim.token);
        }
    }
    inductTarget(claim) { }
    retractSeat(token) { }
    retractTarget(token) { }
    connect(link) {
        if (this.muxspec.emitCallType == CALLTYPE.DIRECT) {
            link.seat.contact.emit = link.target.contact.put;
        }
    }
    disconnect(link) {
        link.seat.contact.emit = undefined;
    }
}
exports.MuxMedium = MuxMedium;
//# sourceMappingURL=multiplexing.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = __webpack_require__(7);
const all_1 = __webpack_require__(5);
class Membrane extends layer_1.Layer {
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
    scan(desexp, flat = true) {
        let desig = all_1.scannerF('subranes', 'contacts');
        let scan = desig(all_1.parseDesignatorString(desexp), this);
        if (flat) {
            return all_1.tokenize(scan);
        }
        else {
            return scan;
        }
    }
    addSubrane(layer, label) {
        this.subranes[label] = layer;
        layer.addWatch(this, label);
    }
    removeSubrane(label) {
        let removing = this.subranes[label];
        if (removing === undefined) {
            return;
        }
        removing.removeWatch(label);
        delete this.subranes[label];
        return removing;
    }
    addContact(contact, label) {
        let existing = this.contacts[label];
        if (existing !== undefined) {
        }
        else {
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
            this.contactChange([[], label], contact);
        }
    }
    notifyContactRemove(contact, label) {
        if (this.notify) {
            this.contactChange([[], label]);
        }
    }
}
exports.Membrane = Membrane;
//# sourceMappingURL=membrane.js.map

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Weave {
    constructor(spec) {
        this.layer = spec.target;
        this.claims = new Map();
        this.violated = [];
        this.media = {};
        this.laws = {};
    }
    addLaw(law) {
        let laws = this.laws[law.spec.medium] = this.laws[law.spec.medium] || new Set();
        laws.add(law);
        let targetMedium = this.media[law.spec.medium];
        if (targetMedium) {
            law.engage(this.layer, targetMedium);
        }
    }
    removeLaw(law) {
        let laws = this.laws[law.spec.medium];
        law.disengage();
        laws.delete(law);
    }
    addMedium(medium, key) {
        this.media[key] = medium;
        if (this.laws[key]) {
            for (let law of this.laws[key]) {
                law.engage(this.layer, medium);
            }
        }
    }
    removeMedium(key) {
        let rm = this.media[key];
        for (let law of this.laws[key]) {
            law.disengage();
        }
        delete this.media[key];
    }
    status() {
    }
    arrangeDispute() {
    }
}
exports.Weave = Weave;
//# sourceMappingURL=weave.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(3);
const Util = __webpack_require__(2);
const IO = __webpack_require__(1);
const TRT = __webpack_require__(6);
__export(__webpack_require__(2));
__export(__webpack_require__(1));
__export(__webpack_require__(9));
__export(__webpack_require__(6));
function j(basis, patch) {
    let head, domain, body, anon, dbasis;
    if (typeof basis === 'string' || domain_1.isNature(basis)) {
        dbasis = basis;
        if (Util.isVanillaObject(patch)) {
            if ('body' in patch && !('head' in patch)) {
                head = patch;
                body = head.body;
                delete patch.body;
            }
            else {
                head = patch.head || {};
                body = patch.body || patch;
                delete patch.head;
            }
            domain = patch.domain;
            anon = patch.anon;
            delete patch.domain;
            delete patch.anon;
        }
        else if (Util.isVanillaArray(patch)) {
            anon = patch;
        }
        else if (patch !== undefined) {
            body = patch;
        }
    }
    else if (Util.isVanillaObject(basis)) {
        head = basis.head;
        delete basis.head;
        anon = basis.anon;
        delete basis.anon;
        body = basis;
        dbasis = 'object';
    }
    else if (Util.isVanillaArray(basis)) {
        dbasis = 'array',
            anon = basis;
    }
    else if (Util.isPrimative(basis)) {
        dbasis = typeof basis,
            body = basis;
    }
    else if (basis !== undefined) {
        dbasis = 'strange',
            body = basis;
    }
    else {
        dbasis = undefined;
    }
    let desc = {};
    desc.basis = dbasis;
    if (head !== undefined)
        desc.head = head;
    if (body !== undefined)
        desc.body = body;
    if (anon !== undefined)
        desc.anon = anon;
    if (domain !== undefined)
        desc.domain = domain;
    return desc;
}
exports.j = j;
exports.J = new domain_1.Domain();
exports.J.sub('media')
    .define('multiplexer', j(TRT.MediumConstruct, {
    head: {
        medium: IO.MuxMedium,
    }
}))
    .define('direct', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.ONE,
    emitRetType: IO.MUXRESP.LAST,
    emitCallType: IO.CALLTYPE.DIRECT
}))
    .define('cast', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.DONT,
    emitRetType: IO.MUXRESP.LAST,
    emitCallType: IO.CALLTYPE.BREADTH_FIRST
}))
    .define('switch', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.SOME,
    emitRetType: IO.MUXRESP.MAP,
    emitCallType: IO.CALLTYPE.BREADTH_FIRST
}))
    .define('compose', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.DONT,
    emitRetType: IO.MUXRESP.MAP,
    emitCallType: IO.CALLTYPE.BREADTH_FIRST
}))
    .define('race', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.DONT,
    emitRetType: IO.MUXRESP.RACE,
    emitCallType: IO.CALLTYPE.BREADTH_FIRST
}))
    .define('serial', j('multiplexer', {
    symbols: [],
    emitArgType: IO.DEMUXARG.DONT,
    emitRetType: IO.MUXRESP.LAST,
    emitCallType: IO.CALLTYPE.SERIAL
}))
    .up()
    .define('cell', TRT.Cell)
    .define('object', TRT.Cell)
    .define('array', TRT.Cell)
    .define('law', TRT.LawConstruct)
    .define('reflex', j(TRT.Reflex, {
    mode: 'reflex',
    inner: false,
    outer: false,
}))
    .define('carry', j(TRT.Carry, {
    mode: 'carry',
    inward: false,
    outward: false
}))
    .define('resolve', j(TRT.Resolve, {
    inner: false,
    outer: false,
    either: false,
}))
    .define('spring', j(TRT.Spring, {
    mode: 'spring',
    inward: false,
    outward: false,
    outfirst: false,
    serial: false,
    composed: false
}))
    .define('deposit', j(TRT.Deposit))
    .define('raw_op', TRT.OpConstruct)
    .define('outward', j('carry', {
    outward: true
}))
    .define('inward', j('carry', {
    inward: true
}))
    .define('spring_in', j('spring', {
    inward: true
}))
    .define('spring_out', j('spring', {
    inward: false
}));
//# sourceMappingURL=jungle.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(0);
const law_1 = __webpack_require__(15);
class LawConstruct extends construct_1.Construct {
    attach(anchor, label) {
        super.attach(anchor, label);
        this.handles = [];
        let lawIRS = law_1.parseLawExpression(this.nucleus);
        for (let i = 0; i < lawIRS.length; i++) {
            let law = lawIRS[i];
            law.key = label + i;
            let actual = new law_1.Law(law);
            anchor.weave.addLaw(actual);
            this.handles.push(actual);
        }
    }
    detach(anchor, label) {
        for (let handle of this.handles) {
            anchor.weave.removeLaw(handle);
        }
    }
}
exports.LawConstruct = LawConstruct;
//# sourceMappingURL=law.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(0);
const checks_1 = __webpack_require__(4);
const law_1 = __webpack_require__(15);
class MediumConstruct extends construct_1.Construct {
    attach(anchor, label) {
        super.attach(anchor, label);
        this.lawhandles = [];
        let medium = this.head.medium;
        let args = this.nucleus;
        let _medium = new medium(args);
        let mhandle = anchor.weave.addMedium(_medium, label);
        this.handleMedium(mhandle);
        for (let lawexp of checks_1.ensureArray(this.nucleus.law)) {
            let laws = law_1.parseLawExpression(lawexp, label);
            for (let law of laws) {
                let handle = anchor.weave.addLaw(new law_1.Law(law));
            }
        }
    }
    handleLaw(handle) {
        this.lawhandles.push(handle);
        handle.on;
    }
    handleMedium(handle) {
    }
    handleConflict(conflict) {
        this.dispose();
    }
    detach(anchor, label) {
    }
}
exports.MediumConstruct = MediumConstruct;
//# sourceMappingURL=media.js.map

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(0);
const stdops_1 = __webpack_require__(14);
class OpConstruct extends construct_1.Construct {
    init(spec) {
        super.init(spec);
    }
    applyExposed() {
    }
    attach(host, key) {
        super.attach(host, key);
        let op = this.contact = this.createOp(this.nucleus, key);
        let inj = this.getInjected();
        if (inj !== undefined) {
            this.exposed = inj;
        }
        host.lining.addContact(op, key);
    }
    detach(host, key) {
        host.lining.removeContact(key);
    }
    getInjected() {
        return undefined;
    }
}
exports.OpConstruct = OpConstruct;
class Spring extends OpConstruct {
    createOp(body, key) {
        return new stdops_1.StdOp({
            label: this.getLocation(),
            context: this.self,
            description: this.nucleus.description,
            hook_inward: this.nucleus.inward,
            hook_outward: this.nucleus.outward,
            mode: 'resolve'
        });
    }
    getInjected() {
        let first = this.contact.hook.inward;
        let last = this.contact.hook.outward;
        return (data) => {
            if (this.nucleus.inward) {
                first(data);
            }
            if (this.nucleus.outward) {
                last(data);
            }
        };
    }
}
exports.Spring = Spring;
class Resolve extends OpConstruct {
    createOp(body, key) {
        return new stdops_1.StdOp({
            label: this.getLocation(),
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'resolve',
            inner_op: this.nucleus.inner || this.nucleus.either,
            outer_op: this.nucleus.outer || this.nucleus.either
        });
    }
}
exports.Resolve = Resolve;
class Reflex extends OpConstruct {
    createOp(body, key) {
        return new stdops_1.StdOp({
            label: this.getLocation(),
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'reflex',
            inner_op: this.nucleus.inner || this.nucleus.either,
            outer_op: this.nucleus.outer || this.nucleus.either
        });
    }
}
exports.Reflex = Reflex;
class Carry extends OpConstruct {
    createOp(body, key) {
        return new stdops_1.StdOp({
            label: this.getLocation(),
            context: this.self,
            description: this.nucleus.description,
            hook_inward: false,
            hook_outward: false,
            mode: 'carry',
            inner_op: this.nucleus.outward || this.nucleus.either,
            outer_op: this.nucleus.inward || this.nucleus.either
        });
    }
}
exports.Carry = Carry;
class Deposit extends construct_1.Construct {
    attach(host, key) {
        super.attach(host, key);
        const drop = (x) => { if (x == undefined) {
            return this.nucleus;
        }
        else {
            this.nucleus = x;
        } };
        let op = new stdops_1.StdOp({
            label: this.getLocation(),
            context: this.self,
            description: "A simple deposit",
            hook_inward: false,
            hook_outward: false,
            mode: 'resolve',
            inner_op: drop,
            outer_op: drop
        });
        host.lining.addContact(op, key);
    }
    detach(host, key) {
        host.lining.removeContact(key);
    }
}
exports.Deposit = Deposit;
//# sourceMappingURL=op.js.map

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(1);
const CS = __webpack_require__(9);
function forwardPointPrepare(section, configval, point) {
    if (typeof configval === 'string') {
        return { positive: section.createSection(configval, 'WTF'), negative: section.createSection(configval, '', false) };
    }
    else if (configval === true) {
        return { positive: section, negative: undefined };
    }
    else if (configval === false) {
        return { positive: undefined, negative: section };
    }
    else {
        throw new Error(`Invalid config value for head setting ${point}, must be boolean or designator string`);
    }
}
class Cell extends CS.Composite {
    constructor(domain) {
        super(domain);
        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
        this.weave = new IO.Weave({
            target: this.lining
        });
    }
    applyHead(head = {}) {
        super.applyHead(head);
    }
    clearHead() {
    }
    attach(anchor, alias) {
        super.attach(anchor, alias);
        let retainer = new IO.Section(true, "**:*");
        let { positive: witheld, negative: unwitheld } = forwardPointPrepare(this.shell, this.head.withold === undefined ? false : true, 'witheld');
        if (witheld !== undefined) {
            witheld.addWatch(retainer);
        }
        let { positive: released, negative: unreleased } = forwardPointPrepare(unwitheld, this.head.release === undefined ? true : false, 'released');
        if (released !== undefined) {
            let { positive: retained, negative: unretained } = forwardPointPrepare(released, anchor.head.retain === undefined ? false : true, 'retained');
            if (retained !== undefined) {
                retained.addWatch(retainer);
            }
            if (unretained !== undefined) {
                let { positive: forwarded, negative: unforwarded } = forwardPointPrepare(unretained, anchor.head.forward === undefined ? true : false, 'forwarded');
                if (forwarded !== undefined) {
                    anchor.shell.addSubrane(forwarded, alias);
                }
            }
        }
        anchor.lining.addSubrane(retainer, alias);
    }
    detach(anchor, alias) {
        super.detach(anchor, alias);
        anchor.lining.removeSubrane(alias);
        anchor.shell.removeSubrane(alias);
    }
    scan(designator) {
        return this.shell.scan(designator);
    }
    seek(designator) {
        let all = this.scan(designator);
        return all[Object.keys(all)[0]];
    }
}
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function pairByBinding(result1, result2, hard = false) {
    let transA = transposeBindings(result1);
    let transB = transposeBindings(result2);
    let collection = [];
    for (let tokenA in transA) {
        for (let tokenB in transB) {
            let breakpair = false;
            let bindingsA = transA[tokenA];
            let bindingsB = transB[tokenB];
            let merged = {};
            for (let symInA in bindingsA) {
                let termInA = bindingsA[symInA];
                if (symInA in bindingsB && termInA !== bindingsB[symInA] || (!(symInA in bindingsB) && hard)) {
                    breakpair = true;
                }
                else {
                    merged[symInA] = termInA;
                }
            }
            for (let symInB in bindingsB) {
                let termInB = bindingsB[symInB];
                if (!(symInB in bindingsA)) {
                    if (hard) {
                        breakpair = true;
                    }
                    else {
                        merged[symInB] = termInB;
                    }
                }
            }
            if (breakpair)
                continue;
            collection.push({
                tokenA: tokenA,
                tokenB: tokenB,
                bindings: merged
            });
        }
    }
    return collection;
}
exports.pairByBinding = pairByBinding;
function transposeBindings(bindings) {
    function recur(bindingTree, collected, current) {
        for (let token in bindingTree) {
            collected[token] = current;
        }
        for (let sym of Object.getOwnPropertySymbols(bindingTree)) {
            let terms = bindingTree[sym];
            for (let term in terms) {
                let upBind = {};
                if (Symbol.keyFor(sym) in current && current[Symbol.keyFor(sym)] !== term) {
                    continue;
                }
                for (let bsym in current) {
                    upBind[bsym] = current[bsym];
                }
                upBind[Symbol.keyFor(sym)] = term;
                let tokens = terms[term];
                recur(tokens, collected, upBind);
            }
        }
        return collected;
    }
    return recur(bindings, {}, {});
}
exports.transposeBindings = transposeBindings;
//# sourceMappingURL=pairing.js.map

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const matching_1 = __webpack_require__(19);
function mergePaths(patha, pathb) {
    let merged = {
        groups: {},
        terminals: {},
        bindings: {}
    };
    for (let sym of Object.getOwnPropertySymbols(patha.bindings || {})) {
        merged.bindings[sym] = patha.bindings[sym];
    }
    for (let sym of Object.getOwnPropertySymbols(pathb.bindings || {})) {
        if (merged.bindings[sym]) {
            merged.bindings[sym] = merged.bindings[sym].concat(pathb.bindings[sym]);
        }
        else {
            merged.bindings[sym] = pathb.bindings[sym];
        }
    }
    for (let k in patha.groups || {}) {
        if (k in pathb.groups) {
            merged.groups[k] = mergePaths(patha.groups[k], pathb.groups[k]);
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
    for (let k in patha.terminals || {}) {
        merged.terminals[k] = patha.terminals[k];
    }
    for (let k in pathb.terminals || {}) {
        merged.terminals[k] = pathb.terminals[k];
    }
    return merged;
}
function scannerF(groupName = 'groups', finalName = 'terminals') {
    return function (designatorIR, target) {
        function _treeDesignate(designatorIR, target, recurState) {
            let rState = recurState;
            let collected = {
                groups: {},
                terminals: {},
                bindings: {}
            };
            let terminal = false;
            let { groups, end: terminals } = designatorIR;
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
                for (let mk in target[groupName]) {
                    let subgroup = target[groupName][mk];
                    let { val: tmatch, sym } = matching_1.matchDesignationTerm(mk, current);
                    if (tmatch) {
                        if (sym) {
                            collected.bindings[sym] = collected.bindings[sym] || [];
                            collected.bindings[sym].push(tmatch);
                        }
                        let proceedwithoutGlob = { thumb: rState.thumb + 1, glob: false };
                        let eager = _treeDesignate(designatorIR, subgroup, proceedwithoutGlob);
                        if (rState.glob) {
                            let keepWithGlob = { thumb: rState.thumb, glob: true };
                            let patient = _treeDesignate(designatorIR, subgroup, keepWithGlob);
                            collected.groups[mk] = mergePaths(eager, patient);
                        }
                        else {
                            collected.groups[mk] = eager;
                        }
                    }
                    else if (rState.glob) {
                        let rUpdate = { thumb: rState.thumb, glob: true };
                        collected.groups[mk] = _treeDesignate(designatorIR, subgroup, rUpdate);
                    }
                }
            }
            else {
                terminal = true;
            }
            if (terminal) {
                let terminalsHere = target[finalName];
                for (let tlabel in terminalsHere) {
                    let t = terminalsHere[tlabel];
                    let { val: tmatch, sym } = matching_1.matchDesignationTerm(tlabel, terminals);
                    if (tmatch) {
                        if (sym) {
                            collected.bindings[sym] = collected.bindings[sym] || [];
                            collected.bindings[sym].push(tmatch);
                        }
                        collected.terminals[tlabel] = t;
                    }
                }
            }
            return collected;
        }
        let result = _treeDesignate(designatorIR, target, { thumb: 0, glob: false });
        return result;
    };
}
exports.scannerF = scannerF;
//# sourceMappingURL=scanning.js.map

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function tokenize(scanned) {
    let recur = function (dtree, tokens, chain, symhead) {
        let insymhead = symhead || tokens;
        let marked = {};
        for (let s of Object.getOwnPropertySymbols(dtree.bindings)) {
            insymhead[s] = insymhead[s] || {};
            let terms = dtree.bindings[s];
            for (let term of terms) {
                insymhead[s][term] = insymhead[s][term] || {};
                marked[term] = s;
            }
        }
        for (let k in dtree.terminals) {
            let v = dtree.terminals[k];
            let token = chain + ':' + k;
            tokens[token] = v;
            if (k in marked) {
                insymhead[marked[k]][k][token] = v;
            }
            else {
                insymhead[token] = v;
            }
        }
        for (let k in dtree.groups) {
            let v = dtree.groups[k];
            let lead = chain === '' ? chain : chain + '.';
            let recsymhead;
            if (k in marked) {
                recsymhead = insymhead[marked[k]][k];
            }
            else {
                recsymhead = insymhead;
            }
            recur(v, tokens, lead + k, recsymhead);
        }
        return tokens;
    };
    return recur(scanned, {}, '');
}
exports.tokenize = tokenize;
//# sourceMappingURL=tokenize.js.map

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Modes = __webpack_require__(39);
var JResultNatures;
(function (JResultNatures) {
    JResultNatures[JResultNatures["Single"] = 0] = "Single";
    JResultNatures[JResultNatures["Keyed"] = 1] = "Keyed";
    JResultNatures[JResultNatures["Indexed"] = 2] = "Indexed";
    JResultNatures[JResultNatures["Appended"] = 3] = "Appended";
    JResultNatures[JResultNatures["Uninferred"] = 4] = "Uninferred";
})(JResultNatures || (JResultNatures = {}));
const WAITING = Symbol("WAITING");
const CACHE_TYPES = {
    "first": Modes.FirstMode,
    "last": Modes.LastMode,
    "single": Modes.SingleMode,
    "race": Modes.RaceMode,
    "object": Modes.ObjectMode,
    "append": Modes.AppendMode,
    "silent": Modes.SilentMode
};
function dezalgo(junction, fallback) {
    if (junction instanceof Junction) {
        let zalgo = junction.realize();
        if (zalgo instanceof Junction) {
            return fallback;
        }
        else {
            return zalgo;
        }
    }
    else {
        return junction;
    }
}
exports.dezalgo = dezalgo;
class Junction {
    constructor() {
        this.thenargs = [];
        this.leashed = [];
        this.blocked = false;
        this.proceeded = false;
        this.fried = false;
        this.cache = new Modes.LastMode();
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
        return this.cache.isBusy() || this.hasFuture();
    }
    isPresent() {
        return !(this.blocked || this.proceeded);
    }
    hasFuture() {
        return this.future != undefined;
    }
    allDone() {
        return (this.proceeded || this.cache.isDone());
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
            return this.cache.getCached();
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
    mode(mode, ...modeargs) {
        this.frontier()._mode(mode, modeargs);
        return this;
    }
    _mode(mode, ...modeargs) {
        if (mode in CACHE_TYPES) {
            this.cachetype = mode;
            this.cache = new CACHE_TYPES[mode](...modeargs);
        }
        else {
            new Error('Invalid hold argument, must be one of "first"|"last"|"race"|"object"|"array"|"append"|"single"');
        }
    }
    await(act, ...awaitargs) {
        let frontier = this.frontier();
        let [done, raise] = frontier.hold(...awaitargs);
        if (frontier.blocked) {
            frontier.leashed.push(act.bind(null, done, raise));
        }
        else {
            act(done, raise);
        }
        return frontier;
    }
    merge(upstream, ...mergeargs) {
        let frontier = this.frontier();
        if (upstream instanceof Junction) {
            return frontier.await(function (done, raise) {
                upstream.then(done);
                upstream.catch(raise);
            }, ...mergeargs);
        }
        else {
            frontier.hold(...mergeargs)[0](upstream);
            return frontier;
        }
    }
    hold(...holdargs) {
        return this.frontier()._hold(...holdargs);
    }
    _hold(...holdargs) {
        let ticket = this.cache.depart(...holdargs);
        return [
            ((res) => {
                this.cache.backOK(ticket, res, ...holdargs);
                if (this.isReady()) {
                    this.proceedThen();
                }
            }),
            ((err) => {
                let error = this.cache.backERR(ticket, {
                    message: err,
                    key: ticket
                });
                this.raise(error);
            })
        ];
    }
    raise(error) {
        this.fried = true;
        this.error = error;
        if (this.hasFuture()) {
            this.proceedCatch(this.error);
        }
    }
    catch(callback) {
        let frontier = this.frontier();
        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.catchCallback = callback;
        if (frontier.fried) {
            frontier.raise(frontier.error);
        }
        return frontier.future;
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
    then(callback, ...thenargs) {
        let frontier = this.frontier();
        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.future._mode(this.cachetype);
        frontier.future.thenargs = thenargs;
        frontier.future.fried = frontier.fried;
        frontier.future.error = frontier.error;
        frontier.thenCallback = callback;
        if (frontier.isReady()) {
            frontier.proceedThen();
        }
        return frontier.future;
    }
    proceedThen() {
        this.proceeded = true;
        let cached = this.cache.getCached();
        if (this.thenCallback !== undefined) {
            let future = this.future;
            let propagate = this.thenCallback(cached);
            if (propagate instanceof Junction) {
                propagate.then(function (result) {
                    future.unleash(result);
                });
            }
            else {
                future.unleash(propagate);
            }
        }
        else {
            this.future.unleash(cached);
        }
    }
    unleash(propagated) {
        let [done, raise] = this._hold(...this.thenargs);
        this.blocked = false;
        for (let i = 0; i < this.leashed.length; i++) {
            this.leashed[i]();
        }
        delete this.leashed;
        done(propagated);
    }
}
exports.Junction = Junction;
//# sourceMappingURL=junction.js.map

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BaseMode {
    constructor() {
        this.checkedTickets = [];
        this.ticketNo = 0;
        this.raising = true;
    }
    checkOut() {
        let ticket = this.ticketNo++;
        this.checkedTickets[ticket] = false;
        return ticket;
    }
    checkIn(ticket) {
        this.checkedTickets[ticket] = true;
    }
    allIn() {
        return this.checkedTickets.reduce((prev, current) => {
            return prev && current;
        }, true);
    }
    anyIn() {
        return this.checkedTickets.reduce((prev, current) => {
            return prev || current;
        }, true);
    }
    backERR(ticket, err, ...args) {
        if (this.raising) {
            return err;
        }
    }
    isBusy() {
        return this.checkedTickets.length > 0;
    }
    isDone() {
        return this.allIn();
    }
    depart(...args) {
        return this.checkOut();
    }
}
exports.BaseMode = BaseMode;
class FirstMode extends BaseMode {
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        if (this.value === undefined) {
            this.value = value;
        }
    }
    getCached() {
        return this.value;
    }
}
exports.FirstMode = FirstMode;
class SilentMode extends BaseMode {
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
    }
    getCached() {
        return undefined;
    }
}
exports.SilentMode = SilentMode;
class LastMode extends BaseMode {
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        this.value = value;
    }
    getCached() {
        return this.value;
    }
}
exports.LastMode = LastMode;
class SingleMode extends BaseMode {
    depart(...args) {
        let ticket = this.checkOut();
        if (args[0]) {
            this.special = ticket;
        }
        return ticket;
    }
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        if (ticket === this.special) {
            this.value = value;
        }
    }
    getCached() {
        return this.value;
    }
}
exports.SingleMode = SingleMode;
class RaceMode extends BaseMode {
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        this.value = value;
    }
    isDone() {
        return this.anyIn();
    }
    getCached() {
        return this.value;
    }
}
exports.RaceMode = RaceMode;
class AppendMode extends BaseMode {
    constructor() {
        super();
        this.returned = [];
    }
    depart(...args) {
        let ticket = this.checkOut();
        return ticket;
    }
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        this.returned.push(value);
    }
    getCached() {
        return this.returned;
    }
}
exports.AppendMode = AppendMode;
class ObjectMode extends BaseMode {
    constructor() {
        super();
        this.returned = {};
    }
    depart(...args) {
        let ticket = this.checkOut();
        return ticket;
    }
    backOK(ticket, value, ...args) {
        this.checkIn(ticket);
        let derefs = args[0] || [];
        derefs = typeof derefs == "string" ? [derefs] : derefs;
        if (derefs.length === 0) {
            this.returned = value;
        }
        else {
            let tip = this.returned;
            for (let i = 0; i < derefs.length; i++) {
                let deref = derefs[i];
                tip = tip[deref] = tip[deref] || (i === derefs.length - 1 ? value : {});
            }
        }
    }
    getCached() {
        return this.returned;
    }
}
exports.ObjectMode = ObjectMode;
//# sourceMappingURL=modes.js.map

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const f = __webpack_require__(22);
const op = __webpack_require__(21);
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
function deepInvertF(terminator = f.terminate.isPrimative, negater = f.negate.existential) {
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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createVisor(target, visorConfig) {
    let visor = {};
    for (let k in visorConfig) {
        let v = visorConfig[k];
        if (v instanceof Function) {
            visor[k] = v(k, target);
        }
        else if (v instanceof Object) {
            visor[k] = createVisor(target[k], v);
        }
        else if (v) {
            let tk = typeof v == 'string' ? v : k;
            if (target[tk] instanceof Function) {
                visor[k] = target[tk].bind(target);
            }
            else {
                Object.defineProperty(visor, k, {
                    get: () => {
                        return target[tk];
                    }
                });
            }
        }
        else {
        }
    }
    return visor;
}
exports.createVisor = createVisor;
//# sourceMappingURL=visor.js.map

/***/ })
/******/ ]);