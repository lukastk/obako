import { Notice } from 'obsidian';
import path from 'path';
import { getFile, parseDatesInDatedTitle } from 'src/utils';
import { Planner } from './notes/planner';
import { getNoteType, loadNote } from './note-loader';

export const taskTypes = ['DONE', 'TODO', 'NON_TASK', 'CANCELLED'] as const;

export interface Task {
    blockLink: string;
    cancelledDate: Date | null;
    createdDate: Date | null;
    description: string;
    doneDate: Date | null;
    dueDate: Date | null;
    indentation: string;
    listMarker: string;
    originalMarkdown: string;
    priority: string;
    recurrence: string | null;
    scheduledDate: Date | null;
    scheduledDateIsInferred: boolean;
    startDate: Date | null;
    status: any;
    tags: any[];
    taskLocation: {
        _path: string;
        _lineNumber: number;
        _sectionStart: number;
        _sectionIndex: number;
        _precedingHeader: string;
    };
    _urgency: number | null;
    priorityNumber: number;
}

export class ObakoTask {
    private task: Task;
    private _md: string; // Used for debugging in the developer console

    constructor(task: Task) {
        this.task = task;
        this._md = task.originalMarkdown
    }

    getTaskDate(dateType: 'scheduled' | 'due' | 'done') {
        switch (dateType) {
            case 'scheduled': return this.scheduledDate;
            case 'due': return this.dueDate;
            case 'done': return this.doneDate;
            default:
                throw new Error(`Invalid date type: ${dateType}`);
        }
    }

    isInDateRange(dateTypes: ('scheduled' | 'due' | 'done')[] | ('scheduled' | 'due' | 'done'), startDate: Date, endDate: Date) {
        if (typeof startDate === 'string') startDate = new Date(startDate);
        if (typeof endDate === 'string') endDate = new Date(endDate);
        if (!endDate) endDate = startDate;
        if (typeof dateTypes === 'string') dateTypes = [dateTypes];

        for (const dateType of dateTypes) {
            const date = this.getTaskDate(dateType);
            if (!date) return false;
            if (date >= startDate && date <= endDate) return true;
        }

        return false;
    }

    async toggle() {
        const toggledMarkdown = await toggleTaskStatus(this.task);
        this.task.originalMarkdown = toggledMarkdown;
    }

    isScheduledInDateRange(startDate: Date, endDate: Date) {
        return this.isInDateRange('scheduled', startDate, endDate);
    }
    isDueInDateRange(startDate: Date, endDate: Date) {
        return this.isInDateRange('due', startDate, endDate);
    }
    isDoneInDateRange(startDate: Date, endDate: Date) {
        return this.isInDateRange('done', startDate, endDate);
    }


    isStatus(status: string) {
        return this.task.status?.configuration?.type === status;
    }
    isDone() {
        return this.isStatus('DONE');
    }
    isCancelled() {
        return this.isStatus('CANCELLED') || this.tags.includes('cancelled');
    }
    isTodo() {
        return this.isStatus('TODO');
    }
    isNonTask() {
        return this.isStatus('NON_TASK');
    }

    get status() {
        return this.task.status?.configuration?.type
    }

    get note() {
        return loadNote(this.filePath);
    }

    get filePath() { return this.task.taskLocation._tasksFile._path; }

