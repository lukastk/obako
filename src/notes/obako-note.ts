import { TFile } from 'obsidian';
import { BasicNote } from './basic-note';
import type { FrontmatterSpec } from './note-frontmatter';
import type { CreateObakoNoteModal } from '../plugin-components/commands/create-obako-note';
import type { NoteCreationData } from 'src/note-loader';

export abstract class ObakoNote extends BasicNote {
    static noteTypeStr = "obako-note";
    static noteTypeDisplayName = "Obako Note";
    static titleDecoratorString = "?obako-note";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "cons": { default: true, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: true, description: "Whether the note has been consolidated." },
            "cons-hp": { default: true, type: "boolean", skipCreationIfAbsent: true, hideInCreationModal: true, description: "Whether the note consolidation is high priority." },
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

    get consolidateHighPriority(): boolean {
        return this.frontmatter['cons-hp'];
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);
    }

    static setNoteCreationModalSettings(containerEl: HTMLElement, modal: CreateObakoNoteModal, noteData: NoteCreationData) {
        super.setNoteCreationModalSettings(containerEl, modal, noteData);
        modal.addFrontmatterSettings(this.noteTypeStr, modal.noteData.frontmatterData);
    }
}