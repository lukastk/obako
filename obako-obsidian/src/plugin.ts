import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TFile, TAbstractFile, WorkspaceLeaf } from 'obsidian';

import { DownloadArticleComponent } from './commands/download-article';
import { InlineTitleDecoratorComponent } from './ui/inline-title-decorator';
import { TopPanelComponent } from './ui/top-panel';

import { ExampleView, VIEW_TYPE_EXAMPLE } from "./views/example-view";

export default class ObakoPlugin extends Plugin {

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

		this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));

		this.addRibbonIcon("dice", "Activate Obako view", () => {
			this.activateView();
		});
	}

	onunload() {
		this.unload_TopPanelComponent();
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0],
		);
	}
}