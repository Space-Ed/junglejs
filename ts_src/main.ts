
///compile this file with --outFile for commonjs module environment

/// <reference path="../typings/index.d.ts"/>
/// <reference path="util.ts"/>
/// <reference path="core.ts"/>
/// <reference path="reconstruction.ts"/>

/// <reference path="inventory/io.ts"/>
/// <reference path="inventory/select.ts"/>
/// <reference path="inventory/resolver.ts"/>

/// <reference path="aliases.ts"/>

// require("./core.ts")
// require("./nodes.ts")
// require("./util.ts")


//exports to multiple environments

var define = define || undefined;

if(typeof define === 'function' && define.amd){ //AMD
    define(function () { return Gentyl; });
} else if (typeof module !== 'undefined' && module.exports){ //node
    module.exports = Gentyl;
} else { //browser
    //use string because of Google closure compiler ADVANCED_MODE
    /*jslint sub:true */
    this['gentyl'] = Gentyl;
}
