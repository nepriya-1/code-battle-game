class MenuScene extends Phaser.Scene{
    constructor(){
        super('MenuScene');
    }

    // preload() не нужен — всё загружено в BootScene
    create(){
        // Получаем размеры экрана для центрирования элементов
        const width = this.scale.width;
        const height = this.scale.height;
        
        //фон меню
        this.cameras.main.setBackgroundColor('#23235c');
        
        //НАЗВАНИЕ ИГРЫ
        this.add.text(width / 2, 100, 'CODE BATTLE', {
            fontSize: '72px',
            fill: '#4a90e2',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 200, 'Соревнование языков программирования', {
            fontSize: '24px',
            fill: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // === ВЫБОР ПЕРСОНАЖА ===
        this.add.text(width / 2, 300, 'Выберите персонажа:', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);


        //  Массив с данными о персонажах
        const characters = [
            { key: 'js',  name: 'JavaScript', color: 0xf7df1e },
            { key: 'python',  name: 'Python',     color: 0x3776ab },
            { key: 'c', name: 'C++', color: 0x00599c }
        ];
        

        // Сохраняем выбранного персонажа (по умолчанию — первый)
        this.selectedCharacter = characters[0].key;
        
        // Сохраняем ссылку на сцену для обработчиков кликов
        const self = this;
        
        // Координаты для карточек
        const startX = width / 2 - (characters.length - 1) * 150;
        const y = 500;
        
        // Создаём карточки персонажей
        this.characterCards = [];
        

        // Цикл по массиву персонажей (создаем карточки
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const x = startX + i * 300; // Сдвигаем каждую следующую карточку вправо
            
            // Рамка карточки
            const frame = this.add.rectangle(x, y, 220, 250, 0x2a2a3e); // Прямоугольник
            frame.setStrokeStyle(4, char.color); // Цветная обводка
            frame.setInteractive({ useHandCursor: true }); // Делаем кликабельным
            
            // Спрайт персонажа (первый кадр)
            this.add.sprite(x, y - 50, char.key).setScale(1.5);
            
            // Имя персонажа
            this.add.text(x, y + 80, char.name, {
                fontSize: '22px',
                fill: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Клик по карточке — выбор персонажа
            frame.on('pointerdown', function() {
                self.selectCharacter(char.key); // При клике выбираем этого персонажа
            });

            // Добавляем карточку в массив
            this.characterCards.push({ frame: frame, key: char.key, color: char.color });
        }
        
        // Выделяем первого персонажа
        this.selectCharacter(this.selectedCharacter);
        
        //КНОПКА "ИГРАТЬ"
        const playButton = this.add.rectangle(width / 2, height - 200, 300, 80, 0x4a90e2);
        playButton.setInteractive({ useHandCursor: true });
        
        this.add.text(width / 2, height - 200, 'ИГРАТЬ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Клик по кнопке "Играть"
        playButton.on('pointerdown', function() {
            // Запускаем GameScene и передаем туда ключ выбранного персонажа
            self.scene.start('GameScene', { character: self.selectedCharacter });
        });
        
        // Подсветка кнопки
        playButton.on('pointerover', function() {
            playButton.setFillStyle(0x6ab0ff);
        });
        playButton.on('pointerout', function() {
            playButton.setFillStyle(0x4a90e2);
        });
    }
    
    // Вспомогательный метод — выделение выбранной карточки
    selectCharacter(key) {
        this.selectedCharacter = key;
        
        for (let i = 0; i < this.characterCards.length; i++) {
            const card = this.characterCards[i];
            if (card.key === key) {
                // Если карточка выбрана — делаем ярче и толще рамку
                card.frame.setFillStyle(0x3a3a5e);
                card.frame.setStrokeStyle(6, card.color);
            } else {
                // Если не выбрана — возвращаем обычный вид
                card.frame.setFillStyle(0x2a2a3e);
                card.frame.setStrokeStyle(4, card.color);
            }
        }
    }
}