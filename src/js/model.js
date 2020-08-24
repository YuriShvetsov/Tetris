const model = {
    properties: {
        gameFieldSize: { width: 15, height: 25 },
        nextFigureSize: { width: 4, height: 4 },
        defaultSpeedMs: 1200,
        mode: {
            default: {
                maxSpeed: 10,
                stepSpeed: 1
            }
        }

    },
    figures: [
        { // []
            coords: [ [0, -1], [0, 0], [1, -1], [1, 0] ],
            positions: 1
        },
        { // |
            coords: [ [0, -2], [0, -1], [0, 0], [0, 1] ],
            positions: 2
        },
        { // L
            coords: [ [0, -1], [0, 0], [0, 1], [1, 1] ],
            positions: 4
        },
        { // J
            coords: [ [0, -1], [0, 0], [0, 1], [-1, 1] ],
            positions: 4
        },
        { // S
            coords: [ [-1, 0], [0, -1], [0, 0], [1, -1] ],
            positions: 2
        },
        { // T
            coords: [ [-1, 0], [0, 0], [1, 0], [0, -1] ],
            positions: 4
        },
        { // Z
            coords: [ [-1, -1], [0, -1], [0, 0], [1, 0] ],
            positions: 2
        }
    ],
    step: null,
    curFigure: null,
    nextFigure: null,
    world: {
        rightBorder: 0,
        leftBorder: 0,
        topBorder: 0,
        bottomBorder: 0,
        width: null,
        height: null,
        color: '#aaaaaa',
        map: null // одномерный массив длиной width * height со значениями bool
    },
    colors: [
        '#ff5526', // orange
        '#33a5ff', // blue
        '#9933ff', // violet
        '#18f04e', // green
    ],

    state: {
        app: {
            grid: false,
            mode: 'default',
            theme: 'default'
        },
        stats: {
            level: 0,
            speed: 0,
            score: 0,
            hiscore: 0,
            counter: 0
        },
        game: {
            status: 'new' // is_launched, is_over, is_paused
        }
    },

    // The init
    init: function() {
        this.setWorldSizes();
        this.setEmptyWorldMap();
        this.initState();
    },
    initState: function() {
        // localStorage.setItem('tetris', JSON.stringify(null)); // Remove!

        let data = this.readStateFromLS() || {
            theme: this.state.app.theme,
            grid: this.state.app.grid,
            hiscore: this.state.stats.hiscore
        };

        this.state.app.theme = data.theme;
        this.state.app.grid = data.grid;
        this.state.stats.hiscore = data.hiscore;

        this.writeStateToLS(data);
    },
    setWorldSizes: function() {
        this.world.leftBorder = 0;
        this.world.rightBorder = this.properties.gameFieldSize.width - 1;
        this.world.topBorder = 0;
        this.world.bottomBorder = this.properties.gameFieldSize.height - 1;
        this.world.width = this.properties.gameFieldSize.width;
        this.world.height = this.properties.gameFieldSize.height;
    },
    setEmptyWorldMap: function() {
        let row = [];
        
        for (let i = 0; i < this.world.width; i++) {
            let cellIsFilled = false;
            row.push(cellIsFilled);
        }

        this.world.map = [];

        for (let i = 0; i < this.world.height; i++) {
            this.world.map.push(row.slice());
        }
    },
    readStateFromLS: function() {
        return JSON.parse(localStorage.getItem('tetris'));
    },
    writeStateToLS: function() {
        let newData = {
            theme: this.state.app.theme,
            hiscore: this.state.stats.hiscore
        };

        localStorage.setItem('tetris', JSON.stringify(newData));
    },

    // Изменение данных
    resetStats: function() {
        this.state.stats.level = 1;
        this.state.stats.speed = 1;
        this.state.stats.score = 0;
    },
    getStats: function() {
        return this.state.stats;
    },
    getGameStatus: function() {
        return this.state.game.status;
    },
    getProps: function() {
        return this.properties;
    },
    increaceScore: function(value) {
        let maxSpeed = this.properties.mode[this.state.app.mode].maxSpeed;
        let stepSpeed = this.properties.mode[this.state.app.mode].stepSpeed;

        for (let i = 0; i < value; i++) {
            this.state.stats.counter++;
            this.state.stats.score += 10 * this.state.stats.speed;

            if (this.state.stats.counter == 10) {
                this.state.stats.counter = 0;
                this.state.stats.level++;

                if (this.state.stats.speed > maxSpeed) {
                    this.state.stats.speed = 1;
                } else {
                    this.state.stats.speed += stepSpeed;
                }
            }

            if (this.state.stats.score > this.state.stats.hiscore) {
                this.state.stats.hiscore = this.state.stats.score;
                this.writeStateToLS();
            }
        }
    },
    setCurFigure: function() {
        // 1. Скопировать фигуру из nextFigure
        this.curFigure =  {
            figure: Object.assign({}, this.nextFigure.figure),
            centerCoords: {},
            color: this.nextFigure.color,
            clockwise: true
        };
        
        // 2. Задать ей координаты центра
        let centerX = Math.ceil(this.world.rightBorder / 2);
        let centerY = -this.getMaxOfArray(this.curFigure.figure.coords.map(coord => coord[1])) - 2;

        this.curFigure.centerCoords.x = centerX;
        this.curFigure.centerCoords.y = centerY;
    },
    setCenterCoords: function(centerCoords) {
        this.curFigure.centerCoords = centerCoords;
    },
    getCurFigure: function() {
        return this.curFigure;
    },
    setNextFigure: function() {
        let randomFigure = Object.assign({}, this.getRandomItem(this.figures));
        let randomColor = this.getRandomItem(this.colors);

        this.nextFigure =  {
            figure: randomFigure,
            centerCoords: { x: 1, y: 2 },
            color: randomColor
        };
    },
    getNextFigure: function() {
        return this.nextFigure;
    },
    getWorld: function() {
        return this.world;
    },
    fillWorldMap: function() {
        // 1. Получить координаты текущей фигуры относительно поля
        let fullCoordsOfCurFig = this.getFullCoordsOfCurFig();

        // 2. Заполнить ячейки в world.map
        let worldMapIsFilled = false;
        let filledRowsIndexes = new Set();

        fullCoordsOfCurFig.forEach(coord => {
            let x = coord[0];
            let y = coord[1];

            if (y < this.world.topBorder) {
                worldMapIsFilled = true;
                return;
            }

            this.world.map[y][x] = true;

            if (this.worldMapRowIsFilled(y)) filledRowsIndexes.add(y);
        });

        // 3. Удалить заполненные строки
        for (let row of Array.from(filledRowsIndexes).sort()) {
            this.clearWorldMapRow(row);
        }

        // 4. Увеличить очки
        this.increaceScore(filledRowsIndexes.size);

        // 5. Проверить заполнена ли верхняя строка карты
        if (worldMapIsFilled) {
            this.state.game.status = 'finished';
            return;
        }

        // 6. Сгенерировать новые фигуры
        this.setCurFigure();
        this.setNextFigure();
    },
    getFullCoordsOfCurFig: function() {
        let fullCoords = [];
        this.curFigure.figure.coords.forEach(coord => {
            let x = coord[0] + this.curFigure.centerCoords.x;
            let y = coord[1] + this.curFigure.centerCoords.y;

            fullCoords.push([x, y]);
        });

        return fullCoords;
    },
    worldMapRowIsFilled: function(rowIndex) {
        let row = this.world.map[rowIndex];
        let rowIsFilled = !row.some(cell => {
            return cell === false;
        });

        return rowIsFilled;
    },
    clearWorldMapRow: function(rowIndex) {
        // 1. Удалить заполненную строку
        this.world.map.splice(rowIndex, 1);

        // 2. Вставить пустую строку в начало массива
        let emptyRow = [];

        for (let i = 0; i < this.world.width; i++) {
            emptyRow.push(false);
        }

        this.world.map.unshift(emptyRow);
    },
    moveCurFigure: function(dir) {
        // 1. Предварительный сдвиг центра фигуры
        let newCenterCoords = {};

        switch (dir) {
            case 'left':
                newCenterCoords.x = this.curFigure.centerCoords.x - 1;
                newCenterCoords.y = this.curFigure.centerCoords.y;
                break;
            case 'right':
                newCenterCoords.x = this.curFigure.centerCoords.x + 1;
                newCenterCoords.y = this.curFigure.centerCoords.y;
                break;
            case 'down':
                newCenterCoords.x = this.curFigure.centerCoords.x;
                newCenterCoords.y = this.curFigure.centerCoords.y + 1;
                break;
        }

        // 2. Нахождение координат фигуры относительно игрового поля
        let newFullCoords = [];

        this.curFigure.figure.coords.forEach(coord => {
            let x = coord[0] + newCenterCoords.x;
            let y = coord[1] + newCenterCoords.y;

            newFullCoords.push([x, y]);
        });

        // 3. Проверка на столкновение с границами игрового поля
        let isCrossingBorder = false;
        let atBottom = false;
        let isVisible = false;

        newFullCoords.forEach(coord => {
            let x = coord[0];
            let y = coord[1];

            if (x < this.world.leftBorder) {
                isCrossingBorder = true;
            } else if (x > this.world.rightBorder) {
                isCrossingBorder = true;
            }

            if (y > this.world.bottomBorder) {
                atBottom = true;
            } else if (y >= this.world.topBorder) {
                isVisible = true;
            }
        });

        // 4. Проверка на столкновение с миром
        let isCrossingWorld = false;
        let usable = true;

        newFullCoords.forEach(coord => {
            let x = coord[0];
            let y = coord[1];

            if (dir == 'left' || dir == 'right') usable = isVisible;

            if (!this.world.map.hasOwnProperty(y)) return;

            switch (dir) {
                case 'down':
                    if (this.world.map[y][x] === true) atBottom = true;
                    break;
                case 'right':
                    if (this.world.map[y][x] === true) isCrossingWorld = true;
                    break;
                case 'left':
                    if (this.world.map[y][x] === true) isCrossingWorld = true;
                    break;
            }
        });

        // 5. Присвоить новые координаты
        if (!usable || isCrossingBorder || isCrossingWorld) {
            return;
        } else if (atBottom) {
            this.fillWorldMap();
            return;
        }

        this.setCenterCoords(newCenterCoords);
    },
    dropCurFigure: function() {
        if (this.state.game.status != 'launched') return;

        if (this.step) this.moveCurFigure('down');

        let stepTime = this.properties.defaultSpeedMs - (this.state.stats.speed - 1) * 100;

        this.step = setTimeout(() => {
            this.dropCurFigure.call(this);
        }, stepTime);
    },
    rotateCurFigure: function() {
        // 1. Проверка на возможность поворота фигуры
        if (this.curFigure.figure.positions == 1) return;

        // 2. Установить коэффициент направления поворота фигуры
        let clockwiseCoef = (this.curFigure.clockwise) ? -1 : 1;

        // 3. Предварительный поворот фигуры относительно центра
        let newCoords = [];

        this.curFigure.figure.coords.forEach(coord => {
            let x = coord[1] * clockwiseCoef;
            let y = -1 * coord[0] * clockwiseCoef;

            newCoords.push([x, y]);
        });

        // 4. Нахождение координат фигуры относительно игрового поля
        let newFullCoords = [];

        newCoords.forEach(coord => {
            let x = coord[0] + this.curFigure.centerCoords.x;
            let y = coord[1] + this.curFigure.centerCoords.y;

            newFullCoords.push([x, y]);
        });
        
        // 5. Проверка на столкновение с границами игрового поля
        let isCrossingBorder = false;
        let isVisible = false;

        newFullCoords.forEach(coord => {
            let x = coord[0];
            let y = coord[1];

            if (x < this.world.leftBorder) {
                isCrossingBorder = true;
            } else if (x > this.world.rightBorder) {
                isCrossingBorder = true;
            } else if (y > this.world.bottomBorder) {
                isCrossingBorder = true;
            }

            if (y >= this.world.topBorder) isVisible = true;
        });

        // 6. Проверка на столкновение с миром
        let isCrossingWorld = false;

        newFullCoords.forEach(coord => {
            let x = coord[0];
            let y = coord[1];

            if (y < this.world.topBorder || y > this.world.bottomBorder) return;

            if (this.world.map[y][x] === true) isCrossingWorld = true;
        });
        
        // 7. Присвоить новые координаты
        if (isCrossingBorder || isCrossingWorld || !isVisible) {
            return;
        }

        this.curFigure.figure.coords = newCoords;

        // 8. Если количество позиций 2 - изменить направление поворота
        if (this.curFigure.figure.positions == 2) {
            this.curFigure.clockwise = !this.curFigure.clockwise;
        }
    },

    // Основные действия
    start: function() {
        if (this.state.game.status != 'new' && this.state.game.status != 'paused') return;

        if (this.state.game.status == 'new') {
            this.setNextFigure();
            this.setCurFigure();
            this.setNextFigure();
            this.resetStats();
        }

        this.state.game.status = 'launched';
        this.dropCurFigure.call(this);
    },
    stop: function() {
        clearTimeout(this.step);
        this.step = null;
        this.state.game.status = 'paused';
    },
    reset: function() {
        clearTimeout(this.step);
        this.step = null;
        this.state.game.status = 'new';
        this.curFigure = null;
        this.nextFigure = null;
        this.resetStats();
        this.setEmptyWorldMap();
    },

    // Вспомогательные функции
    getMaxOfArray: function(arr) {
        return Math.max.apply(null, arr);
    },
    getRandomItem: function(arr) {
        let max = arr.length;
        let randomIndex = Math.floor(Math.random() * max);

        return arr[randomIndex];
    }
};

export default model;