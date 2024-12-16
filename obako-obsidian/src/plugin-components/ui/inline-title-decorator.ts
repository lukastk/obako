/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView, TFile } from 'obsidian';
import { loadNote } from 'src/note-loader';
import BasicNote from 'src/notes/basic-note';
import PluginComponent from '../plugin-component';

const PREFIX_DECORATOR_ID = "obako-inline-title-prefix-decorator";
const SUFFIX_DECORATOR_ID = "obako-inline-title-suffix-decorator";
const DECORATOR_CONTAINER_ID = "obako-inline-title-decorator-container";

export class UI_InlineTitleDecorator extends PluginComponent {
    load() {
        this.app.workspace.onLayoutReady(() => {
            this.updateInlineTitleDecorator();
        });

        // Moving between notes
        this.plugin.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.updateInlineTitleDecorator();
            })
        );

        // Moving between source and preview
        this.plugin.registerEvent(
            this.app.workspace.on("layout-change", () => {
                this.updateInlineTitleDecorator();
            })
        );

        // If the frontmatter changes
        this.plugin.registerEvent(
            this.app.metadataCache.on("changed", () => {
                this.updateInlineTitleDecorator();
            })
        );

        this.plugin.registerEvent(
            this.app.workspace.on('file-open', (file: TFile) => {
                this.updateInlineTitleDecorator(); 
            })
        );
    }

    unload() { }

    updateInlineTitleDecorator() {
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!leaf) return;
        const note: BasicNote = loadNote(leaf.file); 
        if (!note) return;
    
        // Put title into a container
        let titleContainerEl = leaf.contentEl.querySelector(`#${DECORATOR_CONTAINER_ID}`);
        const inlineTitleEl = leaf.contentEl.querySelector('.inline-title');
        if (!inlineTitleEl) return;
        if (!titleContainerEl) {
            titleContainerEl = document.createElement('div');
            titleContainerEl.id = DECORATOR_CONTAINER_ID;
            inlineTitleEl.parentElement.insertBefore(titleContainerEl, inlineTitleEl);
            titleContainerEl.appendChild(inlineTitleEl);
            inlineTitleEl.style.display = 'inline'; // Make sure the inline title is inline so that we can prepend the decorator
        }
    
        // Remove existing decorator if present
        document.querySelectorAll(`#${PREFIX_DECORATOR_ID}`).forEach(el => el.remove());
        document.querySelectorAll(`#${SUFFIX_DECORATOR_ID}`).forEach(el => el.remove());
        
        // Create the prefix decorator element and prepend it to the inline title
        const inlineTitlePrefixDecoratorEl = document.createElement('div');
        inlineTitlePrefixDecoratorEl.id = `${PREFIX_DECORATOR_ID}`;
        inlineTitlePrefixDecoratorEl.style.display = 'inline';
        note.setTitlePrefixDecorator(inlineTitlePrefixDecoratorEl);
        if (inlineTitlePrefixDecoratorEl.innerHTML.trim()) {
            inlineTitlePrefixDecoratorEl.style.marginRight = '10px';
        }
        titleContainerEl.insertBefore(inlineTitlePrefixDecoratorEl, inlineTitleEl);

        // Create the suffix decorator element and append it to the inline title
        const inlineTitleSuffixDecoratorEl = document.createElement('div');
        inlineTitleSuffixDecoratorEl.id = `${SUFFIX_DECORATOR_ID}`;
        inlineTitleSuffixDecoratorEl.style.display = 'inline';
        note.setTitleSuffixDecorator(inlineTitleSuffixDecoratorEl);
        if (inlineTitleSuffixDecoratorEl.innerHTML.trim()) {
            inlineTitleSuffixDecoratorEl.style.marginLeft = '10px';
        }
        titleContainerEl.appendChild(inlineTitleSuffixDecoratorEl);
    }
};

