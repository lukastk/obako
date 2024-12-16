import type { TFile } from 'obsidian';
import type { FrontmatterSpec } from './note-frontmatter';
import { ObakoNote } from './obako-note';

import { getWeekNumber, modifyFrontmatter, parseDateRangeStr } from 'src/utils';

export default class Planner extends ObakoNote {
    static noteTypeStr = "planner";
    static titleDecoratorString = "𝝣";

    public date: Date;
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

        this.plannerTitle = file.basename.split('--')[1]?.trim() || '';
        const [startDateStr, endDateStr] = file.basename.split('--')[0].split('..');

        const [startDate_start, startDate_end, startDate_rangeType] = parseDateRangeStr(startDateStr?.trim());
        const [endDate_start, endDate_end, endDate_rangeType] = parseDateRangeStr(endDateStr?.trim(), startDate_start?.getFullYear());

        this.date = startDate_start;
        if (endDateStr) {
            this.endDate = endDate_end || endDate_start;
            this.rangeType = 'custom';
        } else {
            this.endDate = startDate_end;
            this.rangeType = startDate_rangeType;
        }
    }

    get active(): boolean {
        return this.frontmatter['planner-active'];
    }
    set active(value: boolean) {
        this.modifyFrontmatter('planner-active', value);
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
            }
        }

        return "";
    }
}
