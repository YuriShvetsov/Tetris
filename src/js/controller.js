const controller = {
    state: {
        popup: {
            isActive: false,
            element: null
        }
    },
    init: function(app, model, view) {
        this.app = app;
        this.model = model;
        this.view = view;
        console.log(this.view)

        this.initHandlers();
    },
    initHandlers: function() {
        app.addEventListener('click', event => {
            this.clickHandler.call(this, event);
        });
        // app.addEventListener('keydown', this.keydownHandler);
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

    },
    startGame: function() {
        console.log('game is started');
    },
    stopGame: function() {
        console.log('game is stopped');
    },
    resetGame: function() {
        console.log('game is resetted');
    },
    openPopup: function() {
        let popup = arguments[0].parentElement.querySelector('.popup');

        this.view.showPopup(popup);
        this.view.showOverlay();
        this.state.popup.isActive = true;
        this.state.popup.element = popup;
    },
    closePopup: function() {
        this.view.hidePopup(this.state.popup.element);
        this.view.hideOverlay();
        this.state.popup.isActive = false;
        this.state.popup.element = null;
    }
};

export default controller;