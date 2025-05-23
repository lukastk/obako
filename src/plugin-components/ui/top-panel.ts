/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';
import { loadNote, onNoteCacheUpdate } from 'src/note-loader';
import PluginComponent from 'src/plugin-components/plugin-component';
import { around } from 'monkey-around';
import { getMarkdownViewMode, onMarkdownViewFileChange } from 'src/utils';
import { BasicNote } from 'src/notes/basic-note';

const PANEL_CLASS = "obako-note-top-panel";

export class UI_TopPanel extends PluginComponent {
    componentName = 'UI: Top panel';

    private noteCacheUpdateDetach: (() => void) | null = null;
    
    load() {
        this.app.workspace.onLayoutReady(() => {
            this.createTopPanel();
        });

        // If the note cache is updated
        this.noteCacheUpdateDetach = onNoteCacheUpdate((event, eventData) => {
            this.createTopPanel();
        });

        const self = this;

        // Whenever a markdown view is loaded
        this.plugin.register(
            around(MarkdownView.prototype, {
                onload(next) {
                    return function (...args) {
                        const maxAttempts = 100; // 1 second total maximum wait time
                        let attempts = 0;
                        
                        const checkFile = () => {
                            if (this.leaf.view?.file) {
                                // Register observer to detect mode switch, upon which the panel will be updated
                                self.registerModeSwitchObserver(this.leaf.view);
                                self.createTopPanel(this.leaf.view);
                
                                onMarkdownViewFileChange(this.leaf.view, (oldFile, newFile) => {
                                    self.createTopPanel(this.leaf.view);
                                });
                                return;
                            }
                            
                            attempts++;
                            if (attempts < maxAttempts) {
                                setTimeout(checkFile, 10);
                            }
                        };
                        
                        checkFile();
                        return next.call(this, ...args);
                    }
                }
            })
        );
    }

    unload() {
        document
            .querySelectorAll(`.${PANEL_CLASS}`)
            .forEach((el) => el.parentElement?.removeChild(el));

        if (this.noteCacheUpdateDetach) {
            this.noteCacheUpdateDetach();
            this.noteCacheUpdateDetach = null;
        }
    }

    createTopPanel(leaf: MarkdownView | null = null) {
        if (!leaf) leaf = this.app.workspace.getActiveViewOfType(MarkdownView);

        const containerEl = leaf?.containerEl;
        if (!leaf || !containerEl) return;

        // Remove existing banner if present
        containerEl.querySelectorAll(`.${PANEL_CLASS}`).forEach(el => el.remove());

        // Add a new banner
        const note = loadNote(leaf.file);
        if (note?.noteType === BasicNote.noteTypeStr) return;

        const panel = document.createElement("div");
        panel.className = PANEL_CLASS;
        if (!note) return;
        note.setTopPanel(panel);

        const viewState = leaf.getState();

        const mode = getMarkdownViewMode(leaf);
        if (mode === 'preview' || mode === 'source') {
            const sourceView = leaf.containerEl.querySelector(".markdown-source-view");
            const previewFrontmatter = sourceView.querySelector(".metadata-container");
            if (previewFrontmatter) {
                previewFrontmatter.insertAdjacentElement("afterend", panel);
            }
        } else if (mode === 'reader') {
            const readerView = leaf.containerEl.querySelector(".markdown-reading-view");
            const readerFrontmatter = readerView.querySelector(".metadata-container")
            if (readerFrontmatter) {
                readerFrontmatter.insertAdjacentElement("afterend", panel);
            }
        }
    }

    private registerModeSwitchObserver(leaf: MarkdownView) {
        const containerEl = leaf.containerEl;

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-mode') {
                    setTimeout(() => {
                        this.createTopPanel(leaf);
                    }, 10);
                }
            }
        });
        // Configure the observer to watch for attribute changes
        const config = {
            attributes: true,        // Observe attributes
            attributeFilter: ['data-mode'], // Only observe the 'data-mode' attribute
        };

        // Start observing the target element
        observer.observe(containerEl, config);
    }
};
