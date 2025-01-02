import { Modal, App, Setting } from 'obsidian';
import PluginComponent from '../plugin-component';
import { createNote } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import { Capture } from 'src/notes/zettel-types/capture';
import { Command_CreateCapture } from './create-capture';

export class Command_CreateHighPriorityCapture extends Command_CreateCapture {
    commandId = 'create-high-priority-capture';
    commandName = 'Create high priority capture';

    load() {
        this.addCommand(true);
    }

    unload() { }
}