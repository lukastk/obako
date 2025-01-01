/**
 * Loads a given note and categorises based on its frontmatter.
 */

import { Notice, stringifyYaml, TFile } from 'obsidian';
import { getFile, getFrontmatter, getMarkdownFiles } from './utils';

import { Planner } from './notes/planner';
import { Capture } from './notes/zettel-types/capture';
import { Pad } from './notes/zettel-types/pad';
import { BasicNote } from './notes/basic-note';
import { Memo } from './notes/zettel-types/memo';
import { Log } from './notes/zettel-types/log';
import { Project } from './notes/zettel-types/project';
import { processFrontmatter } from './notes/note-frontmatter';
import { Zettel } from './notes/zettel';
import { ObakoNote } from './notes/obako-note';
import { Transient } from './notes/zettel-types/transient';

export const noteTypeToNoteClass: Record<string, any> = {
    memo: Memo, 
    pad: Pad,
    capture: Capture,
    log: Log,
    planner: Planner,
    project: Project,

    obakoNote: ObakoNote,
    transient: Transient,
    basicNote: BasicNote,
    zettel: Zettel,
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

export interface NoteCreationData {
    title?: string;
    noteType?: string;
    frontmatterData?: any;
    content?: string;
    extraData?: any;
}

export async function createNote(noteData: NoteCreationData): Promise<TFile|null> {
    if (!noteData.noteType) throw new Error('Note type is required');
    if (!noteData.content) noteData.content = '';
    if (!noteData.frontmatterData) noteData.frontmatterData = {};

    const noteClass = noteTypeToNoteClass[noteData.noteType];
    const isValid = noteClass.processNoteData(noteData);
    if (!isValid) {
        new Notice(`Note data is invalid for note type ${noteData.noteType}`);
        return null;
    }

    if (!noteData.title) throw new Error('Note title is required');

    const frontmatter = processFrontmatter(noteData.frontmatterData, noteClass.getFrontmatterSpec());
    frontmatter.createdat = new Date();

    const yaml = stringifyYaml(frontmatter);
    const noteFullContent = "---\n" + yaml + "\n---\n\n" + noteData.content;

    let noteFolder: string;
    if (noteClass.prototype instanceof Zettel) { 
        noteFolder = _obako_plugin.settings.zettelFolder;
    } else if (noteClass == Planner || noteClass.prototype instanceof Planner) {
        noteFolder = _obako_plugin.settings.plannerFolder;
    } else {
        throw new Error(`Note type ${noteData.noteType} not supported`);
    }

    const noteFilepath = noteFolder + "/" + noteData.title + ".md";

    const file = await app.vault.create(noteFilepath, noteFullContent);
    return file;
}
