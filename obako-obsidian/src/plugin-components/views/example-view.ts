import { ItemView } from "obsidian";

import Component from "../../svelte/Example.svelte";
import PluginComponent from '../plugin-component';

const VIEW_TYPE_EXAMPLE = "example-view";

class ExampleView extends ItemView {
	component!: Component;

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		this.component = new Component({
			target: this.contentEl,
		});
	}

	async onClose() {
		this.component.$destroy();
	}
}

export class View_Example extends PluginComponent {
	load() {
		this.plugin.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));
		this.plugin.addRibbonIcon("dice", "Activate Obako view", () => {
			this.activateView();
		});
	}

	unload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
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