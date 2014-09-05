( function( exports ) {

    /**
     * @class
     * @param params
     * @constructor
     */
    function BulkLoader( params ) {
        this.params = params;
        this._ids = [];
        this.results = {};
        this._objects = []; // GC対策
        this.cache = {};
        var self = this;
        this._handler = function( e ) {
            self._onLoadHandler( e );
        };
        for ( var id in this.params ) {
            this._ids.push( id );
            var param = this.params[id];
            var object = null;

            switch ( param.type ) {
                case "image":
                    object = new Image();
                    object.src = param.url;
                    break;
                case "audio":
                case "music":
                    object = new Audio( param.url, Audio.MUSIC );
                    break;
                case "se":
                    object = new Audio( param.url, Audio.SE );
                    break;
            }
            object.id = id;
            object.onload = this._handler;
            this._objects.push( object );
        }
    }
    BulkLoader.prototype = {};

    BulkLoader.prototype._onLoadHandler = function( e ) {
        var id = e.target.id;
        e.target.onload = null;
        this.results[id] = e.target;
        this._ids.splice( this._ids.indexOf( id ), 1 );
        if ( this._ids.length > 0 ) {
            return;
        }
        // complete
        this._handler = null;
        if ( this.onload !== null ) this.onload();
    };

    BulkLoader.prototype.getBitmapData = function( id ) {
        if(typeof this.cache[id] === "undefined" &&
            typeof this.results[id] !== "undefined") {
            this.cache[id] = new BitmapData(this.results[id]);
            this.results[id] = null;
        }
        return this.cache[id];
    };

    BulkLoader.prototype.get = function( id ) {
        return this.results[id];
    };

    BulkLoader.prototype.onload = null;

    exports.BulkLoader = BulkLoader;

} )( this );

( function( exports ) {
    var Observer = function () {
        this.listeners = {};
    };

    Observer.prototype = {
        addEventListener: function( type, listener ) {
            var listeners = this.listeners;
            if (!listeners[type]) {
                listeners[type] = [];
            }
            listeners[type].push(listener);
        },
        removeEventListener:function (type, listener) {
            var listeners = this.listeners;
            if (listeners[type]) {
                var i;
                var len = listeners[type].length;
                for (i = len - 1; i >= 0; i--) {
                    var arr = listeners[type][i];
                    if (arr[0] === listener) {
                        listeners[type].splice(i, 1);
                    }
                }
            }
        },
        dispatchEvent: function(event) {
            var listeners = this.listeners;
            var newEvent = {};
            newEvent.type = event.type;
            newEvent.target = this;
            if (listeners[newEvent.type]) {
                var i;
                var len = listeners[newEvent.type].length;
                for (i = 0; i < len; i++) {
                    var listener = listeners[newEvent.type][i];
                    listener.call(this, newEvent);
                }
            }
        }
    };
    
    exports.Observer = Observer;
    
} )( this );




