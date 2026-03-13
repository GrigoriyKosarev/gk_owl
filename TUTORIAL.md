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

#### Проблема: сервер відповідає НЕ миттєво

Уявіть, що ви в ресторані. Ви замовили піцу. Кухар не видає її миттєво —
потрібен час на приготування. У вас є два варіанти:

1. **Синхронний підхід**: Стояти біля каси і чекати, нічого не роблячи.
   Весь ресторан зависає, поки ваша піца не буде готова.
2. **Асинхронний підхід**: Взяти номерок, сісти за столик і робити інші справи.
   Коли піца готова — вас покличуть.

JavaScript працює так само. Коли ваш код просить дані у сервера (наприклад,
список задач з бази даних Odoo), сервер не відповідає миттєво. Це може зайняти
50мс, 500мс, або навіть 5 секунд.

**Якщо чекати синхронно** — вся сторінка "зависне", кнопки перестануть працювати,
користувач нічого не зможе робити. Браузер може навіть показати "Сторінка не
відповідає".

**Якщо чекати асинхронно** — сторінка продовжує працювати, а коли дані прийдуть,
ми їх обробимо.

#### Що таке Promise (Обіцянка)?

Перед тим як зрозуміти `async/await`, треба знати про `Promise`.

`Promise` — це об'єкт, який представляє **результат операції, яка ще не завершилася**.
Як той номерок у ресторані: "ваша піца буде готова, ми обіцяємо".

Promise має три стани:
```
pending   → Очікування (піца готується)
fulfilled → Виконано (піца готова, ось вона)
rejected  → Відхилено (піца згоріла, сталася помилка)
```

```javascript
// Це Promise — обіцянка, що дані прийдуть
const promise = fetch("/api/tasks");

// promise зараз у стані "pending" — дані ще в дорозі
console.log(promise);  // Promise { <pending> }
```

#### Старий спосіб: `.then()` (ланцюжок обіцянок)

До `async/await` працювали з Promise через `.then()`:

```javascript
function getAllTasks() {
    // Крок 1: Зроби запит до сервера
    this.orm.searchRead("owl.todo.list", [], ["name", "color", "completed"])
        // Крок 2: Коли дані прийдуть — виконай цю функцію
        .then(function(result) {
            this.state.taskList = result;
        })
        // Крок 3: Якщо сталася помилка — виконай цю функцію
        .catch(function(error) {
            console.log("Помилка!", error);
        });
}
```

Проблема: коли потрібно виконати кілька запитів послідовно, код стає дуже
вкладеним і нечитабельним (це називають "callback hell"):

```javascript
// Callback hell — "пекло колбеків"
getUser()
    .then(function(user) {
        getOrders(user.id)
            .then(function(orders) {
                getOrderDetails(orders[0].id)
                    .then(function(details) {
                        // Тут вже 4 рівні вкладеності...
                    });
            });
    });
```

#### Новий спосіб: `async/await` (сучасний і зрозумілий)

`async/await` — це синтаксичний цукор (зручна обгортка) над Promise.
Код виглядає як звичайний синхронний, але працює асинхронно.

**Два ключових слова:**

1. `async` — ставимо перед функцією. Означає: "ця функція може чекати на
   асинхронні операції і завжди повертає Promise"
2. `await` — ставимо перед Promise. Означає: "зупинись тут і почекай результат"

```javascript
// async перед функцією — обов'язково!
async function getAllTasks() {
    // await — "почекай поки сервер відповість"
    const result = await this.orm.searchRead("owl.todo.list", [], ["name"]);

    // Ця строка виконається ТІЛЬКИ коли дані прийдуть
    this.state.taskList = result;
}
```

**Порівняння:**
```javascript
// БЕЗ await — result буде Promise, а не дані!
function broken() {
    const result = this.orm.searchRead("owl.todo.list", [], ["name"]);
    console.log(result);  // Promise { <pending> } — це НЕ дані!
}

// З await — result буде масивом задач
async function working() {
    const result = await this.orm.searchRead("owl.todo.list", [], ["name"]);
    console.log(result);  // [{name: "Задача 1"}, {name: "Задача 2"}] — дані!
}
```

#### Правила async/await

**Правило 1: `await` можна використовувати ТІЛЬКИ всередині `async` функції**
```javascript
// ПОМИЛКА! — await без async
function bad() {
    const data = await getData();  // SyntaxError!
}

// ПРАВИЛЬНО — є async
async function good() {
    const data = await getData();  // OK!
}
```

**Правило 2: `async` функція завжди повертає Promise**
```javascript
async function getNumber() {
    return 42;
}
// getNumber() повертає не 42, а Promise<42>
// Тому, щоб отримати 42, потрібен await:
const num = await getNumber();  // 42
```

**Правило 3: Кілька await виконуються послідовно**
```javascript
async function doThreeThings() {
    const a = await firstOperation();    // Чекаємо...
    const b = await secondOperation(a);  // Потім чекаємо...
    const c = await thirdOperation(b);   // Потім чекаємо...
    return c;
}
// Без вкладеності! Просто і читабельно.
```

#### Обробка помилок: try/catch

Що якщо сервер поверне помилку? Використовуємо `try/catch`:

```javascript
async function getAllTasks() {
    try {
        // "Спробуй" виконати це:
        this.state.taskList = await this.orm.searchRead(
            this.model, [], ["name", "color", "completed"]
        );
    } catch (error) {
        // Якщо сталася помилка — виконай це:
        console.log("Не вдалося завантажити задачі:", error);
    }
}
```

