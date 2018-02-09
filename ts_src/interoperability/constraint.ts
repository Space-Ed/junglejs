
export type ConstraintToken = '0' | '1' | '?' | '*' | '+'

function interpretToken(constraint: ConstraintToken): string {
    return {
        '0': 'NONE',
        '1': 'EXACTLY ONE',
        '?': 'MAYBE ONE',
        '+': 'MANY',
        '*': 'ANY'
    }[constraint]
}

function interpretAmount(num: number): string {
    if (num === 0) {
        return 'NONE'
    } else if (num === 1) {
        return 'EXACTLY ONE'
    } else {
        return 'MANY'
    }
}

export interface ConstraintResult {
    got: string,
    expected: string
}

export function evaluateConstraint(constraint, count): ConstraintResult | boolean {
    let interpretedC = interpretToken(constraint)
    let interpretedA = interpretAmount(count)

    if (interpretedC === 'ANY'
        || interpretedC === interpretedA
        || interpretedC === 'MAYBE ONE' && interpretedA !== 'MANY') {
        return true
    }
    else {
        return {
            got: interpretedA,
            expected: interpretedC
        }
    }
}