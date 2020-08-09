const model = {
    properties: {
        gameFieldSize: { width: 30, height: 25 },
        nextFigureSize: { width: 4, height: 4 }
    },
    figures: [
        { // figure: square
            coords: [ [0, -1], [0, 0], [1, -1], [1, 0] ],
            positions: 1
        },
        { // figure: I
            coords: [ [0, -2], [0, -1], [0, 0], [0, 1] ],
            positions: 2
        },
        { // figure: L
            coords: [ [0, -1], [0, 0], [0, 1], [1, 1] ],
            positions: 4
        },
        { // figure: J
            coords: [ [0, -1], [0, 0], [0, 1], [-1, 1] ],
            positions: 4
        },
        { // figure: S
            coords: [ [-1, 0], [0, -1], [0, 0], [1, -1] ],
            positions: 2
        },
        { // figure: T
            coords: [ [-1, 0], [0, 0], [1, 0], [0, -1] ],
            positions: 4
        },
        { // figure: Z
            coords: [ [-1, -1], [0, -1], [0, 0], [1, 0] ],
            positions: 2
        }
    ],
    world: {
        rightBorder: 0,
        leftBorder: 0,
        topBorder: 0,
        bottomBorder: 0,
        color: '#aaaaaa',
        map: [] 
    },
    state: {
        app: null,
        game: null,
        figure: null
    },
    colors: [
        '#ff5526', // orange
        '#33a5ff', // blue
        '#9933ff', // violet
        '#18f04e', // green
    ],
    init: function() {
        this.setWorldBorders();
        this.initState();
    },
    initState: function() {
        localStorage.setItem('tetris', JSON.stringify(null)); // Remove!

        let data = this.readStateFromLS() || {
            app: {
                theme: 'default'
            },
            game: {
                level: 1,
                speed: 1,
                score: 0,
                hiScore: 0
            },
            curFigure: {
                figure: this.figures[3],
                coords: { x: Math.ceil(this.world.rightBorder / 2), y: 2 },
                color: this.colors[0]
            }
        };

        this.state = data;
        this.writeStateToLS(data);
    },
    readStateFromLS: function() {
        return JSON.parse(localStorage.getItem('tetris'));
    },
    writeStateToLS: function(data) {
        localStorage.setItem('tetris', JSON.stringify(data));
    },
    getState: function() {
        return this.state.game;
    },
    getProps: function() {
        return this.properties;
    },
    getCurFigure: function() {
        return this.state.curFigure;
    },
    setWorldBorders: function() {
        this.world.leftBorder = 0;
        this.world.rightBorder = this.properties.gameFieldSize.width - 1;
        this.world.topBorder = 0;
        this.world.bottomBorder = this.properties.gameFieldSize.height - 1;
    }
};

export default model;