import { Modal, App, requestUrl, Setting } from 'obsidian';

import Parser from '@postlight/parser';
import clipboardy from 'clipboardy';
import TurndownService from 'turndown';

export const DownloadArticleComponent = {
    load_DownloadArticleComponent: function () {
        this.addCommand({
            id: 'download-link',
            name: 'Download article',
            callback: async () => {
                new ArticleDownloadModal(this.app, async (url) => {
                    try {
                        const result = await requestUrl(url);
                        console.log(result.text);

                        const parsedResult = await Parser.parse(url, { html: result.text });
                        const turndownService = new TurndownService();
                        const markdown = turndownService.turndown(parsedResult.content);

                        // Copy result.content to the clipboard using clipboardy
                        await clipboardy.write(markdown);
                        console.log('Content copied to clipboard');
                    } catch (err) {
                        console.error('Failed to process the article: ', err);
                    }
                }).open();
            }
        });
    }
};

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