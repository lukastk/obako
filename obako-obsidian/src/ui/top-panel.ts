/**
 * Modifies the inline title of a note to include a decorator, based on the type specified in the frontmatter.
 */

import { MarkdownView } from 'obsidian';

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

    // banner.innerHTML = `Currently viewing: ${leaf.file?.basename} <a href="full-path-to-your-file.md" class="internal-link">A weekly plan</a>`;

    // Add a new banner
    const panel = document.createElement("div");
    panel.className = PANEL_CLASS;
    panel.style.backgroundColor = "#f0f0f0";
    panel.style.padding = "10px";
    panel.style.marginTop = "10px";
    panel.style.borderBottom = "1px solid #ccc";

    // Add internal link
    const link = document.createElement("a");
    link.className = "internal-link";
    link.href = "your-file-path.md"; // Replace with the file path or dynamically determine it
    link.textContent = "A weekly plan";

    // Add click handler for internal links
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent the default browser action
        const inNewPane = event.metaKey || event.ctrlKey;
        this.app.workspace.openLinkText("your-file-path", "/", inNewPane); // Use app.workspace to navigate
    });

    panel.appendChild(link);

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