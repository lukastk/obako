import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TFile, TAbstractFile, WorkspaceLeaf } from 'obsidian';

import { DownloadArticleComponent } from './commands/download-article';
import { InlineTitleDecoratorComponent } from './ui/inline-title-decorator';
import { TopPanelComponent } from './ui/top-panel';

export default class ObakoPlugin extends Plugin {
	settings: MyPluginSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		global.app = this.app;

		/**** Commands ****/
		Object.assign(this, DownloadArticleComponent);
		/**** UI ****/
		Object.assign(this, InlineTitleDecoratorComponent);
		Object.assign(this, TopPanelComponent);
	}

	async onload() {
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