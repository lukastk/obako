import type { TFile } from 'obsidian';
import { getDateStringFromDate, getDateStringFromNaturalLanguage, getWeekNumber, isDateValid } from 'src/utils';
import { Setting } from 'obsidian';
import type { CreateObakoNoteModal } from 'src/plugin-components/commands/create-obako-note';
import type { NoteCreationData } from 'src/note-loader';
import { Zettel } from '../zettel';
import type { FrontmatterSpec } from '../note-frontmatter';

export class Log extends Zettel {
    static noteTypeStr = "log";
    static noteTypeDisplayName = "Log";
    static noteIcon = "⁍";

    date: Date | null = null;
    logTitle: string = "";

    constructor(file: TFile | string) {
        super(file);

        const dateStr = this.file.basename.split(/\s+/)[0];
        const date = new Date(this.file.basename.split(/\s+/)[0]);
        this.date = isDateValid(date) ? date : null;
        this.logTitle = this.file.basename.slice(dateStr.length + 1) || "";
    }

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
        };
        spec.notetype.default = this.noteTypeStr;
        spec.cons.default = false;
        spec.cons.skipCreationIfAbsent = false;
        spec['is-hp-cons'].default = true;
        spec['is-hp-cons'].skipCreationIfAbsent = false;
        return spec;
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

    static setNoteCreationModalSettings(containerEl: HTMLElement, modal: CreateObakoNoteModal, noteData: NoteCreationData) {
        super.setNoteCreationModalSettings(containerEl, modal, noteData);

        noteData.extraData.logDate = 'today'
        modal.addTextSetting(
            'Log date',
            'The date of the log.',
            (value) => noteData.extraData.logDate = value,
            noteData.extraData.logDate,
        );
    }

    static processNoteData(noteData: NoteCreationData): boolean {
        if (!('logDate' in noteData.extraData)) return false;
        noteData.extraData.logDate = getDateStringFromNaturalLanguage(noteData.extraData.logDate.trim());
        if (!isDateValid(new Date(noteData.extraData.logDate))) return false;
        noteData.title = `${noteData.extraData.logDate} ${noteData.title}`;
        return true;
    }
}
