/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView, TFile } from 'obsidian';

export const InlineTitleDecoratorComponent = {
    load_InlineTitleDecoratorComponent: function () {
        this.registerEvent(
            this.app.workspace.on('file-open', (file: TFile) => {
                updateDisplayedTitle(file.path); // Update the title when a file is opened
            })
        );
    },
};

function updateDisplayedTitle(filePath: string) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file) {
        const metadata = this.app.metadataCache.getFileCache(file as TFile)?.frontmatter;
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);

        let inlineTitleDecoratorEl = leaf.contentEl.querySelector('#inline-title-decorator');
        if (!inlineTitleDecoratorEl) {
            // Create a container for the inline title
            const titleContainerEl = document.createElement('div');
            const inlineTitleEl = leaf.contentEl.querySelector('.inline-title');
            inlineTitleEl.parentElement.insertBefore(titleContainerEl, inlineTitleEl);
            titleContainerEl.appendChild(inlineTitleEl);
            inlineTitleEl.style.display = 'inline'; // Make sure the inline title is inline so that we can prepend the decorator
            // Create the decorator element and prepend it to the inline title
            inlineTitleDecoratorEl = document.createElement('div');
            inlineTitleDecoratorEl.id = 'inline-title-decorator';
            inlineTitleDecoratorEl.style.display = 'inline';
            inlineTitleEl.parentElement.insertBefore(inlineTitleDecoratorEl, inlineTitleEl);
        }

        inlineTitleDecoratorEl.innerHTML = "❐ ";
    }
}