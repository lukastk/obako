import { Notice, TextComponent } from 'obsidian';
import { CommandPluginComponent } from '../../command-plugin-component';
import { loadNote } from 'src/note-loader';
import { Repo } from 'src/notes/zettel-types/repo';
import { PickRepoModal } from './find-repo';
import type { RepoDataWithNote } from './find-repo';

export class Command_GetOpenRepoCmd extends CommandPluginComponent {
    componentName = 'Cmd: Get repo open command';
    commandId = 'get-open-repo-cmd';
    commandName = 'Get Repo Open Command';

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

                if (note.repos.length === 0) {
                    new Notice('No repos found.');
                    return;
                }

                function copyCmd(repo: RepoDataWithNote) {
                    navigator.clipboard.writeText(repo.note.getOpenCmd(repo.repoData.name));
                    new Notice('The command has been copied to the clipboard.');
                }

                if (note.repos.length > 1) {
                    const modal = new PickRepoModal(this.app, copyCmd, [note], false);
                    modal.open();
                } else {
                    copyCmd({ repoData: note.repos[0], note: note });
                }
            }
        });
    }

    unload() { }
};
