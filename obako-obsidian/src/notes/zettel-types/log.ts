import { Transient } from './transient';
import type { TFile } from 'obsidian';
import { getWeekNumber, isDateValid } from 'src/utils';

export class Log extends Transient {
    static noteTypeStr = "log";
    static noteTypeDisplayName = "Log";
    static titleDecoratorString = "⁍";

    date: Date | null = null;
    logTitle: string = "";

    constructor(file: TFile | string) {
        super(file);

        const dateStr = this.file.basename.split(/\s+/)[0];
        const date = new Date(this.file.basename.split(/\s+/)[0]);
        this.date = isDateValid(date) ? date : null;
        this.logTitle = this.file.basename.slice(dateStr.length + 1) || "";
    }

    validate(): boolean {
        return [
            this.date
        ].every(Boolean);
    }

    getTitlePrefixDecoratorString(): string {
        let dateDecorator = "";
        if (this.date) {
            const weekNumber = getWeekNumber(this.date);
            const day = `${this.date.toLocaleDateString('en-US', { weekday: 'short' })}`;
            dateDecorator = `w${weekNumber} ${day}`;
        }
        return `${super.getTitlePrefixDecoratorString()} ${dateDecorator}`;
    }
}
