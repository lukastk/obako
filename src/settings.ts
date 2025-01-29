import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObakoPlugin from './plugin';
import SimpleCollapsible from 'src/ui-components/svelte-lib/SimpleCollapsible.svelte'
import { CommandPluginComponent } from './plugin-components/command-plugin-component';

export interface ObakoSettings {
	zettelFolder: string;
	plannerFolder: string;
	moduleFolder: string;
	globalCommandPrefix: string;
	pluginComponentSettings: any;
}

export const DEFAULT_SETTINGS: ObakoSettings = {
	zettelFolder: 'zettels',
	plannerFolder: 'planners',
	moduleFolder: 'modules',
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

		this.addTextSetting(
			/* name */ 'Zettel folder',
			/* desc */ 'Folder where zettel notes are stored.',
			/* placeholder */ 'Set the folder name',
			/* setting */ 'zettelFolder');

		this.addTextSetting(
			/* name */ 'Planner folder',
			/* desc */ 'Folder where planner notes are stored.',
			/* placeholder */ 'Set the folder name',
			/* setting */ 'plannerFolder');

		this.addTextSetting(
				/* name */ 'Module folder',
				/* desc */ 'Folder where module notes are stored.',
				/* placeholder */ 'Set the folder name',
				/* setting */ 'moduleFolder');

		this.addTextSetting(
			/* name */ 'Global command prefix',
			/* desc */ 'Prefix added to the search terms for all commands.',
			/* placeholder */ 'Set the prefix',
			/* setting */ 'globalCommandPrefix');

		// Initialize settings for all components
		for (const comp of this.plugin.pluginComponents) {
			const compName = comp.constructor.name
			if (!(compName in this.plugin.settings.pluginComponentSettings))
				this.plugin.settings.pluginComponentSettings[compName] = comp.constructor.getDefaultSettings();
		}

		/* Command shortcodes */

		const { titleElement, contentElement } = this.addCollapsible(true);
		const cmdShortcodesTitleEl = titleElement;
		const cmdShortcodesContentEl = contentElement;

		cmdShortcodesTitleEl.textContent = "Command shortcodes";

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
