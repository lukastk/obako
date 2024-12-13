import { Modal, App, requestUrl, Setting, TFile } from 'obsidian';
import PluginComponent from '../plugin-component';
import type { ObakoSettingsTab } from 'src/settings';

export class Command_MoveUnlinkedFiles extends PluginComponent {
    commandId = 'move-unlinked-files';
    commandName = 'Move unlinked files to the non-sync folder';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.commandName,
            callback: async () => {
                const files = this.app.vault.getFiles();
                const filesToMove: TFile[] = [];
                const fileTypesToMove = this.settings.unlinkedFileTypesToMove.split(',').map(s => s.toLowerCase());

                for (const file of files) {
                    const linkedPaths = this.app.metadataCache.getBacklinksForFile(file)?.data;
                    if (linkedPaths.size == 0 && fileTypesToMove.includes(file.extension.toLowerCase())) {
                        filesToMove.push(file);
                    }
                }

                for (const file of filesToMove) {
                    const newPath = this.settings.unlinkedFilesDestFolder + '/' + file.basename + '.' + file.extension;
                    await this.app.fileManager.renameFile(file, newPath);
                    console.log(newPath);
                }
            }
        });
    }

    unload() { }

    static getDefaultSettings(): any {
        return {
            unlinkedFileTypesToMove: 'png,jpg,jpeg,gif,svg,webp,pdf,mp3',
            unlinkedFilesDestFolder: 'nosync'
        };
    }

    displaySettings(settingTab: ObakoSettingsTab, containerEl: HTMLElement): void {
        settingTab.addTextSetting(
            'Unlinked file types to move',
            'Unlinked file types to move when running the command `' + this.commandName + '`.',
            "Set the file types (e.g. 'png,jpg,jpeg,gif,svg,webp,pdf,mp3')",
            'unlinkedFileTypesToMove',
            this.settings);

        settingTab.addTextSetting(
            'Folder to move unlinked files to',
            'Destination folder for unlinked files when running the command `' + this.commandName + '`.',
            'Set the folder name',
            'unlinkedFilesDestFolder',
            this.settings);
    }
};
