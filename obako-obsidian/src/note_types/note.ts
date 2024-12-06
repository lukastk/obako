import ObakoNote from './obako_note';
import { TFile, CachedMetadata } from 'obsidian';
import { getFile } from '../utils';

export default class Note {
    private fileCache : CachedMetadata;
    private frontmatter: any;

    constructor(file: TFile | string) {
        this.fileCache = global.app.metadataCache.getFileCache(getFile(file));
        this.frontmatter = this.fileCache.frontmatter;
    }

    createTopPanel(panel: HTMLElement) {
    }
}