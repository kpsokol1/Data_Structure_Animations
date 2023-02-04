(function() {
    if ( typeof Object.id != "undefined" ) return;

    var id = 0;

    Object.id = function(o) {
        if ( typeof o.__uniqueid != "undefined" ) {
            return o.__uniqueid;
        }

        Object.defineProperty(o, "__uniqueid", {
            value: ++id,
            enumerable: false,
            // This could go either way, depending on your 
            // interpretation of what an "id" is
            writable: false
        });

        return o.__uniqueid;
    };
})();