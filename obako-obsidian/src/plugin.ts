import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TFile, TAbstractFile, WorkspaceLeaf } from 'obsidian';

import { DownloadArticleComponent } from './commands/download-article';
import { InlineTitleDecoratorComponent } from './ui/inline-title-decorator';
import { TopPanelComponent } from './ui/top-panel';
import * as devUtils from './dev_utils';

export default class ObakoPlugin extends Plugin {
	settings: MyPluginSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		Object.assign(this, DownloadArticleComponent);
		Object.assign(this, InlineTitleDecoratorComponent);
		Object.assign(this, TopPanelComponent);
	}

	async onload() {
		/** Load components **/
		/**** Commands ****/
		this.load_DownloadArticleComponent();
		/**** UI ****/
		//this.load_InlineTitleDecoratorComponent();
		this.load_TopPanelComponent();
	}

	onunload() {
		this.unload_TopPanelComponent();
	}

	async loadSettings() {
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}