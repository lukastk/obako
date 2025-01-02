import { Modal, App, requestUrl, Setting, FuzzySuggestModal, Notice } from 'obsidian';
import PluginComponent from '../plugin-component';
import { createNote, getAllNotes, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import type { FrontmatterFieldSpec } from 'src/notes/note-frontmatter';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';
import { Log } from 'src/notes/zettel-types/log';
import { getDateStringFromDate } from 'src/utils';

export class Command_CreateLog extends PluginComponent {
    commandId = 'create-log';
    commandName = 'Create log';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.commandName,
            callback: async () => {
                new SetTitleModal(this.app, async (title) => {
                    //new SetDateModal(this.app, async (dateStr) => {
                        new PickLogLink(this.app, async (logLinkNote, event) => {
                            const dateStr = getDateStringFromDate(new Date());
                            const noteData: NoteCreationData = {
                                title: title,
                                noteType: Log.noteTypeStr,
                                frontmatterData: {
                                    links: [logLinkNote.filepath],
                                },
                                extraData: {
                                    logDate: dateStr,
                                },
                            };
                            createNote(noteData).then((file) => {
                                setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                                    if (file)
                                        app.workspace.openLinkText(file.path, "", true);
                                }, 10);
                            });
                        }).open();
                    //}).open();
                }).open();
            }
        });
    }

    unload() { }
}

class PickLogLink extends FuzzySuggestModal<BasicNote> {
    private allNotes: BasicNote[];
    private onSubmit;

    constructor(app: App, onSubmit: (result: BasicNote, event: MouseEvent | KeyboardEvent) => void) {
        super(app);
        this.allNotes = getAllNotes().filter(note => note instanceof ObakoNote);
        this.allNotes.sort((a, b) => `${a.noteType}: ${a.name}`.localeCompare(`${b.noteType}: ${b.name}`));
        this.onSubmit = onSubmit;
    }

    getItems(): BasicNote[] {
        return this.allNotes;
    }

    getItemText(note: BasicNote): string {
        return `${note.noteType}: ${note.name}`;
    }

    onChooseItem(note: BasicNote, event: MouseEvent | KeyboardEvent) {
        this.onSubmit(note, event);
    }
}

class SetDateModal extends Modal {
    constructor(app: App, onSubmit: (dateStr: string) => void) {
        super(app);
        this.setTitle('Set log date');

        let dateStr = 'today';
        new Setting(this.contentEl)
            .setName('Date')
            .addText((text) =>
                text
                    .setValue(dateStr)
                    .onChange((value) => {
                        dateStr = value;
                    }));

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(dateStr);
            }
        });
    }
}

class SetTitleModal extends Modal {
    constructor(app: App, onSubmit: (title: string) => void) {
        super(app);
        this.setTitle('Set title');

        let title = '';
        new Setting(this.contentEl)
            .setName('Title')
            .addText((text) =>
                text
                    .setValue(title)
                    .onChange((value) => {
                        title = value;
                    }));

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(title);
            }
        });
    }
}