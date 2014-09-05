define( "app/lib", ["app/config", "app/mybutton", "lib/common"], function( config, MyButtoFactory ) {

    //Builtinクラスは継承出来ないのでFactoryを使用
    var ImageSpriteFactory = {
        /**
         * BitmapDataと描画用矩形を渡して生成
         * @param bmd
         * @param frames
         * @returns {Sprite}
         */
        create: function( bmd, frames ) {
            var sprite = new Sprite();
            sprite.bmd = bmd;
            sprite.frames = frames || [];
            sprite.frameIndex = 0;
            Util.mixin( sprite, this.methods );
            sprite.gotoFrameIndex( 0 );
            return sprite;
        },
        //付加するメソッド
        methods: {
            gotoFrameIndex: function( frameIndex ) {
                this.frameIndex = frameIndex;
                if ( typeof this.frames[frameIndex] !== "undefined" ) {
                    if ( this.frames[frameIndex] instanceof Rectangle ) {
                        this.frames[frameIndex] = new Bitmap( this.bmd, false, false, this.frames[frameIndex] );
                    }
                    else if( !this.frames[frameIndex] instanceof Bitmap ) {
                        throw new Error( "invalid." );
                    }
                } else if ( frameIndex === 0 ) {
                    this.frames[frameIndex] = new Bitmap( this.bmd );
                } else {
                    throw new RangeError( "invalid range." );
                }
                this.removeChildAt( 0 );
                this.addChild( this.frames[frameIndex] );
            },
            //使わなくなった時にいらないものを捨てる処理
            clear: function() {
                if(typeof this.enterFrameHandler === "function") {
                    this.removeEventListener( Event.ENTER_FRAME, this.enterFrameHandler, false );
                }
                this.enterFrameHandler = null;
                this.frames.length = 0;
                this.bmd = null;
                this.pon = null;
                
                Util.clearAllChildren(this);
            },
            //コマアニメ(speedは1コマの描画フレーム数)
            animate: function( speed, callback ) {
                var cnt = 0;
                var nFrame   = this.frameIndex;
                var frameMax = this.frames.length - 1;
                var waitCnt = 61 - speed;
                var self = this;

                var enterFrameHandler = function() {
                    cnt++;
                    if ( cnt % waitCnt === 0 ) {
                        nFrame++;
                        if ( nFrame > frameMax ) {//保持しているコマ数完走
                            self.removeEventListener( Event.ENTER_FRAME, enterFrameHandler, false );
                            if(typeof callback === "function") {
                                callback();
                            }
                            self = null;
                        }
                        else {//コマを進める
                            self. gotoFrameIndex(nFrame);
                        }
                    }
                };

                if(typeof this.enterFrameHandler === "function")
                    this.removeEventListener( Event.ENTER_FRAME, this.enterFrameHandler , false );
                
                this.enterFrameHandler = enterFrameHandler;
                
                this.addEventListener( Event.ENTER_FRAME, enterFrameHandler, false );
            }
        }
    };

    //スコア表示生成
    //Sprite内に桁数分の画像スプライトを保持し、数値に合わせて制御する
    var ScoreSpriteFactory = {
        create: function( bmd, width, height, length ) {
            var frames = [],
                i;
            var container = new Sprite();
            var BM_WIDTH = 32;
            var BM_HEIGHT = 32;

            for ( i = 0; i < 10; i++ ) {
                frames.push( new Rectangle( BM_WIDTH * i, 0, BM_WIDTH, BM_HEIGHT ) );
            }
            
            for ( i = 0; i < length; i++ ) {
                var sprite = ImageSpriteFactory.create( bmd, frames.concat() );
                sprite.scaleX = width / BM_WIDTH;
                sprite.scaleY = height / BM_HEIGHT;
                sprite.x = width * i + (i >= length-2 ? width/2 : 0);
                sprite.scaleX = 
                sprite.name = "index_" + String( i );
                container.addChild( sprite );
            }

            container.length = length;

            Util.mixin( container, this.methods );

            return container;

        },
        methods: {
            //数字の描画(とりあえずコレを呼べば良い)
            setNumber: function( num ) {
                var self = this;
                Util.fillZero( num, this.length ).split("").forEach( function( n, index ) {
                    self.setNumberAt( n, index );
                } );
            },
            //特定の桁数を描画
            setNumberAt: function( num, index ) {
                num = String( num ).substr( 0, 1 );
                var numberSprite = this.getChildByName( "index_" + String( index ) );
                numberSprite.gotoFrameIndex( parseInt( num ) );
            },
            clear: function() {
                Util.clearAllChildren(this);
            }
        }
    };

    var DisplayContainerMixin = {
        getChildIndexByName: function( name ) {
            return this.getChildIndex( this.getChildByName( name ) );
        },
        insertBeforeByName: function( child, beforeName ) {
            return this.addChildAt( child, this.getChildIndexByName( beforeName ) );
        }
    };

    var Util = {
        //ucFirst: function( str ) {
        //    str += '';
        //    var f = str.charAt( 0 ).toUpperCase();
        //    return f + str.substr( 1 );
        //},
        clearAllChildren: function(target) {
            var len = target.numChildren;
            var removed;
            for(var i = 0; i < len; i++) {
                removed = target.removeChildAt(0);
                if(typeof removed.clear === "function") removed.clear();
            }
        },
        //lcFirst: function( str ) {
        //    str += '';
        //    var f = str.charAt( 0 ).toLowerCase();
        //    return f + str.substr( 1 );
        //},
        fillZero: function( value, length ) {
            if ( String( value ).length >= length )
                return String( value );
            var numbers = [];
            numbers.length = ( length + 1 ) - value.toString().split( '' ).length;
            return numbers.join( '0' ) + value;
        },
        expressions: {},
        expression: function( args, body ) {
            var key = args + body;
            if ( typeof this.expressions[key] !== "function" ) {
                this.expressions[key] = new Function( args, "return " + body + ";" );
            }
            return this.expressions[key];
        },
        mixin: function( target, imports ) {
            for ( var method in imports ) {
                target[method] = imports[method];
            }
        }
    };

    //表示オブジェクトの配置用
    var ImageSpriteArranger = {
        parseConfigValue: function( value, sprite, property, stage ) {
            if (property === "type") return;
            
            switch ( typeof value ) {
                case "number":
                    sprite[property] = value;
                    break;
                case "string":
                    sprite[property] = Util.expression( "self, stage", value )( sprite, stage );
                    break;
                case "function":
                    sprite[property] = value( sprite, property );
                    break;
            }
        },
        arrange: function( config, game ) {
            var sprite;
            var stage = game.getCurrentStage();
            var root = game.getCurrentRoot();
            var loader = game.loader;

            for ( var name in config ) {
                var bmd = loader.getBitmapData( name );
                
                var props = config[name];
                if (props.type === "mybutton"){
                    sprite = MyButtoFactory.create(bmd);
                } else {
                    sprite = ImageSpriteFactory.create( bmd );
                }
                
                for ( var property in props ) {
                    this.parseConfigValue( props[property], sprite, property, stage );
                }
                sprite.name = name;
                root.addChild( sprite );
            }
        }
    };
    
    /**
     * ゲームのシーン及びstage管理
     */
    var Game = function( ) {
        this.initialize.apply( this, arguments );
    };

    Game.PRELOADED = "preloaded";
    //Game.SCENE_UNLOAD = "unload";
    //Game.SCENE_LOADED = "loaded";
    
    //通知用の仕組みを継承する
    Game.prototype = new Observer();

    /**
     * 一回きりのイベントを設定
     * @param type
     * @param listener
     * @param useCapture
     */
    Game.prototype.addEventListenerOnce = function( type, listener, useCapture ) {
        var self = this;
        var handler = function( event ) {
            self.removeEventListener( type, handler, useCapture );
            listener.call( self, event );
            self = null;
        };
        this.addEventListener( type, handler, useCapture );
    };

    /**
     * 初期化
     * @param width
     * @param height
     */
    Game.prototype.initialize = function( width, height ) {
        this.score = 0;
        this.width = width;
        this.height = height;
        this.scenes = {};
        this.currentSceneName = "";
        this.isOverlay = false;
        this.cur_bgm = "";
        
        this.top_offset = (height - Math.round(width / window.innerWidth * window.innerHeight) )/2;
    };

    /**
     * 素材の読み込みを行い完了したらイベントを通知する
     * @param config
     */
    Game.prototype.preload = function( config ) {
        var loader = new BulkLoader( config );
        var self = this;
        loader.onload = function( ) {
            self.dispatchEvent( new Event( Game.PRELOADED ) );
        };
        this.loader = loader;
    };
    
    /**
     * Gameの画面を管理下に追加する
     * @param name
     * @param scene
     */
    Game.prototype.addScene = function( name, scene ) {
        this.scenes[name] = scene;
    };
    
    /**
     * 画面の描画を保持したまま、別の画面を呼び出す
     * @param name
     */
    Game.prototype.overlayScene = function( name, options ) {
        this.isOverlay = true;
        this.loadScene( name, options );
    };
    
	Game.prototype.layer = null;
	
    /**
     * 画面を呼び出す
     * @param name
     */
    Game.prototype.loadScene = function( name, options ) {
        
        if ( typeof this.scenes[name] === "undefined" ) {
            throw new Error( "no scene:" + name );
        }
		
        //Layerが無ければ初期化
        if(!this.layer) {
            var stage = new Stage( this.width, this.height );
            this.layer = new Layer( stage );
            this.layer.scaleMode = "noBorder";
            window.addLayer( this.layer );
            this.stage = stage;
            Util.mixin( this.stage, DisplayContainerMixin );
        }
		
        //this.dispatchEvent( new Event( Game.SCENE_UNLOAD ) );
        
        if ( !this.isOverlay ) {
            Util.clearAllChildren(this.stage);
        }
        this.isOverlay = false;
        
        this.currentSceneName = name;
        var root = this.stage.getChildByName(name);
        if (!root){
            root = new Sprite();
            root.name = name;
            this.stage.addChild(root);
        }

        //シーンの呼び出し
        this.scenes[name]( this, options );

        //this.dispatchEvent( new Event( Game.SCENE_LOADED ) );

    };
    
    /**
     * 現在のStageを呼び出す
     */
    Game.prototype.getCurrentStage = function( ) {
        return this.stage;
    };

    Game.prototype.getCurrentRoot = function( ) {
        if (!this.currentSceneName){ 
            throw new Error( "No scene has been loaded yet." );
        }
        return this.stage.getChildByName(this.currentSceneName);
    };

    Game.prototype.changeBGM = function(new_bgm){
        var bgm;
        if (this.cur_bgm !== new_bgm){
            if (this.cur_bgm){
                bgm = this.loader.get(this.cur_bgm);
                bgm.stop();
            }

            if (new_bgm){
                bgm = this.loader.get(new_bgm);
                bgm.volume = 0.5;
                bgm.loop = true;
                bgm.play();        
            }
            this.cur_bgm = new_bgm;
        }
    };

    return {
        ImageSpriteFactory: ImageSpriteFactory,
        ImageSpriteArranger: ImageSpriteArranger,
        Game: Game,
        ScoreSpriteFactory: ScoreSpriteFactory
    };
    
} );