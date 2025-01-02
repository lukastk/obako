import { Modal, App, Setting } from 'obsidian';
import PluginComponent from '../plugin-component';
import { createNote } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import { Capture } from 'src/notes/zettel-types/capture';

export class Command_CreateCapture extends PluginComponent {
    commandId = 'create-capture';
    commandName = 'Create capture';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.commandName,
            callback: async () => {
                new SetTitleModal(this.app, async (title) => {
                    new SetContentModal(this.app, async (content) => {
                        const dateTimeStr = (new Date()).toISOString().split('.')[0].replace('T', '_').replaceAll(':','');
                        title = `${dateTimeStr} ${title}`;

                        const noteData: NoteCreationData = {
                            title: title,
                            content: content,
                            noteType: Capture.noteTypeStr,
                            frontmatterData: {
                            },
                            extraData: {
                            },
                        };
                        console.log(noteData);
                        createNote(noteData).then((file) => {
                            setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                                if (file)
                                    app.workspace.openLinkText(file.path, "", true);
                            }, 10);
                        });
                    }).open();
                }).open();
            }
        });
    }

    unload() { }
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

class SetContentModal extends Modal {
    constructor(app: App, onSubmit: (content: string) => void) {
        super(app);
        this.setTitle('Capture content');

        let content = '';
        new Setting(this.contentEl)
            .setName('Content')
            .addTextArea((text) =>
                text
                    .setValue(content)
                    .onChange((value) => {
                        content = value;
                    }));

        // Add event listener for ENTER key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.close();
                onSubmit(content);
            }
        });
    }
}