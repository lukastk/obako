import { Modal, App, requestUrl, Setting } from 'obsidian';
import { createNote, noteTypeToNoteClass } from 'src/note-loader';
import type { NoteCreationData } from 'src/note-loader';
import type { FrontmatterFieldSpec } from 'src/notes/note-frontmatter';
import { Memo } from 'src/notes/zettel-types/memo';
import { Pad } from 'src/notes/zettel-types/pad';
import { Capture } from 'src/notes/zettel-types/capture';
import { Log } from 'src/notes/zettel-types/log';
import { Planner } from 'src/notes/planner';
import { Project } from 'src/notes/zettel-types/project';
import { CommandPluginComponent } from '../command-plugin-component';

export class Command_CreateObakoNote extends CommandPluginComponent {
    componentName = 'Cmd: Create Obako note';
    commandId = 'create-obako-note';
    commandName = 'Create Obako note';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                new CreateObakoNoteModal(this.app, async (noteData) => {
                    createNote(noteData).then((file) => {
                        setTimeout(() => { // Wait a bit to allow the frontmatter cache to be loaded.
                            if (file)
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
    modalTitle?: string;
    disableTitleSetting?: boolean;
    disableNoteTypeSelection?: boolean;
    disableNoteSpecificSettings?: boolean;
    disableNoteContentSetting?: boolean;
    noteData?: NoteCreationData;
}

export class CreateObakoNoteModal extends Modal {
    noteSettingsContainerEl: HTMLElement;

    noteData: NoteCreationData;
    noteTypes: string[] = [
        Memo.noteTypeStr,
        Pad.noteTypeStr,
        Capture.noteTypeStr,
        Log.noteTypeStr,
        Planner.noteTypeStr,
        Project.noteTypeStr,
    ];

    constructor(app: App, onSubmit: (result: NoteCreationData) => void, options: CreateObakoNoteModalOptions = {}) {
        super(app);

        if (!('disableNoteContentSetting' in options))
            options.disableNoteContentSetting = true;

        const explanationEl = document.createElement('p');
        explanationEl.textContent = 'Press Cmd+Enter to submit';
        explanationEl.style.fontSize = 'var(--font-small)';
        explanationEl.style.color = 'var(--text-muted)';
        this.contentEl.appendChild(explanationEl);

        this.setTitle(options.modalTitle || 'Create Obako note');

        this.noteData = options.noteData || {};
        if (!('title' in this.noteData)) this.noteData.title = '';
        if (!('noteType' in this.noteData)) this.noteData.noteType = this.noteTypes[0];
        if (!('frontmatterData' in this.noteData)) this.noteData.frontmatterData = {};
        if (!('content' in this.noteData)) this.noteData.content = '';
        if (!('extraData' in this.noteData)) this.noteData.extraData = {};

        /* note type */
        if (!options.disableNoteTypeSelection) {
            let selectedNoteType = this.noteTypes[0];
            this.addDropdownSetting(
                'Note type',
                'Select the Obako note type.',
                this.noteTypes,
                (value) => {
                    this.noteData.noteType = value;
                    this.noteData.frontmatterData = {};
                    if (!options.disableNoteSpecificSettings)
                        this.refreshNoteSpecificSettings();
                },
                0,
                this.contentEl
            );
        }

        /* title */
        if (!options.disableTitleSetting) {
            this.addTextSetting(
                'Title',
                'The title of the note.',
                (value) => this.noteData.title = value,
                this.noteData.title,
                this.contentEl,
            );
        }

        this.noteSettingsContainerEl = document.createElement('div');
        this.contentEl.appendChild(this.noteSettingsContainerEl);

        /* note-specific settings */
        if (!options.disableNoteSpecificSettings)
            this.refreshNoteSpecificSettings();

        /* note content */
        if (!options.disableNoteContentSetting) {
            this.addTextAreaSetting(
                'Note content',
                'The content of the note.',
                (value) => this.noteData.content = value,
                this.noteData.content,
                this.contentEl
            );
        }
        /* submit button */
        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Submit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(this.noteData);
                    }));

        // Add event listener for Cmd+Enter key
        this.contentEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                this.close();
                onSubmit(this.noteData);
            }
        });
    }

    private refreshNoteSpecificSettings() {
        this.noteSettingsContainerEl.empty();
        const noteClass = noteTypeToNoteClass[this.noteData.noteType];
        noteClass.setNoteCreationModalSettings(this.noteSettingsContainerEl, this, this.noteData);
    }

    addBooleanSetting(name: string, description: string, initialValue: boolean, onChange: (value: boolean) => void) {
        const setting = new Setting(this.noteSettingsContainerEl)
            .setName(name)
            .setDesc(description)
            .addToggle((toggle) => {
                toggle
                    .onChange((value) => onChange(value))
                    .setValue(initialValue);
            });
    }

    addTextSetting(name: string, description: string, onChange: (value: string) => void, initialValue?: string, containerEl?: HTMLElement) {
        const setting = new Setting(containerEl || this.noteSettingsContainerEl)
            .setName(name)
            .setDesc(description)
            .addText((text) => {
                text
                    .onChange((value) => onChange(value))
                    .setValue(initialValue);
            });
    }

    addTextAreaSetting(name: string, description: string, onChange: (value: string) => void, initialValue?: string, containerEl?: HTMLElement) {
        const setting = new Setting(containerEl || this.noteSettingsContainerEl)
            .setName(name)
            .setDesc(description)
            .addTextArea((textArea) => {
                textArea
                    .onChange((value) => onChange(value))
                    .setValue(initialValue);
            });
    }

    addDropdownSetting(name: string, description: string, options: string[], onChange: (value: string) => void, initialValueIndex?: number, containerEl?: HTMLElement) {
        initialValueIndex = initialValueIndex || 0;
        const setting = new Setting(containerEl || this.noteSettingsContainerEl)
            .setName(name)
            .setDesc(description)
            .addDropdown((dropdown) => {
                options.forEach(option => {
                    dropdown.addOption(option, option);
                });
                dropdown
                    .setValue(options[initialValueIndex])
                    .onChange((value) => onChange(value));
            });
    }

    addFrontmatterSpecSetting(key: string, spec: FrontmatterFieldSpec, initialValue?: any, containerEl?: HTMLElement) {
        const description = spec.description || '';
        initialValue = initialValue === undefined ? spec.default : initialValue;

        switch (spec.type) {
            case 'boolean':
                this.addBooleanSetting(key, description, initialValue, (value) => this.noteData.frontmatterData[key] = value);
                break;
            case 'text':
                this.addTextSetting(key, description, initialValue, (value) => this.noteData.frontmatterData[key] = value, containerEl);
                break;
        }
    }

    addFrontmatterSettings(noteType: string, frontmatterData?: any, containerEl?: HTMLElement) {
        const noteClass = noteTypeToNoteClass[noteType];
        const frontmatterSpec = noteClass.getFrontmatterSpec();
        frontmatterData = frontmatterData || {};
        for (const [key, spec] of Object.entries(frontmatterSpec)) {
            if (spec.fixedValue || spec.hideInCreationModal) continue;
            const initialValue = key in frontmatterData ? frontmatterData[key] : undefined;
            this.addFrontmatterSpecSetting(key, spec, initialValue, containerEl);
        }
    }
}