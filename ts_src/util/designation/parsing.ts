export declare type DTerm = RegExp | Function | "**" | string;
export declare type TokenIR = [string[], string] 

export interface DesignatorIR {
    groups: DTerm[]
    end: DTerm
}


export const DSetExp = "(?:\\*|\\{\\w+(?:\,\\w+)*\\})?"
export const DSymBindingExp = `(?:\\w+#${DSetExp})`
export const DSymBindingParse = `(?:(\\w+)#(${DSetExp}))`

export const DTermExp = `(?:\\w+|\\*|${DSymBindingExp})`
export const DGroupExp = `(?:\\w+|\\*{1,2}|${DSymBindingExp})`
export const DFullExp = `(${DGroupExp}(?:\\.${DGroupExp})*)?\\:(${DTermExp})`

export const DTotalExp = new RegExp(`^${DFullExp}$`);

export const TermChars = '[\\w\\$]'

export const DSimpleExp = `(${TermChars}+(?:\\.${TermChars}+)*)?(?:\\:(${DTermExp}))?`

export function parseDesignatorString(desigstr: string): DesignatorIR {

    let [groups, terminal] = splitDesignatorString(desigstr)

    let groupTerms: DTerm[] = groups.map((value, index) => {
        return parseDTerm(value);
    })

    return {
        groups: groupTerms,
        end: parseDTerm(terminal)
    }
}

export function splitDesignatorString(desigstr): [string[], string] {
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(DTotalExp);

    if (colonSplit === null) {
        throw new SyntaxError("Incorrect syntax on designator " + desigstr)
    } else {
        var [total, chain, terminal] = colonSplit
    }

    let groupLex: string[] = chain ? chain.split(/\./) : [];
    return [groupLex, terminal]
}

export function parseTokenSimple(desigstr):TokenIR{
    //match structural consistency with xxx.xxx... ...xxx:ppp
    let colonSplit = desigstr.match(DSimpleExp);

    if (colonSplit === null) {
        throw new SyntaxError("Incorrect syntax on token " + desigstr)
    } else {
        var [total, chain, terminal] = colonSplit
    }

    let groupLex: string[] = chain ? chain.split(/\./) : [];
    return [groupLex, terminal]
}

export function compileToken([groups, end]:TokenIR):string{
    return groups.join('.') + ':' + end
}


export function parseDSet(DSetExp: string): (checkMember) => boolean {
    return checked => true
}

/**
 * convert globs to regex to use as the designator
 */
export function parseDTerm(term: string): DTerm {
    if (term == '*') {
        return /.*/
    } else if (term == '**') {
        return '**'
    } else if (term !== undefined && term.match(DSymBindingExp)) {
        //symbolic
        let match = term.match(DSymBindingParse)
        let set = parseDSet(match[2])
        let sym = match[1]
        return function (exp) {
            if (set(exp)) {
                return {sym:Symbol.for(sym), val:exp}
            }
        }
    } else {
        return new RegExp(`\^${term}\$`)
    }
}



/**create a regex that will o*/
export function designatorToRegex(desigstr) {
    let [subranedesig, terminal] = splitDesignatorString(desigstr)

    let regex = ''

    for (let i = 0; i < subranedesig.length; i++) {
        let term = subranedesig[i], first = i === 0, last = i === subranedesig.length - 1;

        if (term == '*') {
            regex += first ? '^(\\w+)' : '\.\\w+'
        } else if (term == '**') {
            regex += first ? '^(\\w+(\.\\w+)*?)?' : '(\.\\w+)*'
        } else {
            regex += first ? `^${term}` : `\.${term}`
        }
    }

    regex += `:${terminal == '*' ? '(\\w+)' : terminal}$`

    return new RegExp(regex)
}