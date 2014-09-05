define( "app/resultscene", ["app/lib", "app/config", "app/ranking"], function( lib, config, Ranking ) {

    //結果画面-----------
    var game, stage, root, options;


    function initializeScene( _game, _options ) {

        game = _game;
        options = _options;
        stage = game.getCurrentStage();
        root = game.getCurrentRoot();

        //Resultのオブジェクト配置
        SceneArrange = {
            black: {
                width: config.Arrange.STAGE_WIDTH,
                height: config.Arrange.STAGE_HEIGHT,
                alpha: 0
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
        
        
        //TOPに戻るボタン
        var btnHome = root.getChildByName( config.IMG.BTN_HOME );
        btnHome.addEventListener( "mybutton_tapped", function( event ) {
            console.log("btnHome tapped.");
            gotoTitleScene();
        }, false );

        //Restartボタン
        var btnRestart = root.getChildByName( config.IMG.RESTART );
        btnRestart.addEventListener( "mybutton_tapped", function( event ) {
            console.log("btnRestart tapped.");
            gotoGameScene(options);
        }, false );

        //スコアの表示
        showScore();

        //Frame毎にcreatejs.Tween.tick()を呼んでTweenアニメーションを実行。
        root.addEventListener("enterFrame", function () {
            createjs.Tween.tick(1000/60);
        }, false);
        
        //背景を徐々に暗くする。
        createjs.Tween.get(root.getChildByName(config.IMG.BLACK), {loop:false})
                .to({alpha: 0.65}, 1000, createjs.Ease.cubicOut);

    }

    function gotoTitleScene(){
        root.removeAllEventListeners();
        game.loadScene( config.SCENE.TITLE );
    }
    
    function gotoGameScene(options){
        root.removeAllEventListeners();
        game.loadScene( config.SCENE.GAME, options );
    }
    
    //スコアの表示
    function showScore() {
        var HIGHSCORE_Y = game.height / 2 - 290;
        var RANKING_Y = game.height / 2 - 180;
        var HIGHSCORE_COLOR = 0xFF8888;

        var scoreBmd = game.loader.getBitmapData( config.IMG.SCORE );
        var scoreLabel = lib.ScoreSpriteFactory.create( scoreBmd, 42, 42, 4 );
        scoreLabel.setNumber(options.time);
        scoreLabel.x = 220;
        scoreLabel.y = HIGHSCORE_Y - 26;
        root.addChild(scoreLabel);
        
        var ranking = new Ranking();
        var level = options.level+"";
        var name = "";
        var time = options.time -0;
        ranking.submit(level, name, time, function(ranking){
            console.log("Ranking: ", JSON.stringify(ranking));

            var is_best = ranking.rank <= 1;
            if (is_best){
                var highScoreLabel = new TextField();
                highScoreLabel.autoSize = TextFieldAutoSize.CENTER;
                highScoreLabel.defaultTextFormat = new TextFormat( null, 72 );
                highScoreLabel.textColor = HIGHSCORE_COLOR;
                highScoreLabel.x = game.width * 2;
                highScoreLabel.y = HIGHSCORE_Y;
                highScoreLabel.text = "NEW HIGH SCORE!!";
                stage.addChild( highScoreLabel );
                
                createjs.Tween.get(highScoreLabel, {loop:true})
                    .to({x: game.width/2-highScoreLabel.width/2}, 1000, createjs.Ease.quadOut)
                    .to({alpha: 0}, 500, createjs.Ease.cubicOut)
                    .to({alpha: 1},1000, createjs.Ease.cubicOut)
                    .wait(500)
                    .to({x: game.width*-2-highScoreLabel.width/2}, 1000, createjs.Ease.quadIn)
                    .to({x: game.width*2}, 1);
            }
                
            console.log("Ranking: ", JSON.stringify(ranking));
                
            for (var i = 0; i < 10; ++i){
                var lblNum = new TextField();
                lblNum.autoSize = TextFieldAutoSize.RIGHT;
                lblNum.defaultTextFormat = new TextFormat( null, 38, null, true );
                lblNum.textColor = 0xFFFFFF;
                lblNum.text = (i+1) + ". ";
                lblNum.x = game.width/2 - 280 + ((i / 5)|0) * 270;
                lblNum.y = RANKING_Y + (i % 5)*50;
                root.addChild(lblNum);

                if (ranking.top10[i] && ranking.top10[i].score){
                    var sc = Math.round(ranking.top10[i].score) +"";
                    sc = (sc.substr(0, sc.length-2) || "0") + '"' + sc.substr(sc.length-2, 2);

                    var label = new TextField();
                    label.autoSize = TextFieldAutoSize.LEFT;
                    label.defaultTextFormat = new TextFormat( null, 38, null, true );
                    label.textColor = 0xFFFFFF;
                    label.text = sc;
                    label.x = game.width/2 - 166 + ((i / 5)|0) * 270;
                    label.y = RANKING_Y + (i % 5)*50;
                    root.addChild(label);
                    
                    //Top 10に今回のスコアが入っている時は赤色で点滅表示。
                    if (ranking.rank == i+1){
                        lblNum.textColor = HIGHSCORE_COLOR;
                        createjs.Tween.get(lblNum, {loop:true})
                            .to({alpha: 0}, 500, createjs.Ease.cubicOut)
                            .to({alpha: 1},1000, createjs.Ease.cubicOut);
    
                        label.textColor = HIGHSCORE_COLOR;
                        createjs.Tween.get(label, {loop:true})
                            .to({alpha: 0}, 500, createjs.Ease.cubicOut)
                            .to({alpha: 1},1000, createjs.Ease.cubicOut);
                    }
                }
            }
        });
    }

    return initializeScene;
});






