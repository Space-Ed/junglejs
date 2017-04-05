namespace Jungle {

    export namespace Util {

        export function isSubset(seq1, seq2){

            for (let k of seq1){
                if(seq2.indexOf(k) === -1){
                    return false
                }
            }

            return true
        }

        export function isSetEqual(seq1, seq2){
            return isSubset(seq1, seq2) && isSubset(seq2, seq1)
       }

        export function weightedChoice(weights:number[]){
            var sum = weights.reduce(function(a,b){return a+b},0)
            var cdfArray = weights.reduce(function(coll, next, i){
               var v = (coll[i-1] || 0)+next/sum
               return coll.concat([v])
            },[])

            var r = Math.random();
            var i = 0;

            //the cdf exceeds r increment
            while(i < weights.length-1 && r > cdfArray[i]){i++}
            return i
        }

        export function range(...args){
            var beg, end, step

            switch(args.length){
                case 1:{
                    end = args[0]; beg=0; step=1
                    break;
                }
                case 2:{
                    end =args[1];beg=args[0];step=1
                    break;
                }
                case 3:{
                    end=args[2];beg=args[0];step=args[1]
                    break;
                }
                default:{
                    end=0;beg=0;step=1
                    break
                }
            }
            var rng = []
            if(beg > end && step < 0){
                for(let i = beg; i > end; i+=step){
                    rng.push(i)
                }
            } else if (beg < end && step > 0){
                for(let i = beg; i < end; i+=step){
                    rng.push(i)
                }
            } else {
                throw new Error("invalid range parameters")
            }
            return rng;
        }
    }

}
