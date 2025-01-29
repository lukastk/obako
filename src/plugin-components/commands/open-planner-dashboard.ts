import type ObakoPlugin from 'src/plugin';
import { OpenViewCommandPluginComponent } from 'src/plugin-components/views/svelte-view';
import { View_PlannerDashboard } from 'src/plugin-components/views/planner-dashboard/planner-dashboard-view';

export class Command_OpenPlannerDashboard extends OpenViewCommandPluginComponent {
    componentName = 'Cmd: Open planner dashboard';
    commandId = 'open-planner-dashboard';
    commandName = 'Open planner dashboard';

    constructor(plugin: ObakoPlugin) {
        super(plugin, View_PlannerDashboard.name);
    }

    unload() { }
}