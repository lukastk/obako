/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';
import { loadNote } from '../../note-loader';
import PluginComponent from '../plugin-component';

const PANEL_CLASS = "obako-panel";

export class UI_TopPanel extends PluginComponent {
    load() {
        this.app.workspace.onLayoutReady(() => {
            this.updateTopPanel();
        });

        // Moving between notes
        this.plugin.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.updateTopPanel();
            })
        );

        // Moving between source and preview
        this.plugin.registerEvent(
            this.app.workspace.on("layout-change", () => {
                this.updateTopPanel();
            })
        );

        // If the frontmatter changes
        this.plugin.registerEvent(
            this.app.metadataCache.on("changed", () => {
                this.updateTopPanel();
            })
        );
    }

    unload() {
        document
            .querySelectorAll(`.${PANEL_CLASS}`)
            .forEach((el) => el.parentElement?.removeChild(el));
    }

    updateTopPanel() {
        const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!leaf) return;

        // Remove existing banner if present
        document.querySelectorAll(`.${PANEL_CLASS}`).forEach(el => el.remove());

        // Add a new banner
        const note = loadNote(leaf.file);
        const panel = document.createElement("div");
        panel.className = PANEL_CLASS;
        note.setTopPanel(panel);

        const viewState = leaf.getState();
        if (viewState.mode === 'preview') {
            const readerView = leaf.containerEl.querySelector(".markdown-reading-view");
            const readerFrontmatter = readerView.querySelector(".metadata-container")
            if (readerFrontmatter) {
                readerFrontmatter.insertAdjacentElement("afterend", panel);
            }
        } else if (viewState.mode === 'source' && !viewState.source) {
            const sourceView = leaf.containerEl.querySelector(".markdown-source-view");
            const previewFrontmatter = sourceView.querySelector(".metadata-container");
            if (previewFrontmatter) {
                previewFrontmatter.insertAdjacentElement("afterend", panel);
            }
        }
    }
};