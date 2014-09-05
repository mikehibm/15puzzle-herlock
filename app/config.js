define( "app/config", [], function() {
    
    //Base Url
    var Url = "./assets/";
	var SoundBaseUrl = "./assets/";
	
    //シーン名
    var SCENE = {
        TITLE: "title",
        GAME: "game",
        RESULT: "result",
        PREFERENCE: "preference"
    };
	
    //画像リソースの定義
    var IMG = {
        BTN_HOME:"btn_home",
        TITLE_BG: "title_bg",
        BG: "bg",
        SCORE: "score",
        PIECE: "mikan",
        TIMEUP: "timeup",
        TIMEBAR_BG01: "timebar_bg01",
        TIMEBAR_BG02: "timebar_bg02",
        TIMEBAR: "timebar",
        START_EASY: "start_easy",
        START_NORMAL: "start_normal",
        START_HARD: "start_hard",
        RESTART: "restart",
        CLOUD1: "cloud1",
        CLOUD2: "cloud2",
        CLOUD3: "cloud3",
        BLACK: "black"
    };

    //音楽リソースの定義
    var MUSIC = {
        BGM_TITLE : "game_maoudamashii_7_rock54",
        BGM_GAME : "game_maoudamashii_7_rock52"
    };

    //効果音リソースの定義
    var SE = {
        CLEAR : "se_maoudamashii_9_jingle06",
        CORRECT : "se_maoudamashii_se_finger01",
        NG : "se_maoudamashii_onepoint26"
    };

    //読み込む素材
    var materials = {}, key, name;
    for(key in IMG) {
        name = IMG[key];
        materials[name] = {type: "image",url: Url + "images/game_%s.png".replace("%s", name)};
    }
    for(key in SE) {
        name = SE[key];
        materials[name] = {type: "se",url: SoundBaseUrl + "sounds/%s.mp3".replace("%s", name)};
    }
    for(key in MUSIC) {
        name = MUSIC[key];
        materials[name] = {type: "music",url: SoundBaseUrl + "sounds/%s.mp3".replace("%s", name)};
    }
    
    //配置用定数
    var Arrange = {
        CENTER_X: "(stage.stageWidth - self.width) / 2",
        CENTER_Y: "(stage.stageHeight - self.height) / 2",
        STAGE_WIDTH: "stage.stageWidth",
        STAGE_HEIGHT: "stage.stageHeight"
    };

    return {
        baseUrl: Url,
        materials: materials,
        Arrange: Arrange,
        TIME_LIMIT: 120,
        SCENE: SCENE,
        IMG: IMG,
        MUSIC: MUSIC,
        SE: SE
    };

} );