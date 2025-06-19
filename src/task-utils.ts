import { Notice } from 'obsidian';
import path from 'path-browserify';
import { getFile, parseDatesInDateRangeTitle, isDateValid, getLeadingWhitespace, getBlockEmbed, parseObsidianLink, compareDates } from 'src/utils';
import { getNoteClass, loadNote } from './note-loader';
import { Project } from './notes/zettel-types/project';
import { Planner } from './notes/planner';
import { Module } from './notes/zettel-types/module';
import type { BasicNote } from './notes/basic-note';

export const taskTypes = ['DONE', 'TODO', 'NON_TASK', 'CANCELLED'] as const;

export const SCHEDULED_DATE_MARKER = '⏳';
export const DUE_DATE_MARKER = '📅';
export const DURATION_MARKER = '⏲️';

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

/**
 * The tasks plugin has four task types: DONE, TODO, IN_PROGRESS, NON_TASK, CANCELLED.
 * Additional custom tasks can be added by the user. We call them 'subtypes' here. Each subtype must belong to a task type.
 */


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

    isInDateRange(dateTypes: ('scheduled' | 'due' | 'done')[] | ('scheduled' | 'due' | 'done'), startDate: Date|null, endDate: Date|null) {
        if (typeof startDate === 'string') startDate = new Date(startDate);
        if (typeof endDate === 'string') endDate = new Date(endDate);
        if (typeof dateTypes === 'string') dateTypes = [dateTypes];

        for (const dateType of dateTypes) {
            const date = this.getTaskDate(dateType);
            if (!date) return false;
            if ( (!startDate || date >= startDate) && (!endDate || date <= endDate)) return true;
        }

        return false;
    }

    get duration(): number {
        if (this.originalMarkdown.includes(DURATION_MARKER)) {
            const duration = this.originalMarkdown.split(DURATION_MARKER)[1].split(/\s+/).filter(s => s.trim())[0];
            if (!duration) return 0;
            if (duration.endsWith('h')) return isNaN(Number(duration.slice(0, -1))) ? 0 : parseFloat(duration.slice(0, -1));
            if (duration.endsWith('m')) return isNaN(Number(duration.slice(0, -1))) ? 0 : parseFloat(duration.slice(0, -1)) / 60;
            return isNaN(Number(duration)) ? 0 : parseFloat(duration);
        }
        return 0;
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

    getMarkdownWithStatus(status: string) {
        const leadingWhitespace = getLeadingWhitespace(this.originalMarkdown);
        const transformedTask = this.originalMarkdown.replace(/^\s*- \[.*?\]/, `- [${status}]`);
        return `${leadingWhitespace}${transformedTask}`;
    }

    getBlockLink() {
        const file = getFile(this.filePath);
        if (!file) throw new Error('File not found');
        return getBlockEmbed(this.taskLine, file);
    }

    modifyTaskDescriptionMarkdown(newMarkdown: string, append: boolean = false): string {
        this.task.originalMarkdown = modifyTaskMarkdown(this.task, newMarkdown, append);
    }


    isTaskType(taskType: string) {
        return this.task.status?.configuration?.type === taskType;
    }
    isDone() {
        return this.isTaskType('DONE');
    }
    isCancelled() {
        return this.isTaskType('CANCELLED');
    }
    isTodo() {
        return this.isTaskType('TODO');
    }
    isNonTask() {
        return this.isTaskType('NON_TASK');
    }

    isTaskSubType(taskSubType: string) {
        return this.task.status?.configuration?.name === taskSubType;
    }

    getSubtext(startingIndent="", indent="  ") {
        let subtext: string[] = [];
        this.__getSubtext_helper(this.task, subtext, startingIndent, indent);
        return subtext.join('\n');
    }
    __getSubtext_helper(elem, subtext, currIndent, indent) {
        for (const child of elem.children) {
            if (child.status) continue; // If a child has a status attribute, it is a task
            subtext.push(`${currIndent}${child.originalMarkdown.trim()}`);
            this.__getSubtext_helper(child, subtext, currIndent + indent, indent);
        }
    }

    async getForegroundData() {
        if (!this.isTaskSubType('Foreground')) return null;
        const match = this.description.match(/^\{(.*?)\}\s*(.*)$/);

        const category = match?.[1]?.trim() ?? '';
        const categoryIsNote = parseObsidianLink(category) != null;
        const categoryNote = categoryIsNote ? loadNote(parseObsidianLink(category)) : null;
        const startDate = new Date(this.startDate);
        startDate.setHours(0, 0, 0, 0);
        const hasStarted = compareDates(startDate, new Date()) <= 0;

        const description =  category ? match?.[2]?.trim() : this.description;
        const blockLink = await this.getBlockLink();
        const subtext = this.getSubtext();

        return {
            category,
            categoryIsNote,
            categoryNote,
            description,
            blockLink,
            subtext,
            startDate,
            hasStarted
        };
    }

    get hasDueDate() {
        return this.dueDate != null;
    }
    get hasScheduledDate() {
        return this.scheduledDate != null;
    }

    get status() {
        return this.task.status?.configuration?.type
    }

    get note() {
        return loadNote(this.filePath);
    }

    get filePath() { return this.task.taskLocation._tasksFile._path; }

    get taskLine() {
        return this.task.taskLocation._lineNumber;
    }

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

        if (!dueDate && this.task.scheduledDate?._d) {
            return null; // If there is an explicit scheduled date, then the task may not inherit its due date from other metadata
        }

        // Get due date from parent
        if (!dueDate && this.task.parent?.dueDate) {
            const parentTask = new ObakoTask(this.task.parent);
            if (parentTask.dueDate)
                dueDate = parentTask.dueDate;
        }

        // Get due date from preceding header
        const precedingHeader = this.task.taskLocation._precedingHeader;
        if (!dueDate && precedingHeader) {
            const res = parseDatedTaskHeading(precedingHeader);
            if (res && res.dateMarker === DUE_DATE_MARKER) dueDate = res.date;
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

        if (!scheduledDate && this.task.dueDate?._d) {
            return null; // If there is an explicit due date, then the task may not inherit its scheduled date from other metadata
        }

        if (!scheduledDate && this.tags.some(tag => tag === '#tray' || tag.startsWith('#tray/'))) {
            return null; // If the task is in a tray, then it may not inherit its scheduled date from other metadata
        }

        // Get scheduled date from parent
        if (!scheduledDate && this.task.parent?.scheduledDate) {
            const parentTask = new ObakoTask(this.task.parent);
            if (parentTask.scheduledDate)
                scheduledDate = parentTask.scheduledDate;
        }

        // Get scheduled date from preceding header
        const precedingHeader = this.task.taskLocation._precedingHeader;
        if (!scheduledDate && precedingHeader) {
            const res = parseDatedTaskHeading(precedingHeader);
            if (res && res.dateMarker === SCHEDULED_DATE_MARKER) scheduledDate = res.date;
        }

        if (!scheduledDate) {
            const fname = path.basename(this.filePath, path.extname(this.filePath));
            const noteClass = getNoteClass(this.filePath);

            // Get scheduled date from Planner note
            if (noteClass.noteTypeStr === Planner.noteTypeStr) {
                const { date } = parseDatesInDateRangeTitle(fname);
                scheduledDate = date;
                // Get scheduled date from a preceding header in a Planner note
                // Example:
                // ### 2024-12-29 some heading title
                if (precedingHeader) {
                    const dateStr = precedingHeader.split(/\s+/)[0];
                    const date = new Date(dateStr);
                    if (isDateValid(date))
                        scheduledDate = date;
                }
            } else if (noteClass.noteTypeStr === Module.noteTypeStr && this.note.status === Module.statuses.active) {
                const parentNote = loadNote(this.filePath);
                if (parentNote.startDate) scheduledDate = parentNote.startDate;
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

export function searchTasks(query: string, caseSensitive: boolean = false, includeNonTasks: boolean = false, includeCancelled: boolean = true) {
    const tasks = getTasks(includeNonTasks, includeCancelled);
    query = caseSensitive ? query : query.toLowerCase();
    return tasks.filter(task => {
        const description = caseSensitive ? task.description : task.description.toLowerCase();
        return description.includes(query);
    });
}

export function isTaskStatus(task: Task, status: string) {
    return (new ObakoTask(task)).isTaskType(status);
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

export function extractTaskDescriptionMarkdown(taskMarkdown: string): { taskStatus: string, taskDescription: string } | null {
    const regex = /^(\s*-\s*\[.*?\]\s*)(.*)$/;
    const match = taskMarkdown.match(regex);
    return match ? { taskStatus: match[1], taskDescription: match[2] } : null;
}

export async function modifyTaskMarkdown(task: Task, newMarkdown: string, append: boolean = false) {
    if (!app.plugins.plugins['obsidian-tasks-plugin']) {
        new Notice(`obsidian-tasks-plugin is not installed.`);
        return [];
    }

    const tasksApiV1 = app.plugins.plugins['obsidian-tasks-plugin'].apiV1;
    const { taskStatus, taskDescription } = extractTaskDescriptionMarkdown(task.originalMarkdown);
    const newTaskDescription = append ? `${taskDescription}${newMarkdown}` : newMarkdown;

    const lineNumber = task.taskLocation._lineNumber;
    const file = getFile(task.taskLocation._tasksFile._path);

    if (file) {
        await app.vault.process(file, (data) => {
            const lines = data.split('\n');
            lines[lineNumber] = `${taskStatus}${newTaskDescription}`;
            return lines.join('\n');
        });

        return newTaskDescription
    }

    throw new Error('Failed to modify task markdown');
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

export function getIndentedHierarchicalTaskList(tasks: ObakoTask[], orderByDuration: boolean = false) {
    const { taskChildren, topTasks } = getTaskHierarchy(tasks);

    if (orderByDuration) {
        topTasks.sort((a, b) => b.duration - a.duration);
    }

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

export function parseDatedTaskHeading(heading: string) {
    /*
    ### Heading title ⏳ 2024-12-29 Mon 
    ### Heading title 📅 2024-12-29 Mon asdasd
    ### Heading title ⏳ [[2024-12-29]] asdaasdasds
    */

    let dateMarker;
    if (heading.includes(DUE_DATE_MARKER)) dateMarker = DUE_DATE_MARKER;
    else if (heading.includes(SCHEDULED_DATE_MARKER)) dateMarker = SCHEDULED_DATE_MARKER;
    else return null;

    const dateStr = heading.split(dateMarker)[1].trim().split(/\s+/)[0]; // Get the first whitespace-separated string after the date marker
    const date = new Date(dateStr);
    if (date && !isDateValid(date)) return null;
    return { dateMarker, date };
}

export async function getForegrounds(includeNoteCategories: boolean = true, includeNonActive: boolean = false, includeChecked: boolean = false) {
    let fgs = await Promise.all(getTasks(true)
        .filter(t => t.isTaskSubType('Foreground') || (includeChecked && t.isTaskSubType('Foreground_checked')))
        .map(async t => await t.getForegroundData()));
    if (!includeNoteCategories) fgs = fgs.filter(fg => !fg.categoryIsNote);
    if (!includeNonActive) fgs = fgs.filter(fg => fg.hasStarted);
    const groupedByName = fgs.reduce<Record<string, any[]>>((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
    return groupedByName;
}

export async function getNoteForegrounds(note: BasicNote|string, includeNonActive: boolean = false, includeChecked: boolean = false): Promise<any[]> {
    if (typeof note === 'string') note = loadNote(note);
    let fgs = await Promise.all(getTasks(true)
        .filter(t => t.isTaskSubType('Foreground') || (includeChecked && t.isTaskSubType('Foreground_checked')))
        .map(async t => await t.getForegroundData()));
    if (!includeNonActive) fgs = fgs.filter(fg => fg.hasStarted);
    fgs = fgs.filter(fg => fg.categoryNote?.filepath === note.filepath);
    return fgs;
}