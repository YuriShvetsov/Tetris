const view = {
    elements: {
        gameField: {
            canvas: app.querySelector('#game-field'),
            context: null
        },
        nextFigure: {
            canvas: app.querySelector('#next-figure'),
            context: null
        },
        menuBtn: app.querySelector('.js-menu-btn'),
        menuPopup: app.querySelector('.js-menu-popup'),
        level: app.querySelector('.js-level'),
        speed: app.querySelector('.js-speed'),
        score: app.querySelector('.js-score'),
        hiScore: app.querySelector('.js-hiscore'),
        startBtn: app.querySelector('.js-start'),
        resetBtn: app.querySelector('.js-reset'),
        overlay: app.querySelector('.js-overlay')
    },
    properties: {
        gameFieldSizePx: null,
        nextFigureSizePx: null,
        pixelDepth: 2,
        squareSize: 20,
        padding: 0
    },
    init: function(app) {
        this.app = app;
        this.initCanvas();
    },
    initCanvas: function() {
        this.elements.gameField.context = this.elements.gameField.canvas.getContext('2d');
        this.elements.nextFigure.context = this.elements.nextFigure.canvas.getContext('2d');

        this.setCanvasSize(this.elements.gameField, this.properties.gameFieldSizePx.width, this.properties.gameFieldSizePx.height);
        this.setCanvasSize(this.elements.nextFigure, this.properties.nextFigureSizePx.width, this.properties.nextFigureSizePx.height);
    },
    setProps: function(props) {
        let gameFieldSize = props['gameFieldSize'];
        let nextFigureSize = props['nextFigureSize'];

        if (gameFieldSize === undefined || nextFigureSize === undefined) {
            console.error('Data error! Properties is not found.');
            return;
        }

        this.properties.gameFieldSizePx = {
            width: gameFieldSize.width * this.properties.pixelDepth * this.properties.squareSize,
            height: gameFieldSize.height * this.properties.pixelDepth * this.properties.squareSize
        };

        this.properties.nextFigureSizePx = {
            width: nextFigureSize.width * this.properties.pixelDepth * this.properties.squareSize,
            height: nextFigureSize.height * this.properties.pixelDepth * this.properties.squareSize
        };

        // console.log(this.properties);
    },
    setCanvasSize: function(element, width, height) {
        element.canvas.width = width;
        element.canvas.height = height;
        element.canvas.style.width = width / this.properties.pixelDepth + 'px';
        element.canvas.style.height = height / this.properties.pixelDepth + 'px';
        element.context.scale(this.properties.pixelDepth, this.properties.pixelDepth);
    },
    renderSquare: function(context, x, y, color) {
        let coordX = x * this.properties.squareSize;
        let coordY = y * this.properties.squareSize;

        context.fillStyle = color;
        context.fillRect(coordX, coordY, this.properties.squareSize, this.properties.squareSize);
    },
    renderCurFigure: function(curFigure) {
        curFigure.figure.coords.forEach(square => {
            let coordX = square[0] + curFigure.coords.x;
            let coordY = square[1] + curFigure.coords.y;

            this.renderSquare(this.elements.gameField.context, coordX, coordY, curFigure.color);
        });
    },
    updateTextElement: function(element, text) {
        if (!this.elements[element]) return;

        this.elements[element].innerHTML = text;
    },
    updateGameState: function(state) {
        Object.keys(state).forEach(key => {
            if (this.elements[key]) {
                this.updateTextElement(key, state[key]);
            }
        });
    },
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