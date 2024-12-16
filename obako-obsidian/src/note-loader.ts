/**
 * Loads a given note and categorises based on its frontmatter.
 */

import { TFile } from 'obsidian';
import { getFile, getFrontmatter } from './utils';

import Zettel from './notes/zettels/zettel';
import Planner from './notes/planner';
import Capture from './notes/zettels/capture';
import Pad from './notes/zettels/pad';
import BasicNote from './notes/basic-note';
import Memo from './notes/zettels/memo';
import Log from './notes/zettels/log';
import Project from './notes/zettels/project';

export const noteTypeToNoteClass: Record<string, typeof BasicNote> = {
    memo: Memo, 
    pad: Pad,
    capture: Capture,
    log: Log,
    planner: Planner,
    project: Project,
};

export function loadNote(file: TFile | string | null) {
    file = getFile(file);
    if (!file) return null;

    const frontmatter = getFrontmatter(file);

    const isInZettelFolder = file.path.startsWith(_obako_plugin.settings.zettelFolder);
    const isInPlannerFolder = file.path.startsWith(_obako_plugin.settings.plannerFolder);

    let noteType = frontmatter?.notetype;

    if (!noteType) {
        if (isInZettelFolder) {
            noteType = "capture";
        } else if (isInPlannerFolder) {
            noteType = "planner";
        }
    }

    if (noteType && noteType in noteTypeToNoteClass) {
        const NoteClass = noteTypeToNoteClass[noteType];
        return new NoteClass(file);
    }

    return new BasicNote(file);
}
