
///compile this file with --outFile for commonjs module environment

/// <reference path="../typings/index.d.ts"/>
/// <reference path="util.ts"/>
/// <reference path="form.ts"/>
/// <reference path="core.ts"/>
/// <reference path="io.ts"/>
/// <reference path="reconstruction.ts"/>
/// <reference path="terminal.ts"/>

/// <reference path="inventory/io.ts"/>
/// <reference path="inventory/select.ts"/>
/// <reference path="inventory/resolver.ts"/>

/// <reference path="aliases.ts"/>


(function(){
    var root = this

    var define = define || undefined;

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Gentyl;
        }
        exports.Gentyl = Gentyl;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('Gentyl', (function() { return root.Gentyl = Gentyl; })() );
    } else {
        root.Gentyl = Gentyl;
    }
}).call(this)
