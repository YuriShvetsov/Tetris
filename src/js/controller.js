const controller = {
    // Общее состояние игры (активные попапы и прочее)
    state: {
        popup: {
            isActive: false,
            element: null
        },
        gameIsStarted: false
    },
    frame: null,

    /* Инициализация объектов (элемента app, модели и представления),
    а также инициализация обработчиков */
    init: function(app, model, view) {
        this.app = app;
        this.model = model;
        this.view = view;

        this.initHandlers();
    },
    initHandlers: function() {
        this.app.addEventListener('click', event => {
            this.clickHandler.call(this, event);
        });
        document.addEventListener('keydown', event => {
            this.keydownHandler.call(this, event);
        });
    },
    clickHandler: function(event) {
        let prop = event.target.dataset.prop;

        if (this.state.popup.isActive && !this.state.popup.element.contains(event.target)) {
            this.closePopup();
            return;
        }

        if (prop === undefined) return;

        if (this[prop] === undefined || !this[prop]) return;

        let action = this[prop].bind(this, event.target);

        action();
    },
    keydownHandler: function(event) {
        switch (event.keyCode) {
            case 37:
                this.model.moveCurFigure('left');
                // console.log('arrow left');
                break;
            case 39:
                this.model.moveCurFigure('right');
                // console.log('array right');
                break;
            case 40:
                this.model.moveCurFigure('down');
                // console.log('array down');
                break;
            case 13:
                this.model.rotateCurFigure();
                // console.log('enter');
                break;
        }
    },

    // Действия пользователя
    startGame: function() {
        this.state.gameIsStarted = !this.state.gameIsStarted;

        if (!this.state.gameIsStarted) {
            this.stopGame();
            return;
        }
            
        this.model.start();
        update.call(this);

        // обновление данных и перерисовка кадров
        function update() {
            let curFigure = this.model.getCurFigure();
            let world = this.model.getWorld();
            this.view.renderGameField(curFigure, world);

            let nextFigure = this.model.getNextFigure();
            this.view.renderNextFigure(nextFigure);
            this.frame = requestAnimationFrame(update.bind(this));

            let stats = this.model.getStats();
            this.view.updateStats(stats);
        }
    },
    stopGame: function() {
        this.model.stop();
        cancelAnimationFrame(this.frame);
        this.state.gameIsStarted = false;

        console.log('game is stopped');
    },
    resetGame: function() {
        this.state.gameIsStarted = false;
        this.model.reset();
        cancelAnimationFrame(this.frame);
        this.view.clearAll();
    },
    openPopup: function() {
        let popup = arguments[0].parentElement.querySelector('.popup');

        this.view.showPopup(popup);
        this.view.showOverlay();
        this.state.popup.isActive = true;
        this.state.popup.element = popup;
        
        if (this.state.gameIsStarted) {
            this.stopGame();
        }
    },
    closePopup: function() {
        this.view.hidePopup(this.state.popup.element);
        this.view.hideOverlay();
        this.state.popup.isActive = false;
        this.state.popup.element = null;
    }
};

export default controller;