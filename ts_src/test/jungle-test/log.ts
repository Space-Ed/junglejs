import { deeplyEqualsThrow } from '../../jungle'
import { Detection, LogEntry, LogExpectation, LogResult, LogSource } from './interfaces'
import {EventSequencer} from './schedule'

export class EventLog {
    log: LogEntry[];

    constructor(public sequencer: EventSequencer) {
        this.log = [];
    }

    createLogger(source: LogSource): (event: Detection) => void {
        return (ev: Detection) => {
            this.logEvent({
                type: ev.type,
                value: ev.value,
                message: ev.message,
                tid: source.tid,
                at: this.sequencer.getPresentMID(),
                timestamp: new Date().getMilliseconds(),
            })
        }
    }

    private logEvent(event: LogEntry) {
        this.log.push(event)
    }

    query(expected: LogExpectation[]): LogResult[] {
        let results: LogResult[] = []
        //for each expectation scan the log and establish the result, 

        expected.forEach((exp, i) => {

            let result: LogResult = {
                expectation: exp,
                fail: false,
                matches: [],
                partials: [],
                message: '',
                index:i
            }

            for (let entry of this.log) {
                let { isMatch, reason: matchReason, partial } = this.matchExpectation(exp, entry)

                if (isMatch) {
                    result.message = matchReason;

                    result.matches.push(entry);

                    let { result: passTest, message: testReason } = this.runTest(exp, entry)

                    if (exp.unique && result.matches.length == 2) {
                        //finding multiple matches
                        result.fail = true;
                        result.message += '\nMultiple matches found for result expected unique'
                        break;
                    }

                    if (!passTest) {
                        result.fail = true;
                        result.message += '\n     but failed because: \n' + testReason
                    } else {
                        result.message += '\n     and passed because: \n' + testReason
                    }


                    if (result.fail) {
                        break;
                    }

                } else {
                    //though we have not matched it does not constitute failure, until absolutely no matches occur 
                    // the partial match information for this expectation may be relevant to debug
                    if (partial) {
                        result.partials.push(matchReason)
                    }
                }
            }

            if (result.matches.length === 0 && (exp.expect !== 'nothing')) {
                result.fail = true;

                if (result.partials.length > 0) {
                    result.message = 'No complete matches, but partial matches found: \n   ' + result.partials.join('\n   ')
                } else {
                    result.message = 'No results found'
                }
            }

            if (this.isResultInteresting(result)) {
                results.push(result)
            }
        })


        return results
    }

    isResultInteresting(result: LogResult) {
        return result.fail || result.expectation.interest
    }

    matchExpectation(exp: LogExpectation, entry: LogEntry): { isMatch: boolean, reason: string, partial: boolean } {
        let isMatch = true
        let partial = false

        let momentMessage = '', tidMessage = '', typeMessage = ''
        let positiveMessage = '', negativeMessage = '', counterfactual = ''


        if (exp.at !== undefined) {
            if (exp.at !== entry.at) {
                isMatch = false;
                negativeMessage += ` none at moment: '${exp.at}'`
                counterfactual += ` at moment: '${entry.at}'`
            } else {
                positiveMessage += ` at moment: '${exp.at}'`
                partial = true;
            }
        }

        if (exp.type !== undefined) {
            if (exp.type !== entry.type) {
                isMatch = false;
                negativeMessage += ` none with type: '${exp.type}' `
                counterfactual += ` with type: '${entry.type}'`
            } else {
                positiveMessage += ` with type: '${exp.type}'`
                partial = true;
            }
        }

        if (exp.tid !== undefined) {
            if (exp.tid !== entry.tid) {
                isMatch = false;
                negativeMessage += ` none on detector: '${exp.tid}'`
                counterfactual += ` on detector: '${entry.tid}'`
            } else {
                positiveMessage += ` on detector: '${exp.tid}'`
                partial = true;
            }
        }

        let reason;

        if (partial && !isMatch) {
            reason = `Event occurred${positiveMessage} but${negativeMessage} actually ${counterfactual}`
        } else if (!partial && !isMatch) {
            reason = `No event occurred:${negativeMessage} `
        } else if (isMatch) {
            reason = `Event occurred:${positiveMessage}`
        }

        return {
            partial: partial,
            isMatch: isMatch,
            reason: reason
        }
    }

    runTest(exp: LogExpectation, entry: LogEntry): { result: boolean, message: string } {
        if (exp.expect === 'nothing') {
            return { result: false, message: 'expected nothing but found: '+ entry.message +' with value '+entry.value}
        }
        else if (exp.expect === 'equality') {
            try {
                deeplyEqualsThrow(exp.value, entry.value)
                return { result: true, message: 'deep equality satisfied' }
            }
            catch (e) {
                return { result: false, message: e.message }
            }

        } else if (exp.expect === 'identity') {
            let res = exp.value === entry.value
            return { result: res, message: 'is identical' }
        } else if (exp.expect === 'test') {
            if (exp.testF === undefined) {
                throw new Error('test of type expect:test must contain testF')
            } else {
                let res = exp.testF(exp, entry)
                return { result: res, message: res ? 'passed test function' : 'failed test function' }
            }

        } else {
            return { result: true, message: 'the event exists in the log' }
        }
    }

}