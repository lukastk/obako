import type ObakoPlugin from 'src/plugin';
import { OpenViewCommandPluginComponent } from 'src/plugin-components/views/svelte-view';
import { View_LogDashboard } from 'src/plugin-components/views/log-dashboard/log-dashboard-view';

export class Command_OpenLogDashboard extends OpenViewCommandPluginComponent {
    componentName = 'Cmd: Open log dashboard';
    commandId = 'open-log-dashboard';
    commandName = 'Open log dashboard';

    constructor(plugin: ObakoPlugin) {
        super(plugin, View_LogDashboard.name);
    }
    
    unload() { }
}