import { TFile } from "obsidian";
import { writable, type Writable } from "svelte/store";

export function registerVaultOn(events: string[] | string, callback: (...args: any[]) => void) {
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

export function registerWorkspaceOn(events: string[] | string, callback: (...args: any[]) => void) {
    if (typeof events === 'string') {
        events = [events];
    }

    events.forEach(event => {
        _obako_plugin.registerEvent(
            app.workspace.on(event, callback),
        );
    });
}

export function getReloadKey(callback: (() => void) | null = null): Writable<number> {
    const reloadKey = writable(0);

    function updateReloadKey() {
        reloadKey.update((n) => n + 1);
        if (callback) callback();
    }

    registerVaultOn("all", (file) => {
        setTimeout(() => {
            updateReloadKey();
        }, 10);
    });

    registerWorkspaceOn("editor-change", () => {
        setTimeout(() => {
            updateReloadKey();
        }, 10);
    });

    reloadKey.reload = () => {
        updateReloadKey();
    };

    return reloadKey;
}