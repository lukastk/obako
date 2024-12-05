import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TFile, TAbstractFile } from 'obsidian';

import { DownloadArticleComponent } from './commands/download-article';
import { InlineTitleDecoratorComponent } from './inline-title-decorator';

import * as devUtils from './dev_utils';

export default class ObakoPlugin extends Plugin {
	settings: MyPluginSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		Object.assign(this, DownloadArticleComponent);
		Object.assign(this, InlineTitleDecoratorComponent);
	}

	async onload() {
		/** Load components **/
		/**** Commands ****/
		this.load_DownloadArticleComponent();
		/**** Misc ****/
		this.load_InlineTitleDecoratorComponent();
	}

	onunload() {

	}

	async loadSettings() {
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}