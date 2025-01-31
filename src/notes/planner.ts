import type { TFile } from 'obsidian';
import type { FrontmatterSpec } from './note-frontmatter';
import { ObakoNote } from './obako-note';
import { getWeekNumber, parseDatesInDateRangeTitle, getDateStringFromNaturalLanguage, isDateValid, getWeekNumberStr } from 'src/utils';
import { getTasks } from 'src/task-utils';
import type { Task } from 'src/task-utils';
import type { CreateObakoNoteModal } from 'src/plugin-components/commands/create-obako-note';
import type { NoteCreationData } from 'src/note-loader';

export class Planner extends ObakoNote {
    static isAbstract = false;
    static noteTypeStr = "planner";
    static noteTypeDisplayName = "Planner";
    static noteIcon = "𝝣";

    public date: Date | null;
    public endDate: Date | null;
    public plannerTitle: string;
    public rangeType: string; /* 'custom', 'day', 'week', 'month', 'quarter', 'year' */

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "planner-active": { default: true, type: "boolean", description: "Whether the planner is active." },
        };
        spec.notetype.default = this.noteTypeStr;
        spec.cons.default = false;
        spec.cons.skipCreationIfAbsent = false;
        spec['is-hp-cons'].default = true;
        spec['is-hp-cons'].skipCreationIfAbsent = false;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);

        const { plannerTitle, date, endDate, rangeType } = parseDatesInDateRangeTitle(this.file.basename);
        this.plannerTitle = plannerTitle;
        this.date = date;
        this.endDate = endDate;
        this.rangeType = rangeType;
    }

    get active(): boolean {
        return this.frontmatter['planner-active'];
    }
    async setActive(value: boolean) {
        await this.modifyFrontmatter('planner-active', value);
    }

    validate(): boolean {
        return [
            this.date
        ].every(Boolean);
    }

    getTitleSuffixDecoratorString(): string {
        if (this.validate()) {
            switch (this.rangeType) {
                case 'day':
                    return `w${getWeekNumber(this.date)} ${this.date.toLocaleDateString('en-US', { weekday: 'short' })}`;
                    break;
                case 'week':
                    const weekStart = `${this.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}`;
                    const weekEnd = `${this.endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}`;
                    return `${weekStart}-${weekEnd}`;
                case 'quarter':
                    const monthStart = `${this.date.toLocaleDateString('en-US', { month: '2-digit' })}`;
                    const monthEnd = `${this.endDate.toLocaleDateString('en-US', { month: '2-digit' })}`;
                    return `${monthStart}-${monthEnd}`;
            }
        }

        return "";
    }

    getPlannerTasks(): { scheduled: Task[], due: Task[], reminders: Task[], done: Task[] } {
        const tasks = getTasks();

        if (!this.date) return {
            scheduled: [],
            due: [],
            reminders: [],
            done: [],
        };

        const res = {
            scheduled: tasks.filter(task => task.isScheduledInDateRange(this.date, this.endDate)),
            due: tasks.filter(task => task.isDueInDateRange(this.date, this.endDate)),
            reminders: tasks.filter(task =>
                task.isDueInDateRange(this.date, this.endDate) && task.tags.includes('reminder')),
            done: tasks.filter(task => task.isInDateRange(['scheduled', 'due', 'done'], this.date, this.endDate)),
        }

        res.due = res.due.filter(task => !task.tags.includes('reminder')); // remove reminders from due

        return res;
    }

    async setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        const { default: PlannerTopPanel } = await import('src/ui-components/top-panels/planner/PlannerTopPanel.svelte');
        new PlannerTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }

    static setNoteCreationModalSettings(containerEl: HTMLElement, modal: CreateObakoNoteModal, noteData: NoteCreationData) {
        super.setNoteCreationModalSettings(containerEl, modal, noteData);

        noteData.extraData.dateStr = 'today'
        modal.addTextSetting(
            'Date range',
            'The date range of the planner.',
            (value) => noteData.extraData.dateRangeStr = value,
            noteData.extraData.dateRangeStr,
        );
    }

    static processNoteData(noteData: NoteCreationData): boolean {
        if (!('dateRangeStr' in noteData.extraData)) return false;

        // Check if the date range is a valid planner date range
        let { date, endDate, rangeType } = parseDatesInDateRangeTitle(noteData.extraData.dateRangeStr);
        if (!isDateValid(date)) {
            // Try again, but with the current year
            const currentYear = new Date().getFullYear();
            let { date, endDate, rangeType } = parseDatesInDateRangeTitle(noteData.extraData.dateRangeStr, currentYear);
            // If still not valid, try to parse it as natural language
            if (!isDateValid(date)) {
                const res = getDateStringFromNaturalLanguage(noteData.extraData.dateRangeStr);
                const resDate = new Date(res);

                // If 'week' is in the date range string, then we presume the date range is 'week'
                if (noteData.extraData.dateRangeStr.includes('week')) {
                    noteData.extraData.dateRangeStr = `${resDate.getFullYear()} w${getWeekNumberStr(resDate)}`;
                } else if (noteData.extraData.dateRangeStr.includes('month')) {
                    noteData.extraData.dateRangeStr = `${resDate.getFullYear()} ${resDate.getMonth() + 1}`;
                } else if (noteData.extraData.dateRangeStr.includes('quarter')) {
                    noteData.extraData.dateRangeStr = `${resDate.getFullYear()} Q${Math.floor(resDate.getMonth() / 3) + 1}`;
                } else if (noteData.extraData.dateRangeStr.includes('year')) {
                    noteData.extraData.dateRangeStr = `${resDate.getFullYear()}`;
                } else {
                    noteData.extraData.dateRangeStr = res; // date range: 'day'
                }

                if (!noteData.extraData.dateRangeStr) return false;
            } else {
                // If valid, then we know the date string is missing a year, so we add it
                noteData.extraData.dateRangeStr = `${currentYear} ${noteData.extraData.dateRangeStr}`;
            }
        }

        // Normalise the string
        noteData.extraData.dateRangeStr = noteData.extraData.dateRangeStr.trim();
        if (noteData.extraData.dateRangeStr.includes('..'))
            noteData.extraData.dateRangeStr = noteData.extraData.dateRangeStr.split('..').map(s => s.trim()).join('..');

        if (noteData.title)
            noteData.title = `${noteData.extraData.dateRangeStr} -- ${noteData.title}`;
        else
            noteData.title = noteData.extraData.dateRangeStr;
        
        rangeType = parseDatesInDateRangeTitle(noteData.extraData.dateRangeStr).rangeType;
        const isDayPlanner = rangeType === 'day';
        if (isDayPlanner) {
            noteData.frontmatterData.cons = false;
            noteData.frontmatterData['is-hp-cons'] = true;
        }

        return true;
    }
}
