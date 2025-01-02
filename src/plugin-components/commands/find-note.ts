import { Modal, App, requestUrl, Setting, FuzzySuggestModal, Notice } from 'obsidian';
import { createNote, getAllNotes, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import type { FrontmatterFieldSpec } from 'src/notes/note-frontmatter';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';
import { CommandPluginComponent } from '../command-plugin-component';

export class Command_FindNote extends CommandPluginComponent {
    componentName = 'Cmd: Find note';
    commandId = 'find-note';
    commandName = 'Find note';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
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
