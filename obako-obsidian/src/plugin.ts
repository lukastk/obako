import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TFile, TAbstractFile, WorkspaceLeaf } from 'obsidian';

import { ObakoSettings, ObakoSettingsTab, DEFAULT_SETTINGS } from './settings';
import PluginComponent from './plugin-components/plugin-component';

import * as utils from './utils';
import * as tasks from './task-utils';
import * as noteLoader from './note-loader';

/**** Commands ****/
import { Command_DownloadArticle } from './plugin-components/commands/download-article';
import { Command_MoveUnlinkedFiles } from './plugin-components/commands/move-unlinked-files';
import { Command_GetDateString } from './plugin-components/commands/get-date-string';
import { Command_FindNote } from './plugin-components/commands/find-note';
import { Command_CreateObakoNote } from './plugin-components/commands/create-obako-note';
import { Command_CreateLog } from './plugin-components/commands/create-log';
/**** UI ****/
import { UI_InlineTitleDecorator } from './plugin-components/ui/inline-title-decorator';
import { UI_TopPanel } from './plugin-components/ui/top-panel';
/**** Views ****/
import { View_PlannerDashboard } from "./plugin-components/views/planner-dashboard/planner-dashboard-view";
import { View_LogDashboard } from "./plugin-components/views/log-dashboard/log-dashboard-view";

/**** Svelte Components ****/
import TaskList from './svelte-components/TaskList.svelte';

export default class ObakoPlugin extends Plugin {
	settings!: ObakoSettings;
	defaultSettings!: ObakoSettings;
	pluginComponents!: PluginComponent[];

	modifierKeyPressed = {
		meta: false,
		ctrl: false,
		alt: false,
		shift: false,
	};

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		global._obako_plugin = this;
		global.obako = {
			utils: utils,
			tasks: tasks,
			noteLoader: noteLoader,
			svelteComponents: {
				TaskList: TaskList,
			},
			noteClasses: noteLoader.noteTypeToNoteClass,
		}
	}

	async onload() {
		this.pluginComponents = [
			new Command_DownloadArticle(this),
			new Command_MoveUnlinkedFiles(this),
			new Command_GetDateString(this),
			new Command_FindNote(this),
			new Command_CreateObakoNote(this),
			new Command_CreateLog(this),
			new UI_InlineTitleDecorator(this),
			new UI_TopPanel(this),
			new View_PlannerDashboard(this),
			new View_LogDashboard(this),
		];

		this.defaultSettings = DEFAULT_SETTINGS;
		for (const comp of this.pluginComponents)
			this.defaultSettings.pluginComponentSettings[comp.constructor.name] = comp.constructor.getDefaultSettings();

		await this.loadSettings();
		this.addSettingTab(new ObakoSettingsTab(this.app, this));

		for (const module of this.pluginComponents)
			module.load();

		document.addEventListener('keydown', (event) => {
			this.modifierKeyPressed.meta = event.metaKey;
			this.modifierKeyPressed.ctrl = event.ctrlKey;
			this.modifierKeyPressed.alt = event.altKey;
			this.modifierKeyPressed.shift = event.shiftKey;
		});

		document.addEventListener('keyup', (event) => {
			this.modifierKeyPressed.meta = event.metaKey;
			this.modifierKeyPressed.ctrl = event.ctrlKey;
			this.modifierKeyPressed.alt = event.altKey;
			this.modifierKeyPressed.shift = event.shiftKey;
		});
	}

	onunload() {
		for (const module of this.pluginComponents)
			module.unload();
	}

	async loadSettings() {
		this.settings = Object.assign({}, this.defaultSettings, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}