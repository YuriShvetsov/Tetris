import graphics from './json/graphics.json';

const view = {
    properties: {
        pixelDepth: 2,
        squareSize: 20,
        padding: 0
    },
    elements: null,

    /* The init & setting parameters */

    init: function(app) {
        this.app = app;
        this.elements = {
            gameField: {
                canvas: this.app.querySelector('#game-field'),
                context: null,
                sizePx: null
            },
            nextFigure: {
                canvas: this.app.querySelector('#next-figure'),
                context: null,
                sizePx: null
            },
            menuBtn: this.app.querySelector('.js-menu-btn'),
            menuPopup: this.app.querySelector('.js-menu-popup'),
            startBtn: this.app.querySelector('.js-start'),
            resetBtn: this.app.querySelector('.js-reset'),
            overlay: this.app.querySelector('.js-overlay'),
            gameOver: this.app.querySelector('.js-game-over'),
            stats: {
                level: this.app.querySelector('.js-level'),
                speed: this.app.querySelector('.js-speed'),
                score: this.app.querySelector('.js-score'),
                hiscore: this.app.querySelector('.js-hiscore')
            }
        };

        setTimeout(() => { this.initCanvas() });

        this.preLoadGraphics();
    },
    initCanvas: function() {
        this.elements.gameField.context = this.elements.gameField.canvas.getContext('2d');
        this.elements.nextFigure.context = this.elements.nextFigure.canvas.getContext('2d');

        this.setCanvasSize(this.elements.gameField, this.elements.gameField.sizePx.width, this.elements.gameField.sizePx.height);
        this.setCanvasSize(this.elements.nextFigure, this.elements.nextFigure.sizePx.width, this.elements.nextFigure.sizePx.height);
    },
    initAppSettings: function(settings) {
        Object.keys(settings).forEach(key => {
            if (this.hasOwnProperty(key)) {
                let object = this[key];
                let state = settings[key];
                object.init(state);
            }
        });
    },
    preLoadGraphics: function() {
        Object.keys(graphics).forEach(key => {
            graphics[key].forEach(url => {
                let img = new Image();
                img.src = url;
            });
        });
    },
    setProps: function(props) {
        if (!props.hasOwnProperty('gameFieldSize') || !props.hasOwnProperty('nextFigureSize')) {
            console.error('Data error! Properties is not found');
            return;            
        }

        let gameFieldSize = props['gameFieldSize'];
        let nextFigureSize = props['nextFigureSize'];

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

    /* Rendering */

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
            for (let x in world.map[y]) {
                let cell = world.map[y][x];

                if (cell === true) {
                    this.renderSquare(this.elements.gameField.context, x, y, world.color);
                }
            }
        }
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
    clearGameFieldCanvas: function() {
        this.clearCanvas(this.elements.gameField);
    },
    clearNextFigureCanvas: function() {
        this.clearCanvas(this.elements.nextFigure);
    },

    /* Updating visual states of app elements */

    updateTextElement: function(element, text) {
        if (!this.elements.hasOwnProperty(element)) return;

        this.elements[element].innerHTML = text;
    },
    updateStats: function(stats) {
        Object.keys(stats).forEach(key => {
            if (this.elements.stats.hasOwnProperty(key)) {
                this.elements.stats[key].innerHTML = stats[key];
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
    setCaptionForStartBtn: function(gameIsStarted) {
        if (gameIsStarted) {
            this.elements.startBtn.innerHTML = 'pause';
        } else {
            this.elements.startBtn.innerHTML = 'start';
        }
    },
    showReportGameOver: function() {
        this.elements.gameOver.classList.add('game-over-caption_visible');
    },
    hideReportGameOver: function() {
        this.elements.gameOver.classList.remove('game-over-caption_visible');
    },
    showGameField: function() {
        this.elements.gameField.canvas.classList.remove('canvas_game-field_hidden');
    },
    hideGameField: function() {
        this.elements.gameField.canvas.classList.add('canvas_game-field_hidden');
    },

    grid: {
        init: function(state) {
            this.element = view.app.querySelector('.js-grid');
            this.checkbox = view.app.querySelector('.js-grid-checkbox');
            this.checkbox.checked = state.isActive;

            if (state.isActive) {
                this.show();
            } else {
                this.hide();
            }
        },
        show: function() {
            this.element.classList.add('grid_visible');
        },
        hide: function() {
            this.element.classList.remove('grid_visible');
        }
    },
    darkTheme: {
        init: function(state) {
            this.element = view.app;
            this.checkbox = view.app.querySelector('.js-dark-theme-checkbox');
            this.checkbox.checked = state.isActive;

            if (state.isActive) {
                this.activate();
            } else {
                this.unActivate();
            }
        },
        activate: function() {
            this.element.classList.add('app_theme_dark');
        },
        unActivate: function() {
            this.element.classList.remove('app_theme_dark');
        }
    },
    showModal: function(modal, callback) {    
        modal.classList.add('modal_visible');
        callback();
    },
    hideModal: function(modal) {
        modal.classList.add('modal_hidden');

        setTimeout(() => {
            modal.classList.remove('modal_visible');
            modal.classList.remove('modal_hidden');
        }, 200);
    }
};

export default view;
