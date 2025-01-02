import { Modal, App, requestUrl, Setting, FuzzySuggestModal, Notice } from 'obsidian';
import PluginComponent from '../plugin-component';
import { createNote, getAllNotes, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import type { FrontmatterFieldSpec } from 'src/notes/note-frontmatter';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';

export class Command_FindNote extends PluginComponent {
    commandId = 'find-note';
    commandName = 'Find note';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: `${this.plugin.settings?.commandPrefix} ${this.commandName}`,
            callback: async () => {
                new PickNoteLink(this.app, async (note: BasicNote) => {
                }).open();
            }
        });
    }

    unload() { }
}

export class PickNoteLink extends FuzzySuggestModal<BasicNote> {
    private allNotes: BasicNote[];

    constructor(app: App, onSubmit: (result: BasicNote) => void) {
        super(app);
        this.allNotes = getAllNotes().filter(note => note instanceof ObakoNote);
        this.allNotes.sort((a, b) => `${a.noteType}: ${a.name}`.localeCompare(`${b.noteType}: ${b.name}`));
    }

    getItems(): BasicNote[] {
        return this.allNotes;
    }

    getItemText(note: BasicNote): string {
        return `${note.noteType}: ${note.name}`;
    }

    onChooseItem(note: BasicNote, event: MouseEvent | KeyboardEvent) {
        note.open(true);
    }
}
