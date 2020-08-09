import model from './model';
import view from './view';
import controller from './controller';

const app = document.getElementById('app');

model.init();

let props = model.getProps();
view.setProps(props);
view.init(app);

let gameState = model.getState();
view.updateGameState(gameState);

controller.init(app, model, view);

/////////////////////////////////

let curFigure = model.getCurFigure();
view.renderCurFigure(curFigure);