import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObakoPlugin from './plugin';

export interface ObakoSettings {
	zettelFolder: string;
	plannerFolder: string;
	commandPrefix: string;
	pluginComponentSettings: any;
}

export const DEFAULT_SETTINGS: ObakoSettings = {
	zettelFolder: 'zettels',
	plannerFolder: 'planners',
	commandPrefix: '',
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
			'Zettel folder',
			'Folder where zettel notes are stored.',
			'Set the folder name',
			'zettelFolder');
		this.addTextSetting(
			'Planner folder',
			'Folder where planner notes are stored.',
			'Set the folder name',
			'plannerFolder');
		this.addTextSetting(
			'Command prefix',
			'Prefix added to the search terms for all commands.',
			'Set the prefix',
			'commandPrefix');

		
		this.addHeading('Commands, views, and UI components', 3);

		for (const comp of this.plugin.pluginComponents) {
			comp.displaySettings(this, containerEl);
		}
	}

	addHeading(heading: string, level: number|null = null) {
		if (level !== null) {
			const headingEl = document.createElement(`h${level}`);
			headingEl.textContent = heading;
			headingEl.classList.add('obako-settings-heading');
			this.containerEl.appendChild(headingEl);
		} else {
			new Setting(this.containerEl)
				.setName(heading)
				.setHeading();
		}
	}

	addTextSetting(name: string, desc: string, placeholder: string, setting: string, settingsDict: any = null) {
		if (!settingsDict)
			settingsDict = this.plugin.settings;

		const { containerEl } = this;
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addText(text => text
				.setPlaceholder(placeholder)
				.setValue(settingsDict[setting])
				.onChange(async (value) => {
					settingsDict[setting] = value.trim();
					await this.plugin.saveSettings();
				}));
	}
}
