/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView, TFile } from 'obsidian';
import { loadNote } from 'src/note-loader';
import { BasicNote } from 'src/notes/basic-note';
import PluginComponent from '../plugin-component';
import { around } from 'monkey-around';

const PREFIX_DECORATOR_ID = "obako-inline-title-prefix-decorator";
const SUFFIX_DECORATOR_ID = "obako-inline-title-suffix-decorator";
const DECORATOR_CONTAINER_ID = "obako-inline-title-decorator-container";

export class UI_InlineTitleDecorator extends PluginComponent {
    load() {
        // If the frontmatter changes
        this.plugin.registerEvent(
            this.app.metadataCache.on("changed", (file, data, cache) => {
                //this.updateInlineTitleDecorator();
                const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (leaf?.file?.path === file.path) {
                    this.updateInlineTitleDecorator(leaf.containerEl, file.path);
                }
            })
        );

        const self = this;

        this.plugin.register(
            around(MarkdownView.prototype, {
                onLoadFile(next) {
                    return function(...args) {
                        self.createInlineTitleDecorator(this.containerEl, this.leaf.view.file.path);
                        return next.call(this, ...args)
                    }
                }
            })
        )
    }

    unload() { }

    createInlineTitleDecorator(containerEl: HTMLElement, filePath: string) {
        if (!containerEl) return;
        const note: BasicNote | null = loadNote(filePath); 
        if (!note) return;

        // Put title into a container
        let titleContainerEl = containerEl.querySelector(`#${DECORATOR_CONTAINER_ID}`);
        
        const inlineTitleEl = containerEl.querySelector('.inline-title');
        if (!inlineTitleEl) return;
        if (!titleContainerEl) {
            titleContainerEl = document.createElement('div');
            titleContainerEl.id = DECORATOR_CONTAINER_ID;
            inlineTitleEl.parentElement.insertBefore(titleContainerEl, inlineTitleEl);
            titleContainerEl.appendChild(inlineTitleEl);
            inlineTitleEl.style.display = 'inline'; // Make sure the inline title is inline so that we can prepend the decorator
        }
        
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

    updateInlineTitleDecorator(containerEl: HTMLElement, filePath: string) {
        const note: BasicNote | null = loadNote(filePath); 
        if (!note) return;

        const inlineTitlePrefixDecoratorEl: HTMLElement | null = containerEl.querySelector(`#${PREFIX_DECORATOR_ID}`);
        const inlineTitleSuffixDecoratorEl: HTMLElement | null = containerEl.querySelector(`#${SUFFIX_DECORATOR_ID}`);

        if (inlineTitlePrefixDecoratorEl)
            note.setTitlePrefixDecorator(inlineTitlePrefixDecoratorEl);
        if (inlineTitleSuffixDecoratorEl)
            note.setTitleSuffixDecorator(inlineTitleSuffixDecoratorEl);
    }
};

