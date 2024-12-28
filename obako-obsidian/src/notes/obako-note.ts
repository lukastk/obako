import { TFile } from 'obsidian';
import { BasicNote } from './basic-note';
import type { FrontmatterSpec } from './note-frontmatter';
import { loadNote, noteTypeToNoteClass } from '../note-loader';
import { parseObsidianLink } from '../utils';

export abstract class ObakoNote extends BasicNote {
    static noteTypeStr = "obako-note";
    static titleDecoratorString = "?";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: ObakoNote.noteTypeStr, fixedValue: true },
    };

    constructor(file: TFile | string) {
        super(file);
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);
        panel.classList.add('obako-note-top-panel');
    }

    getChildNotes(): ObakoNote[] {
        const linkedNotes = this.getIncomingLinkedNotes().filter(note => note instanceof ObakoNote);
        // Find subset of linkedNotes that are children of this note
        const childNotes = linkedNotes.filter(note => this.equals(note.parent));
        return childNotes;
    }

    get parent(): ObakoNote | null {
        if (!this.frontmatter.parent) return null;
        return loadNote(parseObsidianLink(this.frontmatter.parent));
    }

    getDescendantNotes(includedNoteTypes: (string|typeof ObakoNote)[] = []): NoteHierarchy {
        includedNoteTypes = includedNoteTypes.map(noteType => 
            typeof noteType !== 'string' ? noteType.noteTypeStr : noteType
        );
        const visited = new Set<BasicNote>();
        return this.__getDescendantNotes_helper(visited, includedNoteTypes);
    }

    __getDescendantNotes_helper(visited: Set<BasicNote>, includedNoteTypes: string[]): NoteHierarchy {
        const noteHierarchy: NoteHierarchy = {
            note: this,
            children: []
        };
        for (const childNote of this.getChildNotes()) {
            if (!includedNoteTypes.includes(childNote.noteType) && includedNoteTypes.length != 0) {
                continue;
            }
            if (visited.has(childNote)) {
                throw new Error("ObakoNote.getDescendantNotes: Circular reference detected in note hierarchy. Note: '" + childNote.file.path + "'");
            }
            visited.add(childNote);
            noteHierarchy.children.push(childNote.__getDescendantNotes_helper(visited, includedNoteTypes));
        }
        return noteHierarchy;
    }
}

export interface NoteHierarchy {
    note: BasicNote;
    children: NoteHierarchy[];
}