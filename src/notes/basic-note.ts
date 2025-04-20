import { TFile } from 'obsidian';
import type { CachedMetadata } from 'obsidian';
import { getFile, getPathBasename, isDateValid } from '../utils';

import type { FrontmatterSpec } from './note-frontmatter';
import { processFrontmatter } from './note-frontmatter';
import { loadNote, type NoteCreationData } from '../note-loader';
import type { CreateObakoNoteModal } from '../plugin-components/commands/create-obako-note';
import type { RepoData } from 'src/plugin-components/commands/repos/add-repo';
import { getCreateCmd, getOpenCmd, getRepoPath, openRepo } from 'src/repos';

export class BasicNote {
    static isAbstract = false;
    private _name: string; // For debugging in the DevTools console.

    static noteTypeStr = "basic-note";
    static noteTypeDisplayName = "Basic Note";
    static noteIcon = "";
    static titleSuffixDecoratorString = "";
    
    file: TFile;
    filepath: string;
    basename: string;
    fileCache!: CachedMetadata;
    frontmatter: any;
    createdAt: Date | null = null;

    public isStub: boolean|undefined = undefined;

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
        if (typeof file === 'string' && !this.file) {
            this.basename = getPathBasename(file);
            this.filepath = file;
        } else {
            this.basename = this.file.basename;
            this.filepath = this.file.path;
        }
        this._name = this.file?.basename;
        this.reloadFrontmatterAndFileCache();

