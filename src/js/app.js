import model from './model';
import view from './view';
import controller from './controller';

const app = document.getElementById('app');

// Инициализация модели (данных)
model.init();

// Инициализация представления (ui)
let props = model.getProps();
view.setProps(props);
view.init(app);

// Вывод основных данных перед стартом игры
let stats = model.getStats();
view.updateStats(stats);

// Инициализация контроллера
controller.init(app, model, view);
