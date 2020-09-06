const controller = {
    state: {
        modal: {
            isActive: false,
            element: null
        },
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
        this.initUI();
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
    initUI: function() {
        let appSettings = this.model.getAppSettings();
        this.view.initAppSettings(appSettings);
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
        if (this.model.getGameStatus() == 'finished') return;

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
        if (this.model.gameWorldIsChanged()) {
            let curFigure = this.model.getCurFigure();
            let world = this.model.getWorld();
            this.view.clearGameFieldCanvas();
            this.view.renderCurFigure(curFigure);
            this.view.renderWorldMap(world);
        }

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
        if (!this.state.game.isLaunched) return;

        this.state.game.isLaunched = false;
        this.model.stop();
        this.view.setCaptionForStartBtn(false);

        cancelAnimationFrame(this.frame);
    },
    showModalResetGame: function(button) {
        let gameStatus = this.model.getGameStatus();

        if (gameStatus != 'launched' && gameStatus != 'paused') return;

        if (gameStatus === 'launched') {
            this.stopGame();
        }

        this.openConfirmModal(button.dataset.modalid);
    },
    resetGame: function() {
        this.model.reset();
        this.view.updateStats(this.model.getStats());
        this.view.clearGameFieldCanvas();
        this.view.clearNextFigureCanvas();
        this.closeModal();
    },
    finishGame: function() {
        this.state.game.isLaunched = false;
        this.view.setCaptionForStartBtn(false);
        this.view.showReportGameOver();
        this.view.hideGameField();

        if (this.model.getAppSettings().grid.isActive) this.view.grid.hide();

        cancelAnimationFrame(this.frame);

        setTimeout(() => {
            this.model.reset();

            let stats = this.model.getStats();
            this.view.updateStats(stats);
            this.view.clearGameFieldCanvas();
            this.view.clearNextFigureCanvas();
            this.view.hideReportGameOver();
            this.view.showGameField();

            if (this.model.getAppSettings().grid.isActive) this.view.grid.show();
        }, 3000);
    },

    // Other actions
    openPopup: function(popupBtn) {
        if (this.state.game.isLaunched) this.stopGame();

        let popup = popupBtn.parentElement.querySelector('.popup');

        this.state.popup.isActive = true;
        this.state.popup.element = popup;

        this.view.showPopup(this.state.popup.element);
    },
    closePopup: function() {
        this.view.hidePopup(this.state.popup.element);

        this.state.popup.isActive = false;
        this.state.popup.element = null;
    },
    toggleDarkTheme: function(checkbox) {
        let isChecked = checkbox.checked;

        this.model.setDarkTheme(isChecked);

        if (isChecked) {
            this.view.darkTheme.activate();
        } else {
            this.view.darkTheme.deactivate();
        }

        if (this.model.getGameStatus() == 'paused') this.render();
    },
    toggleGrid: function(checkbox) {
        let isChecked = checkbox.checked;

        this.model.setGrid(isChecked);

        if (isChecked) this.view.grid.show();
        else this.view.grid.hide(); 
    },
    openConfirmModal: function(modalId) {
        let modalTemplate = this.app.querySelector('#' + modalId);
        let modalContent = document.importNode(modalTemplate.content, true);
        let modal = modalContent.querySelector('.js-modal');

        app.append(modal); 

        this.state.modal.isActive = true;
        this.state.modal.element = modal;

        this.view.showOverlay();
        
        this.view.openModal(modal, () => {
            modal.addEventListener('click', event => {
                let actionName = event.target.dataset.prop;

                if (actionName === undefined) return;

                if (!this.hasOwnProperty(actionName)) return;

                let action = this[actionName];

                action.call(this);
            });
        });
    },
    closeModal: function() {
        this.view.hideOverlay();
        this.view.closeModal(this.state.modal.element);

        this.state.isActive = false;
        this.state.element = null;
    }
};

export default controller;