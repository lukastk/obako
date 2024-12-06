/**
 * Loads a given note and categorises based on its frontmatter.
 */

import { TFile } from 'obsidian';
import { getFrontmatter } from './utils';

import Zettel from './note_types/zettels/zettel';
import Planner from './note_types/planner';
import Note from './note_types/note';

export default function loadNote(file: TFile) {
    const frontmatter = getFrontmatter(file);

    switch (frontmatter?.type) {
        case "zettel":
            return new Zettel(file);
        case "planner":
            return new Planner(file);
        default:
            return new Note(file);
    }
}
