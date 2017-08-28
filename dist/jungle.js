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

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(32));
__export(__webpack_require__(2));
const debug = __webpack_require__(20);
exports.Debug = debug;
__export(__webpack_require__(21));
__export(__webpack_require__(22));
__export(__webpack_require__(23));
__export(__webpack_require__(35));
//# sourceMappingURL=all.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Util = __webpack_require__(0);
const state_1 = __webpack_require__(14);
class Construct {
    constructor(domain = Construct.DefaultDomain) {
        this.domain = domain;
        this.isComposite = false;
    }
    init(patch) {
        let ensured = this.ensureObject(patch);
        this.applyForm(ensured.form);
        this.patch(ensured);
        let primeResult = this.primeTractor ? this.primeTractor.call(this.local) : undefined;
        return primeResult;
    }
    dispose() {
        if (this.disposeTractor) {
            this.disposeTractor.call(this.local);
        }
        this.clearForm();
    }
    applyForm(form = {}) {
        this.exposure = form.exposure || 'local';
        this.reach = form.reach || 'host';
        this.remote = form.remote || false;
        this.primeTractor = form.prime;
        this.disposeTractor = form.dispose;
    }
    clearForm() {
        this.primeTractor = undefined;
        this.disposeTractor = undefined;
    }
    attach(host, alias) {
        this.host = host;
        this.alias = alias;
        this.fetch = (extractor) => {
            let qualified = {};
            qualified[alias] = extractor;
            return host.bed.fetch(qualified);
        };
        this.notify = (patch) => {
            let qualified = {};
            qualified[alias] = patch;
            return host.bed.notify(qualified);
        };
        if (!this.isComposite) {
            let acc = new state_1.AccessoryState(this, alias, {
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
    }
    detach(host, alias) {
        this.host = undefined;
        this.alias = undefined;
    }
    patch(patch) {
        this.nucleus = patch;
    }
    extract(sucker) {
        return this.nucleus;
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
}
exports.Construct = Construct;
//# sourceMappingURL=construct.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(11);
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(24));
__export(__webpack_require__(1));
__export(__webpack_require__(12));
__export(__webpack_require__(13));
//# sourceMappingURL=all.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(17));
__export(__webpack_require__(27));
__export(__webpack_require__(16));
__export(__webpack_require__(26));
__export(__webpack_require__(15));
__export(__webpack_require__(7));
//# sourceMappingURL=all.js.map

/***/ }),
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(18));
__export(__webpack_require__(19));
__export(__webpack_require__(29));
__export(__webpack_require__(31));
__export(__webpack_require__(30));
//# sourceMappingURL=all.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(15);
const Debug = __webpack_require__(20);
const all_1 = __webpack_require__(0);
class Op extends base_1.BasicContact {
    constructor(spec) {
        super();
        this.spec = spec;
        this.symmetric = true;
        this.invertable = true;
        this.hasInput = false;
        this.hasOutput = false;
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
}
exports.Op = Op;
//# sourceMappingURL=op.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const hierarchical_1 = __webpack_require__(9);
const operations_1 = __webpack_require__(5);
const f = __webpack_require__(10);
exports.DSetExp = "(?:\\*|\\{\\w+(?:\,\\w+)*\\})?";
exports.DSymBindingExp = `(?:\\w+#${exports.DSetExp})`;
exports.DSymBindingParse = `(?:(\\w+)#(${exports.DSetExp}))`;
exports.DTermExp = `(?:\\w+|\\*|${exports.DSymBindingExp})`;
exports.DGroupExp = `(?:\\w+|\\*{1,2}|${exports.DSymBindingExp})`;
exports.DTotalExp = new RegExp(`^(${exports.DGroupExp}(?:\\.${exports.DGroupExp})*)?\\:(${exports.DTermExp})$`);
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const f = __webpack_require__(10);
const op = __webpack_require__(5);
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
/* 10 */
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(2);
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const hierarchical_1 = __webpack_require__(9);
const designator_1 = __webpack_require__(8);
const construct_1 = __webpack_require__(1);
class Domain {
    constructor(init = {}, isolated = false) {
        this.isolated = isolated;
        this.registry = {};
        this.subdomain = {};
        this.exposed = {
            register: (key, basis, patch) => {
                this.register(key, basis, patch);
            }
        };
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
                throw new Error(`Unable to locate the basis '${basis}' is not registered to the Domain`);
            }
            else {
                return this.parent.locateBasis(basis);
            }
        }
        else if (nresult === 1) {
            return result[Object.keys(result)[0]];
        }
        else {
            throw new Error(`Must designate exactly one basis object`);
        }
    }
    recover(spec) {
        let { nature, patch } = this.locateBasis(spec.basis);
        if (nature === undefined || patch === undefined) {
            throw new Error(`basis: ${spec.basis}, not a constructor in registry`);
        }
        let recovered;
        if (nature.prototype instanceof construct_1.Construct || nature === construct_1.Construct) {
            let domain = this.defaultDomain(spec.domain);
            recovered = new nature(domain);
            let tertiarySpec = this.melder(patch, spec);
            recovered.init(tertiarySpec);
        }
        else {
            let tertiarySpec = this.melder(patch, spec);
            recovered = new nature(tertiarySpec);
        }
        return recovered;
    }
    defaultDomain(targetDomain) {
        let givenDomain = this;
        if (targetDomain !== undefined) {
            if (typeof targetDomain === 'string') {
                givenDomain = construct_1.Construct.DefaultDomain.locateDomain(targetDomain);
            }
            else if (targetDomain instanceof Domain) {
                givenDomain = targetDomain;
            }
        }
        return givenDomain;
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const junction_1 = __webpack_require__(21);
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
            let qualified = {};
            qualified[this.home.alias] = patch;
            return this.home.notify(patch);
        }
    }
    extract(voidspace) {
        if (this.home.fetch instanceof Function) {
            let qualified = {};
            qualified[this.home.alias] = voidspace;
            return this.home.fetch(qualified);
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class AccessoryState {
    constructor(home, accessoryKey, spec) {
        this.home = home;
        this.accessoryKey = accessoryKey;
        let scope = home.host.local;
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
                            if (!exposing.isComposite) {
                                this.setAccessory(exposing, prop, value);
                            }
                            else {
                                this.setSubCell(exposing, prop, value);
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
                            if (exposing.isComposite) {
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
/* 15 */
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const designator_1 = __webpack_require__(8);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IO = __webpack_require__(4);
const CS = __webpack_require__(3);
const operations_1 = __webpack_require__(5);
class Cell extends CS.Composite {
    constructor(domain) {
        super(domain);
        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
    }
    applyForm(form = {}) {
        super.applyForm(form);
        if (form.forward) {
            this.forward = this.shell.createSection(form.forward);
        }
        this.mesh = new IO.RuleMesh(this.lining);
        if (form.media instanceof Array) {
            for (let mediumBasis of form.media || []) {
                this.mesh.addMedium(mediumBasis, this.domain.recover({
                    basis: 'media:' + mediumBasis,
                    label: mediumBasis,
                    exposed: this.local
                }));
            }
        }
        else if (form.media instanceof Object) {
            for (let mediumBasis in form.media) {
                this.mesh.addMedium(mediumBasis, this.domain.recover(operations_1.meld((a, b) => { return b; })({
                    basis: 'media:' + mediumBasis,
                    label: mediumBasis,
                    exposed: this.local
                }, form.media[mediumBasis])));
            }
        }
        for (let lawmedium in form.laws || {}) {
            for (let law of form.laws[lawmedium]) {
                this.mesh.addRule(law, lawmedium);
            }
        }
    }
    clearForm() {
    }
    attach(anchor, alias) {
        super.attach(anchor, alias);
        this.host.lining.addSubrane(this.shell, alias);
        if (this.forward) {
            this.host.shell.addSubrane(this.forward, alias);
        }
    }
    detach(anchor, alias) {
        super.detach(anchor, alias);
        anchor.lining.removeSubrane(alias);
        if (this.forward) {
            anchor.shell.removeSubrane(alias);
        }
    }
}
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const cell_1 = __webpack_require__(18);
class DefaultCell extends cell_1.Cell {
    applyForm(form = {}) {
        form.exposure = 'public';
        form.forward = '**:*';
        super.applyForm(form);
    }
}
exports.DefaultCell = DefaultCell;
//# sourceMappingURL=default.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(2);
const transforms_1 = __webpack_require__(23);
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
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Modes = __webpack_require__(34);
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
/* 22 */
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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(2);
const typesplit_1 = __webpack_require__(11);
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
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(1);
const all_1 = __webpack_require__(0);
const state_1 = __webpack_require__(14);
const agency_1 = __webpack_require__(13);
class Composite extends construct_1.Construct {
    constructor(domain) {
        super(domain);
        this.isComposite = true;
        this.subconstructs = [];
        this.nucleus = {};
    }
    init(patch) {
        super.init(patch);
        this.addStrange('domain', this.domain.getExposure());
        this.addStrange('meta', this.getExposure());
        if (this.beginTractor) {
            this.beginTractor.call(this.local);
        }
    }
    applyForm(form = {}) {
        super.applyForm(form);
        this.state = new state_1.HostState(this, form.state);
        this.exposed = this.state.exposed;
        this.local = this.state.local;
        this.beginTractor = form.begin;
        this.endTractor = form.end;
        this.bed = new agency_1.BedAgent(this, form.bed);
        this.anchor = new agency_1.AnchorAgent(this, form.anchor);
        this.pool = new agency_1.AgentPool(form.pool);
        this.pool.add(this.bed, 'bed');
        this.pool.add(this.anchor, 'anchor');
    }
    clearForm() {
        this.beginTractor = undefined;
        this.endTractor = undefined;
        super.clearForm();
    }
    _patch(patch) {
        for (let k in patch) {
            if (!(k in Composite.keywords)) {
                let v = patch[k];
                this.patchChild(k, v);
            }
        }
        if (patch.anon !== undefined) {
            for (let i = 0; i < patch.anon.length; i++) {
                this.add(patch.anon[i]);
            }
        }
    }
    patch(patch) {
        return this.anchor.notify(patch);
    }
    reset(patch) {
        this.dispose();
        this.init(patch);
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
    add(val, key) {
        let k = key === undefined ? this.subconstructs.length++ : key;
        if (this.nucleus instanceof Array) {
            this.nucleus.length = this.subconstructs.length;
        }
        if (all_1.isPrimative(val)) {
            this.addPrimative(k, val);
        }
        else if (all_1.isVanillaObject(val)) {
            val.basis = val.basis || 'object';
            let recovered = this.domain.recover(val);
            this.attachChild(recovered, k);
        }
        else if (all_1.isVanillaArray(val)) {
            let patch = {
                basis: 'array',
                anon: val
            };
            let recovered = this.domain.recover(patch);
            this.attachChild(recovered, k);
        }
        else {
            this.addStrange(k, val);
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
    dispose() {
        if (this.endTractor) {
            this.endTractor.call(this.state.local);
        }
        for (let key in this.subconstructs) {
            let construct = this.subconstructs[key];
            construct.dispose();
            this.detachChild(key);
        }
        this.clearForm();
        super.dispose();
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
            if (voidspace === null || key in voidspace) {
                let construct = this.subconstructs[key];
                extracted[key] = construct.extract(voidspace === null ? null : voidspace[key]);
            }
        }
        for (let key in this.nucleus) {
            if (voidspace === null || (key in voidspace && voidspace[key] === null)) {
                extracted[key] = this.nucleus[key];
            }
        }
        return extracted;
    }
    extract(suction) {
        return this.anchor.fetch(suction);
    }
}
Composite.keywords = { basis: null, domain: null, form: null, anon: null };
exports.Composite = Composite;
//# sourceMappingURL=composite.js.map

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(16);
const all_1 = __webpack_require__(0);
const op_1 = __webpack_require__(7);
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
class MuxMedium extends medium_1.BaseMedium {
    constructor(muxspec) {
        super(muxspec);
        this.muxspec = muxspec;
        this.typeA = op_1.Op;
        this.typeB = op_1.Op;
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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(25);
const membrane_1 = __webpack_require__(17);
const designator_1 = __webpack_require__(8);
const matching_1 = __webpack_require__(33);
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
            let linkIR = this.parseLink(link);
            this.addRule(linkIR, mediumkey);
        }
    }
    parseLink(link) {
        let m = link.match(/^([\w\*\:\.#]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.#]+)/);
        if (!m) {
            throw new Error(`Unable to parse link description, expression ${link} did not match regex`);
        }
        ;
        let [match, srcDesig, srcClose, backward, filter, matching, forward, snkClose, snkDesig] = m;
        let ruleIR = {
            designatorA: new designator_1.Designator('subranes', 'contacts', srcDesig),
            designatorB: new designator_1.Designator('subranes', 'contacts', snkDesig),
            closeA: srcClose === '|',
            closeB: snkClose === '|',
            forward: forward === '>',
            backward: backward === '<',
            matching: matching === "=",
            propogation: filter !== '' ? { '+': I.LINK_FILTERS.PROCEED, '-': I.LINK_FILTERS.DECEED, '!': I.LINK_FILTERS.ELSEWHERE }[filter] : I.LINK_FILTERS.NONE
        };
        return ruleIR;
    }
    addRule(rule, mediumkey, ruleID) {
        if (this.rules[mediumkey] === undefined) {
            throw new Error(`Unable to create rule ${mediumkey} is not a recognised media type`);
        }
        if (typeof rule === 'string') {
            this.addRule(this.parseLink(rule), mediumkey, ruleID);
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
            throw new Error(`The rule: ${rule} being removed does not exist in medium ${mediumID}`);
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
            let linkRules = this.rules[mediumkey];
            for (let ruleID in linkRules) {
                let rule = linkRules[ruleID];
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
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = __webpack_require__(12);
const _Util = __webpack_require__(0);
const _IO = __webpack_require__(4);
const _TRT = __webpack_require__(6);
const _CST = __webpack_require__(3);
exports.Util = _Util;
exports.IO = _IO;
exports.TRT = _TRT;
exports.CST = _CST;
__export(__webpack_require__(0));
__export(__webpack_require__(4));
__export(__webpack_require__(3));
__export(__webpack_require__(6));
exports.Core = new domain_1.Domain({
    media: new domain_1.Domain({
        direct: {
            nature: _IO.MuxMedium,
            patch: {
                symbols: [],
                emitArgType: _IO.DEMUXARG.ONE,
                emitRetType: _IO.MUXRESP.LAST,
                emitCallType: _IO.CALLTYPE.DIRECT
            }
        },
        smear: {
            nature: _IO.MuxMedium,
            patch: {
                symbols: [],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.LAST,
                emitCallType: _IO.CALLTYPE.BREADTH_FIRST
            }
        },
        split: {
            nature: _IO.MuxMedium,
            patch: {
                symbols: [],
                emitArgType: _IO.DEMUXARG.SOME,
                emitRetType: _IO.MUXRESP.MAP,
                emitCallType: _IO.CALLTYPE.BREADTH_FIRST
            }
        },
        compose: {
            nature: _IO.MuxMedium,
            patch: {
                symbols: [],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.MAP,
                emitCallType: _IO.CALLTYPE.BREADTH_FIRST
            }
        },
        race: {
            nature: _IO.MuxMedium,
            patch: {
                symbols: [],
                emitArgType: _IO.DEMUXARG.DONT,
                emitRetType: _IO.MUXRESP.RACE,
                emitCallType: _IO.CALLTYPE.BREADTH_FIRST
            }
        }
    }),
    cell: exports.TRT.Cell,
    object: exports.TRT.DefaultCell,
    array: exports.TRT.ArrayCell,
    link: exports.TRT.Connector,
    contact: new domain_1.Domain({
        op: exports.TRT.StandardOp,
        outof: {
            nature: exports.TRT.StandardOp,
            patch: {
                carry_out: true
            }
        },
        into: {
            nature: exports.TRT.StandardOp,
            patch: {
                carry_in: true
            }
        }
    })
});
exports.CST.Construct.DefaultDomain = exports.Core;
//# sourceMappingURL=jungle.js.map

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const default_1 = __webpack_require__(19);
class ArrayCell extends default_1.DefaultCell {
    constructor(domain) {
        super(domain);
        this.nucleus = [];
    }
}
exports.ArrayCell = ArrayCell;
//# sourceMappingURL=array.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(1);
const op_1 = __webpack_require__(7);
class OpConstruct extends construct_1.Construct {
    init(spec) {
        super.init(spec);
    }
    attach(host, key) {
        super.attach(host, key);
        let op = new op_1.Op({
            context: this.local,
            major_op: this.nucleus.major_op,
            major_arg1: this.nucleus.major_arg1,
            major_arg2: this.nucleus.major_arg2,
            major_return: this.nucleus.major_return,
            minor_op: this.nucleus.minor_op,
            minor_arg1: this.nucleus.minor_arg1,
            minor_arg2: this.nucleus.minor_arg2,
            minor_return: this.nucleus.minor_return,
            hook_op: this.nucleus.hook_op,
            hook_arg1: this.nucleus.hook_arg1,
            hook_arg2: this.nucleus.hook_arg2,
            hook_name: key,
        });
        this.spec = this.nucleus;
        this.nucleus = this.nucleus.default;
        host.lining.addContact(op, key);
    }
    detach(host, key) {
        host.lining.removeContact(key);
    }
    extract() {
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
        let chosen = [];
        for (let i = 0; i < mutexes.length; i++) {
            let m = mutexes[i];
            for (let n of m) {
                if (n in spec) {
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
            form: spec.form,
            default: spec.default,
            major_op: spec[chosen[0]],
            major_arg1: spec.arg1,
            major_arg2: spec.arg2,
            major_return: fnameToReturnTarget[chosen[0]],
            minor_op: spec[chosen[1]],
            minor_arg1: spec.arg1,
            minor_arg2: spec.arg2,
            minor_return: fnameToReturnTarget[chosen[1]],
        });
    }
    attach(host, key) {
        super.attach(host, key);
    }
}
exports.StandardOp = StandardOp;
class Drain extends OpConstruct {
    init(spec) {
        spec.open_in = spec.open_in === undefined ? true : spec.open_in;
        spec.open_out = spec.open_out === undefined ? true : spec.open_out;
        super.init({
            form: spec.form,
            major_op: spec.open_out ? spec.drain : undefined,
            major_return: 'resolve',
            minor_op: spec.open_in ? spec.drain : undefined,
            minor_return: 'resolve',
        });
    }
}
exports.Drain = Drain;
class Spring extends OpConstruct {
    init(spec) {
        let springF = function (data, carry, reflex) {
            if (spec.open_in) {
                carry(data);
            }
            if (spec.open_out) {
                reflex(data);
            }
        };
        super.init({
            form: spec.form,
            hook_op: springF,
            hook_arg1: 'carry',
            hook_arg2: 'reflex'
        });
    }
}
exports.Spring = Spring;
//# sourceMappingURL=OpAccessory.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const construct_1 = __webpack_require__(1);
class Connector extends construct_1.Construct {
    attach(anchor, label) {
        super.attach(anchor, label);
        if (!(this.nucleus.medium in anchor.mesh.media)) {
            anchor.mesh.addMedium(this.nucleus.medium, this.domain.recover({
                basis: 'media:' + this.nucleus.medium,
                label: this.nucleus.medium,
                exposed: this.nucleus
            }));
        }
        anchor.mesh.addRule(this.nucleus.rule, this.nucleus.medium, label);
    }
    detach(anchor, label) {
        anchor.mesh.removeRule(this.nucleus.medium, label);
    }
}
exports.Connector = Connector;
//# sourceMappingURL=connector.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(11);
const checks_1 = __webpack_require__(2);
const math_1 = __webpack_require__(22);
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
/* 33 */
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
//# sourceMappingURL=matching.js.map

/***/ }),
/* 34 */
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
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(9));
__export(__webpack_require__(5));
__export(__webpack_require__(10));
//# sourceMappingURL=all.js.map

/***/ })
/******/ ]);