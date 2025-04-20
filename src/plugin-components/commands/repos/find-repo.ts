import { FuzzySuggestModal, Notice } from "obsidian";

import type { App } from "obsidian";
import { getAllNotes } from "src/note-loader";
import type { BasicNote } from "src/notes/basic-note";
import type { RepoData } from "./add-repo";
import { CommandPluginComponent } from "src/plugin-components/command-plugin-component";

export class Command_FindRepo extends CommandPluginComponent {
    componentName = 'Cmd: Find repo';
    commandId = 'find-repo';
    commandName = 'Find repo';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new PickRepoModal(this.app, async (repo: RepoDataWithNote, event: MouseEvent | KeyboardEvent) => {
                    repo.note.open(event.metaKey || event.ctrlKey);
                    navigator.clipboard.writeText(repo.repoData.name);
                    new Notice('The repo name has been copied to the clipboard.')
                }).open();
            }
        });
    }

    unload() { }
}

export interface RepoDataWithNote {
    repoData: RepoData;
    note: BasicNote;
}

export class PickRepoModal extends FuzzySuggestModal<RepoDataWithNote> {
    private notes: BasicNote[];
    private allRepos: RepoDataWithNote[];
    private onSubmit: (result: RepoDataWithNote, event: MouseEvent | KeyboardEvent) => void;
    private includeNoteName: boolean;

    constructor(app: App, onSubmit: (result: RepoDataWithNote, event: MouseEvent | KeyboardEvent) => void, notes: BasicNote[]|null = null, includeNoteName: boolean = true) {
        super(app);
        this.onSubmit = onSubmit;
        this.notes = notes || getAllNotes();
        this.notes.sort((a, b) => a.name.localeCompare(b.name));
        this.includeNoteName = includeNoteName;
        
        this.allRepos = [];
        for (const note of this.notes) {
            for (const repo of note.repos) {
                this.allRepos.push({
                    repoData: repo,
                    note: note,
                });
            }
        }

        this.limit = 999999999;
    }

    getItems(): RepoDataWithNote[] {
        return this.allRepos;
    }

    getItemText(repo: RepoDataWithNote): string {
        if (this.includeNoteName) {
            return `${repo.note.noteType}: ${repo.note.name} > ${repo.repoData.name}`;
        } else {
            return `${repo.repoData.name}`;
        }
    }

    onChooseItem(repo: RepoDataWithNote, event: MouseEvent | KeyboardEvent) {
        this.onSubmit(repo, event);
    }
}
