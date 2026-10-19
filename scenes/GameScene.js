// Функция для генерации уникального ID игрока и сохранения его в браузере
function getPlayerId() {
    let id = localStorage.getItem('player_id');
    if (!id) {
        id = 'player_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('player_id', id);
    }
    return id;
}



class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    // preload() не нужен — всё загружено в BootScene


    // INIT: Вызывается перед созданием, получает данные из меню
     init(data) {
        // Получаем выбранного персонажа из меню
        this.characterKey = data.character || 'js'; // Получаем выбранного персонажа
        this.score = 0;
    }

    create(){
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
    

    //Делаем нужные слои непроходимыми
    wallLayer.setCollisionByProperty({ collides: true });
    windowLayer.setCollisionByProperty({ collides: true });
    itemLayer.setCollisionByProperty({ collides: true });


    // Метод sprite создает спрайт (картинку с физикой).
    // player = this.add.sprite(400,300, '');
    //Создаем игрока (используем первый кадр из спрайт-листа)
    this.player = this.physics.add.sprite(1320, 1128, this.characterKey);
    this.player.setCollideWorldBounds(true);  // Не выпускаем за границы
    // Уменьшаем hitbox вокруг игрока
    this.player.body.setSize(24, 30);
    this.player.body.setOffset(36, 60); // Смещаем его вниз, к ногам



    // Устанавливаем границы физического мира равными размеру карты
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // И для игрока — чтобы он не выходил за пределы КАРТЫ, а не экрана
    this.player.setCollideWorldBounds(true);
    // Камера следует за игроком
    this.cameras.main.startFollow(this.player);
    // Не выходить за границы карты
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);



    //Столкновения игрока со всеми твердыми слоями
    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.collider(this.player, windowLayer);
    this.physics.add.collider(this.player, itemLayer);
    


    // Внутри create() после создания this.player

// === МУЛЬТИПЛЕЕР ===
this.socket = io('https://code-battle-server-drkd.onrender.com'); // Ваша ссылка Render
this.otherPlayers = this.physics.add.group(); // Группа для других игроков

// 1. Когда мы подключились, получаем список уже играющих
this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
        if (id !== this.socket.id) { // Себя не рисуем (у нас уже есть this.player)
            this.addOtherPlayer(players[id]);
        }
    });
});

// 2. Когда подключился новый игрок
this.socket.on('newPlayer', (playerInfo) => {
    this.addOtherPlayer(playerInfo);
});

// 3. Когда другой игрок двинулся
this.socket.on('playerMoved', (playerInfo) => {
    this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.id === otherPlayer.playerId) {
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            otherPlayer.setFlipX(playerInfo.flipX);
            //Управляем анимацие
             // Если сервер говорит, что игрок остановился — принудительно тормозим анимацию
            if (playerInfo.isStopped) {
                otherPlayer.anims.stop();
                // Ставим первый кадр из спрайт-листа (кадр покоя)
                otherPlayer.setFrame(0); 
            } 
            // Если игрок движется и есть анимация — играем её
            else if (playerInfo.anim) {
                otherPlayer.anims.play(playerInfo.anim, true);
            }
        }
    });
});

// 4. Когда другой игрок отключился
this.socket.on('playerDisconnected', (playerId) => {
    this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
        }
    });
});