        this.createdAt = new Date(this.frontmatter?.createdat);
        this.createdAt = isDateValid(this.createdAt) ? this.createdAt : null;
    }

    get name(): string { return this.basename; }
    get noteType(): string { return this.frontmatter.notetype; }

    /**
     * Validate the note.
     * @returns true if the note is valid, false otherwise
     */
    validate(): boolean {
        return true;
    }

    equals(other: BasicNote | null): boolean {
        if (!other) return false;
        return this.filepath === other.filepath;
    }

    linkedBy(other: BasicNote | null): boolean {
        if (!other) return false;
        if (!this.incomingLinkedNotes) this.getIncomingLinkedNotes();
        return this.incomingLinkedNotes.map(note => note.equals(other)).includes(true);
    }

    linksTo(other: BasicNote | null): boolean {
        if (!other) return false;
        if (!this.outgoingLinkedNotes) this.getOutgoingLinkedNotes();
        return this.outgoingLinkedNotes.map(note => note.equals(other)).includes(true);
    }

    reloadFrontmatterAndFileCache() {
        this.fileCache = this.file ? app.metadataCache.getFileCache(this.file) : null;
        this.frontmatter = processFrontmatter(this?.fileCache?.frontmatter, this.constructor.getFrontmatterSpec());
    }
    
    getOutgoingLinkedNotes(): BasicNote[] {
        if (this.outgoingLinkedNotes != null) return this.outgoingLinkedNotes;
        const linkedNotes: BasicNote[] = [];
        const linkedPaths = app.metadataCache.resolvedLinks[this.filepath];
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
    async setTopPanel(panel: HTMLElement) {
    }

    getNoteIcon(): string {
        return this.constructor.noteIcon;
    }

    getTitlePrefixDecoratorString(): string {
        return this.constructor.noteIcon;
    }

    setTitlePrefixDecorator(titleDecoratorEl: HTMLElement) {
        titleDecoratorEl.innerHTML = this.getTitlePrefixDecoratorString();
        titleDecoratorEl.style.color = this.getTitlePrefixDecoratorColor();
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            return '';
        }
    }

    getTitleSuffixDecoratorString(): string {
        return this.constructor.titleSuffixDecoratorString;
    }

    setTitleSuffixDecorator(titleSuffixDecoratorEl: HTMLElement) {
        titleSuffixDecoratorEl.innerHTML = this.getTitleSuffixDecoratorString();
    }

    getDecoratedTitle(): string {
        return `${this.getTitlePrefixDecoratorString()} ${this.name} ${this.getTitleSuffixDecoratorString()}`;
    }

    getLinkElement(includePrefixDecorator: boolean = true, includeSuffixDecorator: boolean = true): HTMLElement {
        const linkEl = createEl("a", { href: this.filepath });
        linkEl.classList.add("internal-link");
        const prefixDecoratorEl = createEl("span");
        const titleEl = createEl("span");
        titleEl.innerHTML = ` ${this.name}`;
        const suffixDecoratorEl = createEl("span");
        linkEl.appendChild(prefixDecoratorEl);
        linkEl.appendChild(titleEl);
        linkEl.appendChild(suffixDecoratorEl);
        if (includePrefixDecorator) this.setTitlePrefixDecorator(prefixDecoratorEl);
        if (includeSuffixDecorator) this.setTitleSuffixDecorator(suffixDecoratorEl);
        return linkEl;
    }

    getInternalLink(includePrefixDecorator: boolean = true, includeSuffixDecorator: boolean = true): string {
        const prefixDecorator = includePrefixDecorator ? this.getTitlePrefixDecoratorString() + ' ' : '';
        const suffixDecorator = includeSuffixDecorator ? ' ' + this.getTitleSuffixDecoratorString() : '';
        const dispStr = `${prefixDecorator}${this.name}${suffixDecorator}`.trim();
        return `[[${this.filepath}|${dispStr}]]`;
    }

    async getContent(): Promise<string> {
        if (!this.file) return '';
        
        const noteContentWithFrontmatter = (await app.vault.cachedRead(this.file)).split("\n");

        if (this.fileCache.frontmatterPosition) {
            const fmStart = this.fileCache.frontmatterPosition.start.line;
            const fmEnd = this.fileCache.frontmatterPosition.end.line;
            noteContentWithFrontmatter.splice(fmStart, fmEnd - fmStart + 1);
        }

        return noteContentWithFrontmatter.join("\n");
    }

    static setNoteCreationModalSettings(containerEl: HTMLElement, modal: CreateObakoNoteModal, noteData: NoteCreationData) {
    }

    /**
     * Called before a note is created by noteLoader.createNote(),
     * to allow for note-class-specific processing of the note data.
     * 
     * Returns true if the note data is valid, false otherwise.
     */
    static processNoteData(noteData: NoteCreationData): boolean {
        return true;
    }

    /*** Actions ***/
    open(newTab: boolean = false) {
        app.workspace.openLinkText(this.filepath, "", newTab);
    }

    async modifyFrontmatter(key: string, value: any) {
        await app.fileManager.processFrontMatter(this.file, (frontmatter: any) => {
            frontmatter[key] = value;
        });
        this.reloadFrontmatterAndFileCache(); // Not sure why this doesn't work.
        this.frontmatter[key] = value;
    }

    static getDefaultContent(noteData: NoteCreationData, title: string): string {
        return "";
    }



    /* Repo functions */

    get repos(): RepoData[] {
        return this.frontmatter.repos || [];
    }

    getCreateCmd(repoName: string): string {
        const repoData = this.repos.find(r => r.name === repoName);
        if (!repoData) throw new Error(`Repo '${repoName}' not found`);
        return getCreateCmd(repoData);
    }

    getOpenCmd(repoName: string): string {
        const repoData = this.repos.find(r => r.name === repoName);
        if (!repoData) throw new Error(`Repo '${repoName}' not found`);
        return getOpenCmd(repoData);
    }

    getRepoPath(repoName: string): string {
        const repoData = this.repos.find(r => r.name === repoName);
        if (!repoData) throw new Error(`Repo '${repoName}' not found`);
        return getRepoPath(repoData);
    }

    openRepo(repoName: string) {
        const repoData = this.repos.find(r => r.name === repoName);
        if (!repoData) throw new Error(`Repo '${repoName}' not found`);
        return openRepo(repoData);
    }
}
