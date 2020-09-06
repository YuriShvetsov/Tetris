import model from './model';
import view from './view';
import controller from './controller';

const app = document.getElementById('app');

// Инициализация данных
model.init();

// Инициализация ui
let props = model.getProps();
view.init(app);
view.setProps(props);

// Вывод данных перед стартом игры
let stats = model.getStats();
view.updateStats(stats);

// Инициализация управления
document.addEventListener('DOMContentLoaded', event => {
    controller.init(app, model, view);
});

/* 

Задачи:

1. Исправить ошибки

[✓] - 

2. Реализация новых компонентов и функций игры

[✓] - 

*/
