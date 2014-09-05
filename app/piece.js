define( "app/piece", [], function() {

    //SpriteはBuiltinクラスで継承出来ないため、Factoryパターンを使用
    var PieceFactory = {

        create: function(bmd, number, isBlank, w, h ) {
            var sprite = new Sprite();

            if (!isBlank){
                var bitmap = new Bitmap( bmd );
                bitmap.scaleX = (w*0.95) / bitmap.width;
                bitmap.scaleY = (h*0.95) / bitmap.height;
                sprite.addChild( bitmap );
                
                var shadow = new TextField();
                shadow.autoSize = TextFieldAutoSize.CENTER;
                shadow.defaultTextFormat = new TextFormat( null, 60, null, true );
                shadow.textColor = 0xFFFFFF;
                shadow.text = ""+ number;
                shadow.x = (sprite.width - shadow.width) / 2 + 3;
                shadow.y = (sprite.height - shadow.height) / 2 + 3;
                sprite.addChild(shadow);
                
                var text = new TextField();
                text.autoSize = TextFieldAutoSize.CENTER;
                text.defaultTextFormat = new TextFormat( null, 60, null, true );
                text.textColor = 0x994E03;
                text.text = ""+ number;
                text.x = (sprite.width - text.width) / 2;
                text.y = (sprite.height - text.height) / 2;
                sprite.addChild(text);
    
                sprite.addEventListener(InteractiveObjectTouchEvent.TOUCH_BEGIN, function(){
                    var e = new Event("piece_touch");
                    e.number = number;
                    e.piece = sprite;
                    e.moved = false;
                    sprite.dispatchEvent( e );
                    
                    console.log("e.moved=", e.moved);
                    
                    if (!e.moved){
                        var cur_pos = sprite.parent.parent.puzzle.locateNumber(number);
                        var cur_x = sprite.parent.parent.calcPiecePos(cur_pos.row, cur_pos.col).x;
                        createjs.Tween.get(sprite, {loop:false})
                                .to({alpha:0.2, x:cur_x-10}, 120, createjs.Ease.quadIn)
                                .to({alpha:1,   x:cur_x+10}, 120, createjs.Ease.quadIn)
                                .to({x:cur_x}, 120, createjs.Ease.quadIn);
                    }
                });
    
            }
            
            sprite.transformationPoint = new Point(sprite.width/2, sprite.height/2);

            // 数値をセット
            sprite.number = number;
            sprite.isBlank = isBlank;

            return sprite;
        }
        
    };

    return PieceFactory;
});






