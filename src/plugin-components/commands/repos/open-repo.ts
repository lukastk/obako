
import { Notice, TextComponent } from 'obsidian';
import { CommandPluginComponent } from '../../command-plugin-component';
import { loadNote } from 'src/note-loader';
import { Repo } from 'src/notes/zettel-types/repo';
import { PickRepoModal, type RepoDataWithNote } from './find-repo';

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

                if (note.repos.length === 0) {
                    new Notice('No repos found.');
                    return;
                }

                function execCmd(repo: RepoDataWithNote) {
                    repo.note.openRepo(repo.repoData.name);
                    new Notice('The repo has been opened.');
                }

                if (note.repos.length > 1) {
                    const modal = new PickRepoModal(this.app, execCmd, [note], false);
                    modal.open();
                } else {
                    execCmd({ repoData: note.repos[0], note: note });
                }
            }
        });
    }

    unload() { }
};
