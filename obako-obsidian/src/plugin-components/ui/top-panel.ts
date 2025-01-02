/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView, TFile } from 'obsidian';
import { loadNote } from '../../note-loader';
import PluginComponent from '../plugin-component';
import { around } from 'monkey-around';
import { getMarkdownViewMode } from 'src/utils';
import { BasicNote } from 'src/notes/basic-note';

const PANEL_CLASS = "obako-note-top-panel";

export class UI_TopPanel extends PluginComponent {
    componentName = 'UI: Top panel';
    
    load() {
        this.app.workspace.onLayoutReady(() => {
            this.createTopPanel();
        });

        // If the frontmatter changes
        this.plugin.registerEvent(
            this.app.metadataCache.on("changed", () => {
                this.createTopPanel();
            })
        );

        const self = this;

        // Whenever a markdown view is loaded
        this.plugin.register(
            around(MarkdownView.prototype, {
                onload(next) {
                    return function (...args) {
                        const intervalId = setInterval(() => {
                            if (this.leaf.view?.file) {
                                clearInterval(intervalId);
                                // Register observer to detect mode switch, upon which the panel will be updated
                                self.registerModeSwitchObserver(this.leaf.view);
                                self.createTopPanel(this.leaf.view);
                            }
                        }, 10);
                        return next.call(this, ...args)
                    }
                }
            })
        )

        // Whenever the note is changed (will also trigger when moving between source and preview, potentially doubling up with `registerModeSwitchObserver`)
        this.plugin.registerEvent(
            this.app.workspace.on('layout-change', () => {
                self.createTopPanel();
            })
        )
    }

    unload() {
        document
            .querySelectorAll(`.${PANEL_CLASS}`)
            .forEach((el) => el.parentElement?.removeChild(el));
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