Аналогія з Python:
```python
# Python                          # JavaScript
try:                              # try {
    tasks = self.env[...].search  #     tasks = await orm.searchRead(...)
except Exception as e:            # } catch (error) {
    print(f"Помилка: {e}")        #     console.log("Помилка:", error)
                                  # }
```

#### В нашому проекті: всі async методи

Давайте розберемо кожен async метод у `todo_list.js`:

```javascript
// 1. Завантажити всі задачі
async getAllTasks() {
    //    await ← чекаємо поки Odoo поверне дані з бази
    //    ↓
    this.state.taskList = await this.orm.searchRead(
        this.model,                        // "owl.todo.list"
        [],                                 // без фільтра
        ["name", "color", "completed"]      // які поля потрібні
    );
    // Після await стан оновлено → OWL автоматично перемалює таблицю
}

// 2. Зберегти задачу (створити або оновити)
async saveTask() {
    if (!this.state.isEdit) {
        // await ← чекаємо поки Odoo створить запис в БД
        await this.orm.create(this.model, [this.state.task]);
        this.resetForm();
    } else {
        // await ← чекаємо поки Odoo оновить запис в БД
        await this.orm.write(this.model, [this.state.activeId], this.state.task);
    }
    // await ← чекаємо поки завантажиться оновлений список
    await this.getAllTasks();
}

// 3. Видалити задачу
async deleteTask(task) {
    await this.orm.unlink(this.model, [task.id]);  // Чекаємо видалення
    await this.getAllTasks();                        // Чекаємо перезавантаження
}

// 4. Пошук
async searchTasks() {
    const text = this.searchInput.el.value;
    // await ← чекаємо результати пошуку
    this.state.taskList = await this.orm.searchRead(
        this.model,
        [['name', 'ilike', text]],
        ["name", "color", "completed"]
    );
}

// 5. Перемикач "виконано"
async toggleTask(e, task) {
    await this.orm.write(this.model, [task.id], {completed: e.target.checked});
    await this.getAllTasks();
}

// 6. Зміна кольору
async updateColor(e, task) {
    await this.orm.write(this.model, [task.id], {color: e.target.value});
    await this.getAllTasks();
}
```

**Зверніть увагу на паттерн:** майже кожен метод закінчується `await this.getAllTasks()`.
Це тому, що після будь-якої зміни (створення, видалення, оновлення) ми хочемо
побачити актуальний список. Без `await` ми б спробували прочитати список ДО
того, як попередня операція завершиться.

#### Навіщо `async` у `onWillStart`?

```javascript
onWillStart(async () => {
    await this.getAllTasks();
});
```

`onWillStart` — це хук, який виконується ПЕРЕД тим, як компонент з'явиться
на екрані. Якщо передати в нього `async` функцію, OWL буде чекати поки
вона завершиться. Це означає:

- Компонент НЕ з'явиться, поки `getAllTasks()` не завантажить дані
- Користувач побачить вже заповнену таблицю, а не порожню

Якщо б ми НЕ використали await:
```javascript
// БЕЗ await — ПОГАНО
onWillStart(() => {
    this.getAllTasks();  // Запит відправлено, але ми НЕ чекаємо
});
// Компонент з'явиться з порожньою таблицею
// Через якийсь час дані прийдуть і таблиця заповниться — "мигання"
```

#### Підсумок async/await

| Концепція | Що робить | Аналогія |
|-----------|-----------|----------|
| `Promise` | Обіцянка майбутнього результату | Номерок у ресторані |
| `async` | Позначає функцію як асинхронну | "Я буду чекати на замовлення" |
| `await` | Зупиняє виконання до отримання результату | "Чекаю поки піца готова" |
| `try/catch` | Обробка помилок | "Якщо піца згоріла — замовлю іншу" |

---

### 1.7 Деструктуризація — розпакування значень

#### Проблема: занадто довгі звернення

Уявіть, що у вас є великий об'єкт, і ви хочете використати кілька його частин:

```javascript
// Без деструктуризації — довго і нудно
const component = owl.Component;
const useState = owl.useState;
const onWillStart = owl.onWillStart;
const useRef = owl.useRef;
```

Це 4 рядки коду, і в кожному повторюється `owl.`. Деструктуризація дозволяє
зробити це в один рядок.

#### Деструктуризація об'єктів

```javascript
// Маємо об'єкт
const person = {
    name: "Олена",
    age: 30,
    city: "Київ"
};

// Деструктуризація — витягуємо поля у змінні з такими ж іменами
const { name, age, city } = person;

// Тепер:
console.log(name);  // "Олена"
console.log(age);   // 30
console.log(city);  // "Київ"
```

**Важливо:** назви змінних ПОВИННІ збігатися з назвами полів об'єкта:
```javascript
const { name, age } = person;     // OK — name і age є в person
const { name, years } = person;   // years буде undefined — такого поля немає
```

Можна перейменувати при деструктуризації:
```javascript
const { name: userName, age: userAge } = person;
console.log(userName);  // "Олена"
console.log(userAge);   // 30
```

Можна витягнути не все, а лише потрібне:
```javascript
const { name } = person;  // Витягуємо тільки name, ігноруємо age і city
```

#### Деструктуризація масивів

```javascript
const colors = ["red", "green", "blue"];

// Витягуємо елементи по позиції
const [first, second, third] = colors;
console.log(first);   // "red"
console.log(second);  // "green"
console.log(third);   // "blue"

// Можна пропустити елементи
const [, , onlyThird] = colors;
console.log(onlyThird);  // "blue"
```

#### В нашому проекті

```javascript
const { Component, useState, onWillStart, useRef } = owl;
```

Це еквівалентно:
```javascript
const Component = owl.Component;
const useState = owl.useState;
const onWillStart = owl.onWillStart;
const useRef = owl.useRef;
```