// Вспомогательный метод для добавления других игроков
this.addOtherPlayer = (playerInfo) => {
    const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.characterKey || 'js');
    otherPlayer.playerId = playerInfo.id;
    // Делаем хитбокс таким же, как у главного игрока
    otherPlayer.body.setSize(24, 30);
    otherPlayer.body.setOffset(36, 60);
    this.otherPlayers.add(otherPlayer);
};



    //КЛАВИШИ
    this.createKeys();
   
        //СЧЁТ
    this.scoreText = this.add.text(20, 20, 'Счёт: 0', {
        fontSize: '28px',
        fill: '#ffffff',
        fontStyle: 'bold'
    }).setScrollFactor(0);



    //HTML-ОКНО ЗАДАНИЯ
    // Создаем HTML-элемент прямо в Phaser
    this.taskWindow = this.add.dom(400, 300).createFromHTML(`
        <div id="task-box" style="display: none; background: #1e1e2e; color: #fff; padding: 25px; border-radius: 12px; width: 500px; box-shadow: 0 0 30px rgba(0,0,0,0.8); font-family: Arial, sans-serif; border: 2px solid #4a90e2;">
            <h2 id="task-title" style="margin-top: 0; color: #4a90e2;">Задача</h2>
            <p id="task-desc" style="font-size: 16px; line-height: 1.5;"></p>
            <textarea id="user-code" placeholder="Напишите код здесь..." style="width: 100%; height: 120px; background: #0d0d15; color: #6ee7b7; border: 1px solid #4a90e2; border-radius: 6px; padding: 10px; font-family: 'Courier New', monospace; font-size: 14px; resize: none; box-sizing: border-box;"></textarea>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="check-btn" style="background: #4a90e2; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">Проверить</button>
                <button id="close-btn" style="background: #555; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">Закрыть</button>
            </div>
            <p id="result-msg" style="margin-top: 15px; font-size: 16px;"></p>
        </div>
    `).setScrollFactor(0);



        // Блокируем передачу нажатий клавиш из textarea в Phaser (чтобы не двигался персонаж
        const userCode = document.getElementById('user-code');
        userCode.addEventListener('keydown', function(e) { e.stopPropagation(); });
        userCode.addEventListener('keyup', function(e) { e.stopPropagation(); });
        userCode.addEventListener('keypress', function(e) { e.stopPropagation(); });
    
    
        // Сохраняем ссылку на сцену для обработчиков кнопок
        const self = this;

        // Обработчик кнопки "Проверить"
        document.getElementById('check-btn').onclick = async function() {
        const code = document.getElementById('user-code').value;
        const task = self.currentTask;

         // Показываем загрузку (опционально)
        document.getElementById('result-msg').innerText = '⏳ Проверяем...';
        document.getElementById('result-msg').style.color = '#ffffff';

        // Ждём результат проверки (работает и для синхронных, и для асинхронных)
        const isCorrect = await task.check(code);

        if (isCorrect) {
            self.score = self.score + 1;  // Увеличиваем счет
            self.scoreText.setText('Счёт: ' + self.score);


            // === ОТПРАВЛЯЕМ ДАННЫЕ НА СЕРВЕР ===
            fetch('https://code-battle-server-drkd.onrender.com/api/score', {  // Пока используем localhost для теста
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            playerId: getPlayerId(), // Уникальный ID игрока
            taskId: task.id,         // ID решенной задачи
            language: task.language  // Язык задачи
                })
            })
            .then(response => response.json())
            .then(data => console.log('Сервер ответил:', data))
            .catch(error => console.error('Ошибка отправки:', error));




            document.getElementById('result-msg').innerText = '✅ Правильно! +1 очко';
            document.getElementById('result-msg').style.color = '#6ee7b7';
            // Закрываем окно через 1.5 секунды
            setTimeout(function() {
                document.getElementById('task-box').style.display = 'none';
                self.closeTask();   //восстановить клавиатуру и сцену
            }, 1500);
        } else {
            document.getElementById('result-msg').innerText = '❌ Попробуйте ещё раз';
            document.getElementById('result-msg').style.color = '#f87171';
        }
    };

    // Обработчик кнопки "Закрыть"
    document.getElementById('close-btn').onclick = function() {
        document.getElementById('task-box').style.display = 'none';
         self.closeTask(); //восстановить клавиатуру и сцену
    };


    //ПОЗИЦИИ СТОЛОВ
    this.deskPositions = [
        { x: 1992, y: 1704, language: 'js', name: 'JavaScript'},
        { x: 648, y: 600, language: 'c', name: 'C'},
        { x: 696, y: 1656, language: 'python', name: 'Python'}
    ];
}

addOtherPlayer(playerInfo) {
        const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.characterKey || 'js');
        otherPlayer.playerId = playerInfo.id;
        // Делаем хитбокс таким же, как у главного игрока
        otherPlayer.body.setSize(24, 30);
        otherPlayer.body.setOffset(36, 60);
        this.otherPlayers.add(otherPlayer);
    }


