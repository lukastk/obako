
import { App, Modal, Notice, Setting } from 'obsidian';
import { CommandPluginComponent } from '../../command-plugin-component';
import { createNote, loadNote } from 'src/note-loader';
import { CreateObakoNoteModal } from '../create-obako-note';
import type { ObakoSettingsTab } from 'src/settings';
import { getDateStringFromDate } from 'src/utils';
import { getCreateCmd, getOpenCmd, getRepoPath } from 'src/repos';

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

export interface RepoData {
    name: string;
    path: string;
    'cl-key': string;
    template: string;
    'open-cmd-key': string;
    'open-cmd': string;
}

export class Command_AddRepo extends CommandPluginComponent {
    componentName = 'Cmd: Add Repo';
    commandId = 'add-repo';
    commandName = 'Add Repo';

    load() {
        const cmdSettings = this.settings || this.getDefaultSettings();
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new AddRepoModal(this.app, cmdSettings, async (repoData) => {
                    const activeFile = this.plugin.app.workspace.getActiveFile();
                    const currentNote = loadNote(activeFile);
                    if (!currentNote) {
                        new Notice('Must run command on a note.');
                        return;
                    }

                    if (fs) {
                        if (fs.existsSync(getRepoPath(repoData))) {
                            new Notice(`ERROR: The folder "${getRepoPath(repoData)}" already exists.`);
                            return;
                        }
                    }

                    const noteRepos = currentNote.frontmatter['repos'] || [];
                    await currentNote.modifyFrontmatter('repos', [...noteRepos, repoData]);

                    const cmd = `${getCreateCmd(repoData)}; cd "${getRepoPath(repoData)}"; ${getOpenCmd(repoData)}`;
                    navigator.clipboard.writeText(cmd);

                    new Notice('The command to create the repo has been copied to the clipboard.');
                }).open();
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


class AddRepoModal extends Modal {
    constructor(app: App, settings: ObakoRepoSettings, onSubmit: (repoData: RepoData) => void) {
        super(app);
        this.setTitle('Add Repo to current note');

        const repoData: RepoData = {
            name: '',
            path: '',
            'cl-key': settings.defaultCodeLocationKey,
            template: settings.defaultTemplate,
            'open-cmd-key': settings.defaultOpenRepoCmdKey,
            'open-cmd': '',
        };

        const modalSettings = [];
        for (const key in repoData) {
            modalSettings.push(new Setting(this.contentEl)
                .setName(key)
                .addText((text) =>
                    text
                        .setValue(repoData[key])
                        .onChange((value) => {
                            repoData[key] = value;
                        })));
        }
        modalSettings[0].components[0].inputEl.select();

        let prependDateToTitle = true;
        new Setting(this.contentEl)
            .setName('Prepend date to title')
            .setDesc('Prepend the current date to the title of the repo.')
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => prependDateToTitle = value)
                    .setValue(prependDateToTitle);
            });

        const _this = this;
        function closeAndSubmit() {
            _this.close();
            if (!repoData.path)
                repoData.path = repoData.name;
            if (prependDateToTitle) {
                repoData.path = getDateStringFromDate(new Date()) + ' ' + repoData.path;
            }
            onSubmit(repoData);
        }

        /* submit button */
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(closeAndSubmit));

        // Add event listener for Cmd+Enter key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                closeAndSubmit();
            }
        });
    }
}