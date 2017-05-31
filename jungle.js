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
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(3);
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BaseMedium {
    constructor(spec) {
        this.exclusive = false;
        this.multiA = true;
        this.multiB = true;
        this.matrix = { to: {}, from: {}, sym: {} };
        this.label = spec.label;
        this.exposed = spec.exposed || {};
    }
    suppose(supposedLink) {
        let { tokenA, tokenB, roleA, roleB } = supposedLink;
        if (this.check(supposedLink)) {
            if (this.matrix.to[tokenA] === undefined) {
                this.matrix.to[tokenA] = {};
                this.inductA(tokenA, roleA);
            }
            if (this.matrix.from[tokenB] === undefined) {
                this.matrix.from[tokenB] = {};
                this.inductB(tokenB, roleB);
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
                (this.multiB || (this.matrix.from[link.tokenB] == undefined) || this.matrix.from[link.tokenB][link.tokenA] === undefined);
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const crux_1 = __webpack_require__(4);
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
function parseDesignatorString(desigstr, targetRole) {
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, crux] = colonSplit;
    }
    let subranedesig = chain ? chain.split(/\./) : [];
    subranedesig = subranedesig.map((value, index) => {
        return regexifyDesignationTerm(value);
    });
    return {
        role: targetRole,
        mDesignators: subranedesig,
        cDesignator: regexifyDesignationTerm(crux)
    };
}
exports.parseDesignatorString = parseDesignatorString;
function designatorToRegex(desigstr, role) {
    let colonSplit = desigstr.match(/^((?:(?:\w+|\*{1,2})(?:\.(?:\w+|\*{1,2}))*))?\:(\w+|\*|\$)$/);
    if (colonSplit === null) {
    }
    else {
        var [total, chain, crux] = colonSplit;
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
    regex += `:${crux == '*' ? '(\\w+)' : crux}/${role}$`;
    return new RegExp(regex);
}
exports.designatorToRegex = designatorToRegex;
function tokenDesignatedBy(token, designator) {
    console.log("token: ", token);
    let [match, allSubs, crux, role] = token.match(/^((?:(?:\w+)(?:\.(?:\w+))*))?\:(\w+)\/(\w+)$/);
    console.log("match: ", match);
    let splitSubs = allSubs ? allSubs.split(/\./) : [];
    for (let i = 0; i < splitSubs.length; i++) {
        if (!matchDesignationTerm(splitSubs[i], designator.mDesignators[i])) {
            return false;
        }
    }
    if (!matchDesignationTerm(crux, designator.cDesignator)) {
        return false;
    }
    return role === designator.role;
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
    treeDesignate({ mDesignators, cDesignator, role }) {
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
                        cDesignator: cDesignator,
                        role: role
                    });
                }
                else if (glob) {
                    collected[mk] = this[this.groupName][mk].treeDesignate({
                        mDesignators: mDesignators,
                        cDesignator: cDesignator,
                        role: role
                    });
                }
            }
        }
        else {
            terminal = true;
        }
        if (terminal) {
            let bucket = this[this.finalName][role];
            for (let cruxlabel in bucket) {
                let crux = bucket[cruxlabel];
                if (matchDesignationTerm(cruxlabel, cDesignator)) {
                    collected[cruxlabel] = crux;
                }
            }
        }
        return collected;
    }
    flatDesignate(designator) {
        let recur = function (dtree, collection) {
            for (let k in dtree) {
                let v = dtree[k];
                if (v instanceof crux_1.Crux) {
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
                if (v instanceof crux_1.Crux) {
                    tokens[chain + ':' + k + '/' + designator.role] = v;
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
    designate(str, role, tokenize = true) {
        if (tokenize) {
            return this.tokenDesignate(parseDesignatorString(str, role));
        }
        else {
            return this.flatDesignate(parseDesignatorString(str, role));
        }
    }
}
exports.BasicDesignable = BasicDesignable;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(0);
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Crux {
    constructor(label) {
        this.label = label;
        this.roles = {};
    }
    inversion(role) {
        return Crux.StandardInversions[role];
    }
    attachTo(membrane, asRole) {
        this.originalMembrane = membrane;
        this.originalRole = asRole;
        let place = membrane.roles[asRole] || (membrane.roles[asRole] = {});
        place[this.label] = this;
        this.inversionRole = this.inversion(asRole);
        if (membrane.inverted !== undefined && this.inversionRole !== undefined) {
            this.inversionMembrane = membrane.inverted;
            let Iplace = this.inversionMembrane.roles[this.inversionRole] || (this.inversionMembrane.roles[this.inversionRole] = {});
            Iplace[this.label] = this;
        }
    }
    detach() {
        delete this.originalMembrane.roles[this.originalRole][this.label];
        if (this.inversionMembrane !== undefined) {
            delete this.inversionMembrane.roles[this.inversionRole][this.label];
        }
    }
}
Crux.StandardInversions = {
    'source': 'sink',
    'sink': 'source',
    'master': 'slave',
    'slave': 'master',
    'caller': 'called',
    'called': 'caller'
};
exports.Crux = Crux;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const designable_1 = __webpack_require__(2);
class Membrane extends designable_1.BasicDesignable {
    constructor(host) {
        super("subranes", "roles");
        this.host = host;
        this.roles = {};
        this.subranes = {};
        this.notify = true;
    }
    notifyCruxAdd(crux, role, token) {
        if (this.notify) {
            let basic = token == undefined;
            let t = basic ? `:${crux.label}/${role}` : token;
            this.host.onAddCrux(crux, role, t);
            if (this.parent) {
                let qualified = `${this.alias}${basic ? t : '.' + token}`;
                this.parent.notifyCruxAdd(crux, role, qualified);
            }
        }
    }
    notifyCruxRemove(crux, role, token) {
        if (this.notify) {
            let basic = token == undefined;
            let t = basic ? `:${crux.label}/${role}` : token;
            this.host.onRemoveCrux(crux, role, t);
            if (this.parent) {
                let qualified = `${this.alias}${basic ? t : '.' + token}`;
                this.parent.notifyCruxRemove(crux, role, qualified);
            }
        }
    }
    notifyMembraneAdd(membrane, token) {
        if (this.notify) {
            let basic = token == undefined;
            let t = basic ? `${membrane.alias}` : token;
            this.host.onAddMembrane(membrane, t);
            if (this.parent) {
                let qualified = `${this.alias}${basic ? t : '.' + token}`;
                this.parent.notifyMembraneAdd(membrane, qualified);
            }
        }
    }
    notifyMembraneRemove(membrane, token) {
        if (this.notify) {
            let basic = token == undefined;
            let t = basic ? `${membrane.alias}` : token;
            this.host.onRemoveMembrane(membrane, t);
            if (this.parent) {
                let qualified = `${this.alias}${basic ? t : '.' + token}`;
                this.parent.notifyMembraneRemove(membrane, qualified);
            }
        }
    }
    forEachCrux(func) {
        for (let rk in this.roles) {
            let ofrole = this.roles[rk];
            for (let cruxlabel in ofrole) {
                let crux = ofrole[cruxlabel];
                func(crux, ofrole);
            }
        }
    }
    invert() {
        if (this.inverted === undefined) {
            this.inverted = new Membrane(this.host);
            this.inverted.inverted = this;
            this.forEachCrux((crux, role) => {
                crux.attachTo(this, crux.originalRole);
            });
        }
        return this.inverted;
    }
    getMembraneToken() {
        if (this.parent == undefined) {
            return undefined;
        }
        else {
            let parentToken = this.parent.getMembraneToken();
            if (parentToken) {
                return +'.' + this.alias;
            }
            else {
                return this.alias;
            }
        }
    }
    addSubrane(membrane, label) {
        this.subranes[label] = membrane;
        membrane.parent = this;
        membrane.alias = label;
        this.notifyMembraneAdd(membrane);
    }
    removeSubrane(label) {
        let removing = this.subranes[label];
        delete this.subranes[label];
        this.notifyMembraneRemove(removing);
        removing.parent = undefined;
        removing.alias = undefined;
        return removing;
    }
    addCrux(crux, role) {
        let home = this.roles[role];
        if (home === undefined) {
            home = this.roles[role] = {};
        }
        let existing = home[crux.label];
        if (existing !== undefined) {
        }
        else {
            crux.attachTo(this, role);
            this.notifyCruxAdd(crux, role);
        }
    }
    removeCrux(crux, role) {
        let existing = this.roles[role][crux.label];
        if (existing !== undefined) {
            existing.detach();
            this.notifyCruxRemove(crux, role);
        }
    }
}
exports.Membrane = Membrane;


/***/ }),
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(0);
const typesplit_1 = __webpack_require__(3);
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(5));
__export(__webpack_require__(4));
__export(__webpack_require__(1));
__export(__webpack_require__(5));
__export(__webpack_require__(11));
__export(__webpack_require__(12));
__export(__webpack_require__(13));
__export(__webpack_require__(14));
__export(__webpack_require__(15));
__export(__webpack_require__(2));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(17));
__export(__webpack_require__(0));
const debug = __webpack_require__(18);
exports.Debug = debug;
__export(__webpack_require__(19));
__export(__webpack_require__(6));
__export(__webpack_require__(7));