`owl` — це глобальний об'єкт в Odoo 16, який містить всі інструменти OWL
фреймворку. Ми витягуємо з нього тільки ті 4 штуки, які нам потрібні:

| Що витягуємо | Для чого |
|-------------|----------|
| `Component` | Базовий клас, від якого наслідує наш компонент |
| `useState` | Хук для створення реактивного стану |
| `onWillStart` | Хук життєвого циклу — виконати код перед рендерингом |
| `useRef` | Хук для доступу до DOM елемента |

#### Деструктуризація у параметрах функції

Це використовується рідше в нашому проекті, але корисно знати:

```javascript
// Без деструктуризації
function greet(person) {
    console.log("Привіт, " + person.name + " з " + person.city);
}

// З деструктуризацією в параметрах
function greet({ name, city }) {
    console.log("Привіт, " + name + " з " + city);
}

// Виклик однаковий:
greet({ name: "Олена", age: 30, city: "Київ" });
// "Привіт, Олена з Київ"
```

---

### 1.8 Spread оператор `...` — копіювання та об'єднання

#### Що таке spread?

Три крапки `...` перед об'єктом або масивом "розпаковують" його вміст.
Уявіть, що ви відкриваєте коробку і висипаєте все з неї.

#### Spread для масивів

```javascript
const fruits = ["яблуко", "банан"];
const vegetables = ["морква", "картопля"];

// Об'єднуємо два масиви в один
const food = [...fruits, ...vegetables];
// food = ["яблуко", "банан", "морква", "картопля"]

// Копіюємо масив
const fruitsCopy = [...fruits];
// fruitsCopy = ["яблуко", "банан"] — незалежна копія

// Додаємо елемент
const moreFruits = [...fruits, "вишня"];
// moreFruits = ["яблуко", "банан", "вишня"]
```

#### Spread для об'єктів

```javascript
const task = {
    name: "Купити молоко",
    color: "#FF0000",
    completed: false
};

// Копіюємо об'єкт
const taskCopy = { ...task };
// taskCopy = { name: "Купити молоко", color: "#FF0000", completed: false }

// Копіюємо і змінюємо одне поле
const updatedTask = { ...task, completed: true };
// updatedTask = { name: "Купити молоко", color: "#FF0000", completed: true }
//                                                          ↑ змінено!

// Копіюємо і додаємо нове поле
const extendedTask = { ...task, priority: "high" };
// extendedTask = { name: "Купити молоко", color: "#FF0000", completed: false, priority: "high" }
```

**Порядок важливий!** Якщо є однакові ключі, виграє ОСТАННІЙ:
```javascript
const a = { x: 1, y: 2 };
const b = { y: 3, z: 4 };

const merged = { ...a, ...b };
// merged = { x: 1, y: 3, z: 4 }
//                  ↑ y з об'єкта b перезаписав y з об'єкта a
```

#### Навіщо копіювати? Проблема посилань

Це ДУЖЕ ВАЖЛИВА концепція в JavaScript. Об'єкти і масиви зберігаються **за
посиланням**, а не за значенням.

```javascript
// Примітиви (числа, рядки, boolean) — копіюються за значенням
let a = 5;
let b = a;    // b = 5 — це КОПІЯ
b = 10;
console.log(a);  // 5 — a не змінилося!

// Об'єкти — копіюються за ПОСИЛАННЯМ
const original = { name: "Задача", color: "red" };
const reference = original;  // reference вказує на ТОЙ САМИЙ об'єкт!
reference.color = "blue";
console.log(original.color);  // "blue" — original ТЕЖ змінився!
```

Це як два ярлики на робочому столі, що ведуть до одного файлу. Якщо відкрити
файл через один ярлик і змінити його — зміни будуть видні і через інший.

**Ось чому потрібен spread:**
```javascript
const original = { name: "Задача", color: "red" };

// Spread створює НОВИЙ об'єкт з такими ж значеннями
const copy = { ...original };
copy.color = "blue";
console.log(original.color);  // "red" — original НЕ змінився!
```

#### В нашому проекті

```javascript
editTask(task) {
    this.state.activeId = task.id;
    this.state.isEdit = true;
    this.state.task = { ...task };  // ← Створюємо КОПІЮ задачі
}
```

Що було б БЕЗ spread:
```javascript
editTask(task) {
    this.state.task = task;  // БЕЗ spread — task і state.task це ОДИН об'єкт

    // Тепер якщо користувач змінить щось у формі (через t-model),
    // то зміниться і оригінальна задача в taskList!
    // Це порушить відображення таблиці до збереження.
}
```

Зі spread:
```javascript
editTask(task) {
    this.state.task = { ...task };  // КОПІЯ — незалежний об'єкт

    // Тепер зміни у формі НЕ впливають на taskList.
    // Задача в таблиці виглядає як раніше.
    // Тільки після saveTask() дані оновляться з сервера.
}
```

#### Обмеження spread: поверхнева копія

Spread робить **поверхневу (shallow) копію** — копіює тільки перший рівень:

```javascript
const deep = {
    name: "Задача",
    details: { priority: "high", tags: ["work"] }
};

const copy = { ...deep };
copy.name = "Нова назва";        // OK — це поверхневе поле
copy.details.priority = "low";   // ПРОБЛЕМА — details спільний!
console.log(deep.details.priority);  // "low" — оригінал теж змінився!
```

Для нашого проекту це не проблема, тому що об'єкт `task` має тільки прості
поля (рядки, числа, boolean) без вкладених об'єктів.

---

### 1.9 Модулі: import/export

#### Навіщо потрібні модулі?

Уявіть, що весь код вашого проекту знаходиться в одному файлі на 10 000 рядків.
Це було б жахіттям для читання, розуміння та підтримки.

