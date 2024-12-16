import { ItemView, WorkspaceLeaf } from "obsidian";

import PlannerDashboard from "./PlannerDashboard.svelte";
import PluginComponent from "../../plugin-component";

const VIEW_TYPE_PLANNER_DASHBOARD = "planner-dashboard";

class PlannerDashboardView extends ItemView {
	dashboardComp!: PlannerDashboard;

	getViewType() {
		return VIEW_TYPE_PLANNER_DASHBOARD;
	}

	getDisplayText() {
		return "Planner Dashboard";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		this.dashboardComp = new PlannerDashboard({
			target: container,
		});
	}

	async onClose() {
		this.dashboardComp?.$destroy();
	}
}

export class View_PlannerDashboard extends PluginComponent {
	load() {
		this.plugin.registerView(VIEW_TYPE_PLANNER_DASHBOARD, (leaf) => new PlannerDashboardView(leaf));

		this.plugin.addRibbonIcon("chart-gantt", "Activate Planner Dashboard", () => {
			this.activateView('right');
		});

		this.plugin.addCommand({
			id: 'open-planner-dashboard',
			name: 'Open Planner Dashboard',
			callback: async () => {
				const openInNewTab = this.plugin.modifierKeyPressed.meta || this.plugin.modifierKeyPressed.ctrl;
				const openInRightSidebar = openInNewTab && this.plugin.modifierKeyPressed.shift;

				let openIn: string;
				if (openInRightSidebar) {
					openIn = 'right';
				} else if (openInNewTab) {
					openIn = 'new';
				} else {
					openIn = 'current';
				}

				this.activateView(openIn);
			}
		});
	}

	unload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_PLANNER_DASHBOARD);
	}

	async activateView(openIn: string = 'current') {
		//this.app.workspace.detachLeavesOfType(VIEW_TYPE_PLANNER_DASHBOARD);

		let leaf: WorkspaceLeaf;
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PLANNER_DASHBOARD);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			switch (openIn) {
				case 'current':
					leaf = this.app.workspace.getLeaf(false);
					break;
				case 'new':
					leaf = this.app.workspace.getLeaf(true);
					break;
				case 'right':
					leaf = this.app.workspace.getRightLeaf(false);
					break;
				default:
					throw new Error(`Invalid openIn value: ${openIn}`);
			}
		}

		await leaf.setViewState({
			type: VIEW_TYPE_PLANNER_DASHBOARD,
			active: true,
		});

		this.app.workspace.revealLeaf(leaf);
	}
}