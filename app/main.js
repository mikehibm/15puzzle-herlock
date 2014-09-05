/*
 * main.js
 */


define( "app/main", [
        "app/lib",
        "app/config",
        "app/titlescene",
        "app/gamescene",
        "app/resultscene"
], function ( lib, config, titleScene, gameScene, resultScene ) {

    //ゲームの初期化と開始画面の呼び出し

    function initialize() {
        var game = new lib.Game( 640, 1136 );
        game.addScene( config.SCENE.TITLE, titleScene );
        game.addScene( config.SCENE.GAME, gameScene );
        game.addScene( config.SCENE.RESULT, resultScene );
        
        game.addEventListener( lib.Game.PRELOADED, preloadedHandler );
        game.preload( config.materials );
    }

    function preloadedHandler( event ) {
        event.target.removeEventListener( lib.Game.PRELOADED, preloadedHandler );
        event.target.loadScene( config.SCENE.TITLE );
    }

    return initialize;

} );





