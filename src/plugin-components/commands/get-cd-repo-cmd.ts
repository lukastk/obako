import { Notice, TextComponent } from 'obsidian';
import { CommandPluginComponent } from '../command-plugin-component';
import { loadNote } from 'src/note-loader';
import { Repo } from 'src/notes/zettel-types/repo';

export class Command_GetRepoCdCmd extends CommandPluginComponent {
    componentName = 'Cmd: Get repo cd command';
    commandId = 'get-repo-cd-cmd';
    commandName = 'Get repo cd command';

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

                navigator.clipboard.writeText(`cd "${note.getRepoPath()}"`);

                new Notice('The command has been copied to the clipboard.');
            }
        });
    }

    unload() { }
};
