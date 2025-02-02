import { App, FuzzySuggestModal } from 'obsidian';
import { getAllNotes } from 'src/note-loader';
import type { BasicNote } from 'src/notes/basic-note';
import { Project } from 'src/notes/zettel-types/project';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';

export class Command_FindProject extends CommandPluginComponent {
    componentName = 'Cmd: Find project';
    commandId = 'find-project';
    commandName = 'Find project';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new PickProjectLink(this.app, async (note: BasicNote) => {
                }).open();
            }
        });
    }

    unload() { }
}

export class PickProjectLink extends FuzzySuggestModal<Project> {
    private allNotes: Project[];

    constructor(app: App, onSubmit: (result: Project) => void) {
        super(app);
        this.allNotes = getAllNotes().filter(note => note instanceof Project);
        this.allNotes.sort((a, b) => this.getItemText(a).localeCompare(this.getItemText(b)));
        this.limit = 999999999;
    }

    getItems(): Project[] {
        return this.allNotes;
    }

    getItemText(note: Project): string {
        return note.getLineage().map(n => n.name).join(" > ");
    }

    onChooseItem(note: BasicNote, event: MouseEvent | KeyboardEvent) {
        note.open(true);
    }
}
