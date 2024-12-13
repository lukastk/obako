import { ObakoNote } from './obako-note';
import { TFile, CachedMetadata } from 'obsidian';
import { getFile, parseObsidianLink } from '../utils';

import type { FrontmatterSpec } from './note-frontmatter';
import { processFrontmatter } from './note-frontmatter';
import { loadNote } from '../note-loader';

export default class BasicNote {
    static noteTypeStr = "basic-note";
    static titleDecoratorString = "";
    
    file: TFile;
    fileCache: CachedMetadata;
    frontmatter: any;

    static frontmatterSpec: FrontmatterSpec = {
        type: { default: BasicNote.noteTypeStr, fixedValue: true },
    };


    constructor(file: TFile | string) {
        this.file = getFile(file);
        this.fileCache = _obako_plugin.app.metadataCache.getFileCache(this.file);
        this.frontmatter = processFrontmatter(this.fileCache.frontmatter, this.constructor.frontmatterSpec);
    }

    get noteType(): string { return this.frontmatter.notetype; }
    
    equals(other: BasicNote | null) {
        if (!other) return false;
        return this.file.path === other.file.path;
    }

    getOutgoingLinkedNotes(): BasicNote[] {
        const linkedNotes: BasicNote[] = [];
        const linkedPaths = _obako_plugin.app.metadataCache.resolvedLinks[this.file.path];
        if (linkedPaths) {
            for (const linkedPath in linkedPaths) {
                if (linkedPath) linkedNotes.push(loadNote(linkedPath));
            }
        }
        return linkedNotes;
    }

    getIncomingLinkedNotes(): BasicNote[] {
        const linkedNotes: BasicNote[] = [];
        const backlinks = _obako_plugin.app.metadataCache.getBacklinksForFile(this.file)?.data;
        for (const [filePath, _] of backlinks) {
            linkedNotes.push(loadNote(filePath));
        }
        return linkedNotes;
    }

    /*** UI ***/
    setTopPanel(panel: HTMLElement) {
    }

    getTitleDecoratorString(): string {
        return this.constructor.titleDecoratorString;
    }

    setTitleDecorator(titleDecoratorEl: HTMLElement) {
        titleDecoratorEl.innerHTML = this.constructor.titleDecoratorString;
    }
}
