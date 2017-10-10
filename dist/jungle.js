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
/******/ 	return __webpack_require__(__webpack_require__.s = 31);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const state_1 = __webpack_require__(17);
class Construct {
    constructor(domain) {
        this.domain = domain;
    }
    init(desc) {
        this.origins = desc.origins;
        this.basis = desc.basis;
        this.applyHead(desc.head);
        this._patch(desc.body);
        let primeResult = this.primeTractor ? this.primeTractor.call(this.nucleus) : undefined;
    }
    dispose() {
        if (this.disposeTractor) {
            this.disposeTractor.call(this.nucleus);
        }
        this.clearHead();
    }
    applyHead(head = {}) {
        this.head = head;
        this.exposure = head.exposure || 'local';
        this.reach = head.reach || 'host';
        this.remote = head.remote || false;
        this.beginTractor = head.begin;
        this.endTractor = head.end;
        this.primeTractor = head.prime;
        this.disposeTractor = head.dispose;
    }
    clearHead() {
        this.primeTractor = undefined;
        this.disposeTractor = undefined;
        this.exposure = undefined;
        this.reach = undefined;
        this.remote = undefined;
    }
    attach(host, id) {
        this.attachHostAgent(host, id);
        this.attachHostState(host, id);
        if (this.beginTractor) {
            this.beginTractor.call(this.local);
        }
    }
    attachHostState(host, id) {
        let acc = new state_1.AccessoryState(this, id, host.local, {
            reach: this.reach,
            exposure: this.exposure,
            initial: this.nucleus
        });
        this.local = acc.exposed;
        this.exposed = acc.exposed;
        Object.defineProperty(this, 'nucleus', {
            get: () => {
                return this.local.me;
            },
            set: (value) => {
                return this.local.me = value;
            }
        });
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
    detachHostState() {
        this.local = undefined;
        this.exposed = undefined;
        Object.defineProperty(this, 'nucleus', {
            value: this.nucleus
        });
    }
    detachHostAgent() {
        this.fetch = undefined;
        this.notify = undefined;
    }
    detach(host, id) {
        if (this.endTractor) {
            this.endTractor.call(this.local);
        }
        this.detachHostState();
        this.detachHostAgent();
    }
    _patch(patch) {
        this.nucleus = patch;
    }
    patch(patch) {
        return this._patch(patch);
    }
    _extract(sucker) {
        return this.nucleus;
    }
    extract(sucker) {
        return this._extract(sucker);
    }
}
exports.Construct = Construct;
//# sourceMappingURL=construct.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const typesplit_1 = __webpack_require__(13);
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
__export(__webpack_require__(16));
__export(__webpack_require__(0));
__export(__webpack_require__(14));
__export(__webpack_require__(15));
//# sourceMappingURL=all.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(39));
__export(__webpack_require__(1));
const debug = __webpack_require__(24);
exports.Debug = debug;
__export(__webpack_require__(25));
__export(__webpack_require__(26));
__export(__webpack_require__(12));
__export(__webpack_require__(27));
//# sourceMappingURL=all.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(8));
__export(__webpack_require__(30));
__export(__webpack_require__(21));
__export(__webpack_require__(29));
__export(__webpack_require__(18));
__export(__webpack_require__(20));
//# sourceMappingURL=all.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(22));
__export(__webpack_require__(23));
__export(__webpack_require__(38));
__export(__webpack_require__(33));
__export(__webpack_require__(32));
__export(__webpack_require__(34));
__export(__webpack_require__(35));
__export(__webpack_require__(36));
__export(__webpack_require__(37));
//# sourceMappingURL=all.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const base_1 = __webpack_require__(18);
class Call extends base_1.BasicContact {
    constructor(...args) {
        super(...args);
        this.invertable = true;
        this.hasInput = false;
        this.hasOutput = false;
    }
}
exports.Call = Call;
//# sourceMappingURL=call.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const designator_1 = __webpack_require__(9);
const linktype = '[-=~]';
const mediumMidExp = `-\\(\\w+\\)-|=\\(\\w+\\)=`;
const mediumBounds = `(${linktype})\\((\\w+)\\)${linktype}`;
const lawSplitExp = `(<)?(${mediumMidExp}|${linktype})(>)?`;
const lawExp = new RegExp(`${designator_1.DFullExp}(?:${lawSplitExp}${designator_1.DFullExp})+`);
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
//# sourceMappingURL=law.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const designator_1 = __webpack_require__(9);
(function (MembraneEvents) {
    MembraneEvents[MembraneEvents["AddContact"] = 0] = "AddContact";
    MembraneEvents[MembraneEvents["AddMembrane"] = 1] = "AddMembrane";
    MembraneEvents[MembraneEvents["RemoveContact"] = 2] = "RemoveContact";
    MembraneEvents[MembraneEvents["RemoveMembrane"] = 3] = "RemoveMembrane";
})(exports.MembraneEvents || (exports.MembraneEvents = {}));
var MembraneEvents = exports.MembraneEvents;
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
    createSection(desexp, alias) {
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const hierarchical_1 = __webpack_require__(28);
const operations_1 = __webpack_require__(10);
const f = __webpack_require__(11);
exports.DSetExp = "(?:\\*|\\{\\w+(?:\,\\w+)*\\})?";
exports.DSymBindingExp = `(?:\\w+#${exports.DSetExp})`;
exports.DSymBindingParse = `(?:(\\w+)#(${exports.DSetExp}))`;
exports.DTermExp = `(?:\\w+|\\*|${exports.DSymBindingExp})`;
exports.DGroupExp = `(?:\\w+|\\*{1,2}|${exports.DSymBindingExp})`;
exports.DFullExp = `(${exports.DGroupExp}(?:\\.${exports.DGroupExp})*)?\\:(${exports.DTermExp})`;
exports.DTotalExp = new RegExp(`^${exports.DFullExp}$`);
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
                return [Symbol.for(sym), exp];
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
        return target.match(parseDTerm(term));
    }
}
exports.matchDesignationTerm = matchDesignationTerm;
class Designator {
    constructor(groupName, finalName, designatorExp) {
        this.groupName = groupName;
        this.finalName = finalName;
        let desExp = this.autoColon(designatorExp);
        this.designatorIR = parseDesignatorString(desExp);
        this.regex = designatorToRegex(desExp);
        this.expression = desExp;
        this.screens = [];
    }
    autoColon(designatorExp) {
        if (designatorExp.match(/^[a-z0-9A-Z_\$]+$/)) {
            return ":" + designatorExp;
        }
        else {
            return designatorExp;
        }
    }
    getLocale() {
        let colonSplit = this.expression.match(exports.DTotalExp);
        return colonSplit[1] || "";
    }
    getTerminal() {
        let colonSplit = this.expression.match(exports.DTotalExp);
        return colonSplit[2];
    }
    mergePaths(patha, pathb) {
        let merged = {
            groups: {},
            end: {},
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
            let term = (obj1, obj2, k) => { return k === 'end' || k === 'bindings'; };
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
            end: {},
            bindings: {}
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
                let tmatch = matchDesignationTerm(mk, current);
                if (tmatch) {
                    if (typeof tmatch[0] === 'symbol') {
                        collected.bindings[tmatch[0]] = collected.bindings[tmatch[0]] || [];
                        collected.bindings[tmatch[0]].push(tmatch[1]);
                    }
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
                let tmatch = matchDesignationTerm(tlabel, end);
                if (tmatch) {
                    if (typeof tmatch[0] === 'symbol') {
                        collected.bindings[tmatch[0]] = collected.bindings[tmatch[0]] || [];
                        collected.bindings[tmatch[0]].push(tmatch[1]);
                    }
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
            for (let k in dtree.end) {
                let v = dtree.end[k];
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
    mergeBindings(bindings1, bindings2) {
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
                    resolved = this.mergeBindings(merged[sym], bound);
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
        return merged;
    }
    _matches(token, tgroup, tend, ti, di) {
        let tAtEnd = ti === tgroup.length, dAtEnd = di === this.designatorIR.groups.length;
        let tokenDTerm = tAtEnd ? tend : tgroup[ti];
        let dTerm = dAtEnd ? this.designatorIR.end : this.designatorIR.groups[di];
        if (tAtEnd !== dAtEnd && (dTerm !== '**'))
            return false;
        let tmatch = matchDesignationTerm(tokenDTerm, dTerm);
        if (tmatch || dTerm == '**') {
            let boundval;
            if (tAtEnd || dAtEnd) {
                boundval = {};
                boundval[token] = null;
            }
            else {
                if (dTerm === '**') {
                    let patient = this._matches(token, tgroup, tend, ti + 1, di);
                    let eager = this._matches(token, tgroup, tend, ti + 1, di + 1);
                    boundval = this.mergeBindings(patient, eager);
                }
                else {
                    boundval = this._matches(token, tgroup, tend, ti + 1, di + 1);
                }
            }
            if (typeof tmatch[0] === 'symbol') {
                let binding = {}, sbind = {};
                sbind[tmatch[1]] = boundval;
                binding[tmatch[0]] = sbind;
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
    matches(token) {
        let [tgroup, tend] = splitDesignatorString(this.autoColon(token));
        return this._matches(token, tgroup, tend, 0, 0);
    }
}
exports.Designator = Designator;
//# sourceMappingURL=designator.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const checks_1 = __webpack_require__(1);
const typesplit_1 = __webpack_require__(13);
function ensureArray(sometimes) {
    return (sometimes instanceof Array) ? sometimes : (sometimes != undefined ? [sometimes] : []);
}
exports.ensureArray = ensureArray;
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const all_1 = __webpack_require__(27);
const construct_1 = __webpack_require__(0);
const checks_1 = __webpack_require__(1);
function parseBasisString(str) {
    let m = /^(?:((?:\w+\.)*[\w]+)\:)?(\w+)$/;
    if (m) {
        let [full, loc, name] = str.match(m);
        let sloc = loc ? loc.split('.') : [];
        return {
            location: sloc,
            name: name,
            invasive: false
        };
    }
    else {
        throw new RangeError("invalid basis desiginator expression");
    }
}
function isConstruct(thing) {
    return thing instanceof Function && (thing.prototype instanceof construct_1.Construct || thing === construct_1.Construct);
}
exports.isConstruct = isConstruct;
function isDescription(thing) {
    return checks_1.isVanillaObject(thing) && 'basis' in thing;
}
exports.isDescription = isDescription;
function descmeld(entry, desc, k) {
    return {
        basis: entry.basis,
        head: headmeld(entry.head || {}, desc.head || {}),
        body: all_1.safeMeld(bodyMeldItem)(entry.body || {}, desc.body || {}),
        anon: desc.anon || []
    };
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
        body: all_1.safeMeld(debaseBodyItem)(desc.body || {}, base.body || {})
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
    constructor(ops = {}) {
        this.isolated = ops.isolated !== undefined ? ops.isolated : false;
        this.rebasing = ops.rebasing !== undefined ? ops.rebasing : false;
        this.registry = {};
        this.subdomain = {};
        this.exposed = {
            define: (key, desc) => {
                this.define(key, desc);
            }
        };
    }
    define(name, val) {
        let m = name.match(/^[a-zA-Z0-9_]+$/);
        if (m) {
            if (isDescription(val)) {
                this.addDescription(name, val);
            }
            else if (isConstruct(val)) {
                this.addDescription(name, {
                    basis: val
                });
            }
            else {
                console.log('add static', name);
                this.addStatic(name, val);
            }
            return this;
        }
        else {
            throw new Error("Invalid basis name (must be alphanumeric+_");
        }
    }
    addDescription(name, desc) {
        if (!(name in this.registry)) {
            this.registry[name] = desc;
            if (desc.domain == undefined) {
                desc.domain = this;
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
        let recovered = new nature(final.domain);
        recovered.init(final);
        return recovered;
    }
    collapse(desc) {
        if (isConstruct(desc.basis)) {
            return desc;
        }
        else if (typeof desc.basis === 'string') {
            let sresult;
            if (desc.basis === desc.origins[0]) {
                desc.origins = desc.origins.slice(1);
                if (this.parent && !this.isolated) {
                    sresult = this.parent.seek(desc.basis, true);
                }
            }
            else {
                sresult = this.seek(desc.basis, true);
            }
            let { domain, entry } = sresult;
            let melded = descmeld(entry, desc);
            melded.origins = [desc.basis, ...desc.origins];
            melded.domain = desc.domain || domain;
            if (this.rebasing) {
                return this.collapse(melded);
            }
            else {
                return domain.collapse(melded);
            }
        }
        else {
            throw new Error("Invalid recovery basis must be basis designator or Construct function");
        }
    }
    describe(construct, target = true) {
        let body = construct.extract(null);
        let debased = this.debase({
            basis: construct.basis,
            head: construct.head,
            body: body,
            origins: construct.origins,
        }, target);
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
                    if (this.rebasing) {
                        return this.debase(debased, target);
                    }
                    else {
                        return find.domain.debase(debased, target);
                    }
                }
            }
        }
    }
    seek(basis, fussy = false) {
        let parsed = parseBasisString(basis);
        let result = this._seek(parsed);
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
    _seek(place) {
        let result = this.__seek(place);
        if (result.entry == undefined || result.domain == undefined) {
            if (!this.isolated && this.parent !== undefined) {
                result = this.parent._seek(place);
            }
        }
        return result;
    }
    __seek({ location, name, invasive }) {
        let result;
        if (location.length === 0) {
            if (name in this.registry) {
                result = {
                    domain: this,
                    name: name,
                    entry: this.registry[name]
                };
            }
            else {
                result = {
                    domain: this,
                    name: name,
                    entry: null
                };
            }
        }
        else {
            let subdomain = location[0];
            if (subdomain in this.subdomain) {
                result = this.subdomain[subdomain].__seek({ location: location.slice(1), name: name, invasive: true });
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
    sub(name, opts = {}) {
        if (name in this.subdomain) {
            return this.subdomain[name];
        }
        let domain = opts instanceof Domain ? opts : new Domain(opts);
        this.addSubdomain(name, domain);
        return domain;
    }
    isosub(name) {
        if (name in this.subdomain) {
            return this.subdomain[name];
        }
        let domain = new Domain({ isolated: true });
        this.addSubdomain(name, domain);
        return domain;
    }
    up() {
        if (this.parent) {
            return this.parent;
        }
        else {
            return this;
        }
    }
    addSubdomain(key, val) {
        if (key in this.subdomain) {
            throw new Error(`Subdomain ${key} already exists cannot redefine`);
        }
        else {
            this.subdomain[key] = val;
            val.parent = this;
        }
    }
    addStatic(name, value) {
        this.exposed[name] = value;
    }
    getExposure() {
        return this.exposed;
    }
}
exports.Domain = Domain;
//# sourceMappingURL=domain.js.map

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const junction_1 = __webpack_require__(25);
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
            let junction = new junction_1.Junction().mode('last');
            for (let k in this.pool) {
                if (k !== key) {
                    junction.merge(this.pool[k].patch(data));
                }
            }
            return junction;
        };
    }
    fetchIn(key) {
        return (data) => {
            let junction = new junction_1.Junction().mode('first');
            for (let k in this.pool) {
                if (k !== key) {
                    junction = junction.then(data => {
                        if (this.fetchComplete(data)) {
                            console.log('calling into pool to key ', k);
                            return data;
                        }
                        else {
                            return this.pool[k].extract(data);
                        }
                    }).catch(err => {
                    });
                }
            }
            return junction;
        };
    }
    fetchComplete(latestFetch) {
        return latestFetch !== undefined;
    }
}
exports.AgentPool = AgentPool;
//# sourceMappingURL=agency.js.map

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const construct_1 = __webpack_require__(0);
const state_1 = __webpack_require__(17);
const agency_1 = __webpack_require__(15);
class Composite extends construct_1.Construct {
    constructor(domain) {
        super(domain);
        this.isComposite = true;
        this.subconstructs = [];
        this.nucleus = {};
    }
    init(desc) {
        this.addStrange('domain', this.domain.getExposure());
        this.origins = desc.origins;
        this.basis = desc.basis;
        this.applyHead(desc.head);
        this._patch(desc.body);
        this._patch(desc.anon);
        let primeResult = this.primeTractor ? this.primeTractor.call(this.nucleus) : undefined;
    }
    dispose() {
        for (let key in this.subconstructs) {
            let construct = this.detachChild(key);
            construct.dispose();
        }
        if (this.disposeTractor) {
            this.disposeTractor.call(this.nucleus);
        }
        this.clearHead();
    }
    applyHead(head = {}) {
        super.applyHead(head);
        this.state = new state_1.HostState(this, head.state);
        this.exposed = this.state.exposed;
        this.local = this.state.local;
        let { exposed, pooled } = this.createHeart(((head.heart || {}).exposed || {}));
        this.addStrange('heart', exposed);
        this.bed = new agency_1.BedAgent(this, head.bed);
        this.anchor = new agency_1.AnchorAgent(this, head.anchor);
        this.pool = this.createPool(head.pool);
        this.pool.add(pooled, 'heart');
        this.pool.add(this.bed, 'bed');
        this.pool.add(this.anchor, 'anchor');
    }
    clearHead() {
        this.beginTractor = undefined;
        this.endTractor = undefined;
        super.clearHead();
    }
    attach(host, id) {
        this.attachHostAgent(host, id);
        if (this.beginTractor) {
            this.beginTractor.call(this.local);
        }
    }
    patch(patch) {
        return this.anchor.notify(patch);
    }
    _patch(patch) {
        if (patch instanceof Array) {
            for (let i = 0; i < patch.length; i++) {
                this.add(patch[i]);
            }
        }
        else {
            for (let k in patch) {
                if (!(k in Composite.keywords)) {
                    let v = patch[k];
                    this.patchChild(k, v);
                }
            }
        }
    }
    patchChild(k, v) {
        let existing = this.subconstructs[k];
        if (existing !== undefined) {
            existing.patch(v);
        }
        else {
            if (v === undefined) {
                this.remove(k);
            }
            else {
                this.add(v, k);
            }
        }
    }
    addAnon(val) {
    }
    add(val, key) {
        let k = key === undefined ? this.subconstructs.length++ : key;
        if (this.nucleus instanceof Array) {
            this.nucleus.length = this.subconstructs.length;
        }
        if (val instanceof Object && 'basis' in val) {
            let construct = this.domain.recover(val);
            this.attachChild(construct, k);
        }
        else {
            this.addStrange(k, val);
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
            delete this.nucleus;
        }
    }
    attachChild(construct, key) {
        this.subconstructs[key] = construct;
        construct.attach(this, key);
    }
    detachChild(key) {
        let construct = this.subconstructs[key];
        delete this.subconstructs[key];
        construct.detach(this, key);
        return construct;
    }
    addStrange(k, v) {
        this.nucleus[k] = v;
    }
    addPrimative(k, v) {
        this.nucleus[k] = v;
    }
    getExposure() {
        return {
            create: (v, k) => {
                this.add(v, k);
            },
            destroy: (k) => {
                this.remove(k);
            }
        };
    }
    _extract(suction) {
        let voidspace;
        if (suction === undefined || typeof suction === 'object') {
            voidspace = suction;
        }
        else if (typeof suction === 'string') {
            voidspace = {};
            voidspace[suction] = null;
        }
        else {
            throw new Error('Invalid extractor suction argument');
        }
        let extracted = {};
        for (let key in this.subconstructs) {
            if (voidspace === undefined || key in voidspace) {
                let construct = this.subconstructs[key];
                extracted[key] = construct.extract(voidspace === undefined ? undefined : voidspace[key]);
            }
        }
        for (let key in this.nucleus) {
            if (voidspace === undefined || (key in voidspace && voidspace[key] === undefined)) {
                extracted[key] = this.nucleus[key];
            }
        }
        return extracted;
    }
    extract(suction) {
        return this.anchor.fetch(suction);
    }
    createPool(poolConfig) {
        return new agency_1.AgentPool(poolConfig);
    }
    createHeart(spec) {
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
}
Composite.keywords = { basis: null, domain: null, head: null, anon: null };
exports.Composite = Composite;
//# sourceMappingURL=composite.js.map

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const composite_1 = __webpack_require__(16);
class AccessoryState {
    constructor(home, accessoryKey, scope, spec) {
        this.home = home;
        this.accessoryKey = accessoryKey;
        this.exposed = new Proxy(scope, this);
        this.myval = spec.initial;
    }
    set(target, prop, value) {
        if (prop === 'me' || prop == this.accessoryKey) {
            this.myval = value;
            return true;
        }
        else {
            target[prop] = value;
            return true;
        }
    }
    get(target, prop) {
        if (prop === 'me' || prop == this.accessoryKey) {
            return this.myval;
        }
        else {
            return target[prop];
        }
    }
    defineProperty(oTarget, sKey, oDesc) {
        if (sKey == 'me') {
            return Reflect.defineProperty(this, 'myval', oDesc);
        }
        else {
            Object.defineProperty(oTarget, sKey, oDesc);
        }
    }
}
exports.AccessoryState = AccessoryState;
const exposureLevels = {
    'public': 2,
    'local': 1,
    'private': 0
};
class HostState {
    constructor(host, spec) {
        this.host = host;
        this.spec = spec;
        this.scope = this.host.nucleus || {};
        let outsourced = this.host.subconstructs;
        this.outsourced = outsourced;
        let exposedHandler = function (level) {
            let hostLevel = exposureLevels[level];
            return {
                set: (target, prop, value) => {
                    if (prop in outsourced) {
                        let exposing = outsourced[prop];
                        let outlevel = exposureLevels[exposing.exposure];
                        if (outlevel >= hostLevel) {
                            if (exposing instanceof composite_1.Composite) {
                                this.setSubCell(exposing, prop, value);
                            }
                            else {
                                this.setAccessory(exposing, prop, value);
                            }
                        }
                        else {
                            throw new Error(`Cannot assign, this space: ${prop} is taken by subconstruct that is closed`);
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
                        let outlevel = exposureLevels[exposing.exposure];
                        if (outlevel >= hostLevel) {
                            if (exposing instanceof composite_1.Composite) {
                                return exposing.exposed;
                            }
                            else {
                                return exposing.exposed.me;
                            }
                        }
                        else if (exposing.remote) {
                            exposing.extract();
                        }
                    }
                    else {
                        return target[prop];
                    }
                },
                deleteProperty: (oTarget, sKey) => {
                    if (sKey in outsourced) {
                        this.host.remove(sKey);
                    }
                    else {
                        delete this.scope[sKey];
                    }
                },
                ownKeys: function (oTarget, sKey) {
                    let keycoll = {};
                    for (let k in outsourced) {
                        let outlevel = exposureLevels[outsourced[k].exposure];
                        if (outlevel >= hostLevel) {
                            keycoll[k] = null;
                        }
                    }
                    for (let k in oTarget) {
                        keycoll[k] = null;
                    }
                    return Object.keys(keycoll);
                },
                has: function (oTarget, sKey) {
                    return sKey in oTarget || sKey in outsourced;
                },
            };
        };
        this.local = new Proxy(this.scope, exposedHandler.call(this, 'local'));
        this.exposed = new Proxy(this.scope, exposedHandler.call(this, 'public'));
    }
    setAccessory(exposing, key, value) {
        exposing.exposed[key] = value;
    }
    setSubCell(exposing, key, value) {
        if (value === undefined) {
            this.host.remove(key);
        }
        else if (typeof value === 'object') {
            let p = {};
            p[key] = value;
            this.host._patch(p);
        }
        else {
            throw new Error("A subcell cannot be reset from the context, must dispose (set undefined)");
        }
    }
}
exports.HostState = HostState;
//# sourceMappingURL=state.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class BasicContact {
    constructor() {
        this.hidden = false;
        this.plugged = false;
        this.gloved = false;
        this.claimed = false;
        this.inverted = false;
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
exports.BasicContact = BasicContact;
//# sourceMappingURL=base.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const call_1 = __webpack_require__(6);
class Integrator extends call_1.Call {
    constructor(spec) {
        super();
        this.spec = spec;
        this.invertable = false;
        this.put = (data, debug) => {
            if (data instanceof Object && typeof data.method === 'string') {
                if (this.recievers[data.method] !== undefined) {
                    return this.recievers[data.method].call(this.spec.target, data.payload);
                }
            }
            if ('any' in this.recievers) {
                return this.recievers['any'].call(this.spec.target, data);
            }
        };
        this.hasInput = true;
        this.hasOutput = true;
        this.recievers = {};
        let on = this.createReciever();
        let emit = this.createEmitter();
        spec.integrator(spec.target, this.recievers, emit);
    }
    createEmitter() {
        return (name) => {
            if (name !== undefined) {
                return (arg) => {
                    let packet = {
                        method: name,
                        payload: arg
                    };
                    if (this.emit) {
                        this.emit(packet);
                    }
                };
            }
            else {
                return (arg) => {
                    if (this.emit) {
                        this.emit(arg);
                    }
                };
            }
        };
    }
    createReciever() {
    }
    createPartner() {
        return undefined;
    }
}
exports.Integrator = Integrator;
//# sourceMappingURL=integrator.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const Debug = __webpack_require__(24);
const all_1 = __webpack_require__(3);
const call_1 = __webpack_require__(6);
class Op extends call_1.Call {
    constructor(spec) {
        super();
        this.spec = spec;
        this.invertable = true;
    }
    invert() {
        let inverted = super.invert();
        this.attachInput();
        inverted.attachInput();
        this.attachHook();
        return inverted;
    }
    createPartner() {
        return new Op({
            context: this.spec.context,
            major_op: this.spec.minor_op,
            major_arg1: this.spec.minor_arg1,
            major_arg2: this.spec.minor_arg2,
            major_return: this.spec.minor_return
        });
    }
    attachInput() {
        let troubles = [
            this.spec.major_arg1, this.spec.major_arg2, this.spec.major_return
        ];
        for (let i = 0; i < troubles.length; i++) {
            if (troubles[i] === 'carry') {
                this.partner.hasOutput = true;
            }
            else if (troubles[i] === 'reflex') {
                this.hasOutput = true;
            }
            for (let j = i + 1; j < troubles.length; j++) {
                if (troubles[i] !== undefined && troubles[i] == troubles[j]) {
                    throw new Error(`Must not have repeated targets, ${this.spec.major_arg1} !== ${this.spec.major_arg2} !== ${this.spec.major_return}`);
                }
            }
        }
        if (this.spec.major_arg2 !== undefined && this.spec.major_arg1 === undefined) {
            throw new Error('Must define arg1 before arg2');
        }
        if (this.spec.major_op === true) {
            this.spec.major_op = (inp) => {
                return inp;
            };
        }
        if (this.spec.major_op instanceof Function) {
            this.hasInput = true;
            this.put = this.inputFunction.bind(this);
        }
    }
    inputFunction(inp, crumb) {
        let returned = new all_1.Junction().mode('single');
        let arg1 = this.targetCallF(this.spec.major_arg1, returned);
        let arg2 = this.targetCallF(this.spec.major_arg2, returned);
        let mycrumb = (crumb || new Debug.Crumb("Begin tracking"))
            .drop("Op Contact Put")
            .with(inp);
        let result;
        try {
            result = this.spec.major_op.call(this.spec.context, inp, arg1, arg2);
        }
        catch (e) {
            mycrumb.raise(e.message);
        }
        if (this.spec.major_return === 'resolve') {
            returned.merge(result, true);
        }
        else if (this.spec.major_return !== undefined) {
            let target = this.targetCallF(this.spec.major_return);
            if (target !== undefined) {
                let final = target(result, mycrumb);
                returned.merge(final, true);
            }
            else {
                returned.merge(undefined, true);
            }
        }
        return returned;
    }
    attachHook() {
        let troubles = [
            this.spec.hook_arg1, this.spec.hook_arg2
        ];
        if (troubles.indexOf('carry') > -1) {
            this.partner.hasOutput = true;
        }
        if (troubles.indexOf('reflex') > -1) {
            this.hasOutput = true;
        }
        if (this.spec.hook_op !== undefined && this.spec.hook_name !== undefined) {
            this.spec.context[this.spec.hook_name] = (inp) => {
                let arg1 = this.targetCallF(this.spec.hook_arg1);
                let arg2 = this.targetCallF(this.spec.hook_arg2);
                let result = this.spec.hook_op.call(this.spec.context, inp, arg1, arg2);
                return result;
            };
        }
    }
    targetCallF(target, junction) {
        if (target === 'carry') {
            return this.partner.emit;
        }
        else if (target === 'reflex') {
            return this.emit;
        }
        else if (target === 'resolve' && junction !== undefined) {
            return junction.hold()[0];
        }
    }
}
exports.Op = Op;
//# sourceMappingURL=op.js.map

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class BaseMedium {
    constructor(spec) {
        this.exclusive = false;
        this.multiA = true;
        this.multiB = true;
        this.reflex = true;
        this.matrix = { to: {}, from: {} };
        this.exposed = spec.exposed || {};
        this.symmetric = this.typeA === this.typeB;
        this.typeB = this.symmetric ? undefined : this.typeB;
    }
    suppose(supposedLink) {
        if (this.check(supposedLink)) {
            let { tokenA, tokenB, contactA, contactB } = supposedLink;
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
        return token in this.matrix.to || token in this.matrix.from;
    }
    hasLink(link) {
        if (link.tokenA in this.matrix.to && this.matrix.to[link.tokenA][link.tokenB] !== undefined) {
            return this.matrix.to[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA];
        }
    }
    hasClaim(link) {
        return this.exclusive && (link.tokenA in this.matrix.to || link.tokenB in this.matrix.from);
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
        return link.contactA instanceof this.typeA && link.contactB instanceof this.typeB
            &&
                (this.multiA || (this.matrix.to[link.tokenA] == undefined) || this.matrix.to[link.tokenA][link.tokenB] === undefined)
            &&
                (this.multiB || (this.matrix.from[link.tokenB] == undefined) || this.matrix.from[link.tokenB][link.tokenA] === undefined);
    }
    ;
    disconnect(link) {
        delete this.matrix.to[link.tokenA][link.tokenB];
        delete this.matrix.from[link.tokenB][link.tokenA];
    }
    ;
}
exports.BaseMedium = BaseMedium;
exports.mediaConstructors = {};
//# sourceMappingURL=medium.js.map

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const IO = __webpack_require__(4);
const CS = __webpack_require__(2);
class Cell extends CS.Composite {
    constructor(domain) {
        super(domain);
        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
        this.mesh = new IO.RuleMesh(this.lining);
    }
    applyHead(head = {}) {
        super.applyHead(head);
        if (head.forward) {
            this.forward = this.shell.createSection(head.forward);
        }
    }
    clearHead() {
    }
    attach(anchor, alias) {
        super.attach(anchor, alias);
        anchor.lining.addSubrane(this.shell, alias);
        if (this.forward) {
            anchor.shell.addSubrane(this.forward, alias);
        }
    }
    detach(anchor, alias) {
        super.detach(anchor, alias);
        anchor.lining.removeSubrane(alias);
        if (this.forward) {
            anchor.shell.removeSubrane(alias);
        }
    }
    scan(designator) {
        return this.shell.designate(designator);
    }
    seek(designator) {
        let all = this.scan(designator);
        return all[Object.keys(all)[0]];
    }
}
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const cell_1 = __webpack_require__(22);
class ObjectCell extends cell_1.Cell {
    applyHead(head = {}) {
        head.exposure = 'public';
        head.forward = '**:*';
        super.applyHead(head);
    }
}
exports.ObjectCell = ObjectCell;
//# sourceMappingURL=object.js.map

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const checks_1 = __webpack_require__(1);
const transforms_1 = __webpack_require__(12);
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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const Modes = __webpack_require__(41);
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
                this.error = this.cache.backERR(ticket, {
                    message: err,
                    key: ticket
                });
                if (this.error !== undefined) {
                }
                this.fried = true;
                if (this.fried && this.hasFuture()) {
                    this.proceedCatch(this.error);
                }
            })
        ];
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
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(28));
__export(__webpack_require__(10));
__export(__webpack_require__(11));
//# sourceMappingURL=all.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const f = __webpack_require__(11);
const op = __webpack_require__(10);
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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const medium_1 = __webpack_require__(21);
const all_1 = __webpack_require__(3);
const call_1 = __webpack_require__(6);
(function (DEMUXARG) {
    DEMUXARG[DEMUXARG["ONE"] = 0] = "ONE";
    DEMUXARG[DEMUXARG["SOME"] = 1] = "SOME";
    DEMUXARG[DEMUXARG["DONT"] = 2] = "DONT";
    DEMUXARG[DEMUXARG["ALL"] = 3] = "ALL";
})(exports.DEMUXARG || (exports.DEMUXARG = {}));
var DEMUXARG = exports.DEMUXARG;
(function (CALLTYPE) {
    CALLTYPE[CALLTYPE["DIRECT"] = 0] = "DIRECT";
    CALLTYPE[CALLTYPE["BREADTH_FIRST"] = 1] = "BREADTH_FIRST";
    CALLTYPE[CALLTYPE["DEPTH_FIRST"] = 2] = "DEPTH_FIRST";
    CALLTYPE[CALLTYPE["SERIAL"] = 3] = "SERIAL";
})(exports.CALLTYPE || (exports.CALLTYPE = {}));
var CALLTYPE = exports.CALLTYPE;
(function (MUXRESP) {
    MUXRESP[MUXRESP["RACE"] = 0] = "RACE";
    MUXRESP[MUXRESP["FIRST"] = 1] = "FIRST";
    MUXRESP[MUXRESP["LAST"] = 2] = "LAST";
    MUXRESP[MUXRESP["MAP"] = 3] = "MAP";
    MUXRESP[MUXRESP["ORDER"] = 4] = "ORDER";
    MUXRESP[MUXRESP["DROP"] = 5] = "DROP";
})(exports.MUXRESP || (exports.MUXRESP = {}));
var MUXRESP = exports.MUXRESP;
const JunctionModeKeys = {};
JunctionModeKeys[MUXRESP.RACE] = "race";
JunctionModeKeys[MUXRESP.FIRST] = "first";
JunctionModeKeys[MUXRESP.LAST] = "last";
JunctionModeKeys[MUXRESP.MAP] = "object";
JunctionModeKeys[MUXRESP.ORDER] = "array";
class MuxMedium extends medium_1.BaseMedium {
    constructor(muxspec) {
        super(muxspec);
        this.muxspec = muxspec;
        this.typeA = call_1.Call;
        this.typeB = call_1.Call;
        if (muxspec.emitCallType == CALLTYPE.DIRECT) {
            this.multiA = false;
            this.multiB = false;
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
        return arg;
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
        let allFromA = this.matrix.to[sourceToken];
        this.beginEmit();
        for (let sinkToken in allFromA) {
            let link = allFromA[sinkToken];
            let sink = link.contactB;
            let arg = this.emitArgProcess(data, crumb, sink, link);
            let putResp = sink.put(arg, crumb);
            this.emitResponse(putResp, crumb, link);
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
    inductA(token, a) {
        if (this.muxspec.emitCallType !== CALLTYPE.DIRECT) {
            a.emit = this.emitter.bind(this, token);
        }
    }
    inductB(token, b) {
    }
    connect(link) {
        if (this.muxspec.emitCallType == CALLTYPE.DIRECT) {
            link.contactA.emit = link.contactB.put;
        }
    }
    check(link) {
        let superok = super.check(link);
        let out = link.contactA.hasOutput;
        let inp = link.contactB.hasInput;
        return superok && out && inp;
    }
    disconnect(link) {
        super.disconnect(link);
        link.contactA.emit = undefined;
    }
}
exports.MuxMedium = MuxMedium;
//# sourceMappingURL=multiplexing.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const membrane_1 = __webpack_require__(8);
const designator_1 = __webpack_require__(9);
const matching_1 = __webpack_require__(40);
const law_1 = __webpack_require__(7);
class RuleMesh {
    constructor(membrane) {
        this.changeOccurred = membrane_1.DemuxWatchMethodsF(this);
        this.primary = membrane;
        this.primary.addWatch(this);
        this.rules = {};
        this.media = {};
        this.locations = {};
    }
    addMedium(key, medium) {
        this.rules[key] = [];
        this.media[key] = medium;
    }
    parseRules(ruleset, mediumkey) {
        for (let link of ruleset) {
            let irs = law_1.parseLawExpression(link, mediumkey);
            for (let law of irs) {
                this.addLaw(law);
            }
        }
    }
    addLaw(law) {
        this.addRule({
            designatorA: new designator_1.Designator('subranes', 'contacts', law.designatorA),
            designatorB: new designator_1.Designator('subranes', 'contacts', law.designatorB),
            closeA: false,
            closeB: false,
            matching: law.matching,
            backward: false,
            forward: true,
            propogation: 0
        }, law.medium, law.key);
        return {
            retract: () => {
                this.removeRule(law.medium, law.key);
            }
        };
    }
    addRule(rule, mediumkey, ruleID) {
        if (this.rules[mediumkey] === undefined) {
            throw new Error(`Unable to create rule ${mediumkey} is not a recognised media type`);
        }
        if (typeof rule === 'string') {
            let irs = law_1.parseLawExpression(rule, mediumkey);
            for (let law of irs) {
                if (ruleID !== undefined) {
                    law.key = ruleID;
                }
                this.addLaw(law);
            }
        }
        else if (typeof rule === 'object') {
            if (ruleID !== undefined) {
                this.rules[mediumkey][ruleID] = rule;
            }
            else {
                this.rules[mediumkey].push(rule);
            }
            let dA = rule.designatorA.tokenDesignate(this.primary);
            let dB = rule.designatorB.tokenDesignate(this.primary);
            this.balanceSquare(rule, dA, dB, mediumkey, false);
        }
    }
    removeRule(mediumID, ruleID) {
        let rule = this.rules[mediumID][ruleID];
        if (rule === undefined) {
            throw new Error(`The rule: '${ruleID}' being removed does not exist in medium '${mediumID}'`);
        }
        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
        this.balanceSquare(rule, dA, dB, mediumID, true);
    }
    balanceSquare(rule, dA, dB, mediumkey, destructive) {
        let op = destructive ? this.unsquare : this.square;
        if (rule.forward) {
            op.call(this, rule, dA, dB, mediumkey);
        }
        if (rule.backward) {
            op.call(this, rule, dB, dA, mediumkey);
        }
    }
    unsquare(rule, desigA, desigB, mediumkey) {
        let pairs = matching_1.pairByBinding(desigA, desigB, rule.matching);
        for (let pair of pairs) {
            let tokenA = pair.tokenA;
            let tokenB = pair.tokenB;
            let contactA = desigA[tokenA];
            let contactB = desigB[tokenB];
            let medium = this.media[mediumkey];
            let link = {
                tokenA: tokenA,
                tokenB: tokenB,
                contactA: contactA,
                contactB: contactB,
                bindings: pair.bindings
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
    square(rule, desigA, desigB, mediumkey) {
        let firstGlove = false;
        let pairs = matching_1.pairByBinding(desigA, desigB, rule.matching);
        for (let pair of pairs) {
            let tokenA = pair.tokenA;
            let tokenB = pair.tokenB;
            let contactA = desigA[tokenA];
            let contactB = desigB[tokenB];
            let medium = this.media[mediumkey];
            let link = {
                bindings: pair.bindings,
                tokenA: tokenA,
                tokenB: tokenB,
                contactA: contactA,
                contactB: contactB
            };
            for (let mk in this.media) {
                let claimer = this.media[mk];
                if (mk !== mediumkey && claimer.hasClaim(link)) {
                    throw new Error('Unable to suppose link when another medium has claimed the token');
                }
            }
            let supposeResult = medium.suppose(link);
            if (supposeResult) {
                this.locations[tokenA] = this.locations[tokenA] || {};
                this.locations[tokenB] = this.locations[tokenB] || {};
                this.locations[tokenA][mediumkey] = medium;
                this.locations[tokenB][mediumkey] = medium;
            }
        }
    }
    onAddContact(contact, token) {
        for (let mediumkey in this.media) {
            let medium = this.media[mediumkey];
            let linkRuleKeys = this.rules[mediumkey];
            for (let rulekey in linkRuleKeys) {
                let rule = this.rules[mediumkey][rulekey];
                let matchA = rule.designatorA.matches(token);
                let matchB = rule.designatorB.matches(token);
                if (matchA) {
                    let dB = rule.designatorB.tokenDesignate(this.primary);
                    let dA = {};
                    dA[token] = contact;
                    this.balanceSquare(rule, dA, dB, mediumkey, false);
                }
                if (matchB) {
                    let dA = rule.designatorA.tokenDesignate(this.primary);
                    let dB = {};
                    dB[token] = contact;
                    this.balanceSquare(rule, dA, dB, mediumkey, false);
                }
            }
        }
    }
    onRemoveContact(contact, token) {
        for (let loc in this.locations[token]) {
            let location = this.locations[token][loc];
            if (contact instanceof location.typeA) {
                location.breakA(token, contact);
            }
            if (contact instanceof location.typeB) {
                location.breakB(token, contact);
            }
        }
    }
    onAddMembrane(membrane, token) {
    }
    onRemoveMembrane(membrane, token) {
    }
    hasLinked(tokenA, tokenB, directed = true) {
        let mediaWithA = this.locations[tokenA];
        for (let mediakey in mediaWithA) {
            let medium = this.media[mediakey];
            let aToMap = medium.matrix.to[tokenA];
            let bFromMap = medium.matrix.from[tokenB];
            let aToB = aToMap !== undefined && aToMap[tokenB] !== undefined;
            let bFromA = bFromMap !== undefined && bFromMap[tokenA] !== undefined;
            if (directed && (aToB && bFromA)) {
                return true;
            }
            else if (!directed && (aToB || bFromA)) {
                return true;
            }
        }
        return false;
    }
}
exports.RuleMesh = RuleMesh;
//# sourceMappingURL=ruleMesh.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const domain_1 = __webpack_require__(14);
const Util = __webpack_require__(3);
const IO = __webpack_require__(4);
const TRT = __webpack_require__(5);
__export(__webpack_require__(3));
__export(__webpack_require__(4));
__export(__webpack_require__(2));
__export(__webpack_require__(5));
function j(basis, patch) {
    if (typeof basis === 'string' || domain_1.isConstruct(basis)) {
        if (patch === undefined) {
            return { basis: basis };
        }
        else if (Util.isVanillaObject(patch)) {
            let head = patch.head || {};
            if (patch.heart)
                head.heart = patch.heart;
            let domain = patch.domain;
            delete patch.head;
            delete patch.heart;
            delete patch.domain;
            return {
                domain: domain,
                basis: basis,
                head: head,
                body: patch
            };
        }
        else if (Util.isVanillaArray(patch)) {
            return {
                basis: basis,
                anon: patch
            };
        }
        else {
            return {
                basis: basis,
                body: patch
            };
        }
    }
    else if (Util.isVanillaObject(basis)) {
        return {
            basis: 'object',
            head: basis.head,
            body: basis
        };
    }
    else if (Util.isVanillaArray(basis)) {
        return {
            basis: 'array',
            anon: basis
        };
    }
    else if (Util.isPrimative(basis)) {
        return {
            basis: typeof basis,
            body: basis
        };
    }
    else {
        return {
            basis: 'strange',
            body: basis
        };
    }
}
exports.j = j;
exports.J = new domain_1.Domain();
exports.J.sub('agent')
    .define('context', TRT.ContextAgent)
    .define('contact', TRT.ContactAgent)
    .define('membrane', TRT.SubraneAgent)
    .up()
    .sub('media')
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
    .up()
    .define('cell', TRT.Cell)
    .define('object', TRT.ObjectCell)
    .define('array', TRT.ArrayCell)
    .define('law', TRT.LawConstruct)
    .define('op', TRT.StandardOp)
    .define('outward', j('op', {
    carry_out: true
}))
    .define('inward', j('op', {
    carry_in: true
}));
//# sourceMappingURL=jungle.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const construct_1 = __webpack_require__(0);
const op_1 = __webpack_require__(20);
class OpConstruct extends construct_1.Construct {
    init(spec) {
        super.init(spec);
    }
    attach(host, key) {
        super.attach(host, key);
        this.spec = this.nucleus;
        this.nucleus = this.spec.default;
        let op = new op_1.Op({
            context: this.local,
            major_op: this.spec.major_op,
            major_arg1: this.spec.major_arg1,
            major_arg2: this.spec.major_arg2,
            major_return: this.spec.major_return,
            minor_op: this.spec.minor_op,
            minor_arg1: this.spec.minor_arg1,
            minor_arg2: this.spec.minor_arg2,
            minor_return: this.spec.minor_return,
            hook_op: this.spec.hook_op,
            hook_arg1: this.spec.hook_arg1,
            hook_arg2: this.spec.hook_arg2,
            hook_name: key,
        });
        host.lining.addContact(op, key);
    }
    detach(host, key) {
        host.lining.removeContact(key);
    }
    extract() {
        this.spec.default = this.nucleus;
        return this.spec;
    }
}
exports.OpConstruct = OpConstruct;
const mutexes = [['resolve_out', 'carry_out', 'reflex_out'], ['resolve_in', 'carry_in', 'reflex_in']];
const fnameToReturnTarget = {
    'resolve_out': 'resolve',
    'resolve_in': 'resolve',
    'carry_out': 'carry',
    'carry_in': 'carry',
    'reflex_out': 'reflex',
    'reflex_in': 'reflex',
};
class StandardOp extends OpConstruct {
    init(spec) {
        let body = spec.body;
        let chosen = [];
        for (let i = 0; i < mutexes.length; i++) {
            let m = mutexes[i];
            for (let n of m) {
                if (n in body) {
                    if (!chosen[i]) {
                        chosen[i] = n;
                    }
                    else {
                        throw new Error("Cannot specify mulitiple call sources for each side");
                    }
                }
            }
        }
        super.init({
            basis: spec.basis,
            head: spec.head,
            body: {
                default: body.default,
                major_op: body[chosen[0]],
                major_arg1: body.arg1,
                major_arg2: body.arg2,
                major_return: fnameToReturnTarget[chosen[0]],
                minor_op: body[chosen[1]],
                minor_arg1: body.arg1,
                minor_arg2: body.arg2,
                minor_return: fnameToReturnTarget[chosen[1]]
            },
            origins: spec.origins
        });
    }
    attach(host, key) {
        super.attach(host, key);
    }
}
exports.StandardOp = StandardOp;
class Drain extends OpConstruct {
    init(desc) {
        let spec = desc.body;
        spec.open_in = spec.open_in === undefined ? true : spec.open_in;
        spec.open_out = spec.open_out === undefined ? true : spec.open_out;
        super.init({
            basis: desc.basis,
            head: desc.head,
            body: {
                major_op: spec.open_out ? spec.drain : undefined,
                major_return: 'resolve',
                minor_op: spec.open_in ? spec.drain : undefined,
                minor_return: 'resolve'
            },
            origins: desc.origins
        });
    }
}
exports.Drain = Drain;
class Spring extends OpConstruct {
    init(desc) {
        let spec = desc.body;
        let springF = function (data, carry, reflex) {
            if (spec.open_in) {
                carry(data);
            }
            if (spec.open_out) {
                reflex(data);
            }
        };
        super.init({
            basis: desc.basis,
            head: desc.head,
            body: {
                hook_op: springF,
                hook_arg1: 'carry',
                hook_arg2: 'reflex'
            },
            origins: desc.origins
        });
    }
}
exports.Spring = Spring;
//# sourceMappingURL=contact.js.map

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const construct_1 = __webpack_require__(0);
const law_1 = __webpack_require__(7);
class LawConstruct extends construct_1.Construct {
    attach(anchor, label) {
        super.attach(anchor, label);
        this.handles = [];
        let lawIRS = law_1.parseLawExpression(this.nucleus);
        for (let i = 0; i < lawIRS.length; i++) {
            let law = lawIRS[i];
            law.key = label + i;
            this.handles.push(anchor.mesh.addLaw(law));
        }
    }
    detach(anchor, label) {
        for (let handle of this.handles) {
            handle.retract();
        }
    }
}
exports.LawConstruct = LawConstruct;
//# sourceMappingURL=law.js.map

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const construct_1 = __webpack_require__(0);
const transforms_1 = __webpack_require__(12);
const law_1 = __webpack_require__(7);
class MediumConstruct extends construct_1.Construct {
    attach(anchor, label) {
        super.attach(anchor, label);
        this.lawhandles = [];
        let medium = this.head.medium;
        let args = this.nucleus;
        let _medium = new medium(args);
        let mhandle = anchor.mesh.addMedium(label, _medium);
        this.handleMedium(mhandle);
        for (let lawexp of transforms_1.ensureArray(this.nucleus.law)) {
            let laws = law_1.parseLawExpression(lawexp, label);
            for (let law of laws) {
                let handle = anchor.mesh.addLaw(law);
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
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __webpack_require__(2);
const integrator_1 = __webpack_require__(19);
class ContactAgent extends all_1.Construct {
    init(spec) {
        super.init(spec);
    }
    applyHead(head) {
        super.applyHead(head);
        this.presence = head.presence || 'none';
    }
    patch(spec) {
        if (this.host !== undefined) {
            let host = this.host, alias = this.alias;
            this.detach(this.host, this.alias);
            this.spec = spec;
            this.attach(host, alias);
        }
    }
    extract() {
        return this.spec;
    }
    attach(host, key) {
        super.attach(host, key);
        this.agency = {
            config: this.spec,
            patch: null,
            notify: null,
            extract: null,
            fetch: null
        };
        const contact = () => (new integrator_1.Integrator({
            target: this.agency,
            integrator(target, on, emit) {
                on.extract = (voidspace) => {
                    if (target.fetch instanceof Function) {
                        return target.fetch(voidspace);
                    }
                };
                on.patch = (voidspace) => {
                    if (target.notify instanceof Function) {
                        return target.notify(voidspace);
                    }
                };
                target.patch = emit('patch');
                target.extract = emit('patch');
            }
        }));
        if (this.presence == 'lining') {
            host.lining.addContact(contact(), key);
            console.log('added to lining');
        }
        if (this.presence == 'shell') {
            host.shell.addContact(contact(), key);
            console.log('added to shell');
        }
        host.pool.add(this.agency, key);
    }
    detach(host, key) {
        super.detach(host, key);
        host.lining.removeContact(key);
        host.pool.remove(key);
    }
}
exports.ContactAgent = ContactAgent;
//# sourceMappingURL=contactMeta.js.map

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __webpack_require__(2);
class ContextAgent extends all_1.Construct {
    init(spec) {
        super.init(spec);
        this.spec = spec;
    }
    extract() {
        return this.spec;
    }
    attach(host, key) {
        super.attach(host, key);
        this.nucleus = {
            patch: (patch) => {
                if (this.agency.notify instanceof Function) {
                    return this.agency.notify(patch);
                }
            },
            notify: null,
            extract: (voidspace) => {
                if (this.agency.fetch instanceof Function) {
                    return this.agency.fetch(voidspace);
                }
            },
            fetch: null
        };
        this.agency = {
            config: this.spec,
            patch: (patch) => {
                if (this.nucleus.notify instanceof Function) {
                    return this.nucleus.notify(patch);
                }
            },
            notify: null,
            extract: (voidspace) => {
                if (this.nucleus.fetch instanceof Function) {
                    return this.nucleus.fetch(voidspace);
                }
            },
            fetch: null
        };
        host.pool.add(this.agency, key);
    }
    detach(host, key) {
        super.detach(host, key);
        host.pool.remove(key);
    }
}
exports.ContextAgent = ContextAgent;
//# sourceMappingURL=contextMeta.js.map

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __webpack_require__(2);
const integrator_1 = __webpack_require__(19);
const membrane_1 = __webpack_require__(8);
class SubraneAgent extends all_1.Construct {
    applyHead(head) {
        super.applyHead(head);
        this.presence = head.presence || 'none';
    }
    patch(spec) {
        if (this.host !== undefined) {
            let host = this.host, alias = this.alias;
            this.detach(this.host, this.alias);
            this.spec = spec;
            this.attach(host, alias);
        }
    }
    extract() {
        return this.spec;
    }
    attach(host, key) {
        super.attach(host, key);
        this.agency = {
            config: this.spec,
            patch: null,
            notify: null,
            extract: null,
            fetch: null
        };
        let integrator = (push) => (new integrator_1.Integrator({
            target: this.agency,
            integrator(target, on, emit) {
                let op = push ? 'notify' : 'fetch';
                on.any = (voidspace) => {
                    if (target[op] instanceof Function) {
                        return target[op](voidspace);
                    }
                };
                target[push ? 'patch' : 'extract'] = emit();
            }
        }));
        let subrane = new membrane_1.Membrane();
        subrane.addContact(integrator(false), 'pull');
        subrane.addContact(integrator(true), 'push');
        if (this.presence === 'shell') {
            host.shell.addSubrane(subrane, key);
        }
        else if (this.presence === 'lining') {
            host.lining.addSubrane(subrane, key);
        }
        host.pool.add(this.agency, key);
    }
    detach(host, key) {
        super.detach(host, key);
        host.lining.removeContact(key);
        host.pool.remove(key);
    }
}
exports.SubraneAgent = SubraneAgent;
//# sourceMappingURL=subraneMeta.js.map

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const object_1 = __webpack_require__(23);
class ArrayCell extends object_1.ObjectCell {
    constructor(domain) {
        super(domain);
        this.nucleus = [];
    }
}
exports.ArrayCell = ArrayCell;
//# sourceMappingURL=array.js.map

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const typesplit_1 = __webpack_require__(13);
const checks_1 = __webpack_require__(1);
const math_1 = __webpack_require__(26);
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

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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
//# sourceMappingURL=matching.js.map

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

/***/ })
/******/ ]);