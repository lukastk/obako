import { App, FuzzySuggestModal, Setting } from 'obsidian';
import { getAllNotes } from 'src/note-loader';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';
import { ObakoTask, getTasks } from 'src/task-utils';

export class Command_FindTask extends CommandPluginComponent {
    componentName = 'Cmd: Find task';
    commandId = 'find-task';
    commandName = 'Find task';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new PickTask(this.app, async (task: ObakoTask) => {
                }).open();
            }
        });
    }

    unload() { }
}

export class PickTask extends FuzzySuggestModal<ObakoTask> {
    private allTasks: ObakoTask[];
    private includeCancelled: boolean = false;
    private includeNonTasks: boolean = false;
    private includeDone: boolean = false;
    private includeTodo: boolean = true;

    constructor(app: App, onSubmit: (result: ObakoTask) => void) {
        super(app);
        this.allTasks = getTasks(true, true);
        this.allTasks.sort((a, b) => this.getItemText(a).localeCompare(this.getItemText(b)));
        this.limit = 200;

        const modalContentEl = this.inputEl.parentElement.parentElement;
        const settingContainerEl = document.createElement('div');
        modalContentEl.appendChild(settingContainerEl);
        settingContainerEl.style.padding = '10px';


        new Setting(settingContainerEl)
            .setName('Cancelled')
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => this.includeCancelled = value)
                    .setValue(this.includeCancelled);
            });

        new Setting(settingContainerEl)
            .setName('Non-tasks')
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => this.includeNonTasks = value)
                    .setValue(this.includeNonTasks);
            });

        new Setting(settingContainerEl)
            .setName('Done')
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => this.includeDone = value)
                    .setValue(this.includeDone);
            });

        new Setting(settingContainerEl)
            .setName('Todo')
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => this.includeTodo = value)
                    .setValue(this.includeTodo);
            });
    }

    getItems(): ObakoTask[] {
        const filteredTasks = this.allTasks.filter(task => {
            if (task.isCancelled() && !this.includeCancelled) return false;
            if (task.isNonTask() && !this.includeNonTasks) return false;
            if (task.isDone() && !this.includeDone) return false;
            if (task.isTodo() && !this.includeTodo) return false;
            return true;
        });
        return filteredTasks;
    }

    getItemText(task: ObakoTask): string {
        return `${task.description}`;
    }

    onChooseItem(task: ObakoTask, event: MouseEvent | KeyboardEvent) {
        task.note.open(event.metaKey || event.ctrlKey);
    }
}
