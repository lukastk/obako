import { App, FuzzySuggestModal } from 'obsidian';
import { getAllNotes } from 'src/note-loader';
import type { BasicNote } from 'src/notes/basic-note';
import { ParentableNote } from 'src/notes/parentable-note';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';

export class Command_FindTree extends CommandPluginComponent {
    componentName = 'Cmd: Find tree';
    commandId = 'find-tree';
    commandName = 'Find tree';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new PickTreeLink(this.app, async (note: BasicNote) => {
                }).open();
            }
        });
    }

    unload() { }
}

export class PickTreeLink extends FuzzySuggestModal<ParentableNote> {
    private allNotes: ParentableNote[];

    constructor(app: App, onSubmit: (result: ParentableNote) => void) {
        super(app);
        this.allNotes = getAllNotes().filter(note => note instanceof ParentableNote);
        this.allNotes.sort((a, b) => this.getItemText(a).localeCompare(this.getItemText(b)));
        this.limit = 999999999;
    }

    getItems(): ParentableNote[] {
        return this.allNotes;
    }

    getItemText(note: ParentableNote): string {
        return note.getLineage().map(n => n.name).join(" > ");
    }

    onChooseItem(note: BasicNote, event: MouseEvent | KeyboardEvent) {
        note.open(true);
    }
}
