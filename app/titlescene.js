define( "app/titlescene", ["app/lib", "app/config", "tweenjs"], function( lib, config ) {

    //ゲーム開始画面-----------

    var game, stage, root;

    function initializeScene( _game ) {
        
        game = _game;
        stage = game.getCurrentStage();
        root = game.getCurrentRoot();
        
        //TITLEのオブジェクト配置
        SceneArrange = {
            title_bg: {
                x: 0,
                y: 0,
            },
            start_easy: {
                type: "mybutton",
                x: config.Arrange.CENTER_X,
                y: 600,
                level: 0
            },
            start_normal: {
                type: "mybutton",
                x: config.Arrange.CENTER_X,
                y: 700,
                level: 1
            },
            start_hard: {
                type: "mybutton",
                x: config.Arrange.CENTER_X,
                y: 800,
                level: 2
            }
        };
        lib.ImageSpriteArranger.arrange( SceneArrange, game );

        
        var btnStartEasy = root.getChildByName( config.IMG.START_EASY );
        btnStartEasy.addEventListener( "mybutton_tapped", gotoGameScene);
        
        var btnStartNormal = root.getChildByName( config.IMG.START_NORMAL );
        btnStartNormal.addEventListener( "mybutton_tapped", gotoGameScene);

        var btnStartHard = root.getChildByName( config.IMG.START_HARD );
        btnStartHard.addEventListener( "mybutton_tapped", gotoGameScene);
        
        //BGM再生を開始
        game.changeBGM(config.MUSIC.BGM_TITLE);

        //Frame毎にcreatejs.Tween.tick()を呼んでTweenアニメーションを実行。
        root.addEventListener("enterFrame", function () {
            createjs.Tween.tick(1000/60);
        }, false);

        //パズルピースのアニメーションを開始。
        animatePieces();
    }
    
    function animatePieces(){
        var pos = [{x: 40, y: 120}, {x: 470, y: 120}, {x: 470, y: 340}, {x: 40, y: 340}];
        var delay = 1072;
        var bitmap;
        var ix = root.getChildIndex(root.getChildByName( config.IMG.START_EASY ));
        var bmd = game.loader.getBitmapData(config.IMG.PIECE);
        
        for (var i = 0; i < 3; i++){
            bitmap = new Bitmap(bmd);
            root.addChildAt( bitmap, ix );
            bitmap.scaleX = 0.4;
            bitmap.scaleY = 0.4;
            bitmap.x = pos[i].x;
            bitmap.y = pos[i].y;
            
            createjs.Tween.get(bitmap, {loop:true})
                    .wait(delay*(2-i))
                    .to({x:pos[(i+1) % 4].x, y:pos[(i+1) % 4].y}, delay, createjs.Ease.cubicOut)
                    .wait(delay*2)
                    .to({x:pos[(i+2) % 4].x, y:pos[(i+2) % 4].y}, delay, createjs.Ease.cubicOut)
                    .wait(delay*2)
                    .to({x:pos[(i+3) % 4].x, y:pos[(i+3) % 4].y}, delay, createjs.Ease.cubicOut)
                    .wait(delay*2)
                    .to({x:pos[i].x, y:pos[i].y}, delay, createjs.Ease.cubicOut)
                    .wait(delay*i);
        }
    }
    
    function gotoGameScene(event){
        var level = event.target.level;
        root.removeAllEventListeners();
        
        var options = {
            level:level, 
            rows: level+3, 
            cols: level+3, 
            shuffleCount: (level+1) * 30,
            timeLimit: 60
        };
        game.loadScene( config.SCENE.GAME, options );
    }
    
    return initializeScene;
});


