/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';
import { loadNote, onNoteCacheUpdate } from 'src/note-loader';
import { BasicNote } from 'src/notes/basic-note';
import PluginComponent from 'src/plugin-components/plugin-component';
import { around } from 'monkey-around';
import { getMarkdownViewMode } from 'src/utils';

const PREFIX_DECORATOR_ID = "obako-inline-title-prefix-decorator";
const SUFFIX_DECORATOR_ID = "obako-inline-title-suffix-decorator";
const DECORATOR_CONTAINER_ID = "obako-inline-title-decorator-container";

export class UI_InlineTitleDecorator extends PluginComponent {
    componentName = 'UI: Inline title decorator';

    private noteCacheUpdateDetach: (() => void) | null = null;
    
    load() {
        const self = this;

        // Whenever a new note is loaded
        this.plugin.register(
            around(MarkdownView.prototype, {
                onLoadFile(next) {
                    return function(...args) {
                        self.updateInlineTitleDecorator();
                        return next.call(this, ...args)
                    }
                }
            })
        )

        // Moving between source and preview
        this.plugin.registerEvent(
            this.app.workspace.on("layout-change", () => {
                this.updateInlineTitleDecorator();
            })
        );

        // If the note cache is updated
        this.noteCacheUpdateDetach = onNoteCacheUpdate((event, eventData) => {
            this.updateInlineTitleDecorator();
        });
    }

    unload() {
        if (this.noteCacheUpdateDetach) {
            this.noteCacheUpdateDetach();
            this.noteCacheUpdateDetach = null;
        }
    }

    updateInlineTitleDecorator() {
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        const containerEl = leaf?.containerEl;
        if (!containerEl) return;
        const note: BasicNote = loadNote(leaf.file); 
        if (!note) return;

        // Put title into a container
        const viewMode = getMarkdownViewMode(leaf);
        const decoratorContainerId = `#${DECORATOR_CONTAINER_ID}-${viewMode}`;
        let titleContainerEl = containerEl.querySelector(decoratorContainerId);
        
        const inlineTitleEl = containerEl.querySelector('.inline-title');
        
        if (!inlineTitleEl) return;
        if (!titleContainerEl) {
            titleContainerEl = document.createElement('div');
            titleContainerEl.id = decoratorContainerId;
            inlineTitleEl.parentElement.insertBefore(titleContainerEl, inlineTitleEl);
            titleContainerEl.appendChild(inlineTitleEl);
            inlineTitleEl.style.display = 'inline'; // Make sure the inline title is inline so that we can prepend the decorator
        }

        // Remove existing decorator if present
        containerEl.querySelectorAll(`#${PREFIX_DECORATOR_ID}`).forEach(el => el.remove());
        containerEl.querySelectorAll(`#${SUFFIX_DECORATOR_ID}`).forEach(el => el.remove());
        
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

