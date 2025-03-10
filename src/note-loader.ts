/**
 * Loads a given note and categorises based on its frontmatter.
 */

import { Notice, stringifyYaml, TFile, CachedMetadata, TAbstractFile, parseYaml } from 'obsidian';
import { getFile, getFrontmatter, getMarkdownFiles, getPathParent } from './utils';

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


let noteCache: Record<string, BasicNote> = {};

export function initialiseNoteCache() {
    reloadNoteCache();

    app.vault.on("create", (file: TAbstractFile) => {
        noteCache[file.path] = loadNote(file.path, true) as BasicNote;
        triggerNoteCacheUpdate("create", { note: noteCache[file.path] });
    });
    
    app.metadataCache.on("deleted", (file: TFile, prevCache: CachedMetadata | null) => {
        const note = noteCache[file.path];
        delete noteCache[file.path];
        triggerNoteCacheUpdate("delete", { note: note });
    });

    app.metadataCache.on("changed", (file: TFile, data: string, cache: CachedMetadata) => {
        const oldNote = noteCache[file.path];
        noteCache[file.path] = loadNote(file, true) as BasicNote;
        triggerNoteCacheUpdate("change", { oldNote: oldNote, note: noteCache[file.path] });
    });

    app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
        noteCache[file.path] = noteCache[oldPath];
        delete noteCache[oldPath];
        triggerNoteCacheUpdate("rename", { note: noteCache[file.path], oldPath: oldPath });
    });
}

/* Note: Should only be executed onLayoutReady, as Obsidian triggers 'create' for every file on startup. */
export function initialiseAutomaticNoteFrontmatterFillIn() {
    app.vault.on("create", (file: TAbstractFile) => {
        fillNoteWithFrontmatter(file);
    });
}

const noteCacheUpdateCallbacks: Record<string, ((event: "create" | "delete" | "change" | "rename", eventData: any) => void)> = {};
export function onNoteCacheUpdate(callback: (event: "create" | "delete" | "change" | "rename", eventData: any) => void) {
    const uuid = crypto.randomUUID();
    noteCacheUpdateCallbacks[uuid] = callback;
    return () => {
        delete noteCacheUpdateCallbacks[uuid];
    }
}

function triggerNoteCacheUpdate(event: "create" | "delete" | "change" | "rename", eventData: any) {
    for (const callback of Object.values(noteCacheUpdateCallbacks)) {
        callback(event, eventData);
    }
}

export function reloadNoteCache() {
    const allFiles = getMarkdownFiles() as TFile[];
    noteCache = {};
    for (const file of allFiles) {
        loadNote(file.path);
    }

    for (const filePath in app.metadataCache.unresolvedLinks) {
        for (const fileStubPath in app.metadataCache.unresolvedLinks[filePath]) {
            loadNote(fileStubPath);
        }
    }
}

export function getNoteClass(_file: TFile | string | null, frontmatter: Record<string, any> | null = null): typeof BasicNote {
    const file = getFile(_file);
    const filePath = file ? file.path : _file;

    if (!frontmatter) frontmatter = getFrontmatter(file);

    let noteClass = noteTypeToNoteClass[frontmatter?.notetype];
        
    if (!noteClass) {
        for (const [noteTypeStr, noteTypeFolder] of Object.entries(_obako_plugin.settings.noteTypeFolders)) {
            if (filePath.startsWith(noteTypeFolder)) {
                noteClass = noteTypeToNoteClass[noteTypeStr];
                break;
            }
        }
    }
    
    if (noteClass && concreteNoteTypes.includes(noteClass)) return noteClass;
    return BasicNote;
}

export function loadNote(_file: TFile | string, forceReload: boolean = false) {
    if (!forceReload) {
        if (typeof _file === 'string' && _file in noteCache) return noteCache[_file];
        else if (_file instanceof TFile && _file.path in noteCache) return noteCache[_file.path];
    }

    const file = getFile(_file);
    const filePath = file ? file.path : _file;

    if (filePath in noteCache && !forceReload) return noteCache[filePath];

    const NoteClass = file ? getNoteClass(file) : getNoteClass(filePath);
    if (!NoteClass) return null;
    const note = file ? new NoteClass(file) : new NoteClass(filePath);
    noteCache[filePath] = note;
    return note;
}

