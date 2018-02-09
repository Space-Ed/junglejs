class WeaveError extends Error {}
import {evaluateConstraint, ConstraintResult} from '../../../interoperability/constraint'

function constraintBreachMessage(result: ConstraintResult, act, subject){
    return `Unable to ${act}, would cause ${result.got} but constraint requires ${result.expected} of ${subject}`
}

function checkLengthConstraint (arr, constraint){
    return evaluateConstraint(constraint, arr.length)
}

function push (arr){
    arr.push(1)
}

function pop (arr){
    arr.pop()
}

function hypotheticalize(arr){
    return [...arr]
}

function cautiousAction (structure, action, constraint){
    // create a hypothetical situation
    let hypothetical = hypotheticalize(structure)

    action(hypothetical)

    // check the hypothetical against the constraint
    let result = checkLengthConstraint(hypothetical, constraint)

    // if valid acualise 
    if(result === true){
        action(structure)
    }
    //otherwise report error with the message
    else { 
        throw new Error(constraintBreachMessage(<any>result, action.name, "checkLengthConstraint"))
    }
}

fdescribe('cautious io system', function(){

    beforeAll(function(){

    })

    let constraintToken = ['0','1','+','*', '?']
    let constraintHolders = {
        linksPerLaw:{
            valid:'expected'
        }, 

        linksPerClaim:{},
        claimsPerContact:{}

    }

    describe('should create a simple array hypothetical', function(){

        let states = {    
            empty: ()=>([]),
            one: ()=>([1]),
            two: ()=>([1,1])
        }
        
        let actions = {
            push, pop
        }

        let tests = [
            {initial:'empty', act:'push', constraint:'?', result:'one', failMessage:null},
            {   
                initial:'empty', 
                act:'push', 
                constraint:'0', 
                result:'one',
                failMessage:"Unable to push, would cause EXACTLY ONE but constraint requires NONE of checkLengthConstraint"
            },

            {
                initial: 'one',
                act: 'push',
                constraint: '?',
                result: 'one',
                failMessage: "Unable to push, would cause MANY but constraint requires MAYBE ONE of checkLengthConstraint"
            },

            {
                initial: 'one',
                act: 'pop',
                constraint: '+',
                result: 'one',
                failMessage: "Unable to pop, would cause NONE but constraint requires MANY of checkLengthConstraint"
            },

        ]
    

        for (let test of tests){

            it(`should run test case ${JSON.stringify(test)}`, ()=>{
                let initial = states[test.initial]()
                
                let act = () => {
                    cautiousAction(initial, actions[test.act], test.constraint)
                }
    
                if(test.failMessage){
                    expect(act).toThrowError(test.failMessage)
                    expect(initial).toEqual(states[test.initial]())
                }else{
                    expect(act).not.toThrowError()
                    expect(initial).toEqual(states[test.result]())
                }
            })

        }

    })

})