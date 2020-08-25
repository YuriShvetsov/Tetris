const controller = {
    state: {
        popup: {
            isActive: false,
            element: null
        },
        game: {
            isLaunched: false
        }
    },
    frame: null,
    pressed: false,

    // The init
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
        document.addEventListener('keyup', event => {
            this.keyupHandler.call(this, event);
        });
    },
    clickHandler: function(event) {
        event.target.blur();

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
        if (this.state.game.isLaunched) {
            switch (event.keyCode) {
                case 37: // Arrow left
                    this.model.moveCurFigure('left');
                    break;
                case 39: // Arrow right
                    this.model.moveCurFigure('right');
                    break;
                case 40: // Arrow down
                    this.model.moveCurFigure('down');
                    break;
                case 13: // Enter
                    if (this.pressed) break;

                    this.pressed = true;
                    this.model.rotateCurFigure();
                    break;
            }
        }

        switch (event.keyCode) {
            case 27: // Escape
                if (this.state.game.isLaunched) {
                    this.stopGame();
                } else if (this.state.popup.isActive) {
                    this.closePopup();
                }
                break;
        }
    },
    keyupHandler: function(event) {
        if (!this.state.game.isLaunched) return;

        switch (event.keyCode) {
            case 13: // Enter
                this.pressed = false;
                break;
        }
    },

    // Main actions
    toggleGame: function() {
        this.state.game.isLaunched ? this.stopGame() : this.startGame();
    },
    startGame: function() {
        this.state.game.isLaunched = true;
        this.model.start();
        this.view.setCaptionForStartBtn(this.state.game.isLaunched);

        update.call(this);

        function update() {
            let gameStatus = this.model.getGameStatus();

            switch (gameStatus) {
                case 'launched':
                    this.render();
                    this.frame = requestAnimationFrame(update.bind(this));
                    break;
                case 'finished':
                    this.finishGame();
                    break;
            }
        }
    },
    render: function() {
        let curFigure = this.model.getCurFigure();
        let world = this.model.getWorld();
        this.view.clearGameFieldCanvas();
        this.view.renderCurFigure(curFigure);
        this.view.renderWorldMap(world);

        if (this.model.nextFigureIsUpdated()) {
            let nextFigure = this.model.getNextFigure();
            this.view.clearNextFigureCanvas();
            this.view.renderNextFigure(nextFigure);
        }

        if (this.model.statsIsChanged()) {
            let stats = this.model.getStats();
            this.view.updateStats(stats);
        }
    },
    stopGame: function() {
        this.state.game.isLaunched = false;
        this.model.stop();
        this.view.setCaptionForStartBtn(false);

        cancelAnimationFrame(this.frame);
    },
    resetGame: function() {
        this.stopGame();
        this.model.reset();
        this.view.clearGameFieldCanvas();
        this.view.clearNextFigureCanvas();
    },
    finishGame: function() {
        this.state.game.isLaunched = false;
        this.model.stop();
        this.view.setCaptionForStartBtn(false);
        this.view.showReportGameOver();
        this.view.hideGameField();

        cancelAnimationFrame(this.frame);

        setTimeout(() => {
            this.model.reset();

            let stats = this.model.getStats();
            this.view.updateStats(stats);

            this.view.clearGameFieldCanvas();
            this.view.clearNextFigureCanvas();
            this.view.hideReportGameOver();
            this.view.showGameField();
        }, 2500);
    },

    // Other actions
    openPopup: function(popupBtn) {
        if (this.state.game.isLaunched) this.stopGame();

        let popup = popupBtn.parentElement.querySelector('.popup');

        this.state.popup.isActive = true;
        this.state.popup.element = popup;

        this.view.showPopup(this.state.popup.element);
        this.view.showOverlay();
    },
    closePopup: function() {
        this.view.hidePopup(this.state.popup.element);
        this.view.hideOverlay();

        this.state.popup.isActive = false;
        this.state.popup.element = null;
    }
};

export default controller;