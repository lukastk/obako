import type { TFile } from 'obsidian';
import type { FrontmatterSpec } from './note-frontmatter';
import { ObakoNote } from './obako-note';

import { getWeekNumber, parseDatesInDatedTitle } from 'src/utils';
import { getTasks } from 'src/task-utils';
import type { Task } from 'src/task-utils';

import PlannerTopPanel from 'src/top-panels/planner/PlannerTopPanel.svelte';

export class Planner extends ObakoNote {
    static noteTypeStr = "planner";
    static titleDecoratorString = "𝝣";

    public date: Date | null;
    public endDate: Date | null;
    public plannerTitle: string;
    public rangeType: string; /* 'custom', 'day', 'week', 'month', 'quarter', 'year' */

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Planner.noteTypeStr, fixedValue: true },
        "planner-active": { default: true },
    };

    constructor(file: TFile | string) {
        super(file);

        const { plannerTitle, date, endDate, rangeType } = parseDatesInDatedTitle(file.basename);
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

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        new PlannerTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }
}

