import { App, MarkdownView, Modal, Setting } from 'obsidian';
import { CommandPluginComponent } from '../command-plugin-component';
import { getTasks } from 'src/task-utils';
import { getSelectionPositions } from 'src/utils';

export class Command_ToggleTaskStatus extends CommandPluginComponent {
    componentName = 'Cmd: Toggle task status';
    commandId = 'toggle-task-status';
    commandName = 'Toggle task status';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new SetTaskConversionRulesModal(this.app, (taskStatusRulesString) => {
                    const taskStatusConversionRules = this.getTaskStatusConversionRules(taskStatusRulesString);
                    const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
                    const selectionPositions = getSelectionPositions(leaf?.leaf.view.editor);
                    this.applyTaskConversion(taskStatusConversionRules, selectionPositions.start.line, selectionPositions.end.line);
                }).open();
            }
        });
    }

    unload() { }

    applyTaskConversion(taskStatusConversionRules: { [key: string]: string }, lineStart: number, lineEnd: number) {
        console.log(lineStart, lineEnd);
        console.log(taskStatusConversionRules);
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        const editor = leaf?.leaf.view.editor;
        const notePath = leaf.path;
        const tasks = getTasks(true, true).filter(task => task.filePath === notePath);

        const tasksInSelection = tasks.filter(task => {
            return task.taskLine >= lineStart && task.taskLine <= lineEnd;
        });

        const selMarkdown = [];
        for (let i = lineStart; i <= lineEnd; i++) {
            selMarkdown.push(editor.getLine(i));
        }
        const finalLineLength = selMarkdown[selMarkdown.length - 1].length;

        for (const task of tasksInSelection) {
            const lineIndex = task.taskLine - lineStart;
            const line = selMarkdown[lineIndex];
            const match = line.match(/\[(.*?)\]/);
            const currentStatus = match ? match[1] : null;
            if (currentStatus) {
                const newStatus = currentStatus in taskStatusConversionRules ? taskStatusConversionRules[currentStatus] : currentStatus;
                const updatedLine = line.replace(/\[.*?\]/, `[${newStatus}]`);
                selMarkdown[lineIndex] = updatedLine;
            }
        }

        editor.replaceRange(
            selMarkdown.join('\n'),
            { line: lineStart, ch: 0 },
            { line: lineEnd, ch: finalLineLength }
        );
    }

    getTaskStatusConversionRules(taskStatusConversionRulesString: string) {
        if (taskStatusConversionRulesString) {
            const rulesArray = taskStatusConversionRulesString.split('\n');
            const taskStatusRulesDict: { [key: string]: string } = {};
            for (const rule of rulesArray) {
                const [fromStatus, toStatus] = rule.split('->');
                taskStatusRulesDict[fromStatus] = toStatus;
            }
            return taskStatusRulesDict;
        }
        return {};
    }
};

class SetTaskConversionRulesModal extends Modal {
    constructor(app: App, onSubmit: (title: string) => void) {
        super(app);
        this.setTitle('Task conversion rules');

        let taskStatusRules = " ->d\nd-> \nx->A\nA->x";
        new Setting(this.contentEl)
            .setName('Task conversion rules')
            .setDesc('')
            .addTextArea((text) => {
                const comp = text
                    .setValue(taskStatusRules)
                    .setPlaceholder('Enter task conversion rules here...')
                    .onChange((value) => {
                        taskStatusRules = value;
                    });
                comp.inputEl.setAttribute('rows', '10');
                comp.inputEl.setAttribute('cols', '50');
                return comp;
            });

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(taskStatusRules);
            }
        });
    }
}
