import { WorkspaceLeaf } from "obsidian";
import { SvelteView, SvelteViewPluginComponent, type SvelteViewPluginComponentSettings, type SvelteViewSettings } from "../svelte-view";

import LogDashboard from "./LogDashboard.svelte";
import PluginComponent from "../../plugin-component";
import type ObakoPlugin from "src/plugin";

const viewSettings: SvelteViewSettings = {
    viewType: "log-dashboard",
    displayName: "Log Dashboard",
    viewCompClass: LogDashboard,
}

class LogDashboardView extends SvelteView {
	static viewSettings = viewSettings;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
}

const viewPluginSettings: SvelteViewPluginComponentSettings = {
    viewType: viewSettings.viewType,
    svelteViewClass: LogDashboardView,

    addCommand: true,
    commandId: 'open-log-dashboard',
    commandName: 'Open Log Dashboard',

    addRibbonIcon: true,
    ribbonIcon: "logs",
    ribbonIconTooltip: "Activate Log Dashboard",
}

export class View_LogDashboard extends SvelteViewPluginComponent {
	static viewPluginSettings = viewPluginSettings;

	constructor(plugin: ObakoPlugin) {
		super(plugin);
	}
}