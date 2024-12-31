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

import ZettelTopPanel from 'src/top-panels/ZettelTopPanel.svelte';
import { parseObsidianLink } from 'src/utils';

export abstract class Zettel extends ObakoNote {
    static noteTypeStr = "zettel";
    static noteTypeDisplayName = "Zettel";
    static titleDecoratorString = "?zettel";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            parent: { default: null, type: "note:zettel", hideInCreationModal: true, description: "The parent zettel of this zettel." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);
    }

    get parent(): Zettel | null {
        if (!this.frontmatter.parent) return null;
        return obako.noteLoader.loadNote(parseObsidianLink(this.frontmatter.parent)) as Zettel;
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        new ZettelTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }

    getChildZettels(): Zettel[] {
        const linkedNotes = this.getIncomingLinkedNotes().filter(note => note instanceof Zettel);
        // Find subset of linkedNotes that are children of this note
        const childNotes = linkedNotes.filter(note => this.equals(note.parent));
        return childNotes;
    }
    
    getDescendantZettels(includedNoteTypes: (string|typeof Zettel)[] = []): NoteHierarchy {
        includedNoteTypes = includedNoteTypes.map(noteType => 
            typeof noteType !== 'string' ? noteType.noteTypeStr : noteType
        );
        const visited = new Set<Zettel>();
        return this.__getDescendantZettel_helper(visited, includedNoteTypes);
    }

    __getDescendantZettel_helper(visited: Set<Zettel>, includedNoteTypes: string[]): NoteHierarchy {
        const noteHierarchy: NoteHierarchy = {
            note: this,
            children: []
        };
        for (const childNote of this.getChildZettels()) {
            if (!includedNoteTypes.includes(childNote.noteType) && includedNoteTypes.length != 0) {
                continue;
            }
            if (visited.has(childNote)) {
                throw new Error("Zettel.getDescendantZettels: Circular reference detected in zettel hierarchy. Note: '" + childNote.file.path + "'");
            }
            visited.add(childNote);
            if (childNote instanceof Zettel) {
                noteHierarchy.children.push(childNote.__getDescendantZettel_helper(visited, includedNoteTypes));
            }
        }
        return noteHierarchy;
    }
}

export interface NoteHierarchy {
    note: Zettel;
    children: NoteHierarchy[];
}