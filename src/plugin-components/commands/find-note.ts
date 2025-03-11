import { App, FuzzySuggestModal } from 'obsidian';
import { getAllNotes } from 'src/note-loader';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';

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
        this.allNotes.sort((a, b) => this.getItemText(a).localeCompare(this.getItemText(b)));
        this.limit = 999999999;
    }

    getItems(): BasicNote[] {
        return this.allNotes;
    }

    getItemText(note: BasicNote): string {
        return `${note.noteType}: ${note.name}`;
    }

    onChooseItem(note: BasicNote, event: MouseEvent | KeyboardEvent) {
        note.open(event.metaKey || event.ctrlKey);
    }
}
