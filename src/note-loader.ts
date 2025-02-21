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
import { Doc } from './notes/zettel-types/doc';
import { Log } from './notes/zettel-types/log';
import { Project } from './notes/zettel-types/project';
import { Module } from './notes/zettel-types/module';
import { processFrontmatter } from './notes/note-frontmatter';
import { Zettel } from './notes/zettel';
import { ObakoNote } from './notes/obako-note';
import { ParentableNote } from './notes/parentable-note';
import { Reference } from './notes/zettel-types/reference';
import { Source } from './notes/zettel-types/source';
import { Entity } from './notes/zettel-types/entity';
import { Concept } from './notes/zettel-types/concept';
import { Transient } from './notes/zettel-types/transient';

export const noteTypes = [
    Zettel,
    ParentableNote,
    ObakoNote,
    Transient,
    BasicNote,
    Planner,
    Capture,
    Doc,
    Log,
    Memo,
    Module,
    Pad,
    Project,
    Reference,
    Source,
    Entity,
    Concept,
    Transient,
];

export const concreteNoteTypes = noteTypes.filter(noteType => !noteType.isAbstract);
export const abstractNoteTypes = noteTypes.filter(noteType => noteType.isAbstract);

export const noteTypeToNoteClass: Record<string, any> = noteTypes.reduce((acc, noteType) => {
    acc[noteType.noteTypeStr] = noteType;
    return acc;
}, {});

export function getNoteClass(file: TFile | string | null, frontmatter: Record<string, any> | null = null): typeof BasicNote | null {
    file = getFile(file) as TFile;
    if (!file) return null;
    if (!frontmatter) frontmatter = getFrontmatter(file);

    let noteClass = noteTypeToNoteClass[frontmatter?.notetype];
    
    if (!noteClass) {
        for (const [noteTypeStr, noteTypeFolder] of Object.entries(_obako_plugin.settings.noteTypeFolders)) {
            if (file.path.startsWith(noteTypeFolder)) {
                noteClass = noteTypeToNoteClass[noteTypeStr];
                break;
            }
        }
    }
    
    if (noteClass && concreteNoteTypes.includes(noteClass)) return noteClass;
    return BasicNote;
}

export function loadNote(file: TFile | string | null, frontmatter: Record<string, any> | null = null) {
    file = getFile(file) as TFile;
    const NoteClass = getNoteClass(file, frontmatter);
    if (!NoteClass) return null;
    return new NoteClass(file);
}

export function getAllNotes(): BasicNote[] {
    return getMarkdownFiles().map(file => loadNote(file)) as BasicNote[];
}

export function getAllNotesOfType(noteType: string|(typeof BasicNote), onlyValid: boolean = true): BasicNote[] {
    let noteClass: typeof BasicNote;
    if (typeof noteType === 'string')
        noteClass = noteTypeToNoteClass[noteType];
    else noteClass = noteType;

    let notes = getMarkdownFiles().map(file =>loadNote(file));
    notes = notes.filter(note => note instanceof noteClass);
    if (onlyValid)
        notes = notes.filter(note => note?.validate());
    return notes;
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

export async function createNote(noteData: NoteCreationData, noteFolder: string): Promise<TFile|null> {
    // Make a deep copy of the noteData object
    noteData = {...noteData}
    noteData.frontmatterData = noteData.frontmatterData ? {...noteData.frontmatterData} : {};
    noteData.extraData = noteData.extraData ? {...noteData.extraData} : {};

    if (!noteData.noteType) throw new Error('Note type is required');
    if (!noteData.content) noteData.content = '';
    if (!noteData.frontmatterData) noteData.frontmatterData = {};
    if (!noteData.frontmatterData.links) noteData.frontmatterData.links = [];

    noteData.frontmatterData.links = noteData.frontmatterData.links.map((filepath: string) => {
        return `[[${app.metadataCache.fileToLinktext(getFile(filepath), filepath)}]]`;
    });

    const noteClass = noteTypeToNoteClass[noteData.noteType];
    const isValid = noteClass.processNoteData(noteData);
    if (!isValid) {
        new Notice(`Note data is invalid for note type ${noteData.noteType}`);
        return null;
    }

    if (!noteData.title) throw new Error('Note title is required');

    const frontmatterSpec = noteClass.getFrontmatterSpec();
    const frontmatter = {...processFrontmatter(noteData.frontmatterData, frontmatterSpec, true)};
    frontmatter.createdat = new Date();

    let yamlEntries: string[] = [];
    for (const key in frontmatterSpec) {
        if (key in frontmatter) {
            yamlEntries.push(stringifyYaml({[key]: frontmatter[key]}).trim());
            delete frontmatter[key];
        }
    }
    for (const key in frontmatter) {
        yamlEntries.push(stringifyYaml({[key]: frontmatter[key]}).trim());
    }
    const yaml = yamlEntries.join("\n");
    const noteFullContent = "---\n" + yaml + "\n---\n\n" + noteData.content;

    if (!noteFolder) {
        noteFolder = _obako_plugin.settings.noteTypeFolders[noteClass.noteTypeStr];
        if (!noteFolder) {
            new Notice(`Invalid note type ${noteClass.noteTypeStr}.`);
            throw new Error(`Invalid note type ${noteClass.noteTypeStr}.`);
        };
    }

    const noteFilepath = noteFolder + "/" + noteData.title + ".md";

    const existingFile = getFile(noteFilepath);
    if (existingFile) {
        new Notice(`Note already exists: ${noteFilepath}`);
        return existingFile;
    } else {
        if (!app.vault.getFolderByPath(noteFolder))
            await app.vault.createFolder(noteFolder)
        const file = await app.vault.create(noteFilepath, noteFullContent);
        return file;
    }
}
