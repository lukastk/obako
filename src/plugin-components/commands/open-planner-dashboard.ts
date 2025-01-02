import type ObakoPlugin from 'src/plugin';
import { OpenViewCommandPluginComponent } from '../views/svelte-view';
import { View_PlannerDashboard } from '../views/planner-dashboard/planner-dashboard-view';

export class Command_OpenPlannerDashboard extends OpenViewCommandPluginComponent {
    componentName = 'Cmd: Open planner dashboard';
    commandId = 'open-planner-dashboard';
    commandName = 'Open planner dashboard';

    constructor(plugin: ObakoPlugin) {
        super(plugin, View_PlannerDashboard.name);
    }

    unload() { }
}