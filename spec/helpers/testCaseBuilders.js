let Util = require('../../dist/jungle.js').Util

function resolveTest(cell, input, expected){
    it('should resolve to expected outcome',function(){
        Util.deeplyEqualsThrow(cell.resolve(), expected)

    })
}
