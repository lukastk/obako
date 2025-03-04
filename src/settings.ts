import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObakoPlugin from './plugin';
import SimpleCollapsible from 'src/ui-components/svelte-lib/SimpleCollapsible.svelte'
import { CommandPluginComponent } from './plugin-components/command-plugin-component';
import { concreteNoteTypes, noteTypeToNoteClass } from './note-loader';

const defaultNoteTypeFolders = concreteNoteTypes
	.filter(noteType => noteType !== noteTypeToNoteClass.BasicNote)
	.reduce((acc, noteType) => {
		acc[`${noteType.noteTypeStr}`] = noteType.noteTypeStr;
		return acc;
	}, {});

export interface NoteTypeFolderSettings {
	[key: string]: string;
}

export interface ObakoSettings {
	noteTypeFolders: NoteTypeFolderSettings;
	moduleFolder: string;
	globalCommandPrefix: string;
	pluginComponentSettings: any;
}

export const DEFAULT_SETTINGS: ObakoSettings = {
	noteTypeFolders: defaultNoteTypeFolders,
	globalCommandPrefix: '',
	pluginComponentSettings: {},
}

export class ObakoSettingsTab extends PluginSettingTab {
	plugin: ObakoPlugin;

	constructor(app: App, plugin: ObakoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		/*** Note type folders ***/

		this.addHeading('Note type folders', 3);

		concreteNoteTypes.forEach((noteType) => {
			if (noteType.noteTypeStr === 'basic-note') return;
			this.addTextSetting(
				/* name */ `${noteType.noteTypeDisplayName} folder`,
				/* desc */ `Folder where ${noteType.noteTypeDisplayName} notes are stored.`,
				/* placeholder */ 'Set the folder name',
				/* setting */ `${noteType.noteTypeStr}`,
				/* settingsDict */ this.plugin.settings.noteTypeFolders,
				/* containerEl */ containerEl
			);
		});

		// Initialize settings for all components
		for (const comp of this.plugin.pluginComponents) {
			const compName = comp.constructor.name
			if (!(compName in this.plugin.settings.pluginComponentSettings))
				this.plugin.settings.pluginComponentSettings[compName] = comp.constructor.getDefaultSettings();
		}


		/*** Command shortcodes ***/

		this.addHeading('Command shortcodes', 3);

		this.addTextSetting(
			/* name */ "Global command prefix",
			/* desc */ "Prefix for all commands. Reload the app to see changes.",
			/* placeholder */ "Set the prefix",
			/* setting */ "globalCommandPrefix",
			/* settingsDict */ this.plugin.settings,
			/* containerEl */ containerEl
		);

		const { titleElement, contentElement } = this.addCollapsible(true);
		const cmdShortcodesTitleEl = titleElement;
		const cmdShortcodesContentEl = contentElement;
		cmdShortcodesTitleEl.textContent = "Collapsible";

		this.addTextDescription("Create shortcode prefixes for commands. Reload the app to see changes.", cmdShortcodesContentEl);
		for (const comp of this.plugin.pluginComponents) {
			if (comp instanceof CommandPluginComponent) {
				this.addTextSetting(
					/* name */ comp.commandName,
					/* desc */ "",
					/* placeholder */ "Set the shortcode",
					/* setting */ "shortcode",
					/* settingsDict */ this.plugin.settings.pluginComponentSettings[comp.constructor.name],
					/* containerEl */ cmdShortcodesContentEl
				);
			}
		}

		/*** Commands, views, and UI components ***/

		this.addHeading('Commands, views, and UI components', 3);

		for (const comp of this.plugin.pluginComponents) {
			comp.displaySettings(this, containerEl);
		}
	}

	addHeading(heading: string, level: number | null = null, containerEl: HTMLElement | null = null) {
		containerEl = containerEl || this.containerEl;
		if (level !== null) {
			const headingEl = document.createElement(`h${level}`);
			headingEl.textContent = heading;
			headingEl.classList.add('obako-settings-heading');
			containerEl.appendChild(headingEl);
		} else {
			new Setting(containerEl)
				.setName(heading)
				.setHeading();
		}
	}

	addTextDescription(description: string, containerEl: HTMLElement | null = null) {
		containerEl = containerEl || this.containerEl;
		new Setting(containerEl)
			.setDesc(description)
	}

	addCollapsible(isCollapsed: boolean = false, containerEl: HTMLElement | null = null): { titleElement: HTMLElement, contentElement: HTMLElement } {
		containerEl = containerEl || this.containerEl;

		const comp = new SimpleCollapsible({
			target: containerEl,
			props: {
				isCollapsed: isCollapsed,
			},
		});

		return {
			titleElement: comp.getTitleElement(),
			contentElement: comp.getContentElement(),
		};
	}

	addTextSetting(name: string, desc: string, placeholder: string, setting: string, settingsDict: any = null, containerEl: HTMLElement | null = null) {
		containerEl = containerEl || this.containerEl;
		if (!settingsDict)
			settingsDict = this.plugin.settings;

		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addText(text => text
				.setPlaceholder(placeholder)
				.setValue(settingsDict[setting])
				.onChange(async (value) => {
					settingsDict[setting] = value;
					await this.plugin.saveSettings();
				}));
	}

	addTextAreaSetting(name: string, desc: string, placeholder: string, setting: string, settingsDict: any = null, containerEl: HTMLElement | null = null) {
		containerEl = containerEl || this.containerEl;
		if (!settingsDict)
			settingsDict = this.plugin.settings;

		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addTextArea(text => text
				.setPlaceholder(placeholder)
				.setValue(settingsDict[setting])
				.onChange(async (value) => {
					settingsDict[setting] = value;
					await this.plugin.saveSettings();
				}));
	}
}