/***/ }),
/* 10 */
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


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const I = __webpack_require__(10);
const membrane_1 = __webpack_require__(5);
const medium_1 = __webpack_require__(1);
const Designate = __webpack_require__(2);
class RuleMesh {
    constructor(initArgs) {
        this.primary = new membrane_1.Membrane(this);
        this.roleToMedia = {};
        this.rules = {};
        this.media = {};
        this.exposed = initArgs.exposed;
        for (let membraneKey in initArgs.membranes) {
            this.primary.addSubrane(initArgs.membranes[membraneKey], membraneKey);
        }
        for (let mediakey in initArgs.rules) {
            let newMedium = new medium_1.mediaConstructors[mediakey]({ label: mediakey, exposed: this.exposed });
            this.addMedium(mediakey, newMedium);
            this.parseRules(initArgs.rules[mediakey], mediakey, newMedium);
        }
    }
    addMedium(key, medium) {
        this.rules[key] = [];
        this.media[key] = medium;
        this.roleToMedia[medium.roleA] = key;
        this.roleToMedia[medium.roleB] = key;
    }
    parseRules(ruleset, mediumkey, medium) {
        for (let link of ruleset) {
            let linkIR = this.parseLink(link, medium);
            this.addRule(linkIR, mediumkey, medium);
        }
    }
    parseLink(link, medium) {
        let m = link.match(/^([\w\*\:\.]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.]+)/);
        if (!m) {
            throw new Error(`Unable to parse link description, expression ${link} did not match regex`);
        }
        ;
        let [match, srcDesig, srcClose, viceVersa, filter, matching, persistent, snkClose, snkDesig] = m;
        return {
            designatorA: Designate.parseDesignatorString(srcDesig, medium.roleA),
            designatorB: Designate.parseDesignatorString(snkDesig, medium.roleB),
            closeSource: srcClose === '|',
            closeSink: snkClose === '|',
            matching: matching === "=",
            propogation: filter !== '' ? { '+': I.LINK_FILTERS.PROCEED, '-': I.LINK_FILTERS.DECEED, '!': I.LINK_FILTERS.ELSEWHERE }[filter] : I.LINK_FILTERS.NONE
        };
    }
    addRule(rule, mediumkey, medium) {
        this.rules[mediumkey].push(rule);
        let dA = this.primary.tokenDesignate(rule.designatorA);
        let dB = this.primary.tokenDesignate(rule.designatorB);
        this.designateCheckConnect(rule, dA, dB, medium);
    }
    designateCheckConnect(rule, desigA, desigB, medium) {
        for (let tokenA in desigA) {
            let designatedA = desigA[tokenA];
            for (let tokenB in desigB) {
                let designatedB = desigB[tokenB];
                let link = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    roleA: designatedA.roles[medium.roleA],
                    roleB: designatedB.roles[medium.roleB],
                    directed: true,
                    destructive: false
                };
                for (let mk in this.media) {
                    let claimer = this.media[mk];
                    if (claimer !== medium && claimer.hasClaim()) {
                        throw new Error('Unable to suppose link when another medium has claimed the token');
                    }
                }
                console.log(designatedA.label, " , ", designatedB.label);
                if (!rule.matching || (designatedA.label === designatedB.label)) {
                    medium.suppose(link);
                }
            }
        }
    }
    onAddCrux(crux, role, token) {
        let medium = this.media[this.roleToMedia[role]];
        let linkRules = this.rules[this.roleToMedia[role]];
        let designator;
        if (role === medium.roleA) {
            for (let rule of linkRules) {
                if (Designate.tokenDesignatedBy(token, rule.designatorA)) {
                    let dB = this.primary.tokenDesignate(rule.designatorB);
                    let dA = {};
                    dA[token] = crux;
                    this.designateCheckConnect(rule, dA, dB, medium);
                }
            }
        }
        else if (role === medium.roleB) {
            for (let rule of linkRules) {
                if (Designate.tokenDesignatedBy(token, rule.designatorB)) {
                    let dA = this.primary.tokenDesignate(rule.designatorA);
                    let dB = {};
                    dB[token] = crux;
                    this.designateCheckConnect(rule, dA, dB, medium);
                }
            }
        }
        else {
            throw new Error("Not a valid crux addition role does not match medium");
        }
    }
    onRemoveCrux(crux, role, token) {
        let location = this.media[this.roleToMedia[role]];
        if (role === location.roleA) {
            console.log('remove crux: ', crux, ' , token:', token);
            location.breakA(token, role);
        }
        else if (role === location.roleB) {
            location.breakB(token, role);
        }
    }
    onAddMembrane(membrane, token) {
        for (let role in this.roleToMedia) {
            let cruxscan = membrane.designate("**:*", role, true);
            for (let token in cruxscan) {
                this.onAddCrux(cruxscan[token], role, membrane.getMembraneToken() + token);
            }
        }
    }
    onRemoveMembrane(membrane, token) {
        for (let role in this.roleToMedia) {
            let cruxscan = membrane.designate("**:*", role, true);
            for (let token in cruxscan) {
                this.onRemoveCrux(cruxscan[token], role, membrane.getMembraneToken() + token);
            }
        }
    }
}
exports.RuleMesh = RuleMesh;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const designable_1 = __webpack_require__(2);
class Visor extends designable_1.BasicDesignable {
    constructor(target, designator) {
        super('subranes', 'roles');
        this.target = target;
    }
}
exports.Visor = Visor;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const crux_1 = __webpack_require__(4);
class CallCrux extends crux_1.Crux {
    constructor(spec) {
        super(spec.label);
        let capin, capout, reqfunc;
        if (spec.hook === true) {
            capin = true;
            capout = false;
        }
        else if (spec.hook instanceof Function) {
            capout = true;
            capin = false;
            reqfunc = spec.hook;
        }
        this.roles = {
            caller: {
                capped: capout,
                func: reqfunc
            }, called: {
                capped: capin,
                func: (data, tracking) => {
                    let crumb;
                    if (spec.tracking && tracking !== undefined) {
                        crumb = tracking.drop("Caller Crux")
                            .with(data)
                            .at(`crux-label:${this.label}`);
                    }
                    if (this.roles.caller.func !== undefined) {
                        if (crumb) {
                            return this.roles.caller.func(data, crumb);
                        }
                        else {
                            return this.roles.caller.func(data);
                        }
                    }
                    else {
                        if (tracking) {
                            tracking.raise("Called crux with no assigned caller, missing link");
                        }
                    }
                }
            }
        };
    }
}
exports.CallCrux = CallCrux;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(1);
class DistributeMedium extends medium_1.BaseMedium {
    constructor(spec) {
        super(spec);
        this.roleA = 'caller';
        this.roleB = 'called';
    }
    distribute(sourceToken, data, crumb) {
        for (let sinkToken in this.matrix.to[sourceToken]) {
            let source = this.matrix.to[sourceToken];
            let outrole = source[sinkToken].roleB;
            outrole.func(data, crumb);
        }
    }
    inductA(token, a) {
        a.func = this.distribute.bind(this, token);
    }
    inductB(token, b) {
    }
    connect(link) {
    }
    disconnect(link) {
        super.disconnect(link);
        link.roleA.func = undefined;
    }
}
exports.DistributeMedium = DistributeMedium;
medium_1.mediaConstructors['distribute'] = DistributeMedium;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const medium_1 = __webpack_require__(1);
class InjectiveMedium extends medium_1.BaseMedium {
    constructor(spec) {
        super(spec);
        this.exclusive = true;
        this.roleA = 'caller';
        this.roleB = 'called';
        this.multiA = false,
            this.multiB = false;
    }
    inductA(token, a) {
    }
    inductB(token, b) {
    }
    connect(link) {
        this.matrix.to[link.tokenA][link.tokenB].roleA.func = link.roleB.func;
    }
    disconnect(link) {
        this.matrix.to[link.tokenA][link.tokenB].roleA.func = undefined;
        super.disconnect(link);
    }
}
exports.InjectiveMedium = InjectiveMedium;
medium_1.mediaConstructors['inject'] = InjectiveMedium;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ImUtil = __webpack_require__(9);
const ImIO = __webpack_require__(8);
console.log(new ImUtil.Blender({})
    .init({ greeting: 'hello' })
    .dump());
exports.Util = ImUtil;
exports.IO = ImIO;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(3);
const checks_1 = __webpack_require__(0);
const math_1 = __webpack_require__(6);
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


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = __webpack_require__(0);
const transforms_1 = __webpack_require__(7);
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const typesplit_1 = __webpack_require__(3);
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


/***/ })
/******/ ]);