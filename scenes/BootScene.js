/// Класс с зозданием игры еще до меню
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene'); //super предает имя сцены в родительский класс
    }



// 3. PRELOAD — ЗАГРУЗКА РЕСУРСОВ
 preload() {
     // 1. Загружаем JSON карты, экспортированный из Tiled
    this.load.tilemapTiledJSON('map', 'assets/map_game.tmj');
    
    // Загружаем картинку с тайлами (тайлсет) с 1 по 4
    this.load.image('tiles', 'assets/tileset.png');
    this.load.image('tiles_C', 'assets/C.png');
    this.load.image('tiles_js', 'assets/js.png');
    this.load.image('tiles_p', 'assets/p.png');
    
    
    //this.load.spritesheet(...) загружает набор кадров — одну картинку, разделённую на несколько кадров (спрайт-лист).
    this.load.spritesheet('js', 'assets/js_96.png', {
        frameWidth: 96,
        frameHeight: 96
    })
    this.load.spritesheet('c', 'assets/C_96.png', {
        frameWidth: 96,
        frameHeight: 96
    })
    this.load.spritesheet('python', 'assets/py_96.png', {
        frameWidth: 96,
        frameHeight: 96
    })
}

// 4. CREATE — СОЗДАНИЕ ОБЪЕКТОВ НА СЦЕНЕ
 create() {
    //создание карты с тайлами
     const map = this.make.tilemap({ key: 'map' });
     const tileset = map.addTilesetImage('tiles', 'tiles');
     const tileset2 = map.addTilesetImage('tiles_C', 'tiles_C');
     const tileset3 = map.addTilesetImage('tiles_js', 'tiles_js');
     const tileset4 = map.addTilesetImage('tiles_p', 'tiles_p');

     // Создаем ВСЕ слои по порядку (снизу вверх)
    // floor — самый нижний слой, поэтому создаем первым
    const floorLayer = map.createLayer('floor', [tileset, tileset2, tileset3, tileset4], 0, 0);
    const wallLayer = map.createLayer('wall', [tileset, tileset2, tileset3, tileset4], 0, 0);
    const windowLayer = map.createLayer('window', [tileset, tileset2, tileset3, tileset4], 0, 0);
    const itemLayer = map.createLayer('item', [tileset, tileset2, tileset3, tileset4], 0, 0);
    
    // Включаем физику (коллизии) для стен, окон и мебели
    wallLayer.setCollisionByProperty({ collides: true });
    windowLayer.setCollisionByProperty({ collides: true });
    itemLayer.setCollisionByProperty({ collides: true });
    
    //Создаем анимакии для персонажей
    this.createAnimations('js');
    this.createAnimations('c');
    this.createAnimations('python');

    // переход в меню
    this.scene.start('MenuScene');
    }
    
    createAnimations(key) {
   //блок с спрайтами анимации
    this.anims.create({
        key: key + '_down',
        frames: this.anims.generateFrameNumbers(key, {
            start: 0,
            end: 2
        }),
        frameRate: 5, //Скорость: 5 кадров в секунду
        repeat: -1 // анимация зацикливается. Если поставить repeat: 0, она проиграется один раз и остановится.
    })
    this.anims.create({
        key: key + '_right_left',
        frames: this.anims.generateFrameNumbers(key,{
            start: 3,
            end: 5
        }),
        frameRate: 5, 
        repeat: -1 
    })
    this.anims.create({
        key: key + '_up',
        frames: this.anims.generateFrameNumbers(key,{
            start: 6,
            end: 8
        }),
        frameRate: 5, 
        repeat: -1 
    })
     }
}