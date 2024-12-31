import { TFile } from 'obsidian';
import type { CachedMetadata } from 'obsidian';
import { getFile, isDateValid } from '../utils';

import type { FrontmatterSpec } from './note-frontmatter';
import { processFrontmatter } from './note-frontmatter';
import { loadNote } from '../note-loader';

export class BasicNote {
    private _name: string; // For debugging in the DevTools console.

    static noteTypeStr = "basic-note";
    static noteTypeDisplayName = "Basic Note";
    static titleDecoratorString = "";
    static titleSuffixDecoratorString = "";
    
    file: TFile;
    fileCache!: CachedMetadata;
    frontmatter: any;
    createdAt: Date | null = null;

    private incomingLinkedNotes: BasicNote[] | null = null;
    private outgoingLinkedNotes: BasicNote[] | null = null;

    static getFrontmatterSpec(): FrontmatterSpec {
        return {
            createdat: { default: null, type: "string", hideInCreationModal: true, description: "The date and time the note was created." },
            notetype: { default: BasicNote.noteTypeStr, type: "string", fixedValue: true },
        }
    }

    constructor(file: TFile | string) {
        this.file = getFile(file);
        this._name = this.file.basename;
        this.reloadFrontmatterAndFileCache();

        this.createdAt = new Date(this.frontmatter?.createdat);
        this.createdAt = isDateValid(this.createdAt) ? this.createdAt : null;
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

    equals(other: BasicNote | null): boolean {
        if (!other) return false;
        return this.file.path === other.file.path;
    }

    linkedBy(other: BasicNote | null): boolean {
        if (!other) return false;
        if (!this.incomingLinkedNotes) this.getIncomingLinkedNotes();
        console.log(123, this.incomingLinkedNotes);
        console.log(this.incomingLinkedNotes.map(note => note.equals(other)));
        return this.incomingLinkedNotes.map(note => note.equals(other)).includes(true);
    }

    linksTo(other: BasicNote | null): boolean {
        if (!other) return false;
        if (!this.outgoingLinkedNotes) this.getOutgoingLinkedNotes();
        return this.outgoingLinkedNotes.map(note => note.equals(other)).includes(true);
    }

    reloadFrontmatterAndFileCache() {
        this.fileCache = app.metadataCache.getFileCache(this.file);
        this.frontmatter = processFrontmatter(this.fileCache.frontmatter, this.constructor.getFrontmatterSpec());
    }
    
    getOutgoingLinkedNotes(): BasicNote[] {
        if (this.outgoingLinkedNotes != null) return this.outgoingLinkedNotes;
        const linkedNotes: BasicNote[] = [];
        const linkedPaths = app.metadataCache.resolvedLinks[this.file.path];
        if (linkedPaths) {
            for (const linkedPath in linkedPaths) {
                if (linkedPath) linkedNotes.push(loadNote(linkedPath));
            }
        }
        this.outgoingLinkedNotes = linkedNotes;
        return linkedNotes;
    }

    getIncomingLinkedNotes(): BasicNote[] {
        if (this.incomingLinkedNotes != null) return this.incomingLinkedNotes;
        const linkedNotes: BasicNote[] = [];
        const backlinks = app.metadataCache.getBacklinksForFile(this.file)?.data;
        for (const [filePath, _] of backlinks) {
            linkedNotes.push(loadNote(filePath));
        }
        this.incomingLinkedNotes = linkedNotes;
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

    async getContent(): Promise<string> {
        const noteContentWithFrontmatter = (await app.vault.cachedRead(this.file)).split("\n");

        if (this.fileCache.frontmatterPosition) {
            const fmStart = this.fileCache.frontmatterPosition.start.line;
            const fmEnd = this.fileCache.frontmatterPosition.end.line;
            noteContentWithFrontmatter.splice(fmStart, fmEnd - fmStart + 1);
        }

        return noteContentWithFrontmatter.join("\n");
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
