import { Notice } from 'obsidian';
import { CommandPluginComponent } from '../../command-plugin-component';
import { loadNote } from 'src/note-loader';
import { Repo } from 'src/notes/zettel-types/repo';
import { PickRepoModal, type RepoDataWithNote } from './find-repo';

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

                if (note.repos.length === 0) {
                    new Notice('No repos found.');
                    return;
                }

                function copyCmd(repo: RepoDataWithNote) {
                    navigator.clipboard.writeText(`cd "${repo.note.getRepoPath(repo.repoData.name)}"`);
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