    get blockLink() { return this.task.blockLink; }
    get cancelledDate() {
        return this.task.cancelledDate?._d;
    }
    get createdDate() {
        return this.task.createdDate?._d;
    }
    get description() { return this.task.description; }
    get doneDate() {
        return this.task.doneDate?._d;
    }
    get dueDate() {
        // Get due date from Task object
        let dueDate = this.task.dueDate?._d;

        // Get due date from parent
        if (!dueDate && this.task.parent?.dueDate) {
            const parentTask = new ObakoTask(this.task.parent);
            if (parentTask.dueDate)
                dueDate = parentTask.dueDate;
        }

        // Get due date from preceding header
        if (!dueDate) {
            const precedingHeader = this.task.taskLocation._precedingHeader;
            if (precedingHeader && precedingHeader.includes('📅')) {
                const dateStr = precedingHeader.split('📅')[1].trim();
                dueDate = new Date(dateStr);
            }
        }

        return dueDate;
    }
    get indentation() { return this.task.indentation; }
    get listMarker() { return this.task.listMarker; }
    get originalMarkdown() { return this.task.originalMarkdown; }
    get priority() { return this.task.priority; }
    get recurrence() { return this.task.recurrence; }
    get scheduledDate() {
        // Get scheduled date from Task object
        let scheduledDate = this.task.scheduledDate?._d;

        // Get scheduled date from parent
        if (!scheduledDate && this.task.parent?.scheduledDate) {
            const parentTask = new ObakoTask(this.task.parent);
            if (parentTask.scheduledDate)
                scheduledDate = parentTask.scheduledDate;
        }

        if (!scheduledDate) {
            const fname = path.basename(this.filePath, path.extname(this.filePath));
            const precedingHeader = this.task.taskLocation._precedingHeader;
            const noteType = getNoteType(this.filePath);

            // Get scheduled date from Planner note
            if (noteType === Planner) {
                const { plannerTitle, date, endDate, rangeType } = parseDatesInDatedTitle(fname);

                scheduledDate = date;

                if (precedingHeader) {
                    const { plannerTitle, date, endDate, rangeType } = parseDatesInDatedTitle(precedingHeader);
                    if (date) scheduledDate = date;
                }
            }

            // Get scheduled date from preceding header
            if (precedingHeader && precedingHeader.includes('⏳')) {
                const dateStr = precedingHeader.split('⏳')[1].trim();
                scheduledDate = new Date(dateStr);
            }
        }

        return scheduledDate;
    }
    get scheduledDateIsInferred() { return this.task.scheduledDateIsInferred; }
    get startDate() {
        return this.task.startDate?._d;
    }
    //get status() { return this.task.status; }
    get tags() { return this.task.tags; }
    get taskLocation() { return this.task.taskLocation; }
    get _urgency() { return this.task._urgency; }
    get priorityNumber() { return this.task.priorityNumber; }
}

export function getTasks(includeNonTasks: boolean = false, includeCancelled: boolean = false): ObakoTask[] {
    if (!app.plugins.plugins['obsidian-tasks-plugin']) {
        new Notice(`obsidian-tasks-plugin is not installed.`);
        return [];
    }

    let tasks = app.plugins.plugins['obsidian-tasks-plugin'].getTasks().map(task => new ObakoTask(task));
    if (!includeNonTasks) {
        tasks = tasks.filter(task => !task.isNonTask());
    }
    if (!includeCancelled) {
        tasks = tasks.filter(task => !task.isCancelled());
    }
    return tasks;
}

export function isTaskInDateRange(task: Task, dateType: 'scheduled' | 'due' | 'done', startDate: Date, endDate: Date) {
    return (new ObakoTask(task)).isInDateRange(dateType, startDate, endDate);
}

export function isTaskStatus(task: Task, status: string) {
    return (new ObakoTask(task)).isStatus(status);
}

export async function toggleTaskStatus(task: Task) {
    if (!app.plugins.plugins['obsidian-tasks-plugin']) {
        new Notice(`obsidian-tasks-plugin is not installed.`);
        return [];
    }

    const tasksApiV1 = app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
    const toggledMarkdown = tasksApiV1.executeToggleTaskDoneCommand(task.originalMarkdown);

    const lineNumber = task.taskLocation._lineNumber;
    const file = getFile(task.taskLocation._tasksFile._path);

    if (file) {
        await app.vault.process(file, (data) => {
            const lines = data.split('\n');
            lines[lineNumber] = toggledMarkdown;
            return lines.join('\n');
        });
    }

    return toggledMarkdown;
}

export function getTaskHierarchy(tasks: ObakoTask[]) {
    const _tasks = tasks.map(t => t.task);
    const taskChildren: any = {};
    const topTasks: ObakoTask[] = [];

    tasks.forEach(otask => {
        if (!taskChildren[otask.task])
            taskChildren[otask.task] = [];
        if (otask.task.parent && _tasks.includes(otask.task.parent)) {
            if (!taskChildren[otask.task.parent])
                taskChildren[otask.task.parent] = [];
            taskChildren[otask.task.parent].push(otask);
        } else {
            topTasks.push(otask);
        }
    });

    return {
        taskChildren: taskChildren,
        topTasks: topTasks
    };
}

function __helper__getIndentedHierarchicalTaskList(indentedTaskList, taskChildren, topTask, indent) {
    for (const otask of taskChildren[topTask.task]) {
        indentedTaskList.push({
            indents: indent,
            task: otask
        });
        __helper__getIndentedHierarchicalTaskList(indentedTaskList, taskChildren, otask, indent + 1);
    }
}

export function getIndentedHierarchicalTaskList(tasks: ObakoTask[]) {
    const { taskChildren, topTasks } = getTaskHierarchy(tasks);
    const indentedTaskList = [];
    for (const otask of topTasks) {
        indentedTaskList.push({
            indents: 0,
            task: otask
        });
        __helper__getIndentedHierarchicalTaskList(indentedTaskList, taskChildren, otask, 1);
    }
    return indentedTaskList;
}