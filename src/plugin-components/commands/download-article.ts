import { Modal, App, requestUrl, Setting } from 'obsidian';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';
//import Parser from '@postlight/parser';
import TurndownService from 'turndown';

export class Command_DownloadArticle extends CommandPluginComponent {
    componentName = 'Cmd: Download article';
    commandId = 'download-article';
    commandName = 'Download article';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new ArticleDownloadModal(this.app, async (url) => {
                    try {
                        const result = await requestUrl(url);
                        console.log(result.text);

                        const Parser = await import('@postlight/parser'); // Lazy import as the module is not supported on mobile

                        const parsedResult = await Parser.parse(url, { html: result.text });
                        const turndownService = new TurndownService();
                        const markdown = turndownService.turndown(parsedResult.content);

                        navigator.clipboard.writeText(markdown);
                        console.log('Content copied to clipboard');
                    } catch (err) {
                        console.error('Failed to process the article: ', err);
                    }
                }).open();
            }
        });
    }

    unload() { }
}

class ArticleDownloadModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Download article');

        let url = '';
        new Setting(this.contentEl)
            .setName('URL')
            .addText((text) =>
                text.onChange((value) => {
                    url = value;
                }));

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(url);
                    }));
    }
}