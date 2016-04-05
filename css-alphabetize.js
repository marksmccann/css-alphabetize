/**
 * alphabetizes css declarations
 * @author: Mark McCann <www.markmccann.me>
 * @license: MIT
 */

var cssAlphabetize = (function(){

    /**
     * extends object
     */
    var extend = function () {
        var a = arguments;
        for( var i = 1; i < a.length; i++ )
            for( var key in a[i] )
                if(a[i].hasOwnProperty(key))
                    a[0][key] = a[i][key];
        return a[0];
    }

    /**
     * splits a declaration into separate parts and
     * determines if is any special case
     */
    var Declaration = function(line) {
        this.line = line.trim();
        this.property = this.line.replace( /^[_\*]?(?:-\w*-(?:(?:osx)-)?)?([^:]*):.*/, '$1' );
        this.original = this.line.replace( /^[_\*]?((?:-\w*-(?:(?:osx)-)?)?[^:]*):.*/, '$1' );
        this.value = this.line.replace( /[^:]*: *([^;'"(]*(\(["']?[^'")]*['"]?\)|["'][^'"]*['"])?[^;'"(]*);.*/, '$1' );
        this.comment = /^\/\*((?!\*\/)(.|\n))*\*\/$/.test(this.line);
        this.hacked = /^[_\*]|(\\9|\\0)+;/.test(this.line);
        this.vendor = /^-\w*-/.test(this.line);
        return this;
    }

    /**
     * default settings for alphabetizer
     */
    var defaults = {
        delimeter: '```',
        ascending: true
    }

    /**
     * return the alphabetize function
     */
    return function( styles, options ) {
        // set alphabetizer settings
        var settings = extend( defaults, options || {} );
        var direction = settings.ascending ? 1 : -1;
        // the contents of each set of brackets that does 
        // not contain a set of brackets
        return styles.replace(/{([^{}]*(["'][^\"']*['"])[^{}]*)}/g, function( match, contents ) {
            console.log(
                contents
                // make sure there is a final semicolon 
                .replace(/([)'"%\w\d])((?:\s*\/\*((?!\*\/)(.|\n))*\*\/)*\s*)$/, '$1;$2')
                // add a unique delimeter after every declaration and comment          
                .replace(/([\w\s-]*:([^;'"(])*(\(["']?[^'")]*['"]?\)|["'][^'"]*['"])*([^;])*;( *\/\*((?!\*\/)(.|\n))*\*\/)*|\s*\/\*((?!\*\/)(.|\n))*\*\/)/g, '$1'+settings.delimeter )
            );
            return '{' + contents
                // make sure there is a final semicolon 
                .replace(/([)'"%\w\d])((?:\s*\/\*((?!\*\/)(.|\n))*\*\/)*\s*)$/, '$1;$2')
                // add a unique delimeter after every declaration and comment          
                .replace(/([\w\s-]*:([^;'"(])*(\(["']?[^'")]*['"]?\)|["'][^'"]*['"])*([^;])*;( *\/\*((?!\*\/)(.|\n))*\*\/)*|\s*\/\*((?!\*\/)(.|\n))*\*\/)/g, '$1'+settings.delimeter )
                // remove final delimeter to avoid creating empty element in array
                .replace(new RegExp(settings.delimeter+'\\s*$'), '')
                // split string into array by the unique delimeter
                .split(settings.delimeter)
                // sort the array alphabetically
                .sort(function( a, b ){
                    // initialize declartions to compare values
                    a = new Declaration(a); b = new Declaration(b);
                    // comment -vs- comment
                    if( a.comment && b.comment ) return 0;
                    // comment -vs- non-comment
                    if((!a.comment && b.comment) 
                    || (a.comment && !b.comment)) return 1;
                    // if the properties match
                    if( a.property == b.property ) {
                        // standard -vs- hack (width:100% -> _width:100%)
                        if(!a.hacked && b.hacked) return -1;
                        if(!b.hacked && a.hacked) return 1;
                        // standard -vs- vendor (border-radius -> -webkit-border-radius)
                        if(!a.vendor && b.vendor) return 1;
                        if(!b.vendor && a.vendor) return -1;
                        // standard -vs- identical (background -> background)
                        if(a.value > b.value) return 1 * direction;
                        if(b.value > a.value) return -1 * direction;
                        // vendor -vs- vendor (-webkit-border-radius -> -webkit-border-radius)
                        if(a.original > b.original) return 1 * direction;
                        if(b.original > a.original) return -1 * direction;
                    }
                    // standard -vs- standard
                    if( a.property < b.property ) return -1 * direction;
                    if( a.property > b.property ) return 1 * direction;
                    // they are equivalent
                    return 0;
                })
                // rejoin the array back into a string
                .join('')
                // add ending space if content present
                + ( /\w|\//.test(contents) ? /(\s*)$/.exec(contents)[0] : '' )
                // add the closing bracket back
                + '}';
        });

    }

})();