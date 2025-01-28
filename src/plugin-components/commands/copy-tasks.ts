import { App, Editor, MarkdownView, Modal, Notice, Setting } from 'obsidian';
import { CommandPluginComponent } from '../command-plugin-component';
import { getIndentedHierarchicalTaskList, getTasks } from 'src/task-utils';
import { getDateFromText, getSelectionPositions, isDateValid, trimBlockIdsFromText } from 'src/utils';

export class Command_CopyTasks extends CommandPluginComponent {
    componentName = 'Cmd: Copy tasks';
    commandId = 'copy-tasks';
    commandName = 'Copy tasks';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new CopyTaskModal(this.app, async (options) => {
                    const { earliestDate, latestDate, copyScheduledTasks, copyDueTasks, notesToInclude, priorityRangeStr } = options;
                    const earliest = getDateFromText(earliestDate);
                    const latest = getDateFromText(latestDate);
                    if ((earliest || earliestDate === '') && (latest || latestDate === '')) {
                        let tasks = getTasks();
                        tasks = tasks.filter(task => !task.isDone());

                        if (copyScheduledTasks)
                            tasks = tasks.filter(task => task.isInDateRange('scheduled', earliest, latest));
                        if (copyDueTasks)
                            tasks = tasks.filter(task => task.isInDateRange('due', earliest, latest));

                        let minPriority: number;
                        let maxPriority: number;
                        if (priorityRangeStr) {
                            try {
                                if (priorityRangeStr.includes('-')) {
                                    const priorityRange = priorityRangeStr.split('-').map(Number)
                                    minPriority = Math.min(...priorityRange);
                                    maxPriority = Math.max(...priorityRange);
                                } else {
                                    minPriority = Number(priorityRangeStr);
                                    maxPriority = minPriority;
                                }
                            } catch (e) {
                                new Notice('Invalid priority range');
                            }
                        } else {
                            minPriority = 1;
                            maxPriority = 6;
                        }

                        tasks = tasks.filter(task => task.priorityNumber >= minPriority && task.priorityNumber <= maxPriority);

                        switch (notesToInclude) {
                            case 'all-but-current':
                                tasks = tasks.filter(task => task.filePath !== this.plugin.app.workspace.getActiveFile()?.path);
                                break;
                            case 'all':
                                break;
                            case 'current':
                                tasks = tasks.filter(task => task.filePath === this.plugin.app.workspace.getActiveFile()?.path);
                                break;
                        }

                        const indentedTaskList = getIndentedHierarchicalTaskList(tasks);

                        let md = '';
                        for (const task of indentedTaskList) {
                            const taskMarkdown = (await trimBlockIdsFromText(task.task.getMarkdownWithStatus('d'))).trim();
                            const taskBlockLink = await task.task.getBlockLink();
                            md += `${'\t'.repeat(task.indents)}${taskMarkdown} [[${taskBlockLink}|🔗]]\n`;
                        }

                        navigator.clipboard.writeText(md);
                    } else {
                        new Notice('Invalid date cutoff');
                    }
                }).open();
            }
        });
    }

    unload() { }
};

interface CopyTaskOptions {
    earliestDate: string;
    latestDate: string;
    copyScheduledTasks: boolean;
    copyDueTasks: boolean;
    notesToInclude: string;
    priorityRangeStr: string;
}

class CopyTaskModal extends Modal {
    constructor(app: App, onSubmit: (options: CopyTaskOptions) => void) {
        super(app);

        this.setTitle('Set planner date range');

        let earliestDate = '';
        new Setting(this.contentEl)
            .setName('Earliest date')
            .setDesc('The earliest date for the tasks to copy.')
            .addText((text) =>
                text
                    .setValue(earliestDate)
                    .onChange((value) => {
                        earliestDate = value;
                    }));

        let latestDate = 'today';
        new Setting(this.contentEl)
            .setName('Latest date')
            .setDesc('The latest date for the tasks to copy.')
            .addText((text) =>
                text
                    .setValue(latestDate)
                    .onChange((value) => {
                        latestDate = value;
                    }))
            .components[0].inputEl.select();

        let copyScheduledTasks = true;
        new Setting(this.contentEl)
            .setName('Scheduled tasks')
            .setDesc('Whether to copy scheduled tasks.')
            .addToggle((toggle) =>
                toggle
                    .setValue(copyScheduledTasks)
                    .onChange((value) => {
                        copyScheduledTasks = value;
                    }));

        let copyDueTasks = false;
        new Setting(this.contentEl)
            .setName('Due tasks')
            .setDesc('Whether to copy due tasks.')
            .addToggle((toggle) =>
                toggle
                    .setValue(copyDueTasks)
                    .onChange((value) => {
                        copyDueTasks = value;
                    }));

        let notesToInclude = 'all-but-current';
        new Setting(this.contentEl)
            .setName('Notes to include')
            .setDesc('Notes from which to copy tasks.')
            .addDropdown((dropdown) => {
                dropdown.addOption('all-but-current', 'All but current note');
                dropdown.addOption('all', 'All');
                dropdown.addOption('current', 'Current note');
                dropdown
                    .setValue(notesToInclude)
                    .onChange((value) => {
                        notesToInclude = value;
                    });
                }
            );

        let priorityRangeStr = '0-5';
        new Setting(this.contentEl)
            .setName('Priority range')
            .setDesc('0 - highest. 1 - high. 2 - medium. 3 - none. 4 - low. 5 - lowest.')
            .addText((text) =>
                text
                    .setValue(priorityRangeStr)
                    .onChange((value) => {
                        priorityRangeStr = value;
                    }));

        let submit = () => {
            this.close();
            onSubmit({
                earliestDate: earliestDate,
                latestDate: latestDate,
                copyScheduledTasks: copyScheduledTasks,
                copyDueTasks: copyDueTasks,
                notesToInclude: notesToInclude,
                priorityRangeStr: priorityRangeStr,
            });
        }

        /* submit button */
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(() => {
                        submit();
                    }));

        // Add event listener for Cmd+Enter key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                submit();
            }
        });
    }
}
