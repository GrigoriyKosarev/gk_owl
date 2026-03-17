# Кастомізація стандартних Views в Odoo 16 через JavaScript/OWL

> Детальний мануал для Odoo розробника-початківця в JavaScript.
> Як розширити tree, form, pivot та інші стандартні views за допомогою JS.

---

## Зміст

- [Вступ: Два підходи до кастомізації](#вступ-два-підходи-до-кастомізації)
- [Розділ 1: Архітектура View в Odoo 16](#розділ-1-архітектура-view-в-odoo-16)
- [Розділ 2: Функція patch() — змінюємо існуючі компоненти](#розділ-2-функція-patch)
- [Розділ 3: Кастомізація Tree (List) View](#розділ-3-кастомізація-tree-list-view)
- [Розділ 4: Кастомізація Form View](#розділ-4-кастомізація-form-view)
- [Розділ 5: Кастомізація Pivot View](#розділ-5-кастомізація-pivot-view)
- [Розділ 6: Кастомізація Search View (фільтри та пошук)](#розділ-6-кастомізація-search-view)
- [Розділ 7: Створення повністю нового типу View](#розділ-7-створення-нового-типу-view)
- [Розділ 8: Створення кастомного Field Widget](#розділ-8-кастомний-field-widget)
- [Розділ 9: Шпаргалка з імпортів та шляхів](#розділ-9-шпаргалка)

---

## Вступ: Два підходи до кастомізації

В Odoo 16 є два підходи до кастомізації стандартних views через JavaScript:

### Підхід 1: `patch()` — змінити поведінку ВСЮДИ

Функція `patch()` змінює існуючий клас (Controller, Renderer тощо) **глобально**.
Зміна діє для ВСІХ view цього типу у всій системі.

```
patch() → змінює ListController
              ↓
Тепер ВСІ list views у всіх моделях мають цю зміну
```

**Коли використовувати:** коли потрібно додати функціонал до ВСІХ views
одного типу (наприклад, кнопку "Експорт в Excel" для всіх list views).

### Підхід 2: `js_class` — змінити поведінку для ОДНІЄЇ view

Створюємо НОВИЙ клас view (на основі існуючого) і використовуємо його
тільки для конкретної моделі через атрибут `js_class` в XML.

```
Новий клас CustomListView (наслідує від ListView)
              ↓
Реєструємо в registry під назвою "custom_list"
              ↓
В XML view: <tree js_class="custom_list">
              ↓
Тільки ЦЯ view використовує кастомний клас
```

**Коли використовувати:** коли зміна потрібна тільки для конкретної
моделі або конкретної view.

### Порівняння

| Аспект | `patch()` | `js_class` |
|--------|-----------|------------|
| Область дії | Глобально (всі views) | Тільки одна view |
| Складність | Простіше | Трохи складніше |
| Безпечність | Ризик зламати інші views | Безпечно, ізольовано |
| Рекомендація | Для невеликих змін | Для значних змін |

---

## Розділ 1: Архітектура View в Odoo 16

### 1.1 Три складові кожної View

Перш ніж кастомізувати view, потрібно зрозуміти з чого вона складається.
Кожна стандартна view в Odoo 16 має три частини:

```
View (об'єкт визначення)
├── Controller → Логіка (обробка подій, бізнес-логіка)
├── Renderer  → Відображення (HTML, як view виглядає)
└── Model     → Дані (завантаження/збереження даних)
```

**Аналогія з MVC (якщо чули):**
- **Model** — дані (звідки взяти, як зберегти)
- **View/Renderer** — відображення (як показати)
- **Controller** — логіка (що робити при кліку)

### 1.2 Імпорти для кожної View

Ось шляхи імпортів для основних views в Odoo 16:

#### List (Tree) View
```javascript
import { ListController } from "@web/views/list/list_controller";
import { ListRenderer } from "@web/views/list/list_renderer";
import { listView } from "@web/views/list/list_view";
```

#### Form View
```javascript
import { FormController } from "@web/views/form/form_controller";
import { FormRenderer } from "@web/views/form/form_renderer";
import { formView } from "@web/views/form/form_view";
```

#### Kanban View
```javascript
import { KanbanController } from "@web/views/kanban/kanban_controller";
import { KanbanRenderer } from "@web/views/kanban/kanban_renderer";
import { kanbanView } from "@web/views/kanban/kanban_view";
```

#### Pivot View
```javascript
import { PivotController } from "@web/views/pivot/pivot_controller";
import { PivotRenderer } from "@web/views/pivot/pivot_renderer";
import { pivotView } from "@web/views/pivot/pivot_view";
```

### 1.3 Структура об'єкта View

Кожна view в Odoo 16 — це об'єкт з такою структурою:

```javascript
// Приклад: listView (з файлу @web/views/list/list_view)
const listView = {
    type: "list",                    // Тип view
    display_name: "List",            // Назва для відображення
    icon: "oi-view-list",            // Іконка
    multiRecord: true,               // Показує багато записів
    Controller: ListController,      // Клас контролера
    Renderer: ListRenderer,          // Клас рендерера
    ArchParser: ListArchParser,      // Парсер XML-архітектури
    Model: RelationalModel,          // Клас моделі даних
    // ...та інші поля
};
```

Коли ви створюєте кастомну view, ви замінюєте один чи кілька з цих класів
своїми кастомними версіями.

### 1.4 Що Controller, а що Renderer?

Це ключове розуміння для кастомізації:

**Controller** відповідає за:
- Кнопки зверху (панель управління / control panel)
- Обробку подій кнопок (створити, зберегти, видалити)
- Навігацію між записами
- Бізнес-логіку

**Renderer** відповідає за:
- Відображення даних (таблиця, форма, картки)
- Рядки таблиці, поля форми
- Візуальне оформлення

```
┌──────────────────────────────────────────────────────────────┐
│ Controller                                                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Control Panel: [New] [Actions ▼] [Filters ▼] [Search...]││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Renderer                                                  ││
│  │                                                           ││
│  │  ┌───────────────┬──────────┬─────────┐                  ││
│  │  │ Name          │ Color    │ Done    │                  ││
│  │  ├───────────────┼──────────┼─────────┤                  ││
│  │  │ Купити молоко │ 🔴       │ ☐       │                  ││
│  │  │ Написати код  │ 🟢       │ ☑       │                  ││
│  │  └───────────────┴──────────┴─────────┘                  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Правило:**
- Хочете додати кнопку до панелі зверху → кастомізуйте **Controller**
- Хочете змінити вигляд таблиці/форми → кастомізуйте **Renderer**

---

## Розділ 2: Функція patch()

### 2.1 Що таке patch()?

`patch()` — це функція Odoo 16, яка дозволяє "патчити" (модифікувати)
існуючий клас без зміни його вихідного коду. Це як "мавпяча латка"
(monkey-patching), але безпечніша.

**Аналогія:** Уявіть, що у вас є готовий костюм. `patch()` — це ательє, яке
може додати кишеню або змінити підкладку, НЕ розпорюючи весь костюм.

### 2.2 Імпорт та синтаксис

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";

// Базовий синтаксис:
patch(ЩоПатчимо.prototype, {
    // Нові або перевизначені методи
});
```

### 2.3 Приклад 1: Додати метод до існуючого класу

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";

// Додаємо новий метод до ListController
patch(ListController.prototype, {
    // Новий метод, якого раніше не було
    myCustomMethod() {
        console.log("Мій кастомний метод!");
    }
});
```

### 2.4 Приклад 2: Перевизначити існуючий метод

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";

patch(ListController.prototype, {
    // Перевизначаємо існуючий метод setup()
    setup() {
        // ВАЖЛИВО: виклик оригінального методу!
        super.setup(...arguments);
        // Після оригінальної ініціалізації — наш код:
        console.log("ListController ініціалізовано з патчем!");
    }
});
```

**КРИТИЧНО:** Завжди викликайте `super.метод()` якщо перевизначаєте існуючий
метод! Інакше ви повністю замінити оригінальну логіку і view може зламатися.

### 2.5 Приклад 3: Патч з async методами

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";

patch(ListController.prototype, {
    // Перевизначаємо async метод
    async setup() {
        // Виклик оригінального setup
        super.setup(...arguments);
    },

    // Новий async метод
    async myAsyncAction() {
        // Можна використовувати сервіси через this
        const result = await this.orm.searchRead("res.partner", [], ["name"]);
        console.log("Партнери:", result);
    }
});
```

### 2.6 Обмеження patch()

| Можна | Не можна |
|-------|----------|
| Додати нові методи | Додати нові поля в template |
| Перевизначити існуючі методи | Змінити XML шаблон |
| Змінити логіку setup() | Додати/видалити HTML елементи |
| Викликати сервіси | Змінити тип view |

**Для зміни XML шаблону** потрібен інший підхід — `t-inherit` (описаний нижче).

### 2.7 Як дізнатися які методи є у Controller/Renderer?

Найкращий спосіб — подивитися вихідний код Odoo:

```
addons/web/static/src/views/list/list_controller.js
addons/web/static/src/views/list/list_renderer.js
addons/web/static/src/views/form/form_controller.js
addons/web/static/src/views/form/form_renderer.js
```

Або в браузері через Developer Tools (F12 → Console):
```javascript
// Подивитися методи ListController
console.log(Object.getOwnPropertyNames(ListController.prototype));
```

---

## Розділ 3: Кастомізація Tree (List) View

### 3.1 Задача: Додати кастомну кнопку до List View

Найчастіша задача — додати кнопку зверху таблиці (в control panel).

**Що хочемо отримати:**
```
┌──────────────────────────────────────────────────────────┐
│ [New] [My Custom Button] [Actions ▼]    [Search...]      │
│          ↑ наша нова кнопка                               │
├──────────────────────────────────────────────────────────┤
│ Name          │ Color    │ Done                           │
├───────────────┼──────────┼───────────                     │
│ Задача 1      │ 🔴       │ ☐                              │
│ Задача 2      │ 🟢       │ ☑                              │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Спосіб A: patch() — кнопка для ВСІХ list views

#### Крок 1: Створити файл JavaScript

Файл: `your_module/static/src/views/list_button.js`

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";
import { useService } from "@web/core/utils/hooks";

patch(ListController.prototype, {
    setup() {
        // Викликаємо оригінальний setup
        super.setup(...arguments);
        // Підключаємо сервіс дій (для виклику дій Odoo)
        this.actionService = useService("action");
    },

    // Наш кастомний метод — обробник кнопки
    onClickCustomButton() {
        // Приклад: показати повідомлення
        this.actionService.doAction({
            type: "ir.actions.client",
            tag: "display_notification",
            params: {
                title: "Кастомна кнопка",
                message: "Ви натиснули кастомну кнопку!",
                type: "success",
                sticky: false,
            },
        });
    },
});
```

#### Крок 2: Розширити XML шаблон кнопками

Файл: `your_module/static/src/views/list_button.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <!-- Розширюємо шаблон кнопок ListController -->
    <t t-inherit="web.ListView.Buttons" t-inherit-mode="extension">
        <!-- Додаємо нашу кнопку ПІСЛЯ стандартних -->
        <xpath expr="//div[hasclass('o_list_buttons')]" position="inside">
            <button class="btn btn-primary ms-2"
                    t-on-click="onClickCustomButton">
                My Custom Button
            </button>
        </xpath>
    </t>

</templates>
```

Розберемо кожен рядок:
- `t-inherit="web.ListView.Buttons"` — назва шаблону, який розширюємо
- `t-inherit-mode="extension"` — режим розширення (не заміна)
- `<xpath expr="..." position="inside">` — куди вставити (всередину div з кнопками)
- `t-on-click="onClickCustomButton"` — виклик нашого методу з patch

#### Крок 3: Зареєструвати в __manifest__.py

```python
'assets': {
    'web.assets_backend': [
        'your_module/static/src/views/list_button.js',
        'your_module/static/src/views/list_button.xml',
    ],
},
```

**Результат:** КОЖНА list view у системі тепер має кнопку "My Custom Button".

### 3.3 Спосіб B: js_class — кнопка тільки для ОДНІЄЇ моделі

#### Крок 1: Створити кастомний Controller

Файл: `your_module/static/src/views/todo_list_view.js`

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { listView } from "@web/views/list/list_view";
import { ListController } from "@web/views/list/list_controller";
import { useService } from "@web/core/utils/hooks";

// Створюємо НОВИЙ контролер на основі стандартного
export class TodoListController extends ListController {
    setup() {
        super.setup();
        this.notification = useService("notification");
        this.orm = useService("orm");
    }

    // Кастомний метод
    async onClickCompleteAll() {
        // Отримуємо всі ID записів у поточному списку
        const records = this.model.root.records;
        const ids = records.map(record => record.resId);

        if (ids.length === 0) {
            this.notification.add("Немає задач для оновлення", { type: "warning" });
            return;
        }

        // Позначити всі задачі як виконані
        await this.orm.write("owl.todo.list", ids, { completed: true });

        // Оновити список (перезавантажити дані)
        await this.model.root.load();
        this.render(true);

        this.notification.add("Всі задачі позначені як виконані!", { type: "success" });
    }

    // Ще один кастомний метод
    async onClickDeleteCompleted() {
        const records = this.model.root.records;
        const completedIds = records
            .filter(record => record.data.completed)
            .map(record => record.resId);

        if (completedIds.length === 0) {
            this.notification.add("Немає виконаних задач", { type: "info" });
            return;
        }

        await this.orm.unlink("owl.todo.list", completedIds);
        await this.model.root.load();
        this.render(true);

        this.notification.add(
            `Видалено ${completedIds.length} виконаних задач`,
            { type: "success" }
        );
    }
}

// Вказуємо шаблон для кнопок цього контролера
TodoListController.template = "your_module.TodoListView.Buttons";

// Створюємо новий об'єкт view на основі стандартного listView
export const todoListView = {
    ...listView,                          // Копіюємо все зі стандартного
    Controller: TodoListController,       // Замінюємо контролер на наш
};

// Реєструємо нашу view під назвою "todo_list_view"
registry.category("views").add("todo_list_view", todoListView);
```

#### Крок 2: Створити шаблон кнопок

Файл: `your_module/static/src/views/todo_list_view.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <!-- Розширюємо СТАНДАРТНИЙ шаблон кнопок list view -->
    <t t-name="your_module.TodoListView.Buttons" t-inherit="web.ListView.Buttons" t-inherit-mode="primary">
        <!-- primary = створюємо НОВИЙ шаблон на основі існуючого -->

        <xpath expr="//div[hasclass('o_list_buttons')]" position="inside">
            <button class="btn btn-success ms-2"
                    t-on-click="onClickCompleteAll">
                Complete All
            </button>
            <button class="btn btn-danger ms-2"
                    t-on-click="onClickDeleteCompleted">
                Delete Completed
            </button>
        </xpath>
    </t>

</templates>
```

**Зверніть увагу на різницю:**
- `t-inherit-mode="extension"` — змінює оригінальний шаблон (для patch)
- `t-inherit-mode="primary"` — створює НОВИЙ шаблон на основі оригіналу (для js_class)

#### Крок 3: Використати js_class в XML view

```xml
<!-- views/todo_list.xml -->
<record id="owl_todo_tre_form_view" model="ir.ui.view">
    <field name="name">owl.todo.tree.form.view</field>
    <field name="model">owl.todo.list</field>
    <field name="arch" type="xml">
        <tree js_class="todo_list_view">
        <!--   ↑ це посилання на ім'я у registry.category("views") -->
            <field name="name"/>
            <field name="color" widget="color"/>
            <field name="completed"/>
        </tree>
    </field>
</record>
```

#### Крок 4: __manifest__.py

```python
'assets': {
    'web.assets_backend': [
        'your_module/static/src/views/todo_list_view.js',
        'your_module/static/src/views/todo_list_view.xml',
    ],
},
```

**Результат:** Тільки list view для моделі `owl.todo.list` має кнопки
"Complete All" та "Delete Completed". Інші list views не змінені.

### 3.4 Повний ланцюжок (як це все зв'язано)

```
__manifest__.py
└─ assets: todo_list_view.js, todo_list_view.xml

todo_list_view.js
├─ class TodoListController extends ListController { ... }
│     ├─ setup() → підключає сервіси
│     ├─ onClickCompleteAll() → кастомна логіка
│     └─ onClickDeleteCompleted() → кастомна логіка
│
├─ TodoListController.template = "your_module.TodoListView.Buttons"
│     └─ ↓ зв'язок з XML шаблоном ↓
│
├─ todoListView = { ...listView, Controller: TodoListController }
│     └─ Новий об'єкт view з нашим контролером
│
└─ registry.category("views").add("todo_list_view", todoListView)
      └─ ↓ зв'язок з XML view ↓

todo_list_view.xml
└─ t-name="your_module.TodoListView.Buttons"
      └─ Додає кнопки "Complete All" і "Delete Completed"

views/todo_list.xml
└─ <tree js_class="todo_list_view">
      └─ Odoo шукає "todo_list_view" в registry.category("views")
      └─ Знаходить наш todoListView
      └─ Використовує TodoListController замість стандартного
```

### 3.5 Кастомізація Renderer (зовнішній вигляд таблиці)

Якщо потрібно змінити як виглядає САМА ТАБЛИЦЯ (не кнопки зверху):

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        // Тут можна додати логіку для рендерера
    },

    // Перевизначаємо метод, який визначає CSS клас рядка
    // Це дозволяє фарбувати рядки в залежності від даних
    getRowClass(record) {
        // Виклик оригінального методу для базового класу
        let className = super.getRowClass(record);

        // Якщо задача виконана — зробити рядок зеленим
        if (record.data.completed) {
            className += " text-success bg-success bg-opacity-10";
        }

        return className;
    },
});
```

---

## Розділ 4: Кастомізація Form View

### 4.1 Додати кнопку до Form View (через patch)

**Що хочемо:**
```
┌───────────────────────────────────────────────────────────────┐
│ [Save] [Discard] [My Custom Button]          Status: Draft    │
│                    ↑ наша кнопка                              │
├───────────────────────────────────────────────────────────────┤
│  Task Name: [Купити молоко        ]                           │
│  Color:     [🔴]                                              │
│  Completed: [☐]                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Файл: JS

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";
import { useService } from "@web/core/utils/hooks";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.notification = useService("notification");
    },

    async onClickDuplicateTask() {
        // Отримуємо дані поточного запису
        const record = this.model.root;

        if (!record.resId) {
            this.notification.add("Спочатку збережіть запис", { type: "warning" });
            return;
        }

        // Створюємо дублікат через copy
        await this.orm.call(
            record.resModel,   // "owl.todo.list"
            "copy",            // метод copy
            [record.resId],    // ID запису
        );

        this.notification.add("Задачу продубльовано!", { type: "success" });

        // Повернутися до списку
        this.actionService.doAction({
            type: "ir.actions.act_window",
            res_model: record.resModel,
            views: [[false, "list"], [false, "form"]],
            view_mode: "list",
        });
    },
});
```

#### Файл: XML шаблон

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <!-- Розширюємо шаблон кнопок Form view -->
    <t t-inherit="web.FormView.Buttons" t-inherit-mode="extension">
        <xpath expr="//div[hasclass('o_form_buttons_view')]" position="inside">
            <button class="btn btn-secondary ms-2"
                    t-on-click="onClickDuplicateTask">
                Duplicate Task
            </button>
        </xpath>
    </t>

</templates>
```

### 4.2 Додати кнопку тільки для конкретної моделі (js_class)

#### Файл: JS

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { formView } from "@web/views/form/form_view";
import { FormController } from "@web/views/form/form_controller";
import { useService } from "@web/core/utils/hooks";

export class TodoFormController extends FormController {
    setup() {
        super.setup();
        this.notification = useService("notification");
    }

    async onClickMarkDone() {
        const record = this.model.root;
        if (record.resId) {
            // Оновлюємо поле completed
            await record.update({ completed: true });
            await record.save();
            this.notification.add("Задачу позначено як виконану!", { type: "success" });
        }
    }

    async onClickSendEmail() {
        const record = this.model.root;
        // Приклад виклику кастомного Python методу
        await this.orm.call(
            record.resModel,
            "action_send_notification",  // Метод Python моделі
            [record.resId],
        );
        this.notification.add("Повідомлення надіслано!", { type: "success" });
    }
}

TodoFormController.template = "your_module.TodoFormView.Buttons";

export const todoFormView = {
    ...formView,
    Controller: TodoFormController,
};

registry.category("views").add("todo_form_view", todoFormView);
```

#### Файл: XML шаблон

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="your_module.TodoFormView.Buttons" t-inherit="web.FormView.Buttons" t-inherit-mode="primary">
        <xpath expr="//div[hasclass('o_form_buttons_edit')]" position="inside">
            <button class="btn btn-success ms-2"
                    t-on-click="onClickMarkDone">
                Mark Done
            </button>
            <button class="btn btn-info ms-2"
                    t-on-click="onClickSendEmail">
                Send Notification
            </button>
        </xpath>
    </t>

</templates>
```

#### Файл: XML view

```xml
<record id="owl_todo_list_form_view" model="ir.ui.view">
    <field name="name">owl.todo.list.form.view</field>
    <field name="model">owl.todo.list</field>
    <field name="arch" type="xml">
        <form js_class="todo_form_view">
        <!--        ↑ використовуємо наш кастомний form view -->
            <sheet>
                <group>
                    <field name="name"/>
                    <field name="color" widget="color"/>
                    <field name="completed"/>
                </group>
            </sheet>
        </form>
    </field>
</record>
```

### 4.3 Розширення FormRenderer (зміна вигляду форми)

Якщо потрібно змінити, як виглядає сама форма (не кнопки):

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { FormRenderer } from "@web/views/form/form_renderer";

const { onMounted } = owl;

patch(FormRenderer.prototype, {
    setup() {
        super.setup(...arguments);

        // Після того, як форма відобразилась
        onMounted(() => {
            // Наприклад, додати CSS клас до форми
            const form = this.__owl__.bdom;
            console.log("Форма відображена!");
        });
    },
});
```

---

## Розділ 5: Кастомізація Pivot View

### 5.1 Додати кнопку до Pivot View

**Pivot view** — це зведена таблиця (як в Excel).

#### Файл: JS

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { pivotView } from "@web/views/pivot/pivot_view";
import { PivotController } from "@web/views/pivot/pivot_controller";
import { useService } from "@web/core/utils/hooks";

export class CustomPivotController extends PivotController {
    setup() {
        super.setup();
        this.notification = useService("notification");
    }

    // Кнопка для скидання фільтрів pivot
    onClickResetPivot() {
        // Скидаємо pivot до початкового стану
        this.model.dispatch("TOGGLE_MEASURES", { id: "__count" });
        this.notification.add("Pivot скинуто!", { type: "info" });
    }

    // Кнопка для експорту даних
    async onClickExportData() {
        this.notification.add("Експорт даних...", { type: "info" });
        // Тут можна додати логіку експорту
    }
}

CustomPivotController.template = "your_module.CustomPivotView.Buttons";

export const customPivotView = {
    ...pivotView,
    Controller: CustomPivotController,
};

registry.category("views").add("custom_pivot_view", customPivotView);
```

#### Файл: XML шаблон

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="your_module.CustomPivotView.Buttons" t-inherit="web.PivotView.Buttons" t-inherit-mode="primary">
        <xpath expr="//div[hasclass('o_pivot_buttons')]" position="inside">
            <button class="btn btn-secondary ms-2"
                    t-on-click="onClickResetPivot">
                Reset Pivot
            </button>
            <button class="btn btn-secondary ms-2"
                    t-on-click="onClickExportData">
                Export Data
            </button>
        </xpath>
    </t>

</templates>
```

#### Файл: XML view

```xml
<record id="owl_todo_list_pivot_view" model="ir.ui.view">
    <field name="name">owl.todo.list.pivot.view</field>
    <field name="model">owl.todo.list</field>
    <field name="arch" type="xml">
        <pivot js_class="custom_pivot_view">
            <field name="name" type="row"/>
            <field name="completed" type="col"/>
        </pivot>
    </field>
</record>
```

### 5.2 Патчинг PivotRenderer (зміна вигляду таблиці)

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PivotRenderer } from "@web/views/pivot/pivot_renderer";

patch(PivotRenderer.prototype, {
    setup() {
        super.setup(...arguments);
    },

    // Перевизначаємо CSS клас для комірок pivot
    getCellClass(cell) {
        let className = super.getCellClass(cell);

        // Наприклад, підсвічуємо великі числа
        if (cell.value > 100) {
            className += " text-danger fw-bold";
        }

        return className;
    },
});
```

---

## Розділ 6: Кастомізація Search View (фільтри та пошук)

### 6.1 Як працює Search View

Search View в Odoo 16 — це панель з фільтрами, групуванням та пошуком
зверху кожної view. Вона контролюється через **ControlPanel**.

```
┌──────────────────────────────────────────────────────────────┐
│ [Filters ▼]  [Group By ▼]  [Favorites ▼]    🔍 [Search...]  │
│   ↑              ↑              ↑                 ↑          │
│   фільтри        групування     обране           пошукова    │
│                                                   строка     │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Додати кастомний фільтр через XML (без JavaScript)

Найпростіший спосіб — додати фільтр прямо в XML:

```xml
<record id="owl_todo_list_search_view" model="ir.ui.view">
    <field name="name">owl.todo.list.search.view</field>
    <field name="model">owl.todo.list</field>
    <field name="arch" type="xml">
        <search>
            <!-- Поля для пошуку -->
            <field name="name" string="Task Name"/>

            <!-- Фільтри -->
            <filter name="filter_completed"
                    string="Completed"
                    domain="[('completed', '=', True)]"/>
            <filter name="filter_not_completed"
                    string="Not Completed"
                    domain="[('completed', '=', False)]"/>

            <separator/>

            <filter name="filter_red"
                    string="Red Tasks"
                    domain="[('color', '=', '#FF0000')]"/>

            <!-- Групування -->
            <group expand="0" string="Group By">
                <filter name="group_completed"
                        string="By Status"
                        context="{'group_by': 'completed'}"/>
            </group>
        </search>
    </field>
</record>
```

**Не забудьте** додати action з прив'язкою до search view:
```xml
<record id="action_owl_todo_list" model="ir.actions.act_window">
    <field name="name">Todo List</field>
    <field name="res_model">owl.todo.list</field>
    <field name="view_mode">tree,form</field>
    <field name="search_view_id" ref="owl_todo_list_search_view"/>
</record>
```

### 6.3 Додати кастомну кнопку до Search Panel через JavaScript

Якщо потрібно додати КНОПКУ або кастомний елемент біля панелі пошуку:

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ControlPanel } from "@web/search/control_panel/control_panel";

patch(ControlPanel.prototype, {
    setup() {
        super.setup(...arguments);
    },

    onClickMySearchButton() {
        console.log("Кастомна кнопка пошуку натиснута!");
        // Тут можна програмно додати фільтр
    },
});
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-inherit="web.ControlPanel" t-inherit-mode="extension">
        <xpath expr="//div[hasclass('o_control_panel_actions')]" position="inside">
            <button class="btn btn-sm btn-outline-primary ms-2"
                    t-on-click="onClickMySearchButton">
                Custom Filter
            </button>
        </xpath>
    </t>

</templates>
```

### 6.4 Програмне керування фільтрами

Якщо потрібно програмно встановлювати фільтри з JavaScript:

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";

patch(ListController.prototype, {
    setup() {
        super.setup(...arguments);
    },

    // Програмно застосувати фільтр "тільки виконані"
    async applyCompletedFilter() {
        // Оновлюємо domain через env.searchModel
        this.env.searchModel.setDomainParts({
            myCustomFilter: {
                domain: [["completed", "=", true]],
                description: "Only Completed",
            },
        });
    },

    // Скинути кастомний фільтр
    async clearCompletedFilter() {
        this.env.searchModel.setDomainParts({
            myCustomFilter: undefined,
        });
    },
});
```

---

## Розділ 7: Створення повністю нового типу View

### 7.1 Навіщо створювати нову view?

Іноді стандартних view (list, form, kanban, pivot, graph) не достатньо.
Наприклад, вам потрібен dashboard, timeline, або щось унікальне.

В такому випадку ви можете створити повністю новий тип view, який
відображатиметься через `ir.actions.act_window` замість `ir.actions.client`.

Це відрізняється від `ir.actions.client` (як наш Todo List) тим, що:
- Нова view інтегрується зі стандартною Control Panel (фільтри, пошук)
- Працює з `ir.actions.act_window` і може бути одним з view_mode
- Має доступ до стандартних механізмів Odoo (domain, context, group_by)

### 7.2 Приклад: Dashboard View

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
const { Component, useState, onWillStart } = owl;

// Контролер — головний компонент view
export class DashboardController extends Component {
    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
        });

        onWillStart(async () => {
            await this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        const allTasks = await this.orm.searchCount("owl.todo.list", []);
        const completed = await this.orm.searchCount("owl.todo.list", [
            ["completed", "=", true],
        ]);

        this.state.totalTasks = allTasks;
        this.state.completedTasks = completed;
        this.state.pendingTasks = allTasks - completed;
    }

    onClickViewAll() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "All Tasks",
            res_model: "owl.todo.list",
            views: [[false, "list"], [false, "form"]],
            view_mode: "list,form",
        });
    }

    onClickViewPending() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Pending Tasks",
            res_model: "owl.todo.list",
            domain: [["completed", "=", false]],
            views: [[false, "list"], [false, "form"]],
            view_mode: "list,form",
        });
    }
}

DashboardController.template = "your_module.DashboardView";

// Реєструємо як тип view
export const dashboardView = {
    type: "dashboard",
    display_name: "Dashboard",
    Controller: DashboardController,
};

registry.category("views").add("todo_dashboard", dashboardView);
```

XML шаблон:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="your_module.DashboardView" owl="1">
        <div class="o_action p-4">
            <h2>Todo Dashboard</h2>

            <div class="row mt-4">
                <!-- Картка "Всього" -->
                <div class="col-lg-4">
                    <div class="card text-bg-primary mb-3 cursor-pointer"
                         t-on-click="onClickViewAll">
                        <div class="card-body">
                            <h5 class="card-title">Total Tasks</h5>
                            <h1 t-esc="state.totalTasks"/>
                        </div>
                    </div>
                </div>

                <!-- Картка "Виконані" -->
                <div class="col-lg-4">
                    <div class="card text-bg-success mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Completed</h5>
                            <h1 t-esc="state.completedTasks"/>
                        </div>
                    </div>
                </div>

                <!-- Картка "Очікують" -->
                <div class="col-lg-4">
                    <div class="card text-bg-warning mb-3 cursor-pointer"
                         t-on-click="onClickViewPending">
                        <div class="card-body">
                            <h5 class="card-title">Pending</h5>
                            <h1 t-esc="state.pendingTasks"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </t>

</templates>
```

Використання як `ir.actions.client`:
```xml
<record id="action_todo_dashboard" model="ir.actions.client">
    <field name="name">Todo Dashboard</field>
    <field name="tag">todo_dashboard</field>
</record>

<menuitem name="Dashboard" id="menu_todo_dashboard"
          action="action_todo_dashboard"
          parent="menu_owl_tutorial" sequence="5"/>
```

---

## Розділ 8: Кастомний Field Widget

### 8.1 Що таке Field Widget?

Field Widget — це JavaScript компонент, який відповідає за ВІДОБРАЖЕННЯ
та РЕДАГУВАННЯ одного поля. Наприклад, поле `color` з `widget="color"`
показує кольорову палітру замість текстового поля.

### 8.2 Створення простого кастомного Widget

Створимо віджет `priority_stars` — замість числа показує зірочки:

```
Звичайне поле:    3
Наш віджет:       ★★★☆☆
```

#### Файл: JS

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
const { Component } = owl;

export class PriorityStarsField extends Component {
    setup() {
        // Нічого додаткового для простого віджета
    }

    // Геттер для зручного доступу до значення
    get value() {
        return this.props.record.data[this.props.name] || 0;
    }

    // Масив зірочок [1, 2, 3, 4, 5]
    get stars() {
        return [1, 2, 3, 4, 5];
    }

    // Клік на зірочку — встановити нове значення
    async onClickStar(starValue) {
        await this.props.record.update({
            [this.props.name]: starValue,
        });
    }
}

// Вказуємо шаблон
PriorityStarsField.template = "your_module.PriorityStarsField";

// Вказуємо які пропси приймає компонент (стандартні для поля)
PriorityStarsField.props = {
    ...standardFieldProps,
};

// Вказуємо з якими типами полів працює віджет
PriorityStarsField.supportedTypes = ["integer"];

// Реєструємо в категорії "fields"
registry.category("fields").add("priority_stars", {
    component: PriorityStarsField,
    supportedTypes: ["integer"],
});
```

#### Файл: XML шаблон

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">

    <t t-name="your_module.PriorityStarsField" owl="1">
        <div class="d-inline-flex">
            <t t-foreach="stars" t-as="star" t-key="star">
                <span class="cursor-pointer fs-4"
                      t-on-click="() => this.onClickStar(star)"
                      t-attf-style="color: #{star lte value ? 'gold' : 'lightgray'};">
                    ★
                </span>
            </t>
        </div>
    </t>

</templates>
```

#### Використання в XML view

```xml
<form>
    <sheet>
        <group>
            <field name="name"/>
            <field name="priority" widget="priority_stars"/>
            <!--                    ↑ наш кастомний віджет -->
        </group>
    </sheet>
</form>
```

**Примітка:** Для цього потрібно, щоб модель мала поле `priority` типу Integer:
```python
priority = fields.Integer(string="Priority", default=0)
```

### 8.3 Розширення існуючого Widget через patch

Якщо потрібно злегка змінити поведінку існуючого віджета:

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { BooleanField } from "@web/views/fields/boolean/boolean_field";

// Патчимо стандартний чекбокс, щоб показувати повідомлення
patch(BooleanField.prototype, {
    async onChange(value) {
        await super.onChange(...arguments);
        if (value) {
            console.log("Задачу позначено як виконану!");
        }
    },
});
```

---

## Розділ 9: Шпаргалка

### 9.1 Основні імпорти

```javascript
// === Утиліти ===
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";

// === List View ===
import { ListController } from "@web/views/list/list_controller";
import { ListRenderer } from "@web/views/list/list_renderer";
import { listView } from "@web/views/list/list_view";

// === Form View ===
import { FormController } from "@web/views/form/form_controller";
import { FormRenderer } from "@web/views/form/form_renderer";
import { formView } from "@web/views/form/form_view";

// === Kanban View ===
import { KanbanController } from "@web/views/kanban/kanban_controller";
import { KanbanRenderer } from "@web/views/kanban/kanban_renderer";
import { kanbanView } from "@web/views/kanban/kanban_view";

// === Pivot View ===
import { PivotController } from "@web/views/pivot/pivot_controller";
import { PivotRenderer } from "@web/views/pivot/pivot_renderer";
import { pivotView } from "@web/views/pivot/pivot_view";

// === Graph View ===
import { GraphController } from "@web/views/graph/graph_controller";
import { GraphRenderer } from "@web/views/graph/graph_renderer";
import { graphView } from "@web/views/graph/graph_view";

// === Calendar View ===
import { CalendarController } from "@web/views/calendar/calendar_controller";
import { CalendarRenderer } from "@web/views/calendar/calendar_renderer";
import { calendarView } from "@web/views/calendar/calendar_view";

// === Search / Control Panel ===
import { ControlPanel } from "@web/search/control_panel/control_panel";
import { SearchBar } from "@web/search/search_bar/search_bar";

// === Fields (Widgets) ===
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { BooleanField } from "@web/views/fields/boolean/boolean_field";
import { CharField } from "@web/views/fields/char/char_field";
import { IntegerField } from "@web/views/fields/integer/integer_field";
import { Many2OneField } from "@web/views/fields/many2one/many2one_field";

// === OWL ===
const { Component, useState, useRef, onWillStart, onMounted } = owl;
```

### 9.2 Назви шаблонів для розширення

| View | Шаблон кнопок | Шаблон контенту |
|------|---------------|-----------------|
| List | `web.ListView.Buttons` | `web.ListRenderer` |
| Form | `web.FormView.Buttons` | `web.FormRenderer` |
| Kanban | `web.KanbanView.Buttons` | `web.KanbanRenderer` |
| Pivot | `web.PivotView.Buttons` | `web.PivotRenderer` |
| Graph | `web.GraphView.Buttons` | `web.GraphRenderer` |
| Calendar | `web.CalendarController.controlButtons` | `web.CalendarRenderer` |
| Control Panel | `web.ControlPanel` | — |

### 9.3 Xpath вирази для вставки кнопок

```xml
<!-- List View кнопки -->
<xpath expr="//div[hasclass('o_list_buttons')]" position="inside">

<!-- Form View кнопки (режим перегляду) -->
<xpath expr="//div[hasclass('o_form_buttons_view')]" position="inside">

<!-- Form View кнопки (режим редагування) -->
<xpath expr="//div[hasclass('o_form_buttons_edit')]" position="inside">

<!-- Pivot View кнопки -->
<xpath expr="//div[hasclass('o_pivot_buttons')]" position="inside">

<!-- Control Panel (пошукова панель) -->
<xpath expr="//div[hasclass('o_control_panel_actions')]" position="inside">
```

### 9.4 Доступні сервіси (useService)

```javascript
this.orm = useService("orm");           // Робота з базою даних
this.action = useService("action");     // Виклик дій (actions)
this.notification = useService("notification"); // Повідомлення (toast)
this.dialog = useService("dialog");     // Модальні вікна
this.rpc = useService("rpc");           // Прямі RPC запити
this.user = useService("user");         // Дані поточного користувача
this.company = useService("company");   // Дані поточної компанії
this.router = useService("router");     // URL навігація
this.title = useService("title");       // Заголовок сторінки
this.hotkey = useService("hotkey");     // Клавіатурні скорочення
```

### 9.5 Корисні методи ORM

```javascript
// Пошук і читання
await this.orm.searchRead(model, domain, fields, { limit, offset, order });
await this.orm.search(model, domain, { limit, offset, order });
await this.orm.read(model, ids, fields);
await this.orm.searchCount(model, domain);

// CRUD
await this.orm.create(model, [values]);
await this.orm.write(model, ids, values);
await this.orm.unlink(model, ids);

// Виклик методу Python моделі
await this.orm.call(model, method, args, kwargs);

// Приклади call:
await this.orm.call("owl.todo.list", "action_send_email", [recordId]);
await this.orm.call("owl.todo.list", "get_statistics", [], { date_from: "2024-01-01" });
```

### 9.6 Notification Service (повідомлення)

```javascript
this.notification = useService("notification");

// Типи: success, info, warning, danger
this.notification.add("Успішно збережено!", {
    type: "success",       // Тип повідомлення
    sticky: false,         // Зникає автоматично
    title: "Заголовок",    // Опціональний заголовок
});
```

### 9.7 Action Service (виклик дій)

```javascript
this.action = useService("action");

// Відкрити list/form view
this.action.doAction({
    type: "ir.actions.act_window",
    res_model: "owl.todo.list",
    views: [[false, "list"], [false, "form"]],
    view_mode: "list,form",
    domain: [["completed", "=", false]],
    name: "Pending Tasks",
});

// Відкрити конкретний запис
this.action.doAction({
    type: "ir.actions.act_window",
    res_model: "owl.todo.list",
    res_id: 42,
    views: [[false, "form"]],
    view_mode: "form",
});

// Показати повідомлення
this.action.doAction({
    type: "ir.actions.client",
    tag: "display_notification",
    params: {
        title: "Увага!",
        message: "Щось сталося",
        type: "warning",
        sticky: true,
    },
});

// Завантажити файл
this.action.doAction({
    type: "ir.actions.act_url",
    url: "/web/content/...",
    target: "self",
});
```

### 9.8 Шаблон створення кастомізації (Cheatsheet)

#### Варіант 1: patch() (глобальна зміна)

```
1. Створити JS файл:   static/src/views/my_patch.js
2. Створити XML файл:  static/src/views/my_patch.xml  (якщо міняємо шаблон)
3. JS: import { patch }  + patch(Controller.prototype, { ... })
4. XML: t-inherit="web.XXX.Buttons" t-inherit-mode="extension"
5. Manifest: додати обидва файли до web.assets_backend
6. Оновити модуль
```

#### Варіант 2: js_class (ізольована зміна)

```
1. Створити JS файл:   static/src/views/my_custom_view.js
2. Створити XML файл:  static/src/views/my_custom_view.xml
3. JS: class MyController extends ListController { ... }
4. JS: const myView = { ...listView, Controller: MyController }
5. JS: registry.category("views").add("my_view", myView)
6. XML: t-name="..." t-inherit="web.XXX.Buttons" t-inherit-mode="primary"
7. View XML: <tree js_class="my_view">
8. Manifest: додати файли до web.assets_backend
9. Оновити модуль
```

---

## Додаток: Часті помилки та їх вирішення

### 1. "RPC_ERROR" або "Access Denied"
- Перевірте `security/ir.model.access.csv`
- Перевірте, що `/** @odoo-module **/` є на початку JS файлу

### 2. Кнопка не з'являється
- Перевірте xpath вираз в XML шаблоні
- Переконайтесь, що XML файл додано до `assets` у manifest
- Очистіть кеш: Ctrl+Shift+R або Odoo Debug → Clear Cache
- Перевірте t-inherit-mode: "extension" для patch, "primary" для js_class

### 3. "Cannot read properties of undefined (reading 'prototype')"
- Неправильний шлях імпорту
- Перевірте, що імпортуєте правильний клас

### 4. Метод не викликається при кліку
- Перевірте `t-on-click="methodName"` (без дужок)
- Або `t-on-click="() => this.methodName()"` (зі стрілковою функцією та `this.`)
- Перевірте, що метод є в класі (в patch або в кастомному Controller)

### 5. js_class не знаходиться
- Переконайтесь, що назва в `registry.category("views").add("NAME", ...)`
  збігається з `<tree js_class="NAME">`
- Оновіть модуль та перезапустіть Odoo

### 6. super.setup(...arguments) кидає помилку
- Переконайтесь, що використовуєте `super.setup(...arguments)`, а не `super.setup()`
  (передайте аргументи!)
- В patch: `super` працює автоматично
- В extends: `super.setup()` без arguments теж працює

### 7. Зміни не видно після оновлення модуля
- Перезапустіть Odoo сервер
- Очистіть кеш браузера (Ctrl+Shift+R)
- Перевірте консоль браузера (F12) на помилки JavaScript
