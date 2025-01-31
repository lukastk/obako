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
import type { FrontmatterSpec } from './note-frontmatter';
import { ParentableNote } from './parentable-note';

export abstract class Zettel extends ParentableNote {
    static isAbstract = true;
    static noteTypeStr = "zettel";
    static noteTypeDisplayName = "Zettel";
    static noteIcon = "?zettel";

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    constructor(file: TFile | string) {
        super(file);
    }

    async setTopPanel(panel: HTMLElement) {
        super.setTopPanel(panel);

        const { default: ZettelTopPanel } = await import('src/ui-components/top-panels/ZettelTopPanel.svelte');
        new ZettelTopPanel({
            target: panel,
            props: {
                note: this,
            }
        });
    }
}