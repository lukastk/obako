import { ObakoNote } from './obako-note';
import { TFile, CachedMetadata } from 'obsidian';
import { getFile, parseObsidianLink } from '../utils';

import type { FrontmatterSpec } from './note-frontmatter';
import { processFrontmatter } from './note-frontmatter';
import { loadNote } from '../note-loader';

export class BasicNote {
    static noteTypeStr = "basic-note";
    static titleDecoratorString = "";
    static titleSuffixDecoratorString = "";
    
    file: TFile;
    fileCache: CachedMetadata;
    frontmatter: any;

    static frontmatterSpec: FrontmatterSpec = {
        type: { default: BasicNote.noteTypeStr, fixedValue: true },
    };


    constructor(file: TFile | string) {
        this.file = getFile(file);
        this.reloadFrontmatterAndFileCache();
    }

    get name(): string { return this.file.basename; }
    get filepath(): string { return this.file.path; }
    get noteType(): string { return this.frontmatter.notetype; }

    /**
     * Validate the note.
     * @returns true if the note is valid, false otherwise
     */
    validate() {
        return true;
    }

    equals(other: BasicNote | null) {
        if (!other) return false;
        return this.file.path === other.file.path;
    }

    reloadFrontmatterAndFileCache() {
        this.fileCache = app.metadataCache.getFileCache(this.file);
        this.frontmatter = processFrontmatter(this.fileCache.frontmatter, this.constructor.frontmatterSpec);
    }
    
    getOutgoingLinkedNotes(): BasicNote[] {
        const linkedNotes: BasicNote[] = [];
        const linkedPaths = app.metadataCache.resolvedLinks[this.file.path];
        if (linkedPaths) {
            for (const linkedPath in linkedPaths) {
                if (linkedPath) linkedNotes.push(loadNote(linkedPath));
            }
        }
        return linkedNotes;
    }

    getIncomingLinkedNotes(): BasicNote[] {
        const linkedNotes: BasicNote[] = [];
        const backlinks = app.metadataCache.getBacklinksForFile(this.file)?.data;
        for (const [filePath, _] of backlinks) {
            linkedNotes.push(loadNote(filePath));
        }
        return linkedNotes;
    }

    /*** UI ***/
    setTopPanel(panel: HTMLElement) {
    }

    getTitlePrefixDecoratorString(): string {
        return this.constructor.titleDecoratorString;
    }

    setTitlePrefixDecorator(titleDecoratorEl: HTMLElement) {
        titleDecoratorEl.innerHTML = this.getTitlePrefixDecoratorString();

        if (!this.validate()) {
            titleDecoratorEl.style.color = 'var(--text-error)';
        }
    }

    getTitleSuffixDecoratorString(): string {
        return this.constructor.titleSuffixDecoratorString;
    }

    setTitleSuffixDecorator(titleSuffixDecoratorEl: HTMLElement) {
        titleSuffixDecoratorEl.innerHTML = this.getTitleSuffixDecoratorString();
    }

    /*** Actions ***/
    open(newTab: boolean = false) {
        app.workspace.openLinkText(this.file.path, "", newTab);
    }

    async modifyFrontmatter(key: string, value: any) {
        await app.fileManager.processFrontMatter(this.file, (frontmatter: any) => {
            frontmatter[key] = value;
        });
        this.reloadFrontmatterAndFileCache(); // Not sure why this doesn't work.
        this.frontmatter[key] = value;
    }
}
