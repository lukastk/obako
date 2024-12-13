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
import { ObakoNote } from '../obako-note';
import type { FrontmatterSpec } from '../note-frontmatter';
import CollapsibleNoteHierarchyDisplay from '../../svelte/CollapsibleNoteHierarchyDisplay.svelte';

import LinkedNotesList from '../../svelte/LinkedNotesList.svelte';
import CollapsibleNoteList from 'src/svelte/CollapsibleNoteList.svelte';

export default abstract class Zettel extends ObakoNote {
    static noteTypeStr = "zettel";

    static frontmatterSpec: FrontmatterSpec = {
        ...super.frontmatterSpec,
        notetype: { default: Zettel.noteTypeStr, fixedValue: true },
    };

    constructor(file: TFile | string) {
        super(file);
    }

    setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        new CollapsibleNoteHierarchyDisplay({
            target: panel,
            props: {
                displayTitle: "Note hierarchy",
                noteHierarchy: this.getDescendantNotes(),
                isCollapsed: true,
                displayTitleDecorator: true,
                sortByNoteType: true,
            }
        });

        new CollapsibleNoteList({
            target: panel,
            props: {
                title: "Linked",
                notes: this.getIncomingLinkedNotes(),
                isCollapsed: true,
                groupByNoteType: true,
            }
        });
    }
}