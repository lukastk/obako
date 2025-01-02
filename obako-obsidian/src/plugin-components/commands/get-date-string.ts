import { App, Notice, Modal, Setting } from 'obsidian';
import PluginComponent from '../plugin-component';
import type { ObakoSettingsTab } from 'src/settings';

import clipboardy from 'clipboardy';
import { getDateStringFromNaturalLanguage } from 'src/utils';

export class Command_GetDateString extends PluginComponent {
    componentName = 'Cmd: Get date string from natural language';
    commandId = 'get-date-string';
    commandName = 'Get date string from natural language';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: `${this.plugin.settings?.commandPrefix} ${this.commandName}`,
            callback: async () => {
                new GetDateStringModal(this.app, (naturalLanguageDate) => {
                    const dateString = getDateStringFromNaturalLanguage(naturalLanguageDate);
                    clipboardy.write(dateString).then(() => {
                        new Notice(`Copied '${dateString}' to clipboard.`);
                    });
                }).open();
            }
        });
    }

    unload() { }
};

export class GetDateStringModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Get date string from natural language date');

        let naturalLanguageDate = 'today';
        const textSetting = new Setting(this.contentEl)
            .setName('Natural language date')
            .addText((text) => {
                text.setValue(naturalLanguageDate);
                text.onChange((value) => {
                    naturalLanguageDate = value;
                });

                // Focus and select the text input
                text.inputEl.focus();
                text.inputEl.select();
            });

        const submitButton = new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(naturalLanguageDate);
                    }));

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(naturalLanguageDate);
            }
        });
    }
}
