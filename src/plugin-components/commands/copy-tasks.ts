import { App, Editor, MarkdownView, Modal, Notice, Setting } from 'obsidian';
import { getAllNotesOfType, loadNote } from 'src/note-loader';
import { Planner } from 'src/notes/planner';
import { Project } from 'src/notes/zettel-types/project';
import { Module } from 'src/notes/zettel-types/module';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';
import { getIndentedHierarchicalTaskList, getTasks } from 'src/task-utils';
import { getDateFromText, getDateStringFromDate } from 'src/utils';

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
                    const { earliestDate, latestDate, copyScheduledTasks, copyDueTasks, notesToInclude, priorityRangeStr, groupByFile, groupByNoteType, collapsePlanners, orderByDuration } = options;
                    const earliest = getDateFromText(earliestDate);
                    const latest = getDateFromText(latestDate);
                    if ((earliest || earliestDate === '') && (latest || latestDate === '')) {
                        let tasks = getTasks();
                        tasks = tasks.filter(task => !task.isDone());

                        tasks = tasks.filter(task => {
                            return (task.isInDateRange('scheduled', earliest, latest) && copyScheduledTasks)
                                || (task.isInDateRange('due', earliest, latest) && copyDueTasks);
                        });

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

                        const indentedTaskList = getIndentedHierarchicalTaskList(tasks, orderByDuration);

                        const COLLAPSED_PLANNERS_KEY = '__collapsed_planners__';
                        const groupedTasks: { [key: string]: any[] } = {};
                        if (groupByFile) {
                            for (const task of indentedTaskList) {
                                let groupKey = task.task.filePath;
                                if (collapsePlanners) {
                                    const note = loadNote(task.task.filePath);
                                    if (note instanceof Planner && !note.plannerTitle) {
                                        groupKey = COLLAPSED_PLANNERS_KEY;
                                    }
                                }
                                groupedTasks[groupKey] = groupedTasks[groupKey] || [];
                                groupedTasks[groupKey].push(task);
                            }
                        } else {
                            groupedTasks[""] = indentedTaskList;
                        }

                        // Helper to render tasks for a single file group
                        const renderFileGroup = async (filePath: string, tasks: any[], mdElems: string[]) => {
                            if (filePath && filePath !== COLLAPSED_PLANNERS_KEY) {
                                const file = loadNote(filePath);
                                mdElems.push(`#### ${file.getInternalLink()}`);
                            }
                            for (const task of tasks) {
                                const taskMarkdown = `- [+] ${task.task.description}`;
                                const taskBlockLink = await task.task.getBlockLink();
                                const indents = '\t'.repeat(task.indents);
                                mdElems.push(`${indents}${taskMarkdown} [[${taskBlockLink}|🔗]]`);
                                const subtext = task.task.getSubtext(indents + "\t");
                                if (subtext.trim()) mdElems.push(subtext);
                            }
                        };

                        let mdElems: string[] = [];

                        if (groupByFile && groupByNoteType) {
                            // Group file groups by note type
                            const typeGroups: { [typeDisplayName: string]: string[] } = {};
                            for (const groupKey in groupedTasks) {
                                let typeDisplayName: string;
                                if (groupKey === COLLAPSED_PLANNERS_KEY) {
                                    typeDisplayName = Planner.noteTypeDisplayName;
                                } else if (groupKey === '') {
                                    typeDisplayName = '';
                                } else {
                                    const note = loadNote(groupKey);
                                    typeDisplayName = (note.constructor as typeof import('src/notes/basic-note').BasicNote).noteTypeDisplayName;
                                }
                                typeGroups[typeDisplayName] = typeGroups[typeDisplayName] || [];
                                typeGroups[typeDisplayName].push(groupKey);
                            }

                            // Add active projects and modules that have no tasks
                            const activeProjects = (getAllNotesOfType(Project) as Project[]).filter(p => p.isActiveNow);
                            for (const proj of activeProjects) {
                                if (!(proj.filepath in groupedTasks)) {
                                    groupedTasks[proj.filepath] = [];
                                    const typeName = Project.noteTypeDisplayName;
                                    typeGroups[typeName] = typeGroups[typeName] || [];
                                    typeGroups[typeName].push(proj.filepath);
                                }
                            }
                            const activeModules = (getAllNotesOfType(Module) as Module[]).filter(m => m.isActiveNow);
                            for (const mod of activeModules) {
                                if (!(mod.filepath in groupedTasks)) {
                                    groupedTasks[mod.filepath] = [];
                                    const typeName = Module.noteTypeDisplayName;
                                    typeGroups[typeName] = typeGroups[typeName] || [];
                                    typeGroups[typeName].push(mod.filepath);
                                }
                            }

                            // Sort type groups: Project first, Module second, rest alphabetically
                            const sortedTypeNames = Object.keys(typeGroups).sort((a, b) => {
                                if (a === Project.noteTypeDisplayName) return -1;
                                if (b === Project.noteTypeDisplayName) return 1;
                                if (a === Module.noteTypeDisplayName) return -1;
                                if (b === Module.noteTypeDisplayName) return 1;
                                return a.localeCompare(b);
                            });

                            for (const typeName of sortedTypeNames) {
                                if (typeName) mdElems.push(`### ${typeName}s`);
                                for (const groupKey of typeGroups[typeName]) {
                                    await renderFileGroup(groupKey, groupedTasks[groupKey], mdElems);
                                }
                            }
                        } else {
                            for (const filePath in groupedTasks) {
                                if (filePath) {
                                    if (filePath === COLLAPSED_PLANNERS_KEY) {
                                        mdElems.push(`#### Planners`);
                                    } else {
                                        const file = loadNote(filePath);
                                        mdElems.push(`#### ${file.getInternalLink()}`);
                                    }
                                }
                                for (const task of groupedTasks[filePath]) {
                                    const taskMarkdown = `- [+] ${task.task.description}`;
                                    const taskBlockLink = await task.task.getBlockLink();
                                    const indents = '\t'.repeat(task.indents);
                                    mdElems.push(`${indents}${taskMarkdown} [[${taskBlockLink}|🔗]]`);
                                    const subtext = task.task.getSubtext(indents + "\t");
                                    if (subtext.trim()) mdElems.push(subtext);
                                }
                            }
                        }
                        const md = mdElems.join('\n');

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
    groupByFile: boolean;
    groupByNoteType: boolean;
    collapsePlanners: boolean;
    orderByDuration: boolean;
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
        const currentNote = loadNote(this.app.workspace.getActiveFile()?.path);
        if (currentNote instanceof Planner && currentNote.rangeType === 'day') {
            latestDate = getDateStringFromDate(currentNote.date);
        }
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

        let copyDueTasks = true;
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

        let groupByFile = true;
        new Setting(this.contentEl)
            .setName('Group by file')
            .setDesc('Whether to group tasks by file.')
            .addToggle((toggle) =>
                toggle
                    .setValue(groupByFile)
                    .onChange((value) => {
                        groupByFile = value;
                    }));

        let groupByNoteType = true;
        new Setting(this.contentEl)
            .setName('Group by note type')
            .setDesc('Group files by note type (Projects, Modules, etc). Requires group by file.')
            .addToggle((toggle) =>
                toggle
                    .setValue(groupByNoteType)
                    .onChange((value) => {
                        groupByNoteType = value;
                    }));

        let collapsePlanners = true;
        new Setting(this.contentEl)
            .setName('Collapse untitled planners')
            .setDesc('Collapse tasks from planners without titles into a single group.')
            .addToggle((toggle) =>
                toggle
                    .setValue(collapsePlanners)
                    .onChange((value) => {
                        collapsePlanners = value;
                    }));

        let orderByDuration = true;
        new Setting(this.contentEl)
            .setName('Order by duration')
            .setDesc('Whether to order tasks by duration.')
            .addToggle((toggle) =>
                toggle
                    .setValue(orderByDuration)
                    .onChange((value) => {
                        orderByDuration = value;
                    }));

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
                groupByFile: groupByFile,
                groupByNoteType: groupByNoteType,
                collapsePlanners: collapsePlanners,
                orderByDuration: orderByDuration,
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
