/** @odoo-module **/

import { registry } from "@web/core/registry";
import { listView } from "@web/views/list/list_view";
import { ListController } from "@web/views/list/list_controller";
import { useService } from "@web/core/utils/hooks";
const { useState } = owl;

// Створюємо НОВИЙ контролер на основі стандартного
export class TodoListController extends ListController {
    setup() {
        super.setup();
        this.notification = useService("notification");
        this.orm = useService("orm");
        this.dateFilter = useState({ dateFrom: "", dateTo: "", taskId: 0, taskName: "" });
        this.taskOptions = useState({ list: [] });
        this.taskModal = useState({ show: false });
    }

    async onOpenTaskModal() {
        this.taskOptions.list = await this.orm.searchRead(
            "owl.todo.list", [], ["name"], { order: "name" }
        );
        this.taskModal.show = true;
    }

    onSelectTask(id, name) {
        this.dateFilter.taskId = id;
        this.dateFilter.taskName = name;
        this.taskModal.show = false;
    }

    onClearTask() {
        this.dateFilter.taskId = 0;
        this.dateFilter.taskName = "";
    }

    onCloseTaskModal() {
        this.taskModal.show = false;
    }

    onDateFromChanged(ev) {
        this.dateFilter.dateFrom = ev.target.value || "";
    }

    onDateToChanged(ev) {
        this.dateFilter.dateTo = ev.target.value || "";
    }

    async onDateFilterApply() {
        const domain = [...this.env.searchModel.domain];
        if (this.dateFilter.dateFrom) {
            domain.push(["create_date", ">=", this.dateFilter.dateFrom + " 00:00:00"]);
        }
        if (this.dateFilter.dateTo) {
            domain.push(["create_date", "<=", this.dateFilter.dateTo + " 23:59:59"]);
        }
        if (this.dateFilter.taskId) {
            domain.push(["id", "=", this.dateFilter.taskId]);
        }
        await this.model.root.load({ domain });
        this.model.notify();
    }

    async onDateFilterClear() {
        this.dateFilter.dateFrom = "";
        this.dateFilter.dateTo = "";
        this.dateFilter.taskId = 0;
        await this.model.root.load({ domain: this.env.searchModel.domain });
        this.model.notify();
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

// Створюємо новий об'єкт view на основі стандартного listView
export const todoListView = {
    ...listView,                          // Копіюємо все зі стандартного
    Controller: TodoListController,       // Замінюємо контролер на наш
    buttonTemplate: "gk_owl.TodoListView.Buttons",  // Шаблон кнопок
    //              ↑ цей підхід через buttonTemplate — рекомендований в Odoo 16
};

// Реєструємо нашу view під назвою "todo_list_view"
registry.category("views").add("todo_list_view", todoListView);