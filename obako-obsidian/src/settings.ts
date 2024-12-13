import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObakoPlugin from './plugin';

export interface ObakoSettings {
	zettelFolder: string;
	plannerFolder: string;
	pluginComponentSettings: any;
}

export const DEFAULT_SETTINGS: ObakoSettings = {
	zettelFolder: 'zettels',
	plannerFolder: 'planners',
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

		for (const comp of this.plugin.pluginComponents) {
			comp.displaySettings(this, containerEl);
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
					settingsDict[setting] = value;
					await this.plugin.saveSettings();
				}));
	}
}
