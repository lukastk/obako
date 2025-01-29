import { Command_CreateCapture } from './create-capture';

export class Command_CreateHighPriorityCapture extends Command_CreateCapture {
    componentName = 'Cmd: Create high priority capture';
    commandId = 'create-high-priority-capture';
    commandName = 'Create high priority capture';

    load() {
        this.addCommand(true);
    }

    unload() { }
}