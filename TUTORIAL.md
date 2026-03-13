# Туторіал: JavaScript та OWL для Odoo 16 — від нуля до робочого модуля

> Цей туторіал побудований на основі реального модуля `gk_owl` — Todo List додаток.
> Кожен урок пояснює конкретну частину коду з цього проекту.

---

## Зміст

- [Урок 1: Основи JavaScript — що потрібно знати перед OWL](#урок-1-основи-javascript)
- [Урок 2: Структура Odoo модуля для JavaScript](#урок-2-структура-odoo-модуля-для-javascript)
- [Урок 3: Що таке OWL і як він працює в Odoo 16](#урок-3-що-таке-owl)
- [Урок 4: Створення OWL компонента крок за кроком](#урок-4-створення-owl-компонента)
- [Урок 5: Стан компонента (useState)](#урок-5-стан-компонента-usestate)
- [Урок 6: OWL шаблони (XML templates)](#урок-6-owl-шаблони)
- [Урок 7: Обробка подій (t-on-click, t-on-keyup)](#урок-7-обробка-подій)
- [Урок 8: Робота з сервером — ORM сервіс](#урок-8-orm-сервіс)
- [Урок 9: Життєвий цикл компонента (onWillStart)](#урок-9-життєвий-цикл-компонента)
- [Урок 10: Посилання на DOM елементи (useRef)](#урок-10-useref)
- [Урок 11: Реєстрація компонента як дії (registry)](#урок-11-реєстрація-в-registry)
- [Урок 12: Повний розбір проекту — збираємо все разом](#урок-12-повний-розбір-проекту)

---

## Урок 1: Основи JavaScript

### Що таке JavaScript?

JavaScript (JS) — це мова програмування, яка виконується у браузері. В Odoo 16 весь
фронтенд (те, що ви бачите в браузері) працює на JavaScript. OWL — це JavaScript
фреймворк, тому спочатку треба розуміти базовий JS.

### 1.1 Змінні: `const`, `let`, `var`

```javascript
// const — константа, не можна перепризначити
const name = "Задача 1";
// name = "Задача 2";  // ПОМИЛКА! const не можна змінити

// let — змінна, можна перепризначити
let counter = 0;
counter = 1;  // OK

// var — старий спосіб, НЕ рекомендується в сучасному JS
var oldStyle = "не використовуйте";
```

**В нашому проекті:**
```javascript
this.model = "owl.todo.list"   // зберігаємо назву моделі
const text = this.searchInput.el.value  // зберігаємо текст пошуку
```

### 1.2 Типи даних

```javascript
// Рядок (String)
const taskName = "Купити молоко";

// Число (Number)
const taskId = 42;

// Булевий (Boolean) — true або false
const completed = false;

// Масив (Array) — список значень
const tasks = ["Задача 1", "Задача 2", "Задача 3"];

// Об'єкт (Object) — набір пар ключ-значення
const task = {
    name: "Купити молоко",
    color: "#FF0000",
    completed: false
};
```

**В нашому проекті використовується об'єкт:**
```javascript
task: {name: "", color: "#FF0000", completed: false}
```

### 1.3 Функції

```javascript
// Звичайна функція
function sayHello(name) {
    return "Привіт, " + name;
}

// Стрілкова функція (arrow function) — коротший запис
const sayHello2 = (name) => {
    return "Привіт, " + name;
};

// Ще коротше, якщо одна команда:
const sayHello3 = (name) => "Привіт, " + name;
```

**В нашому проекті стрілкові функції використовуються у шаблоні:**
```xml
t-on-click="(e) => this.toggleTask(e, task)"
```
Це означає: "коли натиснуть, виклич `this.toggleTask` і передай подію `e` та задачу `task`".

### 1.4 Класи

Класи — це "шаблони" для створення об'єктів. В OWL кожен компонент — це клас.

```javascript
// Створення класу
class Animal {
    // Конструктор — виконується при створенні
    constructor(name) {
        this.name = name;
    }

    // Метод класу
    speak() {
        console.log(this.name + " каже щось");
    }
}

// Наслідування — створення класу на основі іншого
class Dog extends Animal {
    speak() {
        console.log(this.name + " гавкає!");
    }
}

const dog = new Dog("Бровко");
dog.speak();  // "Бровко гавкає!"
```

**В нашому проекті:**
```javascript
export class OwlTodoList extends Component {
    // OwlTodoList наслідує від Component (базовий клас OWL)
}
```

### 1.5 `this` — посилання на поточний об'єкт

`this` усередині класу вказує на поточний екземпляр об'єкта.

```javascript
class MyComponent {
    setup() {
        this.name = "Мій компонент";   // this = цей компонент
    }

    printName() {
        console.log(this.name);        // this.name = "Мій компонент"
    }
}
```

**В нашому проекті `this` використовується скрізь:**
```javascript
this.state = useState({...})     // стан ЦЬОГО компонента
this.orm = useService("orm")     // ORM сервіс ЦЬОГО компонента
this.state.taskList = [...]      // список задач ЦЬОГО компонента
```

### 1.6 Async/Await — робота з сервером

Коли ми робимо запит до сервера (наприклад, отримати список задач з бази даних),
це займає час. `async/await` дозволяє "почекати" відповідь.

```javascript
// Без async/await (складніше)
function getData() {
    fetch("/api/data")
        .then(response => response.json())
        .then(data => console.log(data));
}

// З async/await (простіше і зрозуміліше)
async function getData() {
    const response = await fetch("/api/data");
    const data = await response.json();
    console.log(data);
}
```

- `async` — позначає функцію як асинхронну
- `await` — "почекай результат" цієї операції

**В нашому проекті:**
```javascript
async getAllTasks() {
    // await = почекай поки сервер поверне дані
    this.state.taskList = await this.orm.searchRead(
        this.model, [], ["name", "color", "completed"]
    );
}
```

### 1.7 Деструктуризація — розпакування значень

```javascript
// Деструктуризація об'єкта
const owl = { Component: "...", useState: "...", onWillStart: "..." };
const { Component, useState, onWillStart } = owl;
// Тепер Component, useState, onWillStart — окремі змінні

// Деструктуризація масиву
const colors = ["red", "green", "blue"];
const [first, second] = colors;  // first = "red", second = "green"
```

**В нашому проекті:**
```javascript
const { Component, useState, onWillStart, useRef } = owl;
// Витягуємо 4 функції з об'єкта owl
```

### 1.8 Spread оператор `...` — копіювання об'єктів

```javascript
const original = { name: "Задача", color: "red" };

// Копіюємо об'єкт і змінюємо одне поле
const copy = { ...original, color: "blue" };
// copy = { name: "Задача", color: "blue" }
```

**В нашому проекті:**
```javascript
editTask(task) {
    this.state.task = { ...task };
    // Копіюємо задачу у форму для редагування
    // ...task розпаковує всі поля задачі в новий об'єкт
}
```

Чому `{...task}` а не просто `task`? Тому що якщо написати `this.state.task = task`,
то обидві змінні будуть вказувати на ТОЙ САМИЙ об'єкт, і зміна одного змінить і
другий. `{...task}` створює незалежну копію.

### 1.9 Модулі: import/export

В сучасному JavaScript код розділяється на модулі (файли). Кожен модуль може
експортувати (віддавати) і імпортувати (отримувати) функції, класи, змінні.

```javascript
// Файл math.js — експортує функцію
export function add(a, b) {
    return a + b;
}

// Інший файл — імпортує функцію
import { add } from './math.js';
console.log(add(2, 3));  // 5
```

**В нашому проекті:**
```javascript
// Імпортуємо registry з ядра Odoo
import { registry } from '@web/core/registry';

// Імпортуємо хук useService
import { useService } from "@web/core/utils/hooks";

// Експортуємо наш компонент
export class OwlTodoList extends Component { ... }
```

`/** @odoo-module **/` — спеціальний коментар, який говорить Odoo: "цей файл є
модулем, обробляй його відповідно".

---

## Урок 2: Структура Odoo модуля для JavaScript

### 2.1 Структура файлів

Ось повна структура нашого модуля `gk_owl`:

```
gk_owl/                          # Корінь модуля
├── __init__.py                  # Ініціалізація Python-пакета
├── __manifest__.py              # Маніфест модуля (налаштування)
├── models/
│   ├── __init__.py
│   └── todo_list.py             # Python модель (backend)
├── security/
│   └── ir.model.access.csv      # Права доступу
├── views/
│   └── todo_list.xml            # Odoo view та меню
└── static/
    └── src/
        └── components/
            └── todo_list/
                ├── todo_list.js     # OWL компонент (JavaScript)
                ├── todo_list.xml    # OWL шаблон (HTML)
                └── todo_list.scss   # Стилі (CSS)
```

### 2.2 Правило для JavaScript файлів

**Усі JS/XML/SCSS файли для фронтенду повинні знаходитися у `static/src/`.**
Це вимога Odoo. Odoo шукає фронтенд-файли тільки тут.

Рекомендована структура:
```
static/src/components/назва_компонента/
    назва_компонента.js       # Логіка
    назва_компонента.xml      # Шаблон (розмітка)
    назва_компонента.scss     # Стилі
```

### 2.3 Реєстрація активів у `__manifest__.py`

Щоб Odoo знав про ваші JS/XML/SCSS файли, їх треба зареєструвати у маніфесті:

```python
{
    'name': 'OWL Test',
    'version': '16.0.1.0.0',
    'depends': ['product'],
    'data': [
        'views/todo_list.xml',         # Odoo views (серверні XML)
        'security/ir.model.access.csv',
    ],
    'assets': {
        'web.assets_backend': [        # ← Тут реєструємо фронтенд-файли
            'gk_owl/static/src/components/todo_list/todo_list.js',
            'gk_owl/static/src/components/todo_list/todo_list.scss',
            'gk_owl/static/src/components/todo_list/todo_list.xml',
        ],
    },
}
```

**Важливо:**
- `data` — серверні XML файли (views, меню, дані)
- `assets` → `web.assets_backend` — фронтенд файли для бекенду Odoo
- Шлях пишеться як `назва_модуля/static/src/...`

### 2.4 Python модель (backend)

Наш JS компонент працює з даними через Python модель:

```python
# models/todo_list.py
from odoo import api, fields, models

class OwlTodo(models.Model):
    _name = 'owl.todo.list'           # Технічна назва моделі
    _description = 'OWL Todo List App'

    name = fields.Char(string="Task Name")  # Назва задачі
    completed = fields.Boolean()             # Виконана чи ні
    color = fields.Char()                    # Колір (hex код)
```

Ця модель створює таблицю в базі даних. JS компонент буде читати і записувати
дані в цю таблицю через ORM сервіс.

### 2.5 Права доступу

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_owl_todo_list,owl_todo_list,model_owl_todo_list,base.group_user,1,1,1,1
```

Це дає всім базовим користувачам повні права на модель `owl.todo.list`.
Без цього файлу JS компонент отримає помилку "Access Denied" при спробі
прочитати або записати дані.

### 2.6 Два типи дій (actions) для JS компонента

У `views/todo_list.xml` є два типи дій:

```xml
<!-- Стандартна дія Odoo — відкриває звичайні form/tree views -->
<record id="action_owl_todo_list" model="ir.actions.act_window">
    <field name="name">Todo List</field>
    <field name="res_model">owl.todo.list</field>
    <field name="view_mode">tree,form</field>
</record>

<!-- Клієнтська дія — відкриває OWL компонент -->
<record id="action_owl_todo_list_js" model="ir.actions.client">
    <field name="name">Todo List OWL</field>
    <field name="tag">owl.action_todo_list_js</field>
    <!-- tag повинен збігатися з тим, що ми реєструємо в JS -->
</record>
```

`ir.actions.client` — це спеціальний тип дії, який говорить Odoo: "не шукай стандартну
view, а знайди JS компонент з цим тегом".

---

## Урок 3: Що таке OWL

### 3.1 OWL — Odoo Web Library

OWL (Odoo Web Library) — це JavaScript фреймворк, створений командою Odoo.
Якщо ви чули про React, Vue чи Angular — OWL схожий на них, але спеціально
розроблений для Odoo.

**Ключові ідеї OWL:**
1. **Компоненти** — інтерфейс будується з окремих компонентів (блоків)
2. **Реактивність** — коли дані змінюються, інтерфейс автоматично оновлюється
3. **Шаблони** — HTML-розмітка описується в XML файлах
4. **Односпрямований потік даних** — дані течуть від батьківського компонента
   до дочірнього

### 3.2 Компонент = Клас + Шаблон

Кожен OWL компонент складається з двох частин:

```
Компонент
├── JS файл (клас)    → Логіка: що робити при кліку, які дані показувати
└── XML файл (шаблон) → Розмітка: як виглядає компонент (HTML)
```

### 3.3 Як OWL працює в Odoo 16

```
Користувач клікає пункт меню
          ↓
Odoo знаходить дію (action)
          ↓
Якщо ir.actions.client → шукає JS компонент в registry
          ↓
OWL створює компонент
          ↓
Викликається setup() → завантажуються дані
          ↓
Рендериться шаблон (XML) → користувач бачить інтерфейс
          ↓
Користувач взаємодіє → викликаються методи → оновлюється стан
          ↓
OWL автоматично перемальовує змінені частини
```

### 3.4 OWL в Odoo 16 vs Odoo 17+

В Odoo 16 OWL доступний як глобальний об'єкт `owl`:
```javascript
const { Component, useState, onWillStart, useRef } = owl;
```

В Odoo 17+ OWL імпортується як модуль:
```javascript
import { Component, useState, onWillStart, useRef } from "@odoo/owl";
```

Цей туторіал використовує синтаксис Odoo 16.

---

## Урок 4: Створення OWL компонента

### 4.1 Мінімальний компонент

Ось найпростіший OWL компонент:

**JS файл (my_component.js):**
```javascript
/** @odoo-module **/

const { Component } = owl;

export class MyComponent extends Component {}

MyComponent.template = 'my_module.MyComponent';
```

**XML файл (my_component.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="my_module.MyComponent" owl="1">
        <div>Привіт, це мій перший OWL компонент!</div>
    </t>
</templates>
```

### 4.2 Розбір кожного рядка

```javascript
/** @odoo-module **/
```
Спеціальний коментар для Odoo. Без нього файл не буде оброблений як модуль.

```javascript
const { Component } = owl;
```
Витягуємо клас `Component` з глобального об'єкта `owl`.

```javascript
export class MyComponent extends Component {}
```
- `export` — робимо клас доступним для інших модулів
- `class MyComponent` — назва нашого компонента
- `extends Component` — наслідуємо від базового класу OWL

```javascript
MyComponent.template = 'my_module.MyComponent';
```
Вказуємо яку XML-розмітку використовувати для рендерингу.

### 4.3 Наш реальний компонент

```javascript
/** @odoo-module **/

import { registry } from '@web/core/registry';
const { Component, useState, onWillStart, useRef } = owl;
import { useService } from "@web/core/utils/hooks";

export class OwlTodoList extends Component {
    setup() {
        // Вся ініціалізація тут
    }

    // Методи компонента...
}

OwlTodoList.template = 'owl.TodoList';
registry.category('actions').add('owl.action_todo_list_js', OwlTodoList);
```

### 4.4 Метод `setup()` — конструктор компонента

В OWL замість `constructor` використовується метод `setup()`. Він викликається
одразу після створення компонента. Тут ми:
- ініціалізуємо стан
- підключаємо сервіси
- додаємо хуки життєвого циклу

```javascript
setup() {
    // 1. Створюємо реактивний стан
    this.state = useState({
        task: {name: "", color: "#FF0000", completed: false},
        taskList: [],
        isEdit: false,
        activeId: false,
    });

    // 2. Підключаємо ORM сервіс для роботи з БД
    this.orm = useService("orm");

    // 3. Зберігаємо назву моделі для зручності
    this.model = "owl.todo.list";

    // 4. Створюємо посилання на DOM елемент пошуку
    this.searchInput = useRef("search-input");

    // 5. Завантажуємо дані перед відображенням
    onWillStart(async () => {
        await this.getAllTasks();
    });
}
```

---

## Урок 5: Стан компонента (useState)

### 5.1 Що таке стан?

**Стан (state)** — це дані, від яких залежить інтерфейс. Коли стан змінюється,
OWL автоматично оновлює ту частину інтерфейсу, яка від нього залежить.

### 5.2 useState — робимо стан реактивним

```javascript
this.state = useState({
    task: {name: "", color: "#FF0000", completed: false},
    taskList: [],
    isEdit: false,
    activeId: false,
});
```

`useState()` обгортає об'єкт у "реактивну обгортку". Це означає:

```javascript
// БЕЗ useState — інтерфейс НЕ оновиться:
this.data = { taskList: [] };
this.data.taskList = [задача1, задача2];  // Інтерфейс не знає про зміну!

// З useState — інтерфейс оновиться автоматично:
this.state = useState({ taskList: [] });
this.state.taskList = [задача1, задача2];  // OWL побачить зміну і перемалює!
```

### 5.3 Структура нашого стану

```javascript
{
    task: {                    // Дані поточної задачі у формі
        name: "",              // Назва задачі
        color: "#FF0000",      // Колір (за замовчуванням — червоний)
        completed: false       // Виконана чи ні
    },
    taskList: [],              // Масив усіх задач з бази даних
    isEdit: false,             // Режим: true = редагування, false = створення
    activeId: false            // ID задачі, яку зараз редагуємо
}
```

### 5.4 Як стан використовується

**В JavaScript (зміна стану):**
```javascript
// Завантажити список задач
this.state.taskList = await this.orm.searchRead(...);

// Очистити форму
this.state.task = {name: "", color: "#FF0000", completed: false};

// Встановити режим редагування
this.state.isEdit = true;
this.state.activeId = task.id;

// Скопіювати задачу у форму
this.state.task = {...task};
```

**В XML шаблоні (читання стану):**
```xml
<!-- Перебрати список задач -->
<tr t-foreach="state.taskList" t-as="task" t-key="task.id">

<!-- Показати назву задачі -->
<span t-esc="task.name"/>

<!-- Прив'язати поле вводу до стану -->
<input t-model="state.task.name"/>
```

**Зверніть увагу:** в XML пишемо `state.taskList` (без `this`), а в JS — `this.state.taskList`.

---

## Урок 6: OWL шаблони

### 6.1 Структура XML шаблону

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="owl.TodoList" owl="1">
        <!-- HTML-розмітка компонента тут -->
    </t>
</templates>
```

- `<templates>` — кореневий елемент, може містити кілька шаблонів
- `<t t-name="owl.TodoList">` — назва шаблону (повинна збігатися з `Component.template`)
- `owl="1"` — позначає це як OWL шаблон (для Odoo 16)

### 6.2 Директиви OWL (t-команди)

OWL шаблони використовують спеціальні атрибути (директиви), які починаються з `t-`:

#### `t-esc` — вивести значення змінної

```xml
<span t-esc="task.name"/>
```
Виведе текст назви задачі. Аналог `{{ task.name }}` в інших фреймворках.

#### `t-foreach` / `t-as` / `t-key` — цикл (перебір масиву)

```xml
<tr t-foreach="state.taskList" t-as="task" t-key="task.id">
    <td><span t-esc="task.name"/></td>
</tr>
```
- `t-foreach="state.taskList"` — перебрати масив `state.taskList`
- `t-as="task"` — кожен елемент масиву доступний як `task`
- `t-key="task.id"` — унікальний ключ для кожного елемента (потрібен OWL для оптимізації)

#### `t-att-*` — динамічний атрибут

```xml
<input t-att-id="task.id" t-att-checked="task.completed" t-att-value="task.color"/>
```
- `t-att-id="task.id"` → стане `id="42"` (де 42 — ID задачі)
- `t-att-checked="task.completed"` → стане `checked` якщо задача виконана
- `t-att-value="task.color"` → стане `value="#FF0000"`

#### `t-attf-*` — атрибут з форматуванням

```xml
<label t-attf-class="#{task.completed and 'text-decoration-line-through'}">
```
- `#{}` — вставка виразу JavaScript всередину рядка
- Якщо `task.completed` = true, клас буде `text-decoration-line-through`
  (закреслений текст)
- Якщо `task.completed` = false, клас буде порожній

#### `t-on-*` — обробник подій

```xml
<!-- Простий обробник -->
<button t-on-click="addTask">New</button>

<!-- Обробник з параметрами (стрілкова функція) -->
<button t-on-click="() => this.editTask(task)">Edit</button>

<!-- Обробник, де потрібна подія (event) -->
<input t-on-click="(e) => this.toggleTask(e, task)"/>

<!-- Обробник натискання клавіші -->
<input t-on-keyup="searchTasks"/>
```

#### `t-model` — двостороння прив'язка

```xml
<input type="text" t-model="state.task.name"/>
```
- Коли користувач вводить текст → `state.task.name` оновлюється автоматично
- Коли `state.task.name` змінюється в JS → поле вводу оновлюється автоматично

#### `t-ref` — посилання на елемент

```xml
<input t-ref="search-input"/>
```
Дає можливість звернутися до цього DOM-елемента з JavaScript
(через `useRef("search-input")`).

### 6.3 Повний шаблон нашого компонента (з поясненнями)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="owl.TodoList" owl="1">
        <div class="todo-list-container">

            <!-- ===== ВЕРХНЯ ПАНЕЛЬ: кнопка "New" + пошук ===== -->
            <div class="row mx-2 mt-3">
                <div class="col-lg-6">
                    <!-- Кнопка "New" — відкриває модальне вікно
                         та викликає addTask() для очищення форми -->
                    <button class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            t-on-click="addTask">New</button>
                </div>
                <div class="col-lg-6">
                    <!-- Поле пошуку з кнопкою -->
                    <div class="input-group">
                        <input type="text"
                               class="form-control"
                               placeholder="Search here..."
                               t-ref="search-input"
                               t-on-keyup="searchTasks"/>
                        <button class="btn btn-outline-primary"
                                t-on-click="searchTasks">Search</button>
                    </div>
                </div>
            </div>

            <!-- ===== ТАБЛИЦЯ ЗАДАЧ ===== -->
            <div class="row m-2">
                <div class="col">
                    <table class="table table-striped table-hover border">
                        <thead>
                            <tr>
                                <th>Task Description</th>
                                <th>Completed</th>
                                <th> </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Цикл по всіх задачах -->
                            <tr t-foreach="state.taskList"
                                t-as="task"
                                t-key="task.id">

                                <!-- Назва з чекбоксом -->
                                <td>
                                    <div class="form-check">
                                        <input class="form-check-input"
                                               type="checkbox"
                                               t-att-id="task.id"
                                               t-att-checked="task.completed"
                                               t-on-click="(e) => this.toggleTask(e, task)"/>
                                        <label t-att-for="task.id"
                                               t-attf-class="#{task.completed and 'text-decoration-line-through'}">
                                            <span t-esc="task.name"/>
                                        </label>
                                    </div>
                                </td>

                                <!-- Вибір кольору -->
                                <td>
                                    <input type="color"
                                           t-att-value="task.color"
                                           t-on-change="(e) => this.updateColor(e, task)"/>
                                </td>

                                <!-- Кнопки Edit та Delete -->
                                <td>
                                    <button class="btn btn-success me-2"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleModal"
                                            t-on-click="() => this.editTask(task)">
                                        Edit
                                    </button>
                                    <button class="btn btn-danger"
                                            t-on-click="() => this.deleteTask(task)">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ===== МОДАЛЬНЕ ВІКНО (форма додавання/редагування) ===== -->
        <div class="modal fade" id="exampleModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5">Add New Task</h1>
                        <button type="button" class="btn-close"
                                data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">

                        <!-- Поле назви задачі -->
                        <div class="mb-3 row">
                            <label class="col-sm-2 col-form-label">Task Name</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control"
                                       t-model="state.task.name"
                                       t-att-value="state.task.name"/>
                            </div>
                        </div>

                        <!-- Вибір кольору -->
                        <div class="mb-3 row">
                            <label class="col-sm-2 col-form-label">Color</label>
                            <div class="col-sm-10">
                                <input type="color" class="form-control form-control-color"
                                       t-model="state.task.color"
                                       t-att-value="state.task.color"/>
                            </div>
                        </div>

                        <!-- Чекбокс "Виконано" -->
                        <div class="mb-3 row">
                            <label class="col-sm-2 col-form-label">Completed</label>
                            <div class="col-sm-10">
                                <input class="form-check-input" type="checkbox"
                                       t-model="state.task.completed"
                                       t-att-checked="state.task.completed"/>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary"
                                data-bs-dismiss="modal">Close</button>
                        <button class="btn btn-primary"
                                t-on-click="saveTask">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </t>
</templates>
```

---

## Урок 7: Обробка подій

### 7.1 Що таке події?

Подія (event) — це щось, що відбувається в браузері: клік мишкою, натискання
клавіші, зміна значення поля тощо.

### 7.2 Прив'язка подій в OWL

Формат: `t-on-{назва_події}="метод_або_вираз"`

| Подія | Коли спрацьовує |
|-------|----------------|
| `t-on-click` | При кліку мишкою |
| `t-on-keyup` | При відпусканні клавіші |
| `t-on-change` | При зміні значення (після втрати фокусу) |
| `t-on-input` | При кожній зміні значення (в реальному часі) |
| `t-on-submit` | При відправці форми |

### 7.3 Три способи прив'язати обробник

**Спосіб 1: Просто назва методу (без параметрів)**
```xml
<button t-on-click="addTask">New</button>
```
OWL викличе `this.addTask()` при кліку. Перший аргумент автоматично буде подія (Event).

**Спосіб 2: Стрілкова функція (з параметрами)**
```xml
<button t-on-click="() => this.editTask(task)">Edit</button>
```
Тут ми передаємо конкретну `task` в метод. Зверніть увагу на `this.` — в стрілковій
функції всередині шаблону потрібно писати `this.`.

**Спосіб 3: Стрілкова функція з подією**
```xml
<input t-on-click="(e) => this.toggleTask(e, task)"/>
```
`e` — об'єкт події. Через нього можна дізнатися, наприклад:
- `e.target` — DOM елемент, на якому відбулася подія
- `e.target.value` — значення елемента
- `e.target.checked` — чи встановлений чекбокс

### 7.4 Методи-обробники в нашому проекті

```javascript
// addTask — натискання кнопки "New"
addTask() {
    this.resetForm();           // Очищаємо форму
    this.state.activeId = false; // Немає активної задачі
    this.state.isEdit = false;   // Режим створення (не редагування)
}

// editTask — натискання кнопки "Edit" на конкретній задачі
editTask(task) {
    this.state.activeId = task.id;  // Запам'ятовуємо ID
    this.state.isEdit = true;       // Режим редагування
    this.state.task = {...task};     // Копіюємо дані у форму
}

// toggleTask — клік на чекбоксі завершення
async toggleTask(e, task) {
    // e.target.checked — нове значення чекбокса (true/false)
    await this.orm.write(this.model, [task.id], {completed: e.target.checked});
    await this.getAllTasks();  // Перезавантажуємо список
}

// updateColor — зміна кольору
async updateColor(e, task) {
    // e.target.value — новий колір (hex код)
    await this.orm.write(this.model, [task.id], {color: e.target.value});
    await this.getAllTasks();
}

// searchTasks — пошук (при кожному натисканні клавіші)
async searchTasks() {
    const text = this.searchInput.el.value;  // Отримуємо текст з поля
    this.state.taskList = await this.orm.searchRead(
        this.model,
        [['name', 'ilike', text]],  // Фільтр: назва містить текст
        ["name", "color", "completed"]
    );
}
```

---

## Урок 8: ORM сервіс

### 8.1 Що таке ORM сервіс?

ORM (Object-Relational Mapping) — це спосіб працювати з базою даних через
JavaScript. Замість написання SQL запитів, ви викликаєте методи.

### 8.2 Підключення ORM

```javascript
import { useService } from "@web/core/utils/hooks";

setup() {
    this.orm = useService("orm");
}
```

`useService` — це хук OWL, який підключає сервіс Odoo. Сервіс `"orm"` дає доступ
до методів для роботи з базою даних.

### 8.3 Методи ORM

#### `searchRead` — пошук і читання записів

```javascript
const tasks = await this.orm.searchRead(
    "owl.todo.list",                    // Назва моделі
    [],                                  // Домен (фільтр) — [] = без фільтра
    ["name", "color", "completed"]       // Поля, які потрібні
);
```

Аналог Python:
```python
tasks = self.env['owl.todo.list'].search_read([], ['name', 'color', 'completed'])
```

**Домен (фільтр) — це масив умов:**
```javascript
// Без фільтра — всі записи
[]

// Назва містить "молоко" (нечутливий до регістру)
[['name', 'ilike', 'молоко']]

// Незавершені задачі
[['completed', '=', false]]

// Кілька умов (AND)
[['completed', '=', false], ['name', 'ilike', 'купити']]
```

#### `create` — створення запису

```javascript
await this.orm.create(
    "owl.todo.list",          // Назва моделі
    [{                         // Масив об'єктів для створення
        name: "Нова задача",
        color: "#FF0000",
        completed: false
    }]
);
```

Аналог Python:
```python
self.env['owl.todo.list'].create({'name': 'Нова задача', 'color': '#FF0000', 'completed': False})
```

#### `write` — оновлення запису

```javascript
await this.orm.write(
    "owl.todo.list",          // Назва моделі
    [42],                      // Масив ID записів для оновлення
    {completed: true}          // Поля для оновлення
);
```

Аналог Python:
```python
self.env['owl.todo.list'].browse(42).write({'completed': True})
```

#### `unlink` — видалення запису

```javascript
await this.orm.unlink(
    "owl.todo.list",          // Назва моделі
    [42]                       // Масив ID записів для видалення
);
```

Аналог Python:
```python
self.env['owl.todo.list'].browse(42).unlink()
```

### 8.4 Повна таблиця порівняння JS ORM vs Python ORM

| Операція | JavaScript (OWL) | Python (Odoo) |
|----------|-------------------|---------------|
| Читання | `orm.searchRead(model, domain, fields)` | `env[model].search_read(domain, fields)` |
| Створення | `orm.create(model, [values])` | `env[model].create(values)` |
| Оновлення | `orm.write(model, [ids], values)` | `env[model].browse(ids).write(values)` |
| Видалення | `orm.unlink(model, [ids])` | `env[model].browse(ids).unlink()` |
| Пошук ID | `orm.search(model, domain)` | `env[model].search(domain)` |
| Читання | `orm.read(model, [ids], fields)` | `env[model].browse(ids).read(fields)` |
| Виклик методу | `orm.call(model, method, args)` | `env[model].method(*args)` |

---

## Урок 9: Життєвий цикл компонента

### 9.1 Хуки життєвого циклу OWL

Компонент OWL проходить через кілька етапів свого "життя":

```
setup()                    ← Ініціалізація (один раз)
    ↓
onWillStart()              ← Перед першим рендерингом (async)
    ↓
[перший рендеринг]
    ↓
onMounted()                ← Після вставки в DOM
    ↓
[користувач взаємодіє, стан змінюється]
    ↓
onWillUpdateProps()        ← Перед оновленням пропсів
    ↓
onWillRender()             ← Перед кожним перемальовуванням
    ↓
onRendered()               ← Після перемальовування (але до DOM)
    ↓
onPatched()                ← Після оновлення DOM
    ↓
[компонент видаляється]
    ↓
onWillUnmount()            ← Перед видаленням з DOM
    ↓
onWillDestroy()            ← Перед знищенням
```

### 9.2 Найважливіші хуки

#### `setup()` — Ініціалізація

Викликається один раз при створенні компонента. Тут:
- ініціалізуємо стан (`useState`)
- підключаємо сервіси (`useService`)
- реєструємо інші хуки (`onWillStart`, `onMounted` тощо)

```javascript
setup() {
    this.state = useState({...});
    this.orm = useService("orm");
}
```

#### `onWillStart` — Перед першим відображенням

Виконується ОДИН РАЗ перед тим, як компонент вперше з'явиться на екрані.
Підтримує `async` — можна чекати завантаження даних.

```javascript
setup() {
    onWillStart(async () => {
        await this.getAllTasks();
        // Компонент не з'явиться, поки дані не завантажаться
    });
}
```

**Навіщо?** Щоб користувач побачив вже заповнену таблицю, а не порожню.

#### `onMounted` — Після вставки в DOM

Виконується після того, як HTML компонента вставлений у сторінку. Тут можна
працювати з DOM елементами.

```javascript
const { onMounted } = owl;

setup() {
    onMounted(() => {
        console.log("Компонент відображено на сторінці!");
        // Можна працювати з DOM
    });
}
```

#### `onWillUnmount` — Перед видаленням

Виконується перед тим, як компонент буде видалений зі сторінки. Тут
прибираємо за собою: відписуємося від подій, зупиняємо таймери.

```javascript
const { onWillUnmount } = owl;

setup() {
    const interval = setInterval(() => {...}, 1000);

    onWillUnmount(() => {
        clearInterval(interval);  // Зупиняємо таймер
    });
}
```

### 9.3 В нашому проекті

Ми використовуємо тільки `onWillStart`:

```javascript
onWillStart(async () => {
    await this.getAllTasks();
});
```

Це означає: "перед тим як показати компонент користувачу, завантаж список задач
з бази даних".

---

## Урок 10: useRef

### 10.1 Що таке useRef?

`useRef` — це хук, який дає доступ до реального DOM-елемента (HTML-елемента на
сторінці) з JavaScript коду.

### 10.2 Навіщо потрібен useRef?

Зазвичай в OWL ми працюємо через стан (`useState`) і не торкаємося DOM напряму.
Але іноді потрібно прочитати значення з DOM-елемента або виконати якусь операцію
з ним. Тоді використовуємо `useRef`.

### 10.3 Як використовувати

**Крок 1: В setup() створюємо ref**
```javascript
const { useRef } = owl;

setup() {
    this.searchInput = useRef("search-input");
}
```

**Крок 2: В XML шаблоні позначаємо елемент**
```xml
<input type="text" t-ref="search-input"/>
```

**Крок 3: В методах отримуємо доступ до елемента**
```javascript
async searchTasks() {
    const text = this.searchInput.el.value;
    // this.searchInput.el — це реальний HTML <input> елемент
    // .value — його поточне значення
}
```

### 10.4 Чому не t-model?

Можна було б використати `t-model` для пошуку:
```xml
<input t-model="state.searchText"/>
```

Але в нашому випадку:
- Пошук виконується при кожному натисканні клавіші (`t-on-keyup="searchTasks"`)
- Нам не потрібно зберігати текст у стані — він потрібен тільки для пошуку
- `useRef` дає пряму і просту альтернативу без додаткового стану

### 10.5 useRef vs useState для форм

| Ситуація | Що використати |
|----------|---------------|
| Потрібна двостороння прив'язка (форма) | `useState` + `t-model` |
| Потрібно тільки прочитати значення | `useRef` + `.el.value` |
| Потрібно керувати фокусом | `useRef` + `.el.focus()` |
| Потрібна анімація DOM | `useRef` + `.el.classList` |

---

## Урок 11: Реєстрація в registry

### 11.1 Що таке Registry?

Registry (реєстр) — це центральне сховище Odoo, де зареєстровані компоненти,
дії, сервіси та інші сутності. Коли Odoo потрібно знайти компонент за тегом дії,
він шукає його в реєстрі.

### 11.2 Реєстрація нашого компонента

```javascript
import { registry } from '@web/core/registry';

// Після оголошення класу:
registry.category('actions').add('owl.action_todo_list_js', OwlTodoList);
```

Розберемо:
- `registry` — головний реєстр Odoo
- `.category('actions')` — категорія "дії" (client actions)
- `.add('owl.action_todo_list_js', OwlTodoList)` — додаємо наш компонент під
  тегом `'owl.action_todo_list_js'`

### 11.3 Зв'язок з XML

В `views/todo_list.xml`:
```xml
<record id="action_owl_todo_list_js" model="ir.actions.client">
    <field name="name">Todo List OWL</field>
    <field name="tag">owl.action_todo_list_js</field>
    <!-- tag ↑ повинен збігатися з першим аргументом registry.add() -->
</record>
```

**Ланцюжок:**
```
Меню "Todo List OWL"
    → виконує action "action_owl_todo_list_js"
    → action має tag "owl.action_todo_list_js"
    → Odoo шукає в registry.category('actions') за тегом
    → знаходить OwlTodoList
    → рендерить компонент
```

### 11.4 Інші категорії registry

```javascript
// Реєстрація дії (client action)
registry.category('actions').add('tag', MyComponent);

// Реєстрація сервісу
registry.category('services').add('my_service', myService);

// Реєстрація системного трею (верхня панель)
registry.category('systray').add('my_systray', MySystrayComponent);

// Реєстрація віджета поля
registry.category('fields').add('my_widget', MyFieldWidget);
```

---

## Урок 12: Повний розбір проекту

### 12.1 Як все працює разом

Ось повний потік роботи нашого додатка Todo List:

```
1. Користувач встановлює модуль gk_owl в Odoo
   └─ __manifest__.py → Odoo завантажує views, security, assets

2. JS файли додаються до бекенд-бандлу
   └─ web.assets_backend → todo_list.js, todo_list.xml, todo_list.scss

3. При завантаженні сторінки:
   └─ todo_list.js виконується
   └─ registry.category('actions').add() → компонент зареєстрований

4. Користувач клікає меню "Todo List OWL"
   └─ Odoo виконує ir.actions.client з tag "owl.action_todo_list_js"
   └─ Знаходить OwlTodoList в registry
   └─ Створює екземпляр компонента

5. setup() виконується:
   └─ useState → створює реактивний стан
   └─ useService("orm") → підключає ORM
   └─ useRef → створює посилання на поле пошуку
   └─ onWillStart → завантажує задачі з БД

6. Компонент рендериться:
   └─ XML шаблон "owl.TodoList" перетворюється на HTML
   └─ t-foreach → створює рядки таблиці для кожної задачі
   └─ Користувач бачить список задач

7. Користувач взаємодіє:
   └─ Клік "New" → addTask() → очищає форму → відкриває модалку
   └─ Заповнює форму → "Save" → saveTask() → orm.create() → перезавантаження
   └─ Клік "Edit" → editTask(task) → заповнює форму даними → модалка
   └─ Клік "Delete" → deleteTask(task) → orm.unlink() → перезавантаження
   └─ Чекбокс → toggleTask() → orm.write() → перезавантаження
   └─ Колір → updateColor() → orm.write() → перезавантаження
   └─ Пошук → searchTasks() → orm.searchRead з фільтром
```

### 12.2 Повний код JS з коментарями

```javascript
/** @odoo-module **/
// ↑ Обов'язковий коментар для Odoo 16 — позначає файл як ES-модуль

// Імпортуємо реєстр дій з ядра Odoo
import { registry } from '@web/core/registry';

// Витягуємо потрібні функції з глобального об'єкта owl
const { Component, useState, onWillStart, useRef } = owl;

// Імпортуємо хук для підключення сервісів Odoo
import { useService } from "@web/core/utils/hooks";

// Створюємо клас компонента, який наслідує від базового Component
export class OwlTodoList extends Component {

    // setup() — точка входу, замість constructor
    setup() {
        // Створюємо реактивний стан компонента
        this.state = useState({
            task: {name: "", color: "#FF0000", completed: false}, // Дані форми
            taskList: [],     // Список всіх задач
            isEdit: false,    // Чи ми в режимі редагування
            activeId: false,  // ID задачі, яку редагуємо
        });

        // Підключаємо ORM сервіс для роботи з базою даних
        this.orm = useService("orm");

        // Назва моделі Odoo, з якою працюємо
        this.model = "owl.todo.list";

        // Посилання на DOM елемент поля пошуку
        this.searchInput = useRef("search-input");

        // Хук: перед першим відображенням — завантажити задачі
        onWillStart(async () => {
            await this.getAllTasks();
        });
    }

    // Завантажити всі задачі з бази даних
    async getAllTasks() {
        this.state.taskList = await this.orm.searchRead(
            this.model,                        // Модель
            [],                                 // Домен (фільтр) — всі записи
            ["name", "color", "completed"]      // Поля для читання
        );
    }

    // Підготувати форму для створення нової задачі
    addTask() {
        this.resetForm();             // Очищаємо поля форми
        this.state.activeId = false;  // Немає активного ID
        this.state.isEdit = false;    // Режим створення
    }

    // Підготувати форму для редагування існуючої задачі
    editTask(task) {
        this.state.activeId = task.id;  // Запам'ятовуємо ID задачі
        this.state.isEdit = true;       // Режим редагування
        this.state.task = {...task};     // Копіюємо дані задачі у форму
    }

    // Зберегти задачу (створити нову або оновити існуючу)
    async saveTask() {
        if (!this.state.isEdit) {
            // Режим створення — створюємо новий запис
            await this.orm.create(this.model, [this.state.task]);
            this.resetForm();  // Очищаємо форму після створення
        } else {
            // Режим редагування — оновлюємо існуючий запис
            await this.orm.write(this.model, [this.state.activeId], this.state.task);
        }
        // Перезавантажуємо список задач
        await this.getAllTasks();
    }

    // Очистити форму до значень за замовчуванням
    resetForm() {
        this.state.task = {name: "", color: "#FF0000", completed: false};
    }

    // Видалити задачу
    async deleteTask(task) {
        await this.orm.unlink(this.model, [task.id]);  // Видаляємо з БД
        await this.getAllTasks();                        // Перезавантажуємо список
    }

    // Пошук задач за назвою
    async searchTasks() {
        const text = this.searchInput.el.value;  // Отримуємо текст з поля пошуку
        this.state.taskList = await this.orm.searchRead(
            this.model,
            [['name', 'ilike', text]],  // Фільтр: назва містить текст
            ["name", "color", "completed"]
        );
    }

    // Перемикання статусу завершення задачі
    async toggleTask(e, task) {
        await this.orm.write(
            this.model,
            [task.id],
            {completed: e.target.checked}  // Нове значення чекбокса
        );
        await this.getAllTasks();
    }

    // Оновлення кольору задачі
    async updateColor(e, task) {
        await this.orm.write(
            this.model,
            [task.id],
            {color: e.target.value}  // Новий колір
        );
        await this.getAllTasks();
    }
}

// Прив'язуємо XML шаблон до компонента
OwlTodoList.template = 'owl.TodoList';

// Реєструємо компонент як дію Odoo з тегом 'owl.action_todo_list_js'
registry.category('actions').add('owl.action_todo_list_js', OwlTodoList);
```

### 12.3 Шпаргалка: створення нового OWL компонента

Якщо вам потрібно створити **новий** OWL компонент для Odoo 16, дотримуйтесь
цих кроків:

#### Крок 1: Створити файли

```
your_module/static/src/components/my_component/
    my_component.js
    my_component.xml
    my_component.scss
```

#### Крок 2: Написати JS

```javascript
/** @odoo-module **/
import { registry } from '@web/core/registry';
const { Component, useState, onWillStart } = owl;
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    setup() {
        this.state = useState({ /* ваш стан */ });
        this.orm = useService("orm");

        onWillStart(async () => {
            // Завантажити початкові дані
        });
    }

    // Ваші методи
}

MyComponent.template = 'your_module.MyComponent';
registry.category('actions').add('your_module.action_tag', MyComponent);
```

#### Крок 3: Написати XML шаблон

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="your_module.MyComponent" owl="1">
        <div>
            <!-- Ваша HTML розмітка -->
        </div>
    </t>
</templates>
```

#### Крок 4: Зареєструвати в __manifest__.py

```python
'assets': {
    'web.assets_backend': [
        'your_module/static/src/components/my_component/my_component.js',
        'your_module/static/src/components/my_component/my_component.xml',
        'your_module/static/src/components/my_component/my_component.scss',
    ],
},
```

#### Крок 5: Створити client action в XML view

```xml
<record id="action_my_component" model="ir.actions.client">
    <field name="name">My Component</field>
    <field name="tag">your_module.action_tag</field>
</record>

<menuitem name="My Component" id="menu_my_component"
          action="action_my_component" parent="some_parent_menu"/>
```

#### Крок 6: Оновити модуль

В Odoo: Налаштування → Технічне → Оновити список модулів → Оновити ваш модуль.
Або через командний рядок:
```bash
./odoo-bin -u your_module -d your_database
```

---

## Додаток A: Глосарій термінів

| Термін | Пояснення |
|--------|-----------|
| **OWL** | Odoo Web Library — JS фреймворк Odoo |
| **Компонент** | Самостійний блок інтерфейсу (клас + шаблон) |
| **Стан (state)** | Дані, від яких залежить відображення |
| **useState** | Хук для створення реактивного стану |
| **useService** | Хук для підключення сервісу Odoo |
| **useRef** | Хук для доступу до DOM елемента |
| **onWillStart** | Хук — виконується перед першим рендерингом |
| **t-esc** | Директива — вивести значення змінної |
| **t-foreach** | Директива — цикл по масиву |
| **t-on-click** | Директива — обробник кліку |
| **t-model** | Директива — двостороння прив'язка даних |
| **t-att-\*** | Директива — динамічний HTML атрибут |
| **t-attf-\*** | Директива — атрибут з інтерполяцією рядка |
| **t-ref** | Директива — ідентифікатор для useRef |
| **registry** | Центральне сховище зареєстрованих компонентів/сервісів |
| **ORM** | Object-Relational Mapping — абстракція для роботи з БД |
| **domain** | Масив умов для фільтрації записів |
| **async/await** | Спосіб працювати з асинхронними операціями |
| **client action** | Тип дії Odoo, що рендерить JS компонент |

## Додаток B: Часті помилки та їх вирішення

### 1. "Module not found" або компонент не завантажується
- Перевірте `/** @odoo-module **/` на початку JS файлу
- Перевірте шлях у `__manifest__.py` → `assets`
- Оновіть модуль та очистіть кеш браузера (Ctrl+Shift+R)

### 2. "Template not found"
- Назва в `t-name="..."` повинна збігатися з `Component.template = "..."`
- XML файл повинен бути зареєстрований в `assets`

### 3. Інтерфейс не оновлюється при зміні даних
- Використовуйте `useState()` для стану
- Змінюйте `this.state.xxx`, а не створюйте новий об'єкт `this.state = ...`
  (крім повної заміни вкладеного об'єкта)

### 4. "Access Denied" при роботі з даними
- Перевірте файл `security/ir.model.access.csv`
- Перевірте, що файл вказаний в `__manifest__.py` → `data`

### 5. Метод не знайдений при кліку
- В XML: `t-on-click="methodName"` (без дужок для простого виклику)
- В XML зі стрілковою функцією: `t-on-click="() => this.methodName(arg)"`
  (з `this.`)
- Перевірте, що метод оголошений в класі компонента

### 6. Стан не доступний в шаблоні
- В JS: `this.state.taskList`
- В XML: `state.taskList` (без `this`)

---

## Додаток C: Корисні ресурси

- Офіційна документація OWL для Odoo 16: https://www.odoo.com/documentation/16.0/developer/reference/frontend/owl_components.html
- Офіційна документація JavaScript в Odoo: https://www.odoo.com/documentation/16.0/developer/reference/frontend/javascript_reference.html
- OWL GitHub репозиторій: https://github.com/nicholasgross/nicholasgross.github.io
- Odoo JavaScript cheatsheet: https://www.odoo.com/documentation/16.0/developer/reference/frontend/javascript_cheatsheet.html
