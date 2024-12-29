/**
 * Loads a given note and categorises based on its frontmatter.
 */

import { TFile } from 'obsidian';
import { getFile, getFrontmatter, getMarkdownFiles } from './utils';

import { Zettel } from './notes/zettels/zettel';
import { Planner } from './notes/planner';
import { Capture } from './notes/zettels/capture';
import { Pad } from './notes/zettels/pad';
import { BasicNote } from './notes/basic-note';
import { Memo } from './notes/zettels/memo';
import { Log } from './notes/zettels/log';
import { Project } from './notes/zettels/project';

export const noteTypeToNoteClass: Record<string, typeof BasicNote> = {
    memo: Memo, 
    pad: Pad,
    capture: Capture,
    log: Log,
    planner: Planner,
    project: Project,
};

export function getNoteType(file: TFile | string | null, frontmatter: Record<string, any> | null = null): typeof BasicNote | null {
    file = getFile(file) as TFile;
    if (!file) return null;

    if (!frontmatter) frontmatter = getFrontmatter(file);

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
        return noteTypeToNoteClass[noteType]
    }

    return BasicNote;
}

export function loadNote(file: TFile | string | null, frontmatter: Record<string, any> | null = null) {
    file = getFile(file) as TFile;
    const NoteClass = getNoteType(file, frontmatter);
    if (!NoteClass) return null;
    return new NoteClass(file);
}

export function getAllNotes(): BasicNote[] {
    return getMarkdownFiles().map(file => loadNote(file)) as BasicNote[];
}

export function searchNotes(query: string, noteType: string|null = null): BasicNote[] {
    const notes = getAllNotes();
    return notes.filter(note => {
        if (noteType && note.noteType !== noteType) return false;
        return note.name.includes(query)
    });
}