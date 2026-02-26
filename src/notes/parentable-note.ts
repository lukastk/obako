/*

New zettel types are defined in Obako by creating
a template. The template should have the default values of the zettel.
This is so that any file, even an empty one,
can be opened as a zettel. We should also be able to fill in the defaul
values of a zettel using a command.


A zettel type have default properties, and mandatory properties.
The mandatory properties are the ones that cannot be changed in the zettel.
When converting a zettel, the mandatory properties are the ones that are set.
If a default property is not set in the original, it will be set in the 
converted zettel, otherwise it will be kept unchanged.

Or it could also be defined by a class

Todo:
- Transform one zettel type into another
*/

import { TFile } from 'obsidian';
import { ObakoNote } from './obako-note';
import type { FrontmatterSpec } from './note-frontmatter';
import { getFile, parseObsidianLink } from 'src/utils';

export abstract class ParentableNote extends ObakoNote {
    static isAbstract = true;
    static noteTypeStr = "parentable-note";
    static noteTypeDisplayName = "Parentable Note";
    static noteIcon = "?parentable-note";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            parent: { default: null, type: "note:parentable-note", hideInCreationModal: true, description: "The parent note of this note." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);
    }

    get parent(): ParentableNote | null {
        if (!this.frontmatter.parent) return null;
        const file = getFile(parseObsidianLink(this.frontmatter.parent), this.filepath);
        return file ? obako.noteLoader.loadNote(file) as ParentableNote : null;
    }

    getChildNotes(): ParentableNote[] {
        const linkedNotes = this.getIncomingLinkedNotes().filter(note => note instanceof ParentableNote);
        // Find subset of linkedNotes that are children of this note
        const childNotes = linkedNotes.filter(note => this.equals(note.parent));
        return childNotes;
    }

    getDescendantNotes(includedNoteTypes: (string | typeof ParentableNote)[] = []): NoteTree {
        includedNoteTypes = includedNoteTypes.map(noteType =>
            typeof noteType !== 'string' ? noteType.noteTypeStr : noteType
        );
        const visited = new Set<ParentableNote>();
        return this.__getDescendantNote_helper(visited, includedNoteTypes);
    }

    __getDescendantNote_helper(visited: Set<ParentableNote>, includedNoteTypes: string[]): NoteTree {
        const noteTree: NoteTree = {
            note: this,
            children: []
        };
        for (const childNote of this.getChildNotes()) {
            if (!includedNoteTypes.includes(childNote.noteType) && includedNoteTypes.length != 0) {
                continue;
            }
            if (visited.has(childNote)) {
                throw new Error("ParentableNote.getDescendantNotes: Circular reference detected in note hierarchy. Note: '" + childNote.file.path + "'");
            }
            visited.add(childNote);
            if (childNote instanceof ParentableNote) {
                noteTree.children.push(childNote.__getDescendantNote_helper(visited, includedNoteTypes));
            }
        }
        return noteTree;
    }

    getLineage(): ParentableNote[] {
        const lineage: ParentableNote[] = [];
        let currentNote: ParentableNote | null = this;
        while (currentNote) {
            lineage.unshift(currentNote);
            currentNote = currentNote.parent;
        }
        return lineage;
    }
}

export interface NoteTree {
    note: ParentableNote;
    children: NoteTree[];
}