
import { App, Modal, Notice } from 'obsidian';
import { CommandPluginComponent } from '../command-plugin-component';
import { createNote, loadNote } from 'src/note-loader';
import { CreateObakoNoteModal } from './create-obako-note';
import type { ObakoSettingsTab } from 'src/settings';

let fs;
try { fs = require('fs'); } catch (err) { console.warn('fs module is not available'); }

export interface ObakoRepoSettings {
    codeLocations: string;
    defaultCodeLocationKey: string; // Newline separated paths to parent folders. Of the form: 'key: path\n...
    openRepoCmds: string; // Newline separated commands to open the repo. Of the form: 'cmd_key: command\n...'
    defaultOpenRepoCmdKey: string; // Key of the command to open the repo when running the command `create-repo`.
    templatesPath: string; // Path to the templates folder.
    extraTemplates: string;
    defaultTemplate: string; // The default template to use when creating a repo.
}

export class Command_CreateRepo extends CommandPluginComponent {
    componentName = 'Cmd: Create Repo';
    commandId = 'create-repo';
    commandName = 'Create Repo';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const modal = new CreateObakoNoteModal(this.app, async (noteData) => {
                    createNote(noteData).then((file) => {
                        setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                            if (file) {
                                this.app.workspace.openLinkText(file.path, "", true);
                                const repoNote = loadNote(file.path);
                                if (fs) {
                                    if (fs.existsSync(repoNote.getRepoPath())) {
                                        new Notice(`WARNING: The folder "${repoNote.getRepoPath()}" already exists.`);
                                    }
                                }
                                const cmd = `${repoNote.getCreateCmd()}; cd "${repoNote.getRepoPath()}"; ${repoNote.getOpenCmd()}`;
                                navigator.clipboard.writeText(cmd);
                                
                                new Notice('The command to create the repo has been copied to the clipboard.');
                            }
                        }, 50);
                    });
                }, {
                    modalTitle: 'Create Repo',
                    disableNoteTypeSelection: true,
                    disableNoteContentSetting: true,
                    noteData: {
                        noteType: 'repo',
                        frontmatterData: {
                            "repo-cl-key": this.settings.defaultCodeLocationKey,
                            "repo-template": this.settings.defaultTemplate,
                            "open-cmd-key": this.settings.defaultOpenRepoCmdKey,
                        }
                    }
                });

                modal.addBooleanSetting(
                    'Prepend date to title',
                    'Prepend the current date to the title of the repo.',
                    true,
                    (value) => {
                        modal.noteData.extraData['prepend-date-to-title'] = value;
                    }
                );

                modal.open();
            }
        });
    }

    unload() { }

    static getDefaultSettings(): ObakoRepoSettings {
        return {
            codeLocations: '',
            defaultCodeLocationKey: '',
            openRepoCmds: '',
            defaultOpenRepoCmdKey: '',
            templatesPath: '',
            extraTemplates: '',
            defaultTemplate: '',
        };
    }

    displaySettings(settingTab: ObakoSettingsTab, containerEl: HTMLElement): void {
        settingTab.addHeading(this.componentName);

        settingTab.addTextAreaSetting(
            'Code locations',
            'Paths to parent folders for the repos. Of the form: "key: /path/to/parent/folder\n..."',
            "key: /path/to/parent/folder",
            'codeLocations',
            this.settings);

        settingTab.addTextSetting(
            'Default code location',
            'Key of the parent folder for the repo when running the command `' + this.commandName + '`.',
            'Set the key',
            'defaultCodeLocationKey',
            this.settings);

        settingTab.addTextAreaSetting(
            'Open repo commands',
            'Commands to open the repo when running the command `' + this.commandName + '`.',
            'Set the commands',
            'openRepoCmds',
            this.settings);

        settingTab.addTextSetting(
            'Default open repo command key',
            'Key of the command to open the repo when running the command `' + this.commandName + '`.',
            'Set the key',
            'defaultOpenRepoCmdKey',
            this.settings);

        settingTab.addTextSetting(
            'Templates path',
            'Path to the templates folder.',
            'Set the path',
            'templatesPath',
            this.settings);

        settingTab.addTextAreaSetting(
            'Extra templates',
            'Extra templates to use when creating a repo.',
            'Set the extra templates',
            'extraTemplates',
            this.settings);

        settingTab.addTextSetting(
            'Default template',
            'The default template to use when creating a repo.',
            'Set the template',
            'defaultTemplate',
            this.settings);
    }
};
