define( "app/mybutton", [], function() {

    //SpriteはBuiltinクラスで継承出来ないためFactoryパターンを使用
    var MyButtonFactory = {

        create: function( bmd ) {
            var sprite = new Sprite();
            var bitmap = new Bitmap( bmd );
            sprite.addChild( bitmap );
            
            sprite.transformationPoint = new Point(sprite.width/2, sprite.height/2);

            sprite.addEventListener( InteractiveObjectTouchEvent.TOUCH_TAP, function gotoGame( event ) {
                setTimeout(function(){
                    //ボタンの表示が元に戻るのを待ってからイベントを発生。
                    sprite.dispatchEvent( new Event("mybutton_tapped") );
                }, 50);
            }, false );
            
            var zoomButton = function( event ) {
                event.target.scaleX = 1.1;
                event.target.scaleY = 1.1;
            };
            sprite.addEventListener( InteractiveObjectTouchEvent.TOUCH_BEGIN, zoomButton, false );
            sprite.addEventListener( InteractiveObjectTouchEvent.TOUCH_ROLL_OVER, zoomButton, false );
            
            var restoreButton = function( event ) {
                event.target.scaleX = 1;
                event.target.scaleY = 1;
            };
            sprite.addEventListener( InteractiveObjectTouchEvent.TOUCH_END, restoreButton, false );
            sprite.addEventListener( InteractiveObjectTouchEvent.TOUCH_ROLL_OUT, restoreButton, false );

            return sprite;
        }
    };

    return MyButtonFactory;
});





