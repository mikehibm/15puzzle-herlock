var BASE_URL = ".";

( function( ) {
   "use strict";

    var loader = new Script( BASE_URL + "/lib/requirejs/require.min.js" );
    
    loader.onload = function() {
        console.log("require.js loaded.");

        require.config( {
            baseUrl: BASE_URL,
            paths: {
                app: "app",
                lib: "lib",
                'tweenjs' : 'lib/TweenJS/tweenjs-0.4.1.min'            
            }
        } );
        
        require( ["app/main"], function(main){
            main();
        } );
        
    };
	
} )();






