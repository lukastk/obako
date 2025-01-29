import { WorkspaceLeaf } from "obsidian";
import { SvelteView, SvelteViewPluginComponent, type SvelteViewPluginComponentSettings, type SvelteViewSettings } from "../svelte-view";

import LogDashboard from "src/ui-components/dashboards/log/LogDashboard.svelte";
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

    addRibbonIcon: true,
    ribbonIcon: "logs",
    ribbonIconTooltip: "Activate Log Dashboard",
}

export class View_LogDashboard extends SvelteViewPluginComponent {
    componentName = 'View: Log Dashboard';
	static viewPluginSettings = viewPluginSettings;

	constructor(plugin: ObakoPlugin) {
		super(plugin);
	}
}