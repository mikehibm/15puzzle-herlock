define("app/gamescene", ["app/lib", "app/config", "app/stage", "app/piece", "tweenjs"], function (lib, config, Stage, PieceFactory) {

    var STATE = {
        LOADING: "loading",
        PLAYING: "playing",
        COMPLETE: "complete",
        TIMEUP: "timeup"
    };

    //ゲーム画面-----------
    var game, stage, root, frame = 0, state, options;

    function initializeScene(_game, _options) {
        
        game = _game;
        options = _options;
        stage = game.getCurrentStage();
        state = STATE.LOADING;
        root = game.getCurrentRoot();
        
        //Gameのオブジェクト配置
        SceneArrange = {
            bg: {
                x: 0,
                y: 0
            },
            cloud1:{
                visible: false  
            },
            cloud2:{
                visible: false  
            },
            cloud3:{
                visible: false
            },
            timebar_bg02: {
                x: config.Arrange.CENTER_X,
                y: game.top_offset + 100
            },
            timebar: {
                x: config.Arrange.CENTER_X,
                y: game.top_offset + 110
            },
            timebar_bg01: {
                x: config.Arrange.CENTER_X,
                y: game.top_offset + 100
            },
            btn_home: {
                type: "mybutton",
                x: 14,
                y: game.top_offset + 14
            },
            restart: {
                type: "mybutton",
                x: config.Arrange.CENTER_X,
                y: 880
            }
        };
        lib.ImageSpriteArranger.arrange( SceneArrange, game );

        //時間表示用
        root.score = lib.ScoreSpriteFactory.create(game.loader.getBitmapData(config.IMG.SCORE), 42, 42, 4);
        root.score.setNumber(0);
        root.score.x = 400;
        root.score.y = game.top_offset + 40;
        root.addChild(root.score);
        
        //TOPに戻るボタン
        var btnHome = root.getChildByName( config.IMG.BTN_HOME );
        btnHome.addEventListener( "mybutton_tapped", function( event ) {
            gotoTitleScene();
        }, false );

        //Restartボタン
        var btnRestart = root.getChildByName( config.IMG.RESTART );
        btnRestart.addEventListener( "mybutton_tapped", function( event ) {
            startShuffle();
        }, false );
        

        //BGM再生を開始
        game.changeBGM(config.MUSIC.BGM_GAME);

        root.puzzle = new Stage(options);
        root.ROWS = root.puzzle.rows;
        root.COLS = root.puzzle.cols;
        root.START_X = game.width*0.08;
        root.PIECE_W = (game.width - (root.START_X*2))/root.COLS;
        root.PIECE_H = (game.width - (root.START_X*2))/root.ROWS;
        root.START_Y = (game.height - (root.PIECE_H*root.ROWS)) / 2;
        
        root.calcPiecePos = function(row, col){
            return { x: col * (root.PIECE_W) + root.START_X,
                     y: row * (root.PIECE_H) + root.START_Y };
        };
        
        // ピースグループを作成
        root.pieceGroup = new Sprite();
        root.addChild(root.pieceGroup);
 
        // ピースを作成
        showPieces(root.puzzle, options.level);
        
        //時間を示すバーの生成
        root.timeBar = root.getChildByName(config.IMG.TIMEBAR);
        root.pastTime = 1.0 / (root.puzzle.timeLimit * 60 );
        
        //シャッフルよりも先に最初の描画処理を走らせるためにsetTimeoutが必要。
        setTimeout(function(){
            //シャッフルしてゲーム開始。
            startShuffle();
    
            //タイムのカウントを開始。
            root.addEventListener("enterFrame", update);
        }, 50);
        
        showClouds();
    }
    
    function startShuffle(){
        if (root.timeUpLabel){
            root.removeChild(root.timeUpLabel);
            root.timeUpLabel = null;
        }
        state = STATE.LOADING;
        root.puzzle.shufflePieces();
        updatePieces();
        frame = 0;
        root.timeBar.scaleX = 1;
        state = STATE.PLAYING;
    }

    function showPieces(puzzle, level){
        var bmd = game.loader.getBitmapData(config.IMG.PIECE);
        var sprite, n = 0;
        
        for (var i = 0; i < root.ROWS; ++i){
            for (var j = 0; j < root.COLS; ++j){
                var number = puzzle.pieces[i][j];
                var isBlank = (number == puzzle.pieceNum);
            
                var piece = PieceFactory.create(bmd, number, isBlank, root.PIECE_W, root.PIECE_H);
                root.pieceGroup.addChild(piece);
                piece.name = "P" + number;
                var pos = root.calcPiecePos(i, j);
                piece.x = pos.x;
                piece.y = pos.y;
                piece.addEventListener("piece_touch", onTouchPiece);
            }
        }
    }

    function onTouchPiece(e) {
        if (state !== "playing") return;

        var sound;
        e.moved = root.puzzle.swapPieces(e.number);
        if (e.moved){
            //動いた時の効果音を再生
            sound = game.loader.get(config.SE.CORRECT);
            sound.play();
            
            updatePieces();
            if (root.puzzle.checkClear()){
                setTimeout(onClear, 400);
            }
        } else {
            //動かせなかった時の効果音を再生
            sound = game.loader.get(config.SE.NG);
            sound.play();
        }
    }
    

    
    function findPieceByNum(num){
        var piece = root.pieceGroup.getChildByName("P" + num);
        return piece;
    }
    
    function update() {
        if (state === STATE.TIMEUP) return;

        //Frame毎にcreatejs.Tween.tick()を呼んでTweenアニメーションを実行。
        createjs.Tween.tick(1000/60);

        if (state !== STATE.PLAYING) return;
        
        //時間表示を更新
        root.time = ( (frame / 60) * 100) |0;
        root.score.setNumber(root.time);
        frame++;
        
        //制限時間のバーを更新。
        if (root.timeBar.scaleX - root.pastTime <= 0){
            onTimeUp();
        } else {
            root.timeBar.scaleX -= root.pastTime;
        }
    }

    function updatePieces(){
        var piece;
        for (var i = 0; i < root.ROWS; ++i) {
            for (var j = 0; j < root.COLS; ++j) {
                var num = root.puzzle.getNumber(i, j);
                piece = findPieceByNum(num);
                var new_pos = root.calcPiecePos(i, j);
                if (piece.x != new_pos.x || piece.y != new_pos.y){
                    createjs.Tween.get(piece, {loop:false})
                            .to({x:new_pos.x, y:new_pos.y}, 280, createjs.Ease.quadOut);
                }
            }
        }        
    }
    
    function showClouds(){
        var cloud1 = root.getChildByName( config.IMG.CLOUD1 );
        cloud1.y = game.height * (0.1 + Math.random()*0.1);
        cloud1.visible = true;
        animateCloud(cloud1, 5000);

        var cloud2 = root.getChildByName( config.IMG.CLOUD2 );
        cloud2.y = game.height * (0.2 + Math.random()*0.1);
        cloud2.visible = true;
        animateCloud(cloud2, 4000);

        var cloud3 = root.getChildByName( config.IMG.CLOUD3 );
        cloud3.y = game.height * (0.3 + Math.random()*0.1);
        cloud3.visible = true;
        animateCloud(cloud3, 3000);
    }
    
    function animateCloud(cloud, time){
        cloud.x = cloud.width + game.width * (1 + Math.random()*0.2);
        createjs.Tween.get(cloud, {loop:true})
            .to({x:-cloud.width}, time);
    }
    
    function onClear(){
        //時間表示・制限時間バーの更新を停止。
        state = STATE.COMPLETE;
        
        //BGM再生を停止
        game.changeBGM("");
        
        //クリアの効果音を再生
        sound = game.loader.get(config.SE.CLEAR);
        sound.play();

        // createjs.Tween.get(root.pieceGroup, {loop:false})
        //         .to({ x: game.width*1.2}, 2000, createjs.Ease.quadIn);

        gotoResultScene();
    }
    
    function onTimeUp(){
        state = STATE.TIMEUP;
        root.score.setNumber(root.puzzle.timeLimit * 100);
        root.timeBar.scaleX = 0;
        
        var bmd = game.loader.getBitmapData(config.IMG.TIMEUP);
        root.timeUpLabel = lib.ImageSpriteFactory.create( bmd );
        root.timeUpLabel.x = game.width/2 - root.timeUpLabel.width/2;
        root.timeUpLabel.y = game.height/2 - root.timeUpLabel.height/2;
        root.addChild(root.timeUpLabel);

    }

    function gotoTitleScene(){
        root.removeAllEventListeners();
        game.loadScene( config.SCENE.TITLE );
    }
    
    function gotoResultScene(){
        root.removeAllEventListeners();
        options.time = root.time;
        game.overlayScene(config.SCENE.RESULT, options);
    }
    
    return initializeScene;
});