export function getAllNotes(): BasicNote[] {
    return Object.values(noteCache);
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

export function searchNotes(query: string, noteType: string|(typeof BasicNote)|null = null, exactTitleMatch: boolean = false): BasicNote[] {
    if (noteType && typeof noteType !== 'string')
        noteType = noteType.noteTypeStr;
    const notes = getAllNotes();
    return notes.filter(note => {
        if (noteType && note.noteType !== noteType) return false;
        if (exactTitleMatch)
            return note.name === query;
        else
            return note.name.includes(query);
    });
}

export interface NoteCreationData {
    title?: string;
    noteType?: string;
    frontmatterData?: any;
    content?: string;
    extraData?: any;
}

function prepareNoteData(noteData: NoteCreationData, noteFolder: string) {
    noteData = {...noteData};
    noteData.frontmatterData = noteData.frontmatterData ? {...noteData.frontmatterData} : {};
    noteData.extraData = noteData.extraData ? {...noteData.extraData} : {};

    if (!noteData.noteType) {
        noteData.noteType = getNoteClass(noteFolder).noteTypeStr;
    }

    if (!noteData.noteType) throw new Error('Note type is required');
    if (!noteData.content) noteData.content = '';
    if (!noteData.frontmatterData) noteData.frontmatterData = {};
    if (!noteData.frontmatterData.links) noteData.frontmatterData.links = [];

    noteData.frontmatterData.links = noteData.frontmatterData.links.map((filepath: string) => {
        return `[[${app.metadataCache.fileToLinktext(getFile(filepath), filepath)}]]`;
    });

    return noteData;
}
    
/* Formats the fronmatter into a string. If a frontmatter spec is given, then the spec fields will be at the top. */
function formatFrontmatterString(frontmatter, frontmatterSpec) {
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
    return "---\n" + yaml.trim() + "\n---";
}

export async function createNote(noteData: NoteCreationData, noteFolder: string): Promise<TFile|null> {
    // Make a deep copy of the noteData object
    noteData = prepareNoteData(noteData, noteFolder);

    const noteClass = noteTypeToNoteClass[noteData.noteType];
    const isValid = noteClass.processNoteData(noteData);
    if (!noteData.title) throw new Error('Note title is required');
    if (!isValid) {
        new Notice(`Note data is invalid for note type ${noteData.noteType}`);
        return null;
    }

    const frontmatterSpec = noteClass.getFrontmatterSpec();
    const frontmatter = {...processFrontmatter(noteData.frontmatterData, frontmatterSpec, true)};
    frontmatter.createdat = new Date();

    const noteFullContent = formatFrontmatterString(frontmatter, frontmatterSpec) + "\n\n" + noteData.content;

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

export async function fillNoteWithFrontmatter(file: TFile, noteData: NoteCreationData | null = null) {
    if (!noteData) noteData = { };
    noteData = {...noteData};
    noteData.title = file.name;
    noteData = prepareNoteData(noteData, getPathParent(file.path));

    if (noteData.noteType === BasicNote.noteTypeStr) return;

    let noteContent = (await app.vault.cachedRead(file)).split("\n");
    let frontmatterString = "";

    if (noteContent[0] === "---") {
        const fmEnd = noteContent.slice(1).indexOf("---");
        frontmatterString = noteContent.slice(1, fmEnd + 1).join("\n");
        noteContent = noteContent.slice(fmEnd + 2);
    }
    
    noteContent = noteContent.join("\n");
    const originalFrontmatter = parseYaml(frontmatterString);

    const noteClass = noteTypeToNoteClass[noteData.noteType];
    if (!noteClass) {
        new Notice(`Invalid note type ${noteData.noteType}`);
        return;
    }

    const frontmatterSpec = noteClass.getFrontmatterSpec();
    const frontmatter = processFrontmatter({...noteData.frontmatterData, ...originalFrontmatter}, frontmatterSpec, true);
    frontmatter.createdat = new Date();
    const noteFullContent = formatFrontmatterString(frontmatter, frontmatterSpec) + "\n\n" + noteContent;

    await app.vault.modify(file, noteFullContent);
}