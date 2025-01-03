import type { NoteCreationData } from 'src/note-loader';
import { Transient } from './transient';

export class Capture extends Transient {
    static noteTypeStr = "cap";
    static noteTypeDisplayName = "Capture";
    static noteIcon = "﹅";

    static processNoteData(noteData: NoteCreationData): boolean {
        const dateTimeStr = (new Date()).toISOString().split('.')[0].replace('T', '_').replaceAll(':','');
        noteData.title = `${dateTimeStr} ${noteData.title}`;

        return true;
    }
}
