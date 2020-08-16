const model = {
    // Основные параметры и объекты игры
    properties: {
        gameFieldSize: { width: 15, height: 25 },
        nextFigureSize: { width: 4, height: 4 },
        defaultSpeedMs: 1200
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
        color: '#aaaaaa',
        map: [] 
    },
    colors: [
        '#ff5526', // orange
        '#33a5ff', // blue
        '#9933ff', // violet
        '#18f04e', // green
    ],

    // Состояние данных игры (настройки ui, статистика игры, текущее состояние игры)
    state: {
        app: {
            theme: 'default'
        },
        stats: {
            level: 0,
            speed: 0,
            score: 0,
            hiscore: 0
        },
        game: {
            isNew: true
        }
    },

    // Инициализация данных игры (установка параметров для игрового мира, дефолтных значений и прочее)
    init: function() {
        this.setWorldBorders();
        this.setEmptyWorldMap();
        this.initState();
    },
    initState: function() {
        localStorage.setItem('tetris', JSON.stringify(null)); // Remove!

        let data = this.readStateFromLS() || {
            theme: this.state.app.theme,
            hiscore: this.state.stats.hiscore
        };

        this.state.app.theme = data.theme;
        this.state.stats.hiscore = data.hiscore;

        this.writeStateToLS(data);
    },
    setWorldBorders: function() {
        this.world.leftBorder = 0;
        this.world.rightBorder = this.properties.gameFieldSize.width - 1;
        this.world.topBorder = 0;
        this.world.bottomBorder = this.properties.gameFieldSize.height - 1;
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

    // Работа с данными (получение, изменение)
    getStats: function() {
        return this.state.stats;
    },
    getProps: function() {
        return this.properties;
    },
    setCurFigure: function() {
        this.curFigure =  {
            figure: Object.assign([], this.figures[1]),
            centerCoords: {},
            color: this.colors[0],
            clockwise: true
        };

        let centerX = Math.ceil(this.world.rightBorder / 2);
        let centerY = -this.getMaxOfArray(this.curFigure.figure.coords.map(coord => coord[1])) - 2;

        this.curFigure.centerCoords.x = centerX;
        this.curFigure.centerCoords.y = centerY;
    },
    getMaxOfArray: function(arr) {
        return Math.max.apply(null, arr);
    },
    getCurFigure: function() {
        return this.curFigure;
    },
    setNextFigure: function() {
        this.nextFigure =  {
            figure: Object.assign([], this.figures[1]),
            centerCoords: { x: 1, y: 2 },
            color: this.colors[2]
        };
    },
    setEmptyWorldMap: function() {
        let row = [];

        for (let i = 0; i <= this.world.rightBorder; i++) {
            row.push(false);
        }

        for (let i = 0; i <= this.world.bottomBorder; i++) {
            this.world.map.push(Object.assign([], row));
        }
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
    fillWorldMap: function() {
        // 1. Получить координаты текущей фигуры относительно поля
        let curFigFullCoords = this.getFullCoordsOfCurFig();

        // 2. Заполнить ячейки в world.map
        curFigFullCoords.forEach(coord => {
            let column = coord[0];
            let row = coord[1];

            this.world.map[row][column] = true;
        });
    },
    getWorld: function() {
        return this.world;
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

        // 2. Предварительный сдвиг всех точек фигуры
        let newGlobalCoords = [];
        this.curFigure.figure.coords.forEach(coord => {
            let x = coord[0] + newCenterCoords.x;
            let y = coord[1] + newCenterCoords.y;

            newGlobalCoords.push([x, y]);
        });

        // 3. Проверка столкновения с миром
        let isCrossingWorld = false;


        // 4. Проверка столкновения всех точек фигуры с границами поля
        let isInsideField = true;

        let leftBorder = this.world.leftBorder;
        let rightBorder = this.world.rightBorder;
        let bottomBorder = this.world.bottomBorder;

        newGlobalCoords.forEach(coord => {
            let coordX = coord[0];
            let coordY = coord[1];

            if (coordX < leftBorder) {
                isInsideField = false;
            } else if (coordX > rightBorder) {
                isInsideField = false;
            } else if (coordY > bottomBorder) {
                isInsideField = false;
                this.fillWorldMap();
                setTimeout(() => { this.setCurFigure() });
            }
        });

        if (isInsideField) this.setCenterCoords(newCenterCoords);
        console.log(this.getFullCoordsOfCurFig());
    },
    setCenterCoords: function(centerCoords) {
        this.curFigure.centerCoords = centerCoords;
    },
    setSpeed: function(value) {
        this.state.stats.speed = value;
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

        // 4. Предварительный поворот всех точек фигуры
        let newGlobalCoords = [];
        newCoords.forEach(coord => {
            let x = coord[0] + this.curFigure.centerCoords.x;
            let y = coord[1] + this.curFigure.centerCoords.y;

            newGlobalCoords.push([x, y]);
        });
        
        // 5. Проверить столкновение с миром
        
        // ...

        // 6. Проверка пересечения всех точек фигуры с границами поля
        let isInsideField = true;

        let leftBorder = this.world.leftBorder;
        let rightBorder = this.world.rightBorder;
        let bottomBorder = this.world.bottomBorder;

        newGlobalCoords.forEach(coord => {
            let coordX = coord[0];
            let coordY = coord[1];

            if (coordX < leftBorder) {
                isInsideField = false;
            } else if (coordX > rightBorder) {
                isInsideField = false;
            } else if (coordY > bottomBorder) {
                isInsideField = false;
            }
        });

        if (!isInsideField) return;
        
        // 7. Присвоить новые координаты
        this.curFigure.figure.coords = newCoords;

        // 8. Если количество позиций 2 - изменить направление поворота
        if (this.curFigure.figure.positions == 2) {
            this.curFigure.clockwise = !this.curFigure.clockwise;
        }
    },
    move: function() {
        this.moveCurFigure('down');
        this.state.step = setTimeout(this.start.bind(this), this.properties.defaultSpeedMs - (this.state.stats.speed - 1) * 100);
    },
    getNextFigure: function() {
        return this.nextFigure;
    },
    createNewGame: function() {
        this.state.game.isNew = false;
        this.setCurFigure()
        this.setNextFigure();
        this.setSpeed(10);
    },

    // Запуск, остановка процесса игры, обнуление и создание новой сессии игры
    start: function() {
        if (this.state.game.isNew) {
            this.createNewGame();
        }

        this.move.call(this);
    },
    stop: function() {
        clearTimeout(this.state.step);
    },
    reset: function() {
        this.stop();
        this.state.game.isNew = true;
        this.world.map = [];

        this.setCurFigure();
        this.setEmptyWorldMap(); 
    }
};

export default model;