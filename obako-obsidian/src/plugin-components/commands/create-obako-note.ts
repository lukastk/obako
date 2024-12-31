import { Modal, App, requestUrl, Setting } from 'obsidian';
import PluginComponent from '../plugin-component';
import { createNote, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';

export class Command_CreateObakoNote extends PluginComponent {
    commandId = 'create-obako-note';
    commandName = 'Create Obako note';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.commandName,
            callback: async () => {
                new CreateObakoNoteModal(this.app, async (noteData) => {
                    createNote(noteData).then(file => {
                        setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                            app.workspace.openLinkText(file.path, "", true);
                        }, 10);
                    });
                }).open();
            }
        });
    }

    unload() { }
}

export interface CreateObakoNoteModalOptions {
    hideTitle?: boolean;
    hideNoteType?: boolean;
    hideFrontmatter?: boolean;
    hideNoteContent?: boolean;
    noteData?: NoteCreationData;
}

class CreateObakoNoteModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void, options: CreateObakoNoteModalOptions = {}) {
        super(app);
        this.setTitle('Create Obako note');

        const noteTypes = Object.keys(noteTypeToNoteClass);

        const noteData: NoteCreationData = options.noteData || {};
        if (!('title' in noteData)) noteData.title = '';
        if (!('noteType' in noteData)) noteData.noteType = noteTypes[0];
        if (!('frontmatterData' in noteData)) noteData.frontmatterData = {};
        if (!('content' in noteData)) noteData.content = '';

        /* title */
        if (!options.hideTitle) {
            new Setting(this.contentEl)
                .setName('Title')
                .addText((text) => {
                    text
                        .onChange((value) => {
                            noteData.title = value;
                        })
                        .setValue(noteData.title);
                });
        }

        /* note type */
        if (!options.hideNoteType) {
            let selectedNoteType = noteTypes[0];
            new Setting(this.contentEl)
                .setName('Note type')
                .setDesc('Select the Obako note type.')
                .addDropdown(dropdown => {
                    noteTypes.forEach(type => {
                        dropdown.addOption(type, noteTypeToNoteClass[type].noteTypeDisplayName);
                    });
                    dropdown
                        .setValue(selectedNoteType)
                        .onChange(async (value) => {
                            noteData.noteType = value;
                            noteData.frontmatterData = {};
                            if (!options.hideFrontmatter) {
                                setNoteFrontmatterSettings(noteFrontmatterSettingsContainer, noteData.noteType, noteData.frontmatterData);
                            }
                        });
                });
        }

        /* note content */
        if (!options.hideNoteContent) {
            new Setting(this.contentEl)
                .setName('Note content')
                .addTextArea((textArea) => {
                    textArea
                        .onChange((value) => noteData.content = value)
                        .setValue(noteData.content);
                    textArea.inputEl.style.width = '100%';
                });
        }

        /* note frontmatter data */
        let noteFrontmatterSettingsContainer: HTMLElement;
        if (!options.hideFrontmatter) {
            noteFrontmatterSettingsContainer = document.createElement('div');
            this.contentEl.appendChild(noteFrontmatterSettingsContainer);
            setNoteFrontmatterSettings(noteFrontmatterSettingsContainer, noteData.noteType, noteData.frontmatterData);
        }

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(noteData);
                    }));
    }
}

function setNoteFrontmatterSettings(containerEl: HTMLElement, noteType: string, frontmatterData: any) {
    containerEl.empty();

    const noteClass = noteTypeToNoteClass[noteType];
    const frontmatterSpec = noteClass.getFrontmatterSpec();

    const numSettings = Object.entries(frontmatterSpec).filter(([key, spec]) => !spec.fixedValue && !spec.hideInCreationModal).length;
    if (numSettings > 0) {
        new Setting(containerEl)
            .setName('Frontmatter')
            .setHeading();
    }

    for (const [key, spec] of Object.entries(frontmatterSpec)) {
        if (spec.fixedValue || spec.hideInCreationModal) continue;

        const setting = new Setting(containerEl)
            .setName(key)
            .setDesc(spec.description || '')

        switch (spec.type) {
            case 'boolean':
                setting.addToggle((toggle) => {
                    toggle
                        .onChange((value) => frontmatterData[key] = value)
                        .setValue(key in frontmatterData ? frontmatterData[key] : spec.default);
                });
                break;
            case 'text':
                setting.addText((text) => {
                    text
                        .onChange((value) => frontmatterData[key] = value)
                        .setValue(key in frontmatterData ? frontmatterData[key] : spec.default);
                });
                break;
        }
    }
}