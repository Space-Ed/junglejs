
import * as _Util from './util/all'
import * as _IO  from './interoperability/all'

export const Util = _Util
export const IO = _IO;


// (function(){
//     var root = this
//
//     var define = define || undefined;
//
//     if (typeof exports !== 'undefined') {
//         if (typeof module !== 'undefined' && module.exports) {
//             exports = module.exports = Jungle;
//         }
//         exports.Jungle = Jungle;
//     } else if (typeof define !== 'undefined' && define.amd) {
//         define('Jungle', (function() { return root.Jungle = Jungle; })() );
//     } else {
//         root.Jungle = Jungle;
//     }
// }).call(this)
