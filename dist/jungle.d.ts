/// <reference path="../typings/index.d.ts" />
declare namespace Jungle {
    namespace Nova {
        abstract class Construct<HOST extends Composite> {
            alive: boolean;
            parent: HOST;
            cache: any;
            domain: Domain;
            locator: string;
            constructor(spec: any);
            private ensureObject(spec);
            induct(host: HOST, key: string): void;
            abstract prime(): any;
            abstract dispose(): any;
            extract(): any;
            abstract patch(patch: any): any;
            extend(patch: any): Construct<HOST>;
        }
    }
}
declare namespace Jungle {
    namespace Nova {
        class Domain {
            registry: {};
            subdomain: {};
            constructor();
            branch(key: any): any;
            register(key: any, construct: any): void;
            locateDomain(dotpath: string): Domain;
            recover(construct: any): Construct<any>;
        }
        const JungleDomain: Domain;
    }
}
declare namespace Jungle {
    namespace Nova {
        class Composite extends Construct<any> {
            keywords: {
                basis: any;
                domain: any;
            };
            subconstructs: any;
            constructor(spec: any);
            prime(): void;
            add(k: any, v: any): void;
            addStrange(k: any, v: any): void;
            ensureRecoverable(value: any): any;
            remove(k: any): any;
            dispose(): any;
            extract(): any;
            patch(patch: any): void;
            extend(patch: any): Construct<any>;
        }
    }
}
declare namespace Jungle {
    namespace Nova {
        class Cell extends Composite implements IO.MembraneHost {
            mesh: IO.RuleMesh;
            membranes: any;
            nucleus: any;
            policy: Jungle.IO.ShellPolicy;
            constructor(spec: any);
            addStrange(k: any, v: any): void;
            onAddCrux(crux: any, role: any, token: any): void;
            onRemoveCrux(crux: any, role: any, token: any): void;
            onAddMembrane(membrane: any, token: any): void;
            onRemoveMembrane(membrane: any, token: any): void;
        }
    }
}
declare namespace Jungle {
    namespace Nova {
        class StateCell extends Composite {
            proxy: any;
            constructor(spec: any);
            prime(): void;
            define(key: any, value: any): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class Crux {
            label: string;
            static StandardInversions: {
                'source': string;
                'sink': string;
                'master': string;
                'slave': string;
                'caller': string;
                'called': string;
            };
            originalMembrane: Membrane;
            inversionMembrane: Membrane;
            originalRole: string;
            inversionRole: string;
            roles: any;
            constructor(label: string);
            inversion(role: string): string;
            attachTo(membrane: Membrane, asRole: string): void;
            detach(): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        interface CallCruxSpec {
            label: string;
            hook?: boolean | ((data: any, crumb: Debug.Crumb) => any);
            tracking: boolean;
        }
        class CallCrux extends Crux {
            roles: {
                caller: any;
                called: Called;
            };
            constructor(spec: CallCruxSpec);
        }
    }
}
declare namespace Jungle {
    namespace Nova {
        interface CallHookSpec {
            target: string;
            contact: "called" | "caller";
            mode: "push" | "pull";
            hook: any;
            default: any;
            sync: boolean;
        }
        class CallHook extends Construct<Cell> {
            crux: IO.CallCrux;
            cache: CallHookSpec;
            constructor(spec: any);
            produceHook(host: Cell, key: string): {
                hook: boolean | ((inp: any, crumb: Debug.Crumb) => any);
                sinker: any;
            };
            induct(host: Cell, key: string): void;
            prime(): void;
            patch(patch: any): void;
            dispose(): void;
            extract(): CallHookSpec;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        enum LINK_FILTERS {
            PROCEED = 0,
            DECEED = 1,
            ELSEWHERE = 2,
            NONE = 3,
        }
        interface ILinkRule {
            designatorA: CruxDesignator;
            designatorB: CruxDesignator;
            closeSource: boolean;
            closeSink: boolean;
            matching: boolean;
            propogation: LINK_FILTERS;
        }
        interface IMeshInitialiser {
            membranes: any;
            rules: any;
            exposed: any;
        }
        interface IMedium<A extends IContact, B extends IContact> {
            label: string;
            roleA: string;
            roleB: string;
            breakA(token: string, a: A): any;
            breakB(token: string, b: B): any;
            hasClaim(link: ILinkSpec<A, B>): boolean;
            suppose(supposedLink: ILinkSpec<A, B>): boolean;
        }
        interface ILinkSpec<A, B> {
            tokenA: string;
            tokenB: string;
            roleA: A;
            roleB: B;
            directed: boolean;
            destructive: boolean;
        }
        interface IMediumSpec {
            exclusive?: boolean;
            multiA?: boolean;
            multiB?: boolean;
            directedOnly?: boolean;
            exposed: any;
            label: string;
        }
        interface ShellPolicy {
            fussy: boolean;
            allowAddition: boolean;
            allowRemoval: boolean;
        }
        const FreePolicy: ShellPolicy;
        interface MembraneHost {
            policy: ShellPolicy;
            onAddCrux: (crux: Crux, role: string, token: string) => void;
            onRemoveCrux: (crux: Crux, role: string, token: string) => void;
            onAddMembrane: (membrane: Membrane, token) => void;
            onRemoveMembrane: (membrane: Membrane, token) => void;
        }
        interface Designable {
            treeDesignate(desig: CruxDesignator): any;
        }
        interface CruxDesignator {
            role: string;
            mDesignators: string[] | RegExp[] | ((membrane: Membrane, key: string) => boolean)[];
            cDesignator: string | RegExp | ((crux: Crux) => boolean);
        }
        interface IContact {
            capped: boolean;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        abstract class BaseMedium<A extends IContact, B extends IContact> implements IMedium<A, B> {
            exclusive: boolean;
            multiA: boolean;
            multiB: boolean;
            label: string;
            abstract roleA: string;
            abstract roleB: string;
            matrix: {
                to: any;
                from: any;
                sym: any;
            };
            exposed: any;
            constructor(spec: IMediumSpec);
            suppose(supposedLink: ILinkSpec<A, B>): boolean;
            hasClaim(link: ILinkSpec<A, B>): boolean;
            breakA(token: string, a: A): void;
            breakB(token: string, b: B): void;
            check(link: ILinkSpec<A, B>): boolean;
            abstract inductA(token: string, a: A): any;
            abstract inductB(token: string, b: B): any;
            abstract connect(link: ILinkSpec<A, B>): any;
            disconnect(link: ILinkSpec<A, B>): void;
        }
        const mediaConstructors: {};
    }
}
declare namespace Jungle {
    namespace IO {
        namespace Designate {
            function regexifyDesignationTerm(term: string): RegExp | "**";
            function parseDesignatorString(desigstr: string, targetRole: string): CruxDesignator;
            function designatorToRegex(desigstr: any, role: any): RegExp;
            function tokenDesignatedBy(token: any, designator: CruxDesignator): boolean;
            function matchDesignationTerm(target: any, term: any): any;
        }
        class BasicDesignable {
            private groupName;
            private finalName;
            visors: Visor[];
            constructor(groupName: string, finalName: string);
            treeDesignate({mDesignators, cDesignator, role}: CruxDesignator): {};
            flatDesignate(designator: CruxDesignator): any;
            tokenDesignate(designator: CruxDesignator): any;
            designate(str: string, role: string, tokenize?: boolean): any;
            createVisor(designation: string | string[], host: any): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class Membrane extends BasicDesignable {
            host: MembraneHost;
            inverted: Membrane;
            roles: any;
            subranes: any;
            parent: Membrane;
            alias: string;
            notify: boolean;
            visors: Visor[];
            constructor(host: MembraneHost);
            notifyCruxAdd(crux: any, role: any, token?: any): void;
            notifyCruxRemove(crux: Crux, role: string, token?: any): void;
            notifyMembraneAdd(membrane: any, token?: any): void;
            notifyMembraneRemove(membrane: any, token?: any): void;
            forEachCrux(func: (crux, role) => void): void;
            invert(): Membrane;
            getMembraneToken(): string;
            createVisor(designation: string | string[], host: any): void;
            addSubrane(membrane: Membrane, label: string): void;
            removeSubrane(label: any): Membrane;
            addCrux(crux: Crux, role: string): void;
            removeCrux(crux: Crux, role: string): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class RuleMesh implements MembraneHost {
            primary: Membrane;
            policy: ShellPolicy;
            roleToMedia: any;
            rules: any;
            media: any;
            exposed: any;
            constructor(initArgs: IMeshInitialiser);
            addMedium(key: string, medium: IMedium<any, any>): void;
            private parseRules(ruleset, mediumkey, medium);
            private parseLink(link, medium);
            addRule(rule: ILinkRule, mediumkey: string, medium: IMedium<any, any>): void;
            designateCheckConnect(rule: ILinkRule, desigA: Object, desigB: Object, medium: IMedium<any, any>): void;
            onAddCrux(crux: Crux, role: string, token: string): void;
            onRemoveCrux(crux: Crux, role: string, token: string): void;
            onAddMembrane(membrane: Membrane, token: any): void;
            onRemoveMembrane(membrane: Membrane, token: any): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class Visor extends BasicDesignable {
            private target;
            subranes: any;
            roles: any;
            constructor(target: BasicDesignable, designator: any);
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class DistributeMedium extends BaseMedium<Caller, Called> {
            roleA: string;
            roleB: string;
            constructor(spec: IMediumSpec);
            distribute(sourceToken: string, data: any, crumb: any): void;
            inductA(token: string, a: Caller): void;
            inductB(token: string, b: Called): void;
            connect(link: ILinkSpec<Caller, Called>): void;
            disconnect(link: ILinkSpec<Caller, Called>): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        interface Called extends IContact {
            func: (data: any, tracking: Debug.Crumb) => Util.Junction;
        }
        interface Caller extends IContact {
            func?: (data: any, tracking: Debug.Crumb) => Util.Junction;
        }
        class InjectiveMedium extends BaseMedium<Caller, Called> {
            roleA: string;
            roleB: string;
            constructor(spec: IMediumSpec);
            inductA(token: string, a: Caller): void;
            inductB(token: string, b: Called): void;
            connect(link: ILinkSpec<Caller, Called>): void;
            disconnect(link: ILinkSpec<Caller, Called>): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class PortCrux extends CallCrux {
            roles: {
                caller: any;
                called: Called;
                source: any;
                sink: Called;
            };
            constructor(label: any);
        }
        class PushMedium extends DistributeMedium {
            roleA: string;
            roleB: string;
        }
    }
}
declare namespace Test {
    class MockConstruct extends Jungle.Nova.Construct<Jungle.Nova.Composite> {
        state: any;
        spies: any;
        constructor(spec: {
            patch: "message";
        });
        prime(): void;
        dispose(): any;
        extract(): any;
        patch(patch: any): void;
    }
}
declare namespace Jungle {
    namespace Util {
        function B(crown?: {}, form?: any): Blender;
        class Blender {
            crown: any;
            static strictTypeReduce: boolean;
            static defaultReduce(a: any, b: any): any;
            static defaultMap(x: any): any;
            block: boolean;
            term: boolean;
            reducer: (a, b) => any;
            mapper: (a) => any;
            constructor(crown: any, form?: any);
            init(obj: any): Blender;
            initChurn(inner: any, k: any): any;
            dump(): any;
            blend(obj: any): this;
            private _blend(obj);
            merge(income: any): any;
        }
    }
}
declare namespace Jungle {
    namespace Util {
        function isPrimative(thing: any): boolean;
        function isVanillaObject(thing: any): boolean;
        function isVanillaArray(thing: any): boolean;
        function isTree(thing: any, stack?: any[]): any;
        function isVanillaTree(thing: any, stack?: any[]): any;
        function deeplyEquals(node1: any, node2: any, allowIdentical?: boolean): boolean;
        function deeplyEqualsThrow(node1: any, node2: any, derefstack: any, seen: any, allowIdentical?: boolean): boolean;
        function isDeepReplica(node1: any, node2: any): void;
        function isDeepReplicaThrow(node1: any, node2: any): void;
    }
}
declare namespace Jungle {
    namespace Debug {
        function dumpToDepthF(maxdepth: any, indentSym?: string): (x: any) => string;
        class JungleError {
            message: any;
            fileName: any;
            lineNumber: any;
            constructor(message: any, fileName?: any, lineNumber?: any);
        }
        interface CrumbOptions {
            header: string;
            traceDepth: number;
            debug: boolean | string[];
            log: {
                log: any;
            };
            format: (whatever) => any;
            with: (whatever) => any;
            at: (whatever) => any;
            within: (whatever) => any;
            as: (whatever) => any;
        }
        class Crumb {
            label: string;
            static defaultOptions: CrumbOptions;
            static customOptions: {};
            options: CrumbOptions;
            previous: Crumb;
            position: any;
            location: any;
            data: any;
            situation: any;
            message: string;
            catchCallback: (crumb: Crumb) => void;
            raised: boolean;
            constructor(label: string);
            setOptions(optionObj: any): void;
            drop(label: string): Crumb;
            excursion(label: any, callback: (crumb) => void): void;
            at(position: any): this;
            in(location: any): this;
            as(situation: any): this;
            with(data: any): this;
            dump(): string;
            traceback(depth?: number): any;
            describe(): string;
            catch(callback: any): this;
            raise(error: any): void;
            deflect(exception: any): void;
        }
    }
}
declare namespace Jungle {
    namespace Util {
        class Junction {
            private resultNature;
            awaits: any;
            index: number;
            silentAwaits: boolean[];
            silentIndex: number;
            residue: any;
            leashed: any;
            error: {
                message: string;
                key: string | number;
            };
            catchCallback: any;
            thenCallback: any;
            future: Junction;
            fried: boolean;
            blocked: boolean;
            cleared: boolean;
            thenkey: boolean | string | number;
            constructor();
            private proceedThen();
            private unleash(propagated);
            private proceedCatch(error);
            private successor();
            private frontier();
            realize(): any;
            private isClean();
            isIdle(): boolean;
            private isReady();
            private isTampered();
            private isPresent();
            private hasFuture();
            private allDone();
            hold(returnkey?: any): ((result?: any) => any)[];
            _hold(returnkey?: any): ((result?: any) => any)[];
            await(act: (done: (returned: any) => Junction, raise: (message: string) => void) => any, label?: any): Junction;
            merge(upstream: any, holdstyle?: any): Junction;
            then(callback: (results: any, residue: any, handle: Junction) => void, thenkey?: any): Junction;
            catch(callback: Function): Junction;
        }
    }
}
declare namespace Jungle {
    namespace Util {
        function isSubset(seq1: any, seq2: any): boolean;
        function isSetEqual(seq1: any, seq2: any): boolean;
        function weightedChoice(weights: number[]): number;
        function range(...args: any[]): any[];
    }
}
declare namespace Jungle {
    namespace Util {
    }
}
declare namespace Jungle {
    namespace Util {
        function identity(x: any): any;
        function collapseValues(obj: any): any[];
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean, typeConstrain?: boolean): any;
        function softAssoc(from: any, onto: any): void;
        function parassoc(from: any, onto: any): void;
        function assoc(from: any, onto: any): void;
        function deepCopy<T>(thing: T): T;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
        function objectArrayTranspose(objArr: any, key: string): void;
        function flattenObject(obj: any, depth?: number, values?: any[]): any[];
        function mapObject(obj: any, func: (key, value) => any): {};
        function projectObject(obj: any, keys: any): any;
    }
}
declare namespace Jungle {
    namespace Util {
        function typeCaseSplitR(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any, initial?: any, reductor?: (a: any, b: any, k: any) => void) => any;
        function typeCaseSplitF(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
        function typeCaseSplitM(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => void;
    }
}
