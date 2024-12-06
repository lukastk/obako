/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';
import loadNote from '../note-loader';
import { createInternalLinkElement } from '../utils';

const PANEL_CLASS = "obako-panel";

export const TopPanelComponent = {
    load_TopPanelComponent: function () {
		// Add banners initially
		this.app.workspace.onLayoutReady(() => {
			updateTopPanel();
		});

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                updateTopPanel();
            })
        );

        this.registerEvent(
            this.app.workspace.on("layout-change", () => {
                updateTopPanel();
            })
        );
    },

    unload_TopPanelComponent: function () {
		document
			.querySelectorAll(`.${PANEL_CLASS}`)
			.forEach((el) => el.parentElement?.removeChild(el));
    },
};

function updateTopPanel() {
    const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!leaf) return;

    // Remove existing banner if present
    document.querySelectorAll(`.${PANEL_CLASS}`).forEach(panel => panel.remove());

    // Add a new banner
    const note = loadNote(leaf.file);
    const panel = document.createElement("div");
    panel.className = PANEL_CLASS;
    note.createTopPanel(panel);

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