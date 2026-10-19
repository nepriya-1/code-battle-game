// 1. КОНФИГУРАЦИЯ ИГРЫ
const config = {
    type: Phaser.AUTO,           // Автоматически выбираем WebGL или Canvas
    width: 1600,                  // Ширина игрового поля
    height: 900,                 // Высота игрового поля
    parent: 'game',
    dom: {
        createContainer : true
    },
    physics: {
        default: 'arcade',       // Используем простую физику (Arcade)
        arcade: {
            gravity: { y: 0 },   // Гравитация отсутствует (вид сверху)
            debug: false         // true - покажет границы объектов (для отладки)
        }
    },
    scale:{
        mode: Phaser.Scale.FIT,  // FIT без полей, если пропорции совпадают
        autoCenter: Phaser.Scale.CENTER_BOTH, // Центрировать по горизонтали и вертикали
    },
    scene:  [BootScene, MenuScene, GameScene] // классы
        //preload: preload,        // Функция загрузки ресурсов
        //create: create,          // Функция создания объектов
        //update: update           // Функция игрового цикла
};


// 2. СОЗДАНИЕ ИГРЫ
const game = new Phaser.Game(config);