**Модулі** дозволяють розбити код на окремі файли, де кожен файл відповідає
за свою частину функціональності. Один файл = один модуль.

В Odoo це особливо важливо: десятки модулів мають свій JavaScript, і всі
вони повинні працювати разом, не конфліктуючи.

#### export — "я ділюсь цим з іншими"

`export` позначає, що функцію, клас або змінну можна використовувати в інших файлах.

```javascript
// math.js

// Named export (іменований експорт) — експортуємо з назвою
export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

export const PI = 3.14159;
```

```javascript
// Або можна експортувати клас
export class Calculator {
    add(a, b) { return a + b; }
}
```

**Default export (експорт за замовчуванням)** — один на файл:
```javascript
// my_component.js
export default class MyComponent { ... }
```

#### import — "я беру це з іншого файлу"

```javascript
// Імпортуємо конкретні named exports
import { add, multiply } from './math.js';
console.log(add(2, 3));       // 5
console.log(multiply(2, 3));  // 6

// Імпортуємо все під одним іменем
import * as math from './math.js';
console.log(math.add(2, 3));  // 5
console.log(math.PI);         // 3.14159

// Імпортуємо default export
import MyComponent from './my_component.js';
```

#### Модулі в Odoo 16 — три типи імпорту

В нашому проекті є три різні способи отримати код:

**Тип 1: Глобальний об'єкт `owl`**
```javascript
const { Component, useState, onWillStart, useRef } = owl;
```
OWL бібліотека доступна глобально (тобто не потрібен `import`).
Ми просто деструктуризуємо те, що потрібно.

В Odoo 17+ це змінилося — там OWL імпортується як модуль:
```javascript
// Odoo 17+ (не працює в Odoo 16!)
import { Component, useState } from "@odoo/owl";
```

**Тип 2: import з ядра Odoo (`@web/...`)**
```javascript
import { registry } from '@web/core/registry';
import { useService } from "@web/core/utils/hooks";
```
Шлях `@web/...` — це псевдонім (alias) для модуля `web` в Odoo.
- `@web/core/registry` → файл `addons/web/static/src/core/registry.js`
- `@web/core/utils/hooks` → файл `addons/web/static/src/core/utils/hooks.js`

Ці модулі — частина ядра Odoo і доступні в будь-якому кастомному модулі.

**Тип 3: import з інших модулів Odoo**
```javascript
// Якщо ваш модуль залежить від іншого
import { SomeComponent } from '@my_other_module/some_path';
```
Шаблон: `@назва_модуля/шлях_від_static/src`

#### `/** @odoo-module **/` — обов'язковий маркер

```javascript
/** @odoo-module **/   // ← Перший рядок кожного JS файлу в Odoo 16
```

Цей спеціальний коментар говорить системі збірки Odoo:
1. "Цей файл — ES модуль, обробляй його відповідно"
2. "Конвертуй імпорти `@web/...` у правильні шляхи"
3. "Додай цей модуль до реєстру модулів Odoo"

**Без цього коментаря:**
- Файл буде виконаний як простий скрипт
- `import` та `export` не будуть працювати
- Компонент не зареєструється

#### export в нашому проекті

```javascript
export class OwlTodoList extends Component { ... }
```

Ми експортуємо клас `OwlTodoList`. Це потрібно для:
1. Odoo повинен знати про цей клас для системи модулів
2. Інші модулі (якщо потрібно) зможуть імпортувати та розширити наш компонент:

```javascript
// В іншому модулі (якщо потрібно розширити):
import { OwlTodoList } from '@gk_owl/components/todo_list/todo_list';

export class ExtendedTodoList extends OwlTodoList {
    // Додаємо нову функціональність
}
```

#### Підсумок модулів

| Елемент | Що робить | Приклад у проекті |
|---------|-----------|-------------------|
| `/** @odoo-module **/` | Позначає файл як модуль Odoo | Перший рядок `todo_list.js` |
| `import { X } from '...'` | Бере X з іншого модуля | `import { registry } from '@web/core/registry'` |
| `export class X` | Дає можливість іншим використати X | `export class OwlTodoList extends Component` |
| `const { X } = owl` | Витягує X з глобального об'єкта OWL | `const { Component, useState } = owl` |

#### Повний перший рядки нашого файлу — що кожен означає

```javascript
/** @odoo-module **/
// ↑ Рядок 1: "Odoo, це модуль — обробляй мене правильно"

import { registry } from '@web/core/registry';
// ↑ Рядок 3: Беремо registry з ядра Odoo (для реєстрації компонента як дії)

const { Component, useState, onWillStart, useRef } = owl;
// ↑ Рядок 4: Витягуємо 4 інструменти з глобального об'єкта owl

import { useService } from "@web/core/utils/hooks";
// ↑ Рядок 5: Беремо useService з ядра Odoo (для підключення ORM сервісу)
```

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

#### Що таке дія (action) в Odoo?

Ви, як розробник Odoo 16, вже знаєте: коли користувач клікає пункт меню,
Odoo виконує **дію (action)**. Дія визначає, ЩО саме показати користувачу.

В Odoo є кілька типів дій. Для нашого проекту важливі два:

#### Тип 1: `ir.actions.act_window` — стандартна дія (ви це вже знаєте)

Це звичайна дія, яку ви використовуєте щодня в Odoo. Вона відкриває
стандартні views (tree, form, kanban тощо).

```xml
<record id="action_owl_todo_list" model="ir.actions.act_window">
    <field name="name">Todo List</field>
    <field name="res_model">owl.todo.list</field>
    <field name="view_mode">tree,form</field>
</record>
```

