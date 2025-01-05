import { Modal, App, requestUrl, Setting, FuzzySuggestModal, Notice } from 'obsidian';
import { createNote, getAllNotes, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import type { BasicNote } from 'src/notes/basic-note';
import { ObakoNote } from 'src/notes/obako-note';
import { CommandPluginComponent } from '../command-plugin-component';

export class Command_CreatePlanner extends CommandPluginComponent {
    componentName = 'Cmd: Create planner';
    commandId = 'create-planner';
    commandName = 'Create planner';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new SetTitleModal(this.app, async (title) => {
                    new SetDateRangeModal(this.app, async (dateRangeStr) => {
                        const noteData: NoteCreationData = {
                            title: title,
                            noteType: 'planner',
                            extraData: {
                                dateRangeStr: dateRangeStr,
                            },
                        };
                        createNote(noteData).then((file) => {
                            setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                                if (file)
                                    this.app.workspace.openLinkText(file.path, "", true);
                            }, 10);
                        });
                    }).open();
                }).open();
            }
        });
    }

    unload() { }
}

class SetDateRangeModal extends Modal {
    constructor(app: App, onSubmit: (dateRangeStr: string) => void) {
        super(app);
        this.setTitle('Set planner date range');

        let dateRangeStr = 'today';
        new Setting(this.contentEl)
            .setName('Date range')
            .setDesc('The date range of the planner.')
            .addText((text) =>
                text
                    .setValue(dateRangeStr)
                    .onChange((value) => {
                        dateRangeStr = value;
                    }));
            .components[0].inputEl.select();

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(dateRangeStr);
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
