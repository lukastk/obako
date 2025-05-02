import { normalizePath } from "obsidian";
import type { ObakoNote } from "./notes/obako-note";
import { formatString, getDateStringFromDate } from "./utils";
import path from 'path-browserify';
import type { ObakoRepoSettings, RepoData } from "./plugin-components/commands/repos/add-repo";

let fs;
try { fs = require('fs'); } catch (err) { console.warn('fs module is not available'); }
let child_process;
try { child_process = require('child_process'); } catch (err) { console.warn('child_process module is not available'); }

export function getRepoData(note: ObakoNote, repoName: string): Record<string, string> {
    const reposData = note.getRepos();
    const repoData = reposData.find(r => r.name === repoName);
    if (!repoData) throw new Error(`repo '${repoName}' does not exist`);
    return repoData;
}

export function getCreateCmd(repoData: RepoData): string {
    const templates = getTemplates();
    const templatePath = templates[repoData['template']];
    if (!templatePath) throw new Error(`repo-template '${repoData['template']}' does not match any existing template`);
    const cmd = `copier copy --trust "${templatePath}" "${repoData['path']}" --data repo_name="${repoData['name']}"`;
    return cmd;
}

export function getOpenCmd(repoData: RepoData): string {
    let openCmd = repoData['open-cmd'];
    if (!openCmd) {
        const openCmdKey = repoData['open-cmd-key'];
        if (!openCmdKey) throw new Error('Neither open-cmd-key nor open-cmd is set');
        openCmd = getOpenRepoCmds()[openCmdKey];
        if (!openCmd) throw new Error(`open-cmd-key '${openCmdKey}' does not match any existing open-cmd`);
    }

    return formatString(openCmd, {
        'REPO_PATH': `"${getRepoPath(repoData)}"`,
    }).trim();
}

export async function openRepo(repoData: RepoData) {
    if (!child_process) throw new Error('child_process module is not available');
    let openCmd = getOpenCmd(repoData);
    const args = openCmd.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => 
        arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
    ) || [];
    const [command, ...commandArgs] = args;
    child_process.spawn(command, commandArgs);
}

export function getRepoPath(repoData: RepoData): string {
    let repoPath = repoData['path'];
    if (repoData['cl-key']) {
        const codeLocation = getCodeLocations()[repoData['cl-key']];
        if (!codeLocation) throw new Error(`cl-key '${repoData['cl-key']}' does not match any existing code location`);
        repoPath = path.join(codeLocation, repoPath);
    }
    return repoPath;
}


export function getObakoRepoSettings(): ObakoRepoSettings {
    return _obako_plugin.settings.pluginComponentSettings.Command_AddRepo;
}

export function  getTemplates(): Record<string, string> {
    const settings = getObakoRepoSettings();
    const templates: Record<string, string> = {};
    if (!settings.templatesPath.startsWith('/')) {
        const vaultBasePath = _obako_plugin.app.vault.adapter.basePath;
        for (const folder of app.vault.getAllFolders()) {
            if (normalizePath(folder.path) === normalizePath(settings.templatesPath)) {
                templates[folder.name] = path.join(vaultBasePath, folder.path);
            }
        }
    } else {
        if (!fs) throw new Error('fs module is not available');
        const fullPath = path.resolve(settings.templatesPath);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
            const folders = fs.readdirSync(fullPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const folder of folders) {
                templates[folder] = path.join(fullPath, folder);
            }
        }
    }

    // Extra templates
    for (const line of settings.extraTemplates.split('\n')) {
        if (!line?.trim()) continue;
        const [key, path] = line.split(/:(.+)/);
        templates[key.trim()] = path.trim();
    }

    return templates;
}

export function  getCodeLocations(): Record<string, string> {
    const settings = getObakoRepoSettings();
    const codeLocations: Record<string, string> = {};
    for (const line of settings.codeLocations.split('\n')) {
        if (!line?.trim()) continue;
        const [key, path] = line.split(/:(.+)/);
        codeLocations[key.trim()] = path.trim();
    }
    return codeLocations;
}

export function getOpenRepoCmds(): Record<string, string> {
    const settings = getObakoRepoSettings();
    const openRepoCmds: Record<string, string> = {};
    for (const line of settings.openRepoCmds.split('\n')) {
        if (!line?.trim()) continue;
        const [key, cmd] = line.split(/:(.+)/);
        openRepoCmds[key.trim()] = cmd.trim();
    }
    return openRepoCmds;
}