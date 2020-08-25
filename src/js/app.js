import model from './model';
import view from './view';
import controller from './controller';

const app = document.getElementById('app');

// Инициализация модели (данных)
model.init();

// Инициализация представления (ui)
let props = model.getProps();
view.init(app);
view.setProps(props);

// Вывод основных данных перед стартом игры
let stats = model.getStats();
view.updateStats(stats);

// Инициализация контроллера
document.addEventListener('DOMContentLoaded', event => {
    controller.init(app, model, view);
});

/* 

Задачи:

1. Исправить ошибки

[✓] 1.1. Ошибка заполнения карты мира, удаления заполненных строк и тд
[✓] 1.2. Зажатие клавиши поворота
[ ] 1.3. Ошибка новой игры после проигрыша
[✓] 1.4. Вывод статистики только по факту
[✓] 1.5. Вывод следующей фигуры только по факту
[ ] 1.6. Протестировать, выявить возможные ошибки

2. Реализация новых компонентов и функций игры

[ ] 2.1. Сетка
[ ] 2.2. Темная тема
[ ] 2.3. Сброс игры (появление модалки с подтверждением)
[ ] 2.4. Протестировать, выявить возможные ошибки

*/