Що тут відбувається — ви це знаєте:
- `res_model` → яка модель (`owl.todo.list`)
- `view_mode` → які views показати (`tree,form`)
- Odoo шукає views для цієї моделі і показує стандартний інтерфейс

```
Клік на меню "Todo List"
     ↓
Odoo виконує ir.actions.act_window
     ↓
Шукає tree view для owl.todo.list → знаходить owl_todo_tre_form_view
     ↓
Показує стандартну таблицю Odoo (list view)
     ↓
При кліку на запис → шукає form view → показує стандартну форму
```

**Результат:** звичайний інтерфейс Odoo, без JavaScript. Все рендериться
на стороні сервера через Python + XML.

#### Тип 2: `ir.actions.client` — клієнтська дія (НОВЕ для вас!)

Це спеціальний тип дії, який говорить Odoo: **"Не шукай стандартну view.
Замість цього, знайди JavaScript компонент і дай ЙОМУ повністю контролювати
те, що бачить користувач."**

```xml
<record id="action_owl_todo_list_js" model="ir.actions.client">
    <field name="name">Todo List OWL</field>
    <field name="tag">owl.action_todo_list_js</field>
</record>
```

Зверніть увагу на відмінності від `act_window`:
- **Модель:** `ir.actions.client` (не `ir.actions.act_window`)
- **Немає `res_model`:** клієнтська дія не прив'язана до конкретної моделі
- **Немає `view_mode`:** нема стандартних views
- **Є `tag`:** унікальний ідентифікатор для пошуку JS компонента

```
Клік на меню "Todo List OWL"
     ↓
Odoo виконує ir.actions.client
     ↓
Читає field "tag" → "owl.action_todo_list_js"
     ↓
Шукає в JavaScript реєстрі (registry) компонент з цим тегом
     ↓
Знаходить OwlTodoList (ми його зареєстрували в JS!)
     ↓
OWL рендерить компонент → користувач бачить кастомний інтерфейс
```

**Результат:** повністю кастомний інтерфейс, побудований на JavaScript/OWL.
Ви контролюєте кожну кнопку, кожну таблицю, кожну дію.

#### Зв'язок tag ↔ registry (ключовий момент!)

Це найважливіше для розуміння. `tag` у XML та реєстрація в JS — це **один і
той самий рядок**, який зв'язує їх разом:

```
XML (серверна частина):                    JS (клієнтська частина):

<field name="tag">                         registry.category('actions').add(
    owl.action_todo_list_js                    'owl.action_todo_list_js',
</field>                                       OwlTodoList
                                           );
        ↑                                          ↑
        └──────── ПОВИННІ ЗБІГАТИСЯ! ──────────────┘
```

Якщо ці рядки не збігаються, Odoo покаже помилку: "Could not find client action".

Давайте подивимось на JavaScript частину (з файлу `todo_list.js`, рядок 78):
```javascript
registry.category('actions').add('owl.action_todo_list_js', OwlTodoList);
//                                ↑ цей рядок                ↑ цей клас
//                                повинен збігатися           буде
//                                з tag в XML                 відрендерений
```

#### Як працюють меню

У нашому файлі `views/todo_list.xml` є два пункти меню:

```xml
<!-- Батьківське меню (верхній рівень) -->
<menuitem name="OWL Tutorial" id="menu_owl_tutorial" sequence="10">

    <!-- Підменю 1: стандартний Odoo інтерфейс -->
    <menuitem name="Todo List"
              id="menu_owl_todo_list"
              sequence="10"
              action="action_owl_todo_list"/>
              <!--       ↑ посилається на ir.actions.act_window -->

    <!-- Підменю 2: OWL JavaScript інтерфейс -->
    <menuitem name="Todo List OWL"
              id="menu_owl_todo_list_js"
              sequence="10"
              action="action_owl_todo_list_js"/>
              <!--       ↑ посилається на ir.actions.client -->
</menuitem>
```

В інтерфейсі Odoo це буде виглядати так:
```
┌─────────────────────────────────────────────────────────────┐
│ [OWL Tutorial ▼]                                            │
│  ├── Todo List       → стандартний Odoo (tree/form)         │
│  └── Todo List OWL   → кастомний OWL компонент              │
└─────────────────────────────────────────────────────────────┘
```

Обидва пункти працюють з ТІЄЮ Ж моделлю `owl.todo.list` і ТИМИ Ж даними,
але показують їх по-різному:
- "Todo List" — стандартний інтерфейс, згенерований Odoo
- "Todo List OWL" — кастомний інтерфейс, який ми написали на JavaScript

#### Коли використовувати який тип?

| Ситуація | Тип дії | Приклад |
|----------|---------|---------|
| Стандартний CRUD | `ir.actions.act_window` | Список контактів, форма продукту |
| Кастомний інтерфейс | `ir.actions.client` | Дашборд, конструктор, гра |
| Інтерактивні елементи | `ir.actions.client` | Drag & drop, графіки, чат |
| Звичайна робота з даними | `ir.actions.act_window` | Замовлення, рахунки |

**Правило:** якщо стандартних views Odoo достатньо — використовуйте `act_window`.
Якщо потрібно щось особливе, чого стандартні views не вміють — `client` + OWL.

#### Повна картина: від меню до компонента

