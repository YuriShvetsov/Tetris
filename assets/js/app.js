/* Game "Tetris" by Yuri Shvetsov. Version 2.2. Date 06.2019 */

(function(){

    /* Create canvas (large & small). */
    /* Создание холста (большого и малого). */

    const app = document.getElementById('app');
    const canvas_lg = document.getElementById('canvas-large');
    const ctx_lg = canvas_lg.getContext('2d');
    const width_lg = 600;
    const height_lg = 1000;

    canvas_lg.width = width_lg;
    canvas_lg.height = height_lg;
    canvas_lg.style.width = width_lg / 2 + 'px';
    canvas_lg.style.height = height_lg / 2 + 'px';
    ctx_lg.scale(2, 2);

    const canvas_sm = document.getElementById('canvas-small');
    const ctx_sm = canvas_sm.getContext('2d');
    const width_sm = 124;
    const height_sm = 164;

    canvas_sm.width = width_sm;
    canvas_sm.height = height_sm;
    canvas_sm.style.width = width_sm / 2 + 'px';
    canvas_sm.style.height = height_sm / 2 + 'px';
    ctx_sm.scale(2, 2);

    /* Main elements of interface. */
    /* Основные элементы интерфейса. */

    const page = document.querySelector('.page');

    const elemSpeed = document.getElementById('speed');
    const elemScore = document.getElementById('score');
    const elemHiScore = document.getElementById('hiscore');

    const buttonStart = document.getElementById('start');
    const buttonReset = document.getElementById('reset');

    const checkboxGrid = document.getElementById('checkbox-grid');
    const checkboxDarkTheme = document.getElementById('checkbox-dark-theme');

    const grid = document.querySelector('.app__grid');
    const game_over = document.querySelector('.game-over__text');
    const game_over_cursor = document.querySelector('.game-over__cursor');

    /* Main objects of game. */
    /* Объекты игры. */

    const game = {
        width: 15,
        height: 25,
        squareSize: 20,
        padding: 0,
        play: false,
        grid: false,
        speed: 1,
        score: 0,
        hiScore: localStorage.getItem('hiScore'),
        counter: 1
    }

    const curFig = {
        fig: undefined,
        coordX: 7,
        coordY: -3,
        color: undefined,
        clockwise: true,
    };

    const nextFig = {
        fig: undefined,
        coordX: 1,
        coordY: 2,
        color: undefined,
    };

    const worldMap = {
        width: 15,
        height: 25,
        color: '#aaa',
        map: []
    };

    const figures = {
        fig_1: { // figure: square
            coords: [ [0, -1], [0, 0], [1, -1], [1, 0] ],
            numPositions: 1
        },
        fig_2: { // figure: I
            coords: [ [0, -2], [0, -1], [0, 0], [0, 1] ],
            numPositions: 2
        },
        fig_3: { // figure: L
            coords: [ [0, -1], [0, 0], [0, 1], [1, 1] ],
            numPositions: 4
        },
        fig_4: { // figure: J
            coords: [ [0, -1], [0, 0], [0, 1], [-1, 1] ],
            numPositions: 4
        },
        fig_5: { // figure: S
            coords: [ [-1, 0], [0, -1], [0, 0], [1, -1] ],
            numPositions: 2
        },
        fig_6: { // figure: T
            coords: [ [-1, 0], [0, 0], [1, 0], [0, -1] ],
            numPositions: 4
        },
        fig_7: { // figure: Z
            coords: [ [-1, -1], [0, -1], [0, 0], [1, 0] ],
            numPositions: 2
        }
    };

    const colors = [
        '#ff5526', // orange
        '#33a5ff', // blue
        '#9933ff', // violet
        '#18f04e', // green
    ];

    let frame, keyFrame;

    /* Settings for main objects. */
    /* Установка начальных значений для объектов игры. */

    resetGame();
    saveHiScore();
    themeApp();
    createMenu();

    elemSpeed.innerHTML = game.speed;
    elemScore.innerHTML = game.score;

    /* Event handling. */
    /* Обработка событий. */

    // Event tracking od control (keyboard):
    // Отслеживание событий для управления (клавиатура):
    window.addEventListener('keydown', event => {
        if (game.play) { // only works during the game
            if (event.keyCode == 83) { // "S": move to down
                moveFig('down');
            } else if (event.keyCode == 65) { // "A": move to left
                moveFig('left');
            } else if (event.keyCode == 68) { // "D": move to right
                moveFig('right');
            } else if (event.keyCode == 76) { // "L": change speed
                changeSpeed();
            }
        }

        if (event.keyCode == 81) { // "Q": play/pause
            toggleStatusGame();
            hideGameOver();
            elemSpeed.innerHTML = game.speed;
            elemScore.innerHTML = game.score;
            if (!game.play) {
                cancelUpdateFrames();
            }

        }
    }, false);

    // Tracking event clicking on enter:
    // Отслеживания события нажатия по "Enter":
    window.addEventListener('keyup', event => {
        if (game.play) {
            if (event.keyCode == 13) {
                rotateFig();
            }
        }
    }, false);

    // Event tracking click on the buttons of the game:
    // Отслеживание события нажатия по кнопкам игры:
    window.addEventListener('click', event => {
        if (event.target == buttonStart) { // start/pause
            toggleStatusGame();
            hideGameOver();
            elemSpeed.innerHTML = game.speed;
            elemScore.innerHTML = game.score;
            buttonStart.blur();
        } else if (event.target == buttonReset) { // reset game
            hideGameOver();
            resetGame();
            elemSpeed.innerHTML = game.speed;
            elemScore.innerHTML = game.score;
            clearCanvas(ctx_lg, width_lg, height_lg);
            clearCanvas(ctx_sm, width_sm, height_sm);
            cancelUpdateFrames();
            buttonReset.blur();
        }

    }, false);

    /* Drawing. */
    /* Рисование. */

    // Getting coordinates for rendering figure on canvas:
    // Получение координат для отрисовки фигуры на холсте (главном):
    function getCoords(coords, centerX, centerY) {
        const newCoords = [];
        let x, y;

        for (let pair of coords) {
            x = pair[0] + centerX;
            y = pair[1] + centerY;
            newCoords.push([x, y]);
        }

        return newCoords;
    }

    // Drawing a square:
    // Отрисовка квадратика:
    function drawSq(x, y, color, context) {
        const size = game.squareSize;
        const p = game.padding;

        context.fillStyle = color;
        context.fillRect(x * size + p, y * size + p, size - p, size - p);
    }

    // Drawing current figure:
    // Отрисовка текущей фигуры:
    function drawCurFig() {
        const coords = getCoords(curFig.fig.coords, curFig.coordX, curFig.coordY);
        const color = curFig.color;

        for (let pair of coords) {
            drawSq(pair[0], pair[1], color, ctx_lg);
        }
    }

    // Drawing next figure:
    // Отрисовка следующей фигуры:
    function drawNextFig() {
        const coords = getCoords(nextFig.fig.coords, nextFig.coordX, nextFig.coordY);
        const color = nextFig.color;
        
        for (let pair of coords) {
            drawSq(pair[0], pair[1], color, ctx_sm);
        }
    }

    // Drawing worldmap:
    // Отрисовка worldmap:
    function drawWorldMap() {
        let removeCount;

        for (let y in worldMap.map) {
            removeCount = 0;

            for (let x in worldMap.map[y]) {
                if (worldMap.map[y][x]) {
                    drawSq(x, y, worldMap.color, ctx_lg);
                    removeCount++;
                }
            }

            if (removeCount == 15) {
                removeWorldMap(y);
            }
        }
    }

    // Cleaning canvas:
    // Очистка холста:
    function clearCanvas(context, width, height) {
        context.clearRect(0, 0, width, height);
    }


    // Color theme of the game:
    // Цветовая тема:
    function themeApp() {
        if (localStorage.getItem('darkTheme') == 'true') {
            checkboxDarkTheme.checked = true;
            app.classList.add('app_theme_dark');
            worldMap.color = '#fff';
            page.classList.add('page_dark');
        } else {
            checkboxDarkTheme.checked = false;
            app.classList.remove('app_theme_dark');
            worldMap.color = '#aaa';
            page.classList.add('page_light');
        }

        if (localStorage.getItem('grid') == 'true') {
            checkboxGrid.checked = true;
            grid.classList.remove('app__grid_hidden');
        }
    }

    // Save value hi-score to localStorage:
    // Сохранение значения hi-score в localStorage:
    function saveHiScore() {
        if (game.hiScore < game.score) {
            localStorage['hiScore'] = game.score;
            elemHiScore.innerHTML = localStorage['hiScore'];
            game.hiScore = localStorage['hiScore'];
        } else {
            elemHiScore.innerHTML = localStorage['hiScore'];
        }
        
        if (!localStorage['hiScore']) {
            elemHiScore.innerHTML = 0;
        }
    }

    // Removing filled line of worldmap:
    // Удаление заполненной строчки worldmap:
    function removeWorldMap(y) {
        const line = Array(game.width);
        line.fill(false);

        worldMap.map.splice(y, 1);
        worldMap.map.unshift(line);

        game.score += 10 * game.speed;
        elemScore.innerHTML = game.score;

        if (game.counter < 10) {
            game.counter++;
        } else if (game.counter == 10) {
            game.counter = 1;
            changeSpeed();
        }

       saveHiScore();
    }

    /* Checking and changing position current figure. */
    /* CПроверка и изменение положения текущей цифры. */

    // Getting the rotation direction of the current figure:
    // Получение направления вращения фигуры:
    function getClockwise() {
        let clockwise = curFig.clockwise;

        if (curFig.fig.numPositions == 2) {
            return !clockwise;
        }

        return clockwise;
    }

    // Getting coords rotated current figure:
    // Получение измененных начальных координат для поворота
    function getRotateFig() {
        const coords = curFig.fig.coords;
        const clockwise = getClockwise();
        const newCoords = [];
        let x, y;
        let coef = clockwise ? 1 : -1;

        if (curFig.fig.numPositions == 1) {
            return curFig.fig.coords;
        }

        for (let pair of coords) {
            x = coef * (-pair[1]);
            y = coef * (pair[0]);
            newCoords.push([x, y]);
        }

        return newCoords;
    }

    // Checking for a "safe" movement of the figure:
    // Проверка на "безопасное" перемещение фигуры в опр. направлении:
    function checkMove(dir) {
        const coords = getMovedFig(dir);
        let x, y;

        for (let pair of coords) {
            x = pair[0];
            y = pair[1];

            if (x < 0 || x > 14 || y > 24) {
                return false;
            }

            if (y >= 0 && worldMap.map[y][x]) {
                return false;
            }
        }

        return true;
    }

    // Checking border contact when rotating:
    // Проверка на "безопасный" поворот фигуры:
    function checkRotate() {
        const coords = getRotatedFig();
        let x, y;

        for (let pair of coords) {
            x = pair[0];
            y = pair[1];

            if (x < 0 || x > 14 || y > 24) {
                return false;
            }

            if (y >= 0 && worldMap.map[y][x]) {
                return false;
            }
        }

        return true;
    }

    // Getting coordinates of the current figure at the end of the movement:
    // Получение координат текущей фигуры по завершении движения:
    function getMovedFig(dir) {
        let newCoordX = curFig.coordX;
        let newCoordY = curFig.coordY;
        let newCoords;

        if (dir == 'left') {
            newCoordX--;
        } else if (dir == 'right') {
            newCoordX++;
        } else if (dir == 'down') {
            newCoordY++;
        }

        newCoords = getCoords(curFig.fig.coords, newCoordX, newCoordY);

        return newCoords;
    }

    // Getting coordinates of the current figure after rotation:
    // Получение координат текущей фигуры после поворота:
    function getRotatedFig() {
        let coef = getClockwise() ? -1 : 1;
        let coords = curFig.fig.coords;
        let x, y;
        let newCoords = [];

        if (curFig.numPositions == 1) {
            return getCoords(curFig.fig.coords, curFig.coordX, curFig.coordY);
        }

        for (let pair of coords) {
            x = pair[1] * coef;
            y = -1 * pair[0] * coef;
            newCoords.push([x, y]);
        }

        return getCoords(newCoords, curFig.coordX, curFig.coordY);
    }

    // Moving the current figure:
    // Перемещение текущей фигуры (влево, вправо, вниз):
    function moveFig(dir) {
        if (dir == 'left' && checkMove('left')) {
            curFig.coordX--;
        } else if (dir == 'right' && checkMove('right')) {
            curFig.coordX++;
        } else if (dir == 'down' && checkMove('down')) {
            curFig.coordY++;
        } else if (dir == 'down' && !checkMove('down')) {
            saveToWorldMap();
            createNewFig();
        }
    }

    // Rotating the current figure:
    // Поворот текущей фигуры:
    function rotateFig() {
        curFig.clockwise = getClockwise();

        let coef = getClockwise() ? -1 : 1;
        let x, y;
        let newCoords = [];

        if (curFig.fig.numPositions == 1) {
            return;
        }

        if (!checkRotate()) {
            return;
        }

        for (let i = 0; i < curFig.fig.coords.length; i++) {
            x = curFig.fig.coords[i][0];
            y = curFig.fig.coords[i][1];
           newCoords.push([y * coef, -1 * x * coef]);
        }

        curFig.fig.coords = newCoords;
    }

    // Create empty worldmap with width & height:
    // Создание пустого массива worldmap с шириной и высотой:
    function createWorldMap(width, height) {
        let map = Array(height);

        for (let i = 0; i < height; i++) {
            let line = Array(width);
            line.fill(false);
            map[i] = line;
        }

        return map;
    }

    // Generation of a new figure:
    // Создание новой фигуры:
    function createNewFig() {
        curFig.fig = nextFig.fig;
        curFig.color = nextFig.color;
        curFig.coordX = 7;
        curFig.coordY = -3;
        curFig.clockwise = true;

        nextFig.fig = Object.assign([], figures[getRandomItem(Object.keys(figures))]);
        nextFig.color = getRandomItem(colors);
    }

    // Preservation current figure to worldmap:
    // Сохранение текущей фигуры в worldmap:
    function saveToWorldMap() {
        const coords = getCoords(curFig.fig.coords, curFig.coordX, curFig.coordY);
        let x, y;

        for (let pair of coords) {
            x = pair[0];
            y = pair[1];

            if (worldMap.map.hasOwnProperty(y)) {
                worldMap.map[y][x] = true;
            } else {
                resetGame();
                clearCanvas(ctx_lg, width_lg, height_lg);
                clearCanvas(ctx_sm, width_sm, height_sm);
                showGameOver();
                cancelUpdateFrames();
                return;
            }
        }

        elemSpeed.innerHTML = game.speed;
        elemScore.innerHTML = game.score;
    }

    /* Game state update. */
    /* Обновление состояния игры. */

    // Getting a random item of array:
    // Получение случайного элемента массива:
    function getRandomItem(arr) {
        const num = arr.length;
        const randomIndex = Math.floor(Math.random() * num);

        return arr[randomIndex];
    }

    // Resetting the default game state:
    // Сброс состояния игры по умолчанию:
    function resetGame() {
        game.play = false;
        game.score = 0;
        game.speed = 1;
        game.counter = 1;

        curFig.fig = Object.assign([], figures[getRandomItem(Object.keys(figures))]);
        curFig.coordX = 7;
        curFig.coordY = -3;
        curFig.color = getRandomItem(colors);
        curFig.clockwise = true;

        nextFig.fig = Object.assign([], figures[getRandomItem(Object.keys(figures))]);
        nextFig.color = getRandomItem(colors);

        worldMap.map = createWorldMap(worldMap.width, worldMap.height);

        buttonStart.innerHTML = 'Start';
    }

    // Showing the splash screen when loosing game:
    // Показ заставки при проигрыше игры:
    function showGameOver() {
        game_over.classList.add('game-over__text_visible');
        game_over.classList.remove('game-over__text_hide');
    }

    // Hiding the splash screen when loosing game:
    // Скрытие заставки при проигрыше игры:
    function hideGameOver() {
        if (game_over.classList.contains('game-over__text_visible')) {
            game_over.classList.add('game-over__text_hide');
        }
        setTimeout(function() {
            game_over.classList.remove('game-over__text_visible');
            game_over.classList.remove('game-over__text_hide');
        }, 400);
    }

    // Show/hide grid:
    // Показать/скрыть сетку:
    function toggleGrid() {
        if (game.grid) {
            canvas_lg.classList.add('grid');
            game.grid = false;
        } else if (!game.grid) {
            canvas_lg.classList.remove('grid');
            game.grid = true;
        }
    }

    // Change of figure movement speed:
    // Изменение скорости падения фигуры:
    function changeSpeed() {
        if (game.speed < 10) {
            game.speed++;
        } else if (game.speed == 10) {
            game.speed = 1;
        }

        game.counter = 1;
        elemSpeed.innerHTML = game.speed;
    }

    // Cancel requestAnimationFrame and setTimeout
    // Отмена requestAnimationFrame и setTimeout:
    function cancelUpdateFrames() {
        clearTimeout(keyFrame);
        window.cancelAnimationFrame(frame);
    }

    // Game status change:
    // Тумблер изменения состояния игры с неактивного на активный:
    function toggleStatusGame() {
        if (game.play) {
            game.play = false;
            buttonStart.innerHTML = 'Start';
            cancelUpdateFrames();
        } else if (!game.play) {
            game.play = true;
            buttonStart.innerHTML = 'Pause';
            render();
            update();
        }
    }

    // Frame rendering:
    // Отрисовка кадра:
    function render() {
        frame = requestAnimationFrame(render);
        clearCanvas(ctx_lg, width_lg, height_lg);
        drawCurFig();
        drawWorldMap();
        clearCanvas(ctx_sm, width_sm, height_sm);
        drawNextFig();
    }

    // Drop of a figure:
    // Падение фигуры:
    function update() {
        keyFrame = setTimeout(function() {
            update();
            moveFig('down');
        }, 1200 / game.speed);
    }

    // Creating menu with settings:
    // Создание меню с настройками:
    function createMenu() {
        const menu_btn = document.querySelector('.menu__btn');
        const menu_popup = document.querySelector('.menu__popup');

        // Tracking the click on the menu button:
        // Отслеживание клика по кнопке меню:
        menu_btn.addEventListener('click', event => {
            if (!menu_btn.classList.contains('menu__btn_active')) {
                menu_btn.classList.add('menu__btn_active');
                menu_popup.classList.remove('menu__popup_hidden');
                menu_popup.classList.add('menu__popup_visible');
                if (game.play) {
                    toggleStatusGame();
                }
            } else {
                menu_btn.classList.remove('menu__btn_active');
                menu_popup.classList.remove('menu__popup_visible');
                menu_popup.classList.add('menu__popup_hidden');
            }
            // Remove focus from menu button:
            // удаление фокуса с кнопки меню:
            menu_btn.blur();
        });

        // Tracking the click on the page with the active menu:
        // Отслеживание клика по странице при активном меню:
        document.addEventListener('click', event => {
            if (!menu_btn.classList.contains('menu__btn_active')) {
                return;
            }

            if (!menu_popup.contains(event.target) &&
                event.target != menu_btn) {
                menu_btn.classList.remove('menu__btn_active');
                menu_popup.classList.remove('menu__popup_visible');
                menu_popup.classList.add('menu__popup_hidden');
            }
        });

        // Tracking a checkbox with a "dark theme":
        // Отслеживание клика по чекбоксу с "темная тема":
        checkboxDarkTheme.addEventListener('click', event => {
            if (checkboxDarkTheme.checked) {
                app.classList.add('app_theme_dark');
                worldMap.color = '#fff';
                clearCanvas(ctx_lg, width_lg, height_lg);
                drawCurFig();
                drawWorldMap();
                localStorage['darkTheme'] = true;
                togglePageTheme();
            } else {
                app.classList.remove('app_theme_dark');
                worldMap.color = '#aaa';
                clearCanvas(ctx_lg, width_lg, height_lg);
                drawCurFig();
                drawWorldMap();
                localStorage['darkTheme'] = false;
                togglePageTheme();
            }
        });

        // Tracking a checkbox with a "grid":
        // Отслеживание клика по чекбоксу с "сетка":
        checkboxGrid.addEventListener('click', event => {
            if (checkboxGrid.checked) {
                grid.classList.remove('app__grid_hidden');
                localStorage['grid'] = true;
            } else {
                grid.classList.add('app__grid_hidden');
                localStorage['grid'] = false;
            }
        });
    }

    function togglePageTheme() {
        if (page.classList.contains('page_light')) {
            page.classList.remove('page_light');
            page.classList.add('page_dark');
        } else if (page.classList.contains('page_dark')) {
            page.classList.remove('page_dark');
            page.classList.add('page_light');
        }
    }



}());