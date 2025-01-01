import { Transient } from './transient';
import type { TFile } from 'obsidian';
import { getDateStringFromDate, getDateStringFromNaturalLanguage, getWeekNumber, isDateValid } from 'src/utils';
import { Setting } from 'obsidian';
import type { CreateObakoNoteModal } from 'src/plugin-components/commands/create-obako-note';
import type { NoteCreationData } from 'src/note-loader';

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
        noteData.extraData.logDate = getDateStringFromNaturalLanguage(noteData.extraData.logDate);
        if (!isDateValid(new Date(noteData.extraData.logDate))) return false;
        noteData.title = `${noteData.extraData.logDate} ${noteData.title}`;
        return true;
    }
}
