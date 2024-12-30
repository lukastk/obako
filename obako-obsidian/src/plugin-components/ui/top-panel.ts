/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';
import { loadNote } from '../../note-loader';
import PluginComponent from '../plugin-component';
import { around } from 'monkey-around';
import { getMarkdownViewMode } from 'src/utils';

const PANEL_CLASS = "obako-panel";

export class UI_TopPanel extends PluginComponent {
    load() {
        this.app.workspace.onLayoutReady(() => {
            this.createTopPanel();
        });


        // Moving between source and preview
        this.plugin.registerEvent(
            this.app.workspace.on("layout-change", () => {
                this.createTopPanel();
            })
        );

        // If the frontmatter changes
        this.plugin.registerEvent(
            this.app.metadataCache.on("changed", () => {
                this.createTopPanel();
            })
        );

        const self = this;

        // Whenever a new note is loaded
        this.plugin.register(
            around(MarkdownView.prototype, {
                onLoadFile(next) {
                    return function (...args) {
                        self.createTopPanel(this.leaf.view);
                        return next.call(this, ...args)
                    }
                }
            })
        )
    }

    unload() {
        document
            .querySelectorAll(`.${PANEL_CLASS}`)
            .forEach((el) => el.parentElement?.removeChild(el));
    }

    createTopPanel(leaf: MarkdownView|null = null) {
        if (!leaf) leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        const containerEl = leaf?.containerEl;
        if (!leaf || !containerEl) return;

        // Remove existing banner if present
        containerEl.querySelectorAll(`.${PANEL_CLASS}`).forEach(el => el.remove());

        // Add a new banner
        const note = loadNote(leaf.file);
        const panel = document.createElement("div");
        panel.className = PANEL_CLASS;
        note.setTopPanel(panel);

        const viewState = leaf.getState();

        switch (getMarkdownViewMode(leaf)) {
            case 'preview':
                const sourceView = leaf.containerEl.querySelector(".markdown-source-view");
                const previewFrontmatter = sourceView.querySelector(".metadata-container");
                if (previewFrontmatter) {
                    previewFrontmatter.insertAdjacentElement("afterend", panel);
                }
                break;
            case 'reader':
                const readerView = leaf.containerEl.querySelector(".markdown-reading-view");
                const readerFrontmatter = readerView.querySelector(".metadata-container")
                if (readerFrontmatter) {
                    readerFrontmatter.insertAdjacentElement("afterend", panel);
                }
                break;
        }
    }
};