//МЕТОД СОЗДАНИЯ КЛАВИШ
    createKeys() {
        this.cursors = this.input.keyboard.createCursorKeys(); // Клавиши-стрелки
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    


    // Метод возобновления игры после закрытия задачи
    closeTask() {
        this.input.keyboard.enabled = true; // Включаем клавиатуру обратно
        this.createKeys();   //создать клавиши заново
        this.scene.resume(); // Снимаем игру с паузы
    }


    openTask(language) {
        // Фильтруем задачи по языку
        const languageTasks = [];
        for (let i = 0; i < TASKS.length; i++) {
            if (TASKS[i].language === language) {
                languageTasks.push(TASKS[i]);
            }
        }
        
        // Если задач нет — выходим
        if (languageTasks.length === 0) {
            console.log('Нет задач для языка:', language);
            return;
        }
        

        // Берём случайную задачу
        const randomIndex = Math.floor(Math.random() * languageTasks.length);
        this.currentTask = languageTasks[randomIndex];
        


        // Заполняем окно
        document.getElementById('task-title').innerText = this.currentTask.title;
        document.getElementById('task-desc').innerText = this.currentTask.description;
        document.getElementById('user-code').value = '';
        document.getElementById('result-msg').innerText = '';
        document.getElementById('task-box').style.display = 'block';
        

        // Меняем цвет рамки окна под язык
        const colors = {
        'js': '#f7df1e',
        'c': '#5c6bc0',
        'python': '#3776ab'
        };
        document.getElementById('task-box').style.borderColor = colors[language] || '#4a90e2';


        // Отключаем управление и ставим игру на паузу
        this.input.keyboard.enabled = false;
        setTimeout(() => document.getElementById('user-code').focus(), 50); // Фокус на поле ввода
        this.scene.pause();
    }



     // Всплывающее сообщение над игроком
    showMessage(text) {
    // Удаляем старое сообщение, если есть
    if (this.messageText) {
        this.messageText.destroy();
    }

    // Создаём новое сообщение над игроком
    this.messageText = this.add.text(
        this.player.x,
        this.player.y - 60,
        text,
        {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
    ).setOrigin(0.5);

    // Через 1.5 секунды — удаляем
    const self = this;
    this.time.delayedCall(1500, function() {
        if (self.messageText) {
            self.messageText.destroy();
            self.messageText = null;
        }
    });
    }



// 5. UPDATE — ИГРОВОЙ ЦИКЛ (выполняется 60 раз в секунду)
 update() {
    if (this.scene.isPaused()) return;// Если сцена на паузе — не выполнять update

    const speed = 300; // Скорость движения в пикселях в секунду

    // Сначала останавливаем игрока (сбрасываем скорость)
    this.player.body.setVelocity(0);

     // Переменная для отслеживания состояния анимации
    let isMoving = false;

    const char = this.characterKey; //локальную переменную

    // ДВИЖЕНИЕ ВЛЕВО
    if (this.cursors.left.isDown || this.keyA.isDown) {
        this.player.body.setVelocityX(-speed);
        this.player.setFlipX(true);       // Отражаем спрайт по горизонтали
        this.player.anims.play(char +'_right_left', true);  // true = не перезапускать, если уже играет
        isMoving = true;
    }
    // ДВИЖЕНИЕ ВПРАВО
    else if (this.cursors.right.isDown || this.keyD.isDown) {
        this.player.body.setVelocityX(speed);
        this.player.setFlipX(false);       // Отражаем спрайт по горизонтали
        this.player.anims.play(char +'_right_left', true);  // true = не перезапускать, если уже играет
        isMoving = true;
    }

    // ДВИЖЕНИЕ ВВЕРХ
    if (this.cursors.up.isDown || this.keyW.isDown) {
       this.player.body.setVelocityY(-speed);
        if (!isMoving){
        this.player.anims.play(char +'_up', true);  // true = не перезапускать, если уже играет
        isMoving = true;
        }
    }
    // ДВИЖЕНИЕ ВНИЗ
    else if (this.cursors.down.isDown || this.keyS.isDown) {
        this.player.body.setVelocityY(speed);
        if (!isMoving) { 
        this.player.anims.play(char +'_down', true);  // true = не перезапускать, если уже играет
        isMoving = true;
        }
    }

    // Если игрок никуда не идет — останавливаем анимацию
    if (!isMoving) {
        this.player.anims.stop();
        this.player.setFrame(0); // Показываем первый кадр (стоим)
    }




       //ПРОВЕРКА БЛИЗОСТИ К СТОЛАМ (поиск ближайшего)
    let nearestDesk = null;
    let minDistance = 80; // Максимальный радиус взаимодействия

    // 1. Ищем самый близкий стол
    for (let i = 0; i < this.deskPositions.length; i++) {
        const desk = this.deskPositions[i];
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            desk.x, desk.y
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestDesk = desk;
        }
    }

    //Если нашли стол рядом и нажали E
    if (nearestDesk && Phaser.Input.Keyboard.JustDown(this.keyE)) {
        // 3. Проверяем язык
        if (nearestDesk.language === this.characterKey) {
            this.openTask(nearestDesk.language); // Язык совпадает — открываем задачу
        } else {
            this.showMessage('Этот стол не для твоего языка!'); // Язык не совпадает — показываем сообщение
        }
    }


    // Отправляем свои координаты на сервер (можно ограничить частоту, но для простоты шлем каждый кадр)
    if (this.socket) {
    this.socket.emit('playerMovement', {
        x: this.player.x,
        y: this.player.y,
        characterKey: this.characterKey,
        // Отправляем true, если стоим, и false, если идем
        isStopped: !isMoving, 
        // Отправляем имя анимации только если реально двигаемся
        anim: isMoving ? (this.player.anims.currentAnim ? this.player.anims.currentAnim.key : '') : '',
        flipX: this.player.flipX // Повернут ли влево
        });
    }
    }
}
