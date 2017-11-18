import { Debug} from '../../jungle'

import {DetectorContact} from './detector'
import {EmitterContact} from './emitter'
import {EventLog} from './log'
import {EventSequencer} from './schedule'
import {TestCell} from './cell'
import {TestEvent, TestRunOptions, LogEntry,LogResult} from './interfaces'
import {TestDomain} from './domain'
import {ensureArray} from '../../util/checks'

export function run(opts: TestRunOptions) {

    let tdom = <TestDomain>opts.domain.sub('test', new TestDomain(opts))
    
    let seq = tdom.seq
    let log = tdom.log
    let targets = tdom.targets

    let runsituation = (sitarr, n) => {
        let [situation, ...rest] = sitarr

        console.log('Situation: %d \n', n)
        opts.domain.recover(situation)

        //run event schedule 
        seq.run(() => {

            //when schedule complete check the results
            let results: LogResult[] = log.query(opts.expected)

            let nfail = results.filter((result) => (result.fail)).length
            let nsuccess = opts.expected.length - nfail
            let ninterest = results.length - nfail
            let banner = `------------Results: Failed: ${nfail} Passed: ${nsuccess} Interesting: ${ninterest}------------`
            let footer = `--------------------------End Results -----------------------------`


            console.log(nfail > 0 ? fail(banner) : yay(banner))

            //interpret the results as a test
            results.forEach((result, i) => {
                displayResult(result, result.index)
            })

            console.log(nfail > 0 ? fail(footer) : yay(footer))

            //and carry completion to outside

            if (rest.length > 0) {
                //temporal recursion
                runsituation(rest, n + 1)
            } else {
                end()
            }

        })
    }

    let end = () => {
        delete opts.domain.subdomain.test
        opts.done()
    }

    let sitarr = ensureArray(opts.situation)
    runsituation(sitarr, 0)

}

function fail(message) {
    return `\x1b[31m${message}\x1b[0m`
}

function stern(message) {
    return `\x1b[34m${message}\x1b[0m`
}

function yay(message) {
    return `\x1b[32m${message}\x1b[0m`

}

function displayResult(result: LogResult, i: number) {
    console.log('\nResult: %d - %s', i, result.fail ? fail('FAIL') : `\x1b[33mPASS\x1b[0m`)

    if (result.fail) {
        console.log('\x1b[33m%s\x1b[0m', result.message)
    } else { //interestnig
        console.log(`\nInteresting results of    ${result.message}`)
        result.matches.forEach((match, i) => {
            displayMatchEntry(match, false)
        })
    }
}

function displayMatchEntry(entry: LogEntry, fail) {
    let color = (str) => (fail ? `\x1b[33m${str}\x1b[0m` : `\x1b[34m${str}\x1b[0m`)

    let message = `
event message: ${entry.message}
event value:   ${Debug.dumpToDepthF(4, '   ', )(entry.value)}
    `

    console.log(color(message))
}