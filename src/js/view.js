const view = {
    // Основные элементы страницы, а также параметры холстов
    elements: {
        gameField: {
            canvas: app.querySelector('#game-field'),
            context: null,
            sizePx: {}
        },
        nextFigure: {
            canvas: app.querySelector('#next-figure'),
            context: null,
            sizePx: {}
        },
        menuBtn: app.querySelector('.js-menu-btn'),
        menuPopup: app.querySelector('.js-menu-popup'),
        level: app.querySelector('.js-level'),
        speed: app.querySelector('.js-speed'),
        score: app.querySelector('.js-score'),
        hiscore: app.querySelector('.js-hiscore'),
        startBtn: app.querySelector('.js-start'),
        resetBtn: app.querySelector('.js-reset'),
        overlay: app.querySelector('.js-overlay')
    },
    properties: {
        pixelDepth: 2,
        squareSize: 20,
        padding: 0
    },

    // Инициализация параметров игры
    init: function(app) {
        this.app = app;
        this.initCanvas();
    },
    initCanvas: function() {
        this.elements.gameField.context = this.elements.gameField.canvas.getContext('2d');
        this.elements.nextFigure.context = this.elements.nextFigure.canvas.getContext('2d');

        this.setCanvasSize(this.elements.gameField, this.elements.gameField.sizePx.width, this.elements.gameField.sizePx.height);
        this.setCanvasSize(this.elements.nextFigure, this.elements.nextFigure.sizePx.width, this.elements.nextFigure.sizePx.height);
    },
    setProps: function(props) {
        let gameFieldSize = props['gameFieldSize'];
        let nextFigureSize = props['nextFigureSize'];

        if (gameFieldSize === undefined || nextFigureSize === undefined) {
            console.error('Data error! Properties is not found.');
            return;
        }

        this.elements.gameField.sizePx = {
            width: gameFieldSize.width * this.properties.pixelDepth * this.properties.squareSize,
            height: gameFieldSize.height * this.properties.pixelDepth * this.properties.squareSize
        };

        this.elements.nextFigure.sizePx = {
            width: nextFigureSize.width * this.properties.pixelDepth * this.properties.squareSize,
            height: nextFigureSize.height * this.properties.pixelDepth * this.properties.squareSize
        };
    },
    setCanvasSize: function(element, width, height) {
        element.canvas.width = width;
        element.canvas.height = height;
        element.canvas.style.width = width / this.properties.pixelDepth + 'px';
        element.canvas.style.height = height / this.properties.pixelDepth + 'px';
        element.context.scale(this.properties.pixelDepth, this.properties.pixelDepth);
    },

    // Отрисовка на холстах
    renderSquare: function(context, x, y, color) {
        let coordX = x * this.properties.squareSize;
        let coordY = y * this.properties.squareSize;

        context.fillStyle = color;
        context.fillRect(coordX, coordY, this.properties.squareSize, this.properties.squareSize);
    },
    renderCurFigure: function(curFigure) {
        curFigure.figure.coords.forEach(square => {
            let coordX = square[0] + curFigure.centerCoords.x;
            let coordY = square[1] + curFigure.centerCoords.y;

            this.renderSquare(this.elements.gameField.context, coordX, coordY, curFigure.color);
        });
    },
    renderWorldMap: function(world) {
        for (let y in world.map) {
            let row = world.map[y];

            for (let x in row) {
                let cell = row[x];

                if (cell === true) {
                    this.renderSquare(this.elements.gameField.context, x, y, world.color);
                }
            }
        }
    },
    renderGameField: function(curFigure, worldMap) {
        this.clearCanvas(this.elements.gameField);
        this.renderCurFigure(curFigure);
        this.renderWorldMap(worldMap);
    },
    renderNextFigure: function(nextFigure) {
        nextFigure.figure.coords.forEach(square => {
            let coordX = square[0] + nextFigure.centerCoords.x;
            let coordY = square[1] + nextFigure.centerCoords.y;

            this.renderSquare(this.elements.nextFigure.context, coordX, coordY, nextFigure.color);
        });
    },
    clearCanvas: function(canvas) {
        canvas.context.clearRect(0, 0, canvas.sizePx.width - 1, canvas.sizePx.height - 1);
    },
    clearAll: function() {
        this.clearCanvas(this.elements.gameField);
        this.clearCanvas(this.elements.nextFigure);
    },

    // Обновление текстовых элементов
    updateTextElement: function(element, text) {
        if (!this.elements[element]) return;

        this.elements[element].innerHTML = text;
    },
    updateStats: function(stats) {
        Object.keys(stats).forEach(key => {
            if (this.elements[key]) {
                this.updateTextElement(key, stats[key]);
            }
        });
    },

    // Прочие элементы страницы и изменение их состояний
    showPopup: function(popup) {
        popup.classList.add('popup_visible');
    },
    hidePopup: function(popup) {
        popup.classList.add('popup_hidden');
        popup.classList.remove('popup_visible');
        setTimeout(() => {
            popup.classList.remove('popup_hidden');
        }, 200);
    },
    showOverlay: function() {
        this.elements.overlay.classList.add('overlay_visible');
    },
    hideOverlay: function() {
        this.elements.overlay.classList.remove('overlay_visible');
    },
};

export default view;