```
1. __manifest__.py
   └─ data: ['views/todo_list.xml']
       └─ Odoo завантажує XML при встановленні модуля

2. views/todo_list.xml
   ├─ ir.ui.view (tree) ─── для стандартного інтерфейсу
   ├─ ir.ui.view (form) ─── для стандартного інтерфейсу
   ├─ ir.actions.act_window ── дія "Todo List"
   ├─ ir.actions.client ────── дія "Todo List OWL" (tag: owl.action_todo_list_js)
   └─ menuitem ── меню з посиланнями на дії

3. __manifest__.py
   └─ assets: web.assets_backend: ['...todo_list.js', '...todo_list.xml']
       └─ Odoo завантажує JS/XML у браузер

4. todo_list.js
   └─ registry.category('actions').add('owl.action_todo_list_js', OwlTodoList)
       └─ Реєструє компонент під тегом

5. Користувач клікає "Todo List OWL"
   └─ Odoo знаходить action з tag 'owl.action_todo_list_js'
   └─ Шукає в registry → знаходить OwlTodoList
   └─ Рендерить компонент
```

---

## Урок 3: Що таке OWL

### 3.1 OWL — Odoo Web Library

OWL (Odoo Web Library) — це JavaScript фреймворк, створений командою Odoo.

**Простими словами:** OWL — це інструмент, який дозволяє створювати інтерактивні
веб-інтерфейси всередині Odoo. Якщо стандартні views Odoo (tree, form, kanban) —
це як стандартні меблі з магазину, то OWL — це столярна майстерня, де ви можете
зробити БУДЬ-ЯКУ меблі на замовлення.

#### Чому саме OWL, а не чистий JavaScript?

Давайте порівняємо. Уявіть, що вам потрібно показати список задач і оновлювати
його при зміні даних.

**На чистому JavaScript (без фреймворку):**
```javascript
// 1. Вручну створити HTML
const div = document.createElement('div');
const ul = document.createElement('ul');

// 2. Завантажити дані
const tasks = await fetch('/api/tasks');

// 3. Вручну створити елемент для кожної задачі
for (const task of tasks) {
    const li = document.createElement('li');
    li.textContent = task.name;
    li.onclick = function() { /* обробка кліку */ };
    ul.appendChild(li);
}
div.appendChild(ul);

// 4. Вставити в сторінку
document.body.appendChild(div);

// 5. При зміні даних — вручну знайти елемент і оновити
//    Треба пам'ятати, який елемент відповідає якій задачі
//    Це стає ДУЖЕ складним!
```

**З OWL:**
```javascript
// 1. Описуємо ЩО показувати (шаблон автоматично рендериться)
// XML:
// <ul>
//     <li t-foreach="state.tasks" t-as="task" t-esc="task.name"/>
// </ul>

// 2. Описуємо стан
this.state = useState({ tasks: [] });

// 3. Завантажуємо дані
this.state.tasks = await this.orm.searchRead(...);
// OWL АВТОМАТИЧНО оновить HTML! Не треба нічого шукати/міняти вручну!
```

Бачите різницю? OWL бере на себе найскладнішу частину — **синхронізацію
даних та інтерфейсу**. Ви просто змінюєте дані, а OWL сам оновлює HTML.

### 3.2 Чотири ключові ідеї OWL

#### Ідея 1: Компоненти — будівельні блоки інтерфейсу

Уявіть, що ви будуєте дім з конструктора Lego. Кожен блок — це **компонент**.
Компонент — це самостійна частина інтерфейсу зі своєю логікою і виглядом.

В нашому проекті весь Todo List — це один компонент `OwlTodoList`. Але в
більших проектах сторінка може складатися з багатьох компонентів:

```
┌──────────────────────────────────────────────────────────┐
│ Сторінка                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Компонент Header (верхня панель)                      │ │
│  │  ┌──────────┐  ┌──────────────────────────────────┐  │ │
│  │  │ Кнопка   │  │ Компонент SearchBar (пошук)       │  │ │
│  │  │ "New"    │  │  [Поле вводу]  [Кнопка "Search"]  │  │ │
│  │  └──────────┘  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Компонент TaskTable (таблиця задач)                    │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │ Компонент TaskRow (рядок задачі)                │   │ │
│  │  │  ☑ Купити молоко  [🎨] [Edit] [Delete]          │   │ │
│  │  ├────────────────────────────────────────────────┤   │ │
│  │  │ Компонент TaskRow (рядок задачі)                │   │ │
│  │  │  ☐ Написати код   [🎨] [Edit] [Delete]          │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Компонент Modal (модальне вікно)                      │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

В нашому проекті для простоти все це — один компонент `OwlTodoList`.
В реальних проектах розбивають на менші компоненти для зручності.

**Кожен компонент:**
- Має свій файл з логікою (JS)
- Має свій шаблон (XML)
- Може мати свої стилі (SCSS)
- Працює незалежно від інших
- Може включати в себе інші компоненти (дочірні)

#### Ідея 2: Реактивність — автоматичне оновлення інтерфейсу

**Реактивність** — це коли інтерфейс автоматично реагує на зміну даних.

Аналогія: уявіть електронне табло на вокзалі. Коли оператор змінює час
відправлення в системі, табло АВТОМАТИЧНО показує нові дані. Оператору
не треба йти і вручну переставляти літери.

В OWL це працює через `useState`:

```javascript
// Створюємо "реактивне табло" (стан)
this.state = useState({
    taskList: []
});

// Десь пізніше змінюємо дані:
this.state.taskList = [
    {name: "Задача 1", completed: false},
    {name: "Задача 2", completed: true}
];
// OWL бачить зміну → АВТОМАТИЧНО перемальовує таблицю!
// Вам НЕ треба писати код для оновлення HTML!

// Ще пізніше:
this.state.taskList = [];
// OWL бачить зміну → таблиця стала порожньою!
```

**Без реактивності** (чистий JS) вам довелося б:
1. Знайти DOM елемент таблиці
2. Видалити старі рядки
3. Створити нові рядки
4. Вставити їх у таблицю
5. Повісити обробники подій на кожен новий рядок
6. Повторювати це ЩОРАЗУ при зміні даних

З OWL ви просто змінюєте `this.state.taskList` і все.

#### Ідея 3: Шаблони (Templates) — опис вигляду

Шаблон — це XML файл, який описує, ЯК має виглядати компонент.
Він схожий на HTML, але з додатковими можливостями (директивами `t-`).

```xml
<!-- Це НЕ звичайний HTML. Це OWL шаблон. -->
<t t-name="owl.TodoList" owl="1">
    <div>
        <!-- t-foreach — "для кожної задачі зроби рядок" -->
        <div t-foreach="state.taskList" t-as="task" t-key="task.id">

            <!-- t-esc — "покажи значення змінної" -->
            <span t-esc="task.name"/>

            <!-- t-on-click — "при кліку виконай метод" -->
            <button t-on-click="() => this.deleteTask(task)">
                Delete
            </button>
        </div>
    </div>
</t>
```

**Аналогія з Odoo QWeb, який ви знаєте:**

Якщо ви працювали з QWeb шаблонами в Odoo (для PDF звітів, наприклад),
то OWL шаблони дуже схожі:

```xml
<!-- QWeb для звітів (ви це знаєте) -->
<t t-foreach="docs" t-as="doc">
    <span t-field="doc.name"/>
</t>

<!-- OWL шаблон (майже те саме!) -->
<t t-foreach="state.taskList" t-as="task">
    <span t-esc="task.name"/>
</t>
```

Різниця: в QWeb для звітів дані приходять з Python, а в OWL —
з JavaScript стану (`state`).

#### Ідея 4: Односпрямований потік даних

Дані в OWL "течуть" в одному напрямку: від батьківського компонента до
дочірнього через **пропси (props)**.

```
Батьківський компонент (має дані)
         │
         │ передає дані через props
         ↓
Дочірній компонент (отримує і показує)
```

В нашому простому проекті це не використовується (бо у нас один компонент),
але в складних проектах це виглядає так:

```javascript
// Батьківський компонент
class TodoApp extends Component {
    setup() {
        this.state = useState({ tasks: [...] });
    }
}
// XML батька: <TaskRow task="task"/>  ← передає задачу дочірньому

// Дочірній компонент
class TaskRow extends Component {
    // Отримує task через props
    // this.props.task.name, this.props.task.completed
}
```

### 3.3 Компонент = Клас + Шаблон

Кожен OWL компонент складається мінімум з двох частин:

```
Компонент OwlTodoList
│
├── JS файл (todo_list.js)
│   └── class OwlTodoList extends Component
│       ├── setup()        → Ініціалізація
│       ├── getAllTasks()   → Завантажити задачі
│       ├── addTask()      → Додати задачу
│       ├── editTask()     → Редагувати задачу
│       ├── saveTask()     → Зберегти задачу
│       ├── deleteTask()   → Видалити задачу
│       ├── searchTasks()  → Пошук задач
│       ├── toggleTask()   → Позначити виконаною
│       ├── updateColor()  → Змінити колір
│       └── resetForm()    → Очистити форму
│
└── XML файл (todo_list.xml)
    └── template "owl.TodoList"
        ├── Кнопка "New"
        ├── Поле пошуку
        ├── Таблиця задач (для кожної задачі: чекбокс, назва, колір, кнопки)
        └── Модальне вікно (форма створення/редагування)
```

**Зв'язок між ними:**
```javascript
// В JS:
OwlTodoList.template = 'owl.TodoList';
//                       ↑ ця назва...

// В XML:
// <t t-name="owl.TodoList" owl="1">
//            ↑ ...повинна збігатися з цією
```

### 3.4 Як OWL працює в Odoo 16 — крок за кроком

Давайте детально прослідкуємо що відбувається від моменту, коли користувач
відкриває Odoo, до моменту, коли він бачить наш Todo List.

#### Крок 1: Завантаження сторінки

Коли користувач відкриває Odoo в браузері, сервер відправляє HTML-сторінку.
Разом з нею завантажуються всі JavaScript файли, зареєстровані в `assets`.

```
Браузер ──GET──→ Odoo сервер
         ←─────  HTML + CSS + JavaScript (включаючи наш todo_list.js)
```

Наш файл `todo_list.js` виконується автоматично при завантаженні:
```javascript
// Цей рядок виконується одразу:
registry.category('actions').add('owl.action_todo_list_js', OwlTodoList);
// Тепер Odoo "знає" про наш компонент
```

А наш файл `todo_list.xml` (OWL шаблон) теж завантажується і реєструється
в системі шаблонів OWL.

#### Крок 2: Користувач клікає меню "Todo List OWL"

```
Користувач клікає:   [OWL Tutorial] → [Todo List OWL]
                                            ↓
Odoo в браузері:     "Мені потрібно виконати action з id=action_owl_todo_list_js"
                                            ↓
                     Читає action → тип: ir.actions.client
                                            ↓
                     Бачить tag: "owl.action_todo_list_js"
                                            ↓
                     Шукає в registry.category('actions')
                                            ↓
                     Знаходить: OwlTodoList
                                            ↓
                     "Потрібно створити екземпляр OwlTodoList!"
