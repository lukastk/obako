
import { Notice, TextComponent } from 'obsidian';
import { CommandPluginComponent } from '../command-plugin-component';
import { loadNote } from 'src/note-loader';
import { Repo } from 'src/notes/zettel-types/repo';

export class Command_OpenRepo extends CommandPluginComponent {
    componentName = 'Cmd: Open Repo';
    commandId = 'open-repo';
    commandName = 'Open Repo';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const activeFile = this.plugin.app.workspace.getActiveFile();
                if (!activeFile) {
                    new Notice('Must run command on a note.');
                    return;
                }
                const note = loadNote(activeFile);
                if (!(note instanceof Repo)) {
                    new Notice('Must run command on a repo note.');
                    return;
                }
                await note.openRepo();
            }
        });
    }

    unload() { }
};
