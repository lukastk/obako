import { Editor, MarkdownView } from 'obsidian';
import { CommandPluginComponent } from 'src/plugin-components/command-plugin-component';
import { getSelectionPositions } from 'src/utils';

export class Command_CutLines extends CommandPluginComponent {
    componentName = 'Cmd: Cut lines';
    commandId = 'cut-lines';
    commandName = 'Cut lines';

    load() {
        this.plugin.addCommand({
            id: this.commandId,
            name: this.getCommandName(),
            callback: async () => {
                const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
                const editor: Editor = leaf?.leaf?.view?.editor;
                if (!editor) return;
                const selectionPositions = getSelectionPositions(editor);
                const lastLineLength = editor.getLine(selectionPositions.end.line).length;
                const getLines = editor.getRange(
                    { line: selectionPositions.start.line, ch: 0 },
                    { line: selectionPositions.end.line, ch: lastLineLength }
                );
                editor.replaceRange("",
                    { line: selectionPositions.start.line, ch: 0 },
                    { line: selectionPositions.end.line, ch: lastLineLength }
                );
                navigator.clipboard.writeText(getLines);
            }
        });
    }

    unload() { }
};