```

#### Крок 3: OWL створює компонент

```javascript
// OWL внутрішньо робить щось на кшталт:
const component = new OwlTodoList();
component.setup();  // ← Виконується наш setup()
```

В `setup()` виконується:
```javascript
setup() {
    // 1. Створюється реактивний стан (поки порожній)
    this.state = useState({
        task: {name: "", color: "#FF0000", completed: false},
        taskList: [],       // ← Поки порожній масив
        isEdit: false,
        activeId: false,
    });

    // 2. Підключається ORM сервіс
    this.orm = useService("orm");

    // 3. Реєструється хук onWillStart
    onWillStart(async () => {
        await this.getAllTasks();  // ← Завантажити задачі ПЕРЕД показом
    });
}
```

#### Крок 4: Виконується `onWillStart`

OWL бачить, що є хук `onWillStart`, і виконує його ПЕРЕД рендерингом:

```javascript
async getAllTasks() {
    // JavaScript відправляє запит до Odoo сервера:
    // POST /web/dataset/call_kw/owl.todo.list/search_read
    this.state.taskList = await this.orm.searchRead(
        "owl.todo.list",               // Модель
        [],                              // Без фільтра
        ["name", "color", "completed"]   // Поля
    );
}
```

```
Браузер (JS) ──JSON-RPC──→ Odoo сервер (Python)
                            │
                            ↓
                          self.env['owl.todo.list'].search_read(
                              [], ['name', 'color', 'completed']
                          )
                            │
                            ↓
                          SELECT name, color, completed
                          FROM owl_todo_list;
                            │
                            ↓
              ←──JSON──── Результат: [{id:1, name:"Задача 1", ...}, ...]
```

Тепер `this.state.taskList` містить масив задач з бази даних.

#### Крок 5: OWL рендерить шаблон

OWL бере шаблон `owl.TodoList` і "виконує" його:

```xml
<!-- t-foreach="state.taskList" — перебирає кожну задачу -->
<!-- Якщо taskList = [{id:1, name:"Купити молоко"}, {id:2, name:"Написати код"}] -->
<!-- То OWL створить два <tr> рядки: -->

<tr>
    <td>
        <input type="checkbox"/>
        <label>Купити молоко</label>
    </td>
    <td><input type="color" value="#FF0000"/></td>
    <td>
        <button>Edit</button>
        <button>Delete</button>
    </td>
</tr>
<tr>
    <td>
        <input type="checkbox"/>
        <label>Написати код</label>
    </td>
    <td><input type="color" value="#00FF00"/></td>
    <td>
        <button>Edit</button>
        <button>Delete</button>
    </td>
</tr>
```

Згенерований HTML вставляється у сторінку, і користувач бачить таблицю.

#### Крок 6: Користувач взаємодіє → Реактивний цикл

Тепер починається "реактивний цикл":

```
Користувач клікає "Delete" на задачі "Купити молоко"
    ↓
OWL викликає: this.deleteTask(task)    // task = {id:1, name:"Купити молоко"}
    ↓
deleteTask() виконує:
    await this.orm.unlink("owl.todo.list", [1])    // Видаляє з БД
    await this.getAllTasks()                         // Перезавантажує список
    ↓
this.state.taskList тепер = [{id:2, name:"Написати код"}]  // Без "Купити молоко"
    ↓
OWL БАЧИТЬ, що state.taskList змінився
    ↓
OWL АВТОМАТИЧНО перемальовує таблицю
    ↓
Користувач бачить оновлену таблицю (без "Купити молоко")
```

Це і є **реактивність** — ви міняєте дані, OWL міняє інтерфейс.

### 3.5 Порівняння: Стандартний Odoo vs OWL

| Аспект | Стандартний Odoo (act_window) | OWL (ir.actions.client) |
|--------|-------------------------------|------------------------|
| Де створюється HTML | На сервері (Python + QWeb) | В браузері (JavaScript) |
| Як оновлюється | Перезавантаження сторінки | Миттєво, без перезавантаження |
| Гнучкість інтерфейсу | Обмежена стандартними views | Повна свобода |
| Швидкість взаємодії | Повільніша (запит до сервера) | Швидша (локальне оновлення) |
| Складність розробки | Простіше (XML views) | Складніше (JS + XML) |
| Коли використовувати | Типовий CRUD | Кастомні інтерфейси |

**Для вас як розробника Odoo:** стандартні views — це ваш основний інструмент.
OWL потрібен тоді, коли стандартних views не вистачає: дашборди, конструктори,
інтерактивні віджети, ігри, чат-інтерфейси тощо.

### 3.6 OWL в Odoo 16 vs Odoo 17+

Важлива відмінність у тому, як підключати OWL:

**Odoo 16 (наш проект):**
```javascript
// OWL доступний як глобальний об'єкт
const { Component, useState, onWillStart, useRef } = owl;
```

**Odoo 17+ (для майбутнього):**
```javascript
// OWL імпортується як модуль
import { Component, useState, onWillStart, useRef } from "@odoo/owl";
```

Якщо ви будете переходити на Odoo 17+, потрібно буде змінити тільки
цей один рядок. Вся решта логіки залишається такою ж.

### 3.7 Словник термінів OWL (для початківця)

| Термін | Простими словами | Аналогія |
|--------|-----------------|----------|
| **Компонент** | Незалежний блок інтерфейсу | Lego-блок |
| **Стан (State)** | Дані, які визначають вигляд | Вміст кошика в магазині |
| **Рендеринг** | Перетворення шаблону в HTML | Друк документу |
| **Ререндеринг** | Оновлення HTML після зміни | Передрук зміненого документу |
| **Шаблон (Template)** | Опис вигляду компонента | Бланк/шаблон документу |
| **Хук (Hook)** | Функція, що "чіпляється" до моменту | Будильник на певний час |
| **Директива** | Спеціальна команда в шаблоні (`t-...`) | Команда для принтера |
| **Реактивність** | Автоматичне оновлення при зміні даних | Електронне табло |
| **Пропси (Props)** | Дані від батька до дитини | Інструкція від начальника |
| **Registry** | Каталог зареєстрованих компонентів | Телефонна книга |

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
