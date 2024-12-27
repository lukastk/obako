import { TFile } from "obsidian";

export function registerOn(events: string[]|string, callback: (...args: any[]) => void) {
    if (events === 'all') {
        events = ['modify', 'create', 'delete', 'rename'];
    }

    if (typeof events === 'string') {
        events = [events];
    }

    events.forEach(event => {
        _obako_plugin.registerEvent(
            app.vault.on(event, callback),
        );
    });
}

export function registerOnModify(callback: (file: TFile) => void) {
    registerOn('modify', callback);
}

export function registerOnCreate(callback: (file: TFile) => void) {
    registerOn('create', callback);
}

export function registerOnDelete(callback: (file: TFile) => void) {
    registerOn('delete', callback);
}

export function registerOnRename(callback: (file: TFile) => void) {
    registerOn('rename', callback);
}
