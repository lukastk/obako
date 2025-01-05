import { getSelectionPositions } from 'src/utils';
import { Command_TransformTaskStatus } from './transform-task-status';
import { MarkdownView } from 'obsidian';

export class Command_ToggleTaskDeferred extends Command_TransformTaskStatus {
    componentName = 'Cmd: Toggle task deferred';
    commandId = 'toggle-task-deferred';
    commandName = 'Toggle task deferred';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const taskStatusConversionRules = {
                    '>': ' ',
                    ' ': '>',
                };
                const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
                const selectionPositions = getSelectionPositions(leaf?.leaf.view.editor);
                this.applyTaskConversion(taskStatusConversionRules, selectionPositions.start.line, selectionPositions.end.line);
            }
        });
    }
};