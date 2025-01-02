import { WorkspaceLeaf } from "obsidian";
import { SvelteView, SvelteViewPluginComponent, type SvelteViewPluginComponentSettings, type SvelteViewSettings } from "../svelte-view";

import PlannerDashboard from "./PlannerDashboard.svelte";
import PluginComponent from "../../plugin-component";
import type ObakoPlugin from "src/plugin";

const viewSettings: SvelteViewSettings = {
    viewType: "planner-dashboard",
    displayName: "Planner Dashboard",
    viewCompClass: PlannerDashboard,
}

class PlannerDashboardView extends SvelteView {
	static viewSettings = viewSettings;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}
}

const viewPluginSettings: SvelteViewPluginComponentSettings = {
    viewType: viewSettings.viewType,
    svelteViewClass: PlannerDashboardView,

    addRibbonIcon: true,
    ribbonIcon: "chart-gantt",
    ribbonIconTooltip: "Activate Planner Dashboard",
}

export class View_PlannerDashboard extends SvelteViewPluginComponent {
    componentName = 'View: Planner Dashboard';
	static viewPluginSettings = viewPluginSettings;

	constructor(plugin: ObakoPlugin) {
		super(plugin);
	}
}