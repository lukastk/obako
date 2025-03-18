import { TFile } from 'obsidian';
import { BasicNote } from './basic-note';
import type { FrontmatterSpec } from './note-frontmatter';
import type { CreateObakoNoteModal } from '../plugin-components/commands/create-obako-note';
import type { NoteCreationData } from 'src/note-loader';

export abstract class ObakoNote extends BasicNote {
    static isAbstract = true;
    static noteTypeStr = "obako-note";
    static noteTypeDisplayName = "Obako Note";
    static noteIcon = "?obako-note";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "cons": { default: true, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: true, description: "Whether the note has been consolidated." },
            "is-hp-cons": { default: true, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: true, description: "Whether the note consolidation is high priority." },
            "is-link-cons": { default: true, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: true, description: "Whether the capture needs to be consolidated to the notes it links to ." },
            "archived": { default: false, type: "boolean", skipCreationIfAbsent: true, description: "Whether the note is archived." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);
    }

    get consolidated(): boolean {
        return this.frontmatter.cons;
    }

    get needsConsolidation(): boolean {
        return !this.consolidated; // By default, if a note is not consolidated, it should be consolidated.
    }

    get isHighPriorityConsolidate(): boolean {
        return this.frontmatter['is-hp-cons'];
    }

    get isLinkConsolidate(): boolean {
        return this.frontmatter['is-link-cons'];
    }

    get isArchived(): boolean {
        return this.frontmatter.archived;
    }

    async setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);
    }
    
    static setNoteCreationModalSettings(containerEl: HTMLElement, modal: CreateObakoNoteModal, noteData: NoteCreationData) {
        super.setNoteCreationModalSettings(containerEl, modal, noteData);
        modal.addFrontmatterSettings(this.noteTypeStr, modal.noteData.frontmatterData);
    }
}