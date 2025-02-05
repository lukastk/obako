import { App, Modal, Setting } from 'obsidian';
import type ObakoPlugin from 'src/plugin';
import { OpenViewCommandPluginComponent } from 'src/plugin-components/views/svelte-view';
import { View_RapidSerialVisualPresentation } from 'src/plugin-components/views/rapid-serial-visual-presentation';

export class Command_OpenRapidSerialVisualPresenter extends OpenViewCommandPluginComponent {
    componentName = 'Cmd: Rapid serial visual presentation (RSVP)';
    commandId = 'rapid-serial-visual-presentation';
    commandName = 'Rapid serial visual presentation (RSVP)';

    constructor(plugin: ObakoPlugin) {
        super(plugin, View_RapidSerialVisualPresentation.name);
    }

    async openCommandModal(launchView: (viewStateToSet: any) => void) {
        const wordsPerMinute = await new WordsPerMinuteModal(this.app, async (wordsPerMinute) => {
            const rsvpText = await navigator.clipboard.readText();

            launchView({
                wordsPerMinute: wordsPerMinute,
                rsvpElements: rsvpText.split(/\s+/),
            });
        }).open();
    }

    unload() { }
};

class WordsPerMinuteModal extends Modal {
    constructor(app: App, onSubmit: (wordsPerMinute: number) => void) {
        super(app);
        this.setTitle('Set words per minute');

        let wordsPerMinute = '600';
        new Setting(this.contentEl)
            .setName('Words per minute')
            .addText((text) =>
                text
                    .setValue(wordsPerMinute)
                    .onChange((value) => {
                        wordsPerMinute = value;
                    }))
            .components[0].inputEl.select();

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(parseInt(wordsPerMinute));
            }
        });
    }
}