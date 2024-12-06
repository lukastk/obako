import { TFile } from 'obsidian';

export function getFile(file: TFile | string) {
    if (typeof file === 'string') {
        return global.app.vault.getAbstractFileByPath(file);
    } else {    
        return file;
    }
}

export function getFrontmatter(file: TFile | string) {
    const fileCache = global.app.metadataCache.getFileCache(getFile(file));
    return fileCache?.frontmatter;
}

export function createInternalLinkElement(text: string, path: string) {
    const link = document.createElement("a");
    link.className = "internal-link";
    link.href = path;
    link.textContent = text;

    // Add click handler for internal links
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent the default browser action
        const inNewPane = event.metaKey || event.ctrlKey;
        global.app.workspace.openLinkText(path, "", inNewPane); // Use app.workspace to navigate
    });

    return link;
}