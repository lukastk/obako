import { Modal, App, Setting } from 'obsidian';
import { createNote } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import { Capture } from 'src/notes/zettel-types/capture';
import { CommandPluginComponent } from '../command-plugin-component';

export class Command_CreateCapture extends CommandPluginComponent {
    componentName = 'Cmd: Create capture';
    commandId = 'create-capture';
    commandName = 'Create capture';
    
    load() {
        this.addCommand(false);
    }

    addCommand(highPriorityCapture: boolean = false) {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new SetTitleModal(this.app, async (title) => {
                    new SetContentModal(this.app, async (content) => {
                        const noteData: NoteCreationData = {
                            title: title,
                            content: content,
                            noteType: Capture.noteTypeStr,
                            frontmatterData: {
                                "cons": false,
                                "is-hp-cons": highPriorityCapture,
                            },
                            extraData: {
                            },
                        };
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