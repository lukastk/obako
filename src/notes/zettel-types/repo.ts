import type { FrontmatterSpec } from '../note-frontmatter';
import { Zettel } from '../zettel';
import type { ObakoRepoSettings } from '../../plugin-components/commands/create-repo';
import { normalizePath } from 'obsidian';
import path from 'path-browserify';
import type { NoteCreationData } from 'src/note-loader';
import { formatString, getDateStringFromDate } from 'src/utils';

let fs;
try { fs = require('fs'); } catch (err) { console.warn('fs module is not available'); }
let child_process;
try { child_process = require('child_process'); } catch (err) { console.warn('child_process module is not available'); }


export class Repo extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "repo";
    static noteTypeDisplayName = "Repo";
    static noteIcon = "∷";

    static statuses = {
        writing: "writing",
        done: "done",
        archived: "archived",
    };

    static statusOrder = {
        [Repo.statuses.writing]: 0,
        [Repo.statuses.done]: 1,
        [Repo.statuses.archived]: 2,
    };

    static getFrontmatterSpec(): FrontmatterSpec {
        const spec: FrontmatterSpec = {
            ...super.getFrontmatterSpec(),
            "repo-name": { default: "", type: "string", description: "The name of the repository." },
            "repo-status": { default: "writing", type: "string", description: "The status of the repository." },
            "repo-cl-key": { default: "", type: "string", description: "The key of the code location of the repository. The keys are defined in the settings." },
            "repo-path": { default: "", type: "string", description: "The path to the repository." },
            "repo-template": { default: "", type: "string", description: "The template used for the repository." },
            "open-cmd-key": { default: "", type: "string", description: "The key of the command to open the repository. If not set, and if open-cmd is set, the script will be opened using the default command script." },
            "open-cmd": { default: "", type: "string", description: "The command to open the repository. Used instead of the open-cmd-key if it is set." },
            "prepend-date-to-repo-path": { default: true, type: "boolean", description: "Prepend the creation date to the repo path." },
        };
        spec.notetype.default = this.noteTypeStr;
        return spec;
    }

    get status(): string {
        return this.frontmatter["repo-status"];
    }

    getCreateCmd(): string {
        const templates = Repo.getTemplates();
        if (!this.frontmatter['repo-template']) throw new Error('repo-template is not set');
        const templatePath = templates[this.frontmatter['repo-template']];
        if (!templatePath) throw new Error(`repo-template '${this.frontmatter['repo-template']}' does not match any existing template`);
        const cmd = `copier copy --trust "${templatePath}" "${this.getRepoPath()}" --data repo_name="${this.frontmatter['repo-name']}"`;
        return cmd;
    }

    getOpenCmd(): string {
        let openCmd = this.frontmatter['open-cmd'];
        if (!openCmd) {
            const openCmdKey = this.frontmatter['open-cmd-key'];
            if (!openCmdKey) throw new Error('Neither open-cmd-key nor open-cmd is set');
            openCmd = Repo.getOpenRepoCmds()[openCmdKey];
            if (!openCmd) throw new Error(`open-cmd-key '${openCmdKey}' does not match any existing open-cmd`);
        }

        return formatString(openCmd, {
            'REPO_PATH': `"${this.getRepoPath()}"`,
        }).trim();
    }

    async openRepo() {
        if (!child_process) throw new Error('child_process module is not available');
        let openCmd = this.getOpenCmd();
        const args = openCmd.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => 
            arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
        ) || [];
        console.log(args);
        const [command, ...commandArgs] = args;
        child_process.spawn(command, commandArgs);
    }

    getRepoPath(): string {
        let repoPath = this.frontmatter['repo-path'];
        if (this.frontmatter['prepend-date-to-repo-path'] && this.createdAt) {
            repoPath = `${getDateStringFromDate(this.createdAt)} ${repoPath}`;
        }
        if (!repoPath) throw new Error('repo-path is not set');
        if (this.frontmatter['repo-cl-key']) {
            const codeLocation = Repo.getCodeLocations()[this.frontmatter['repo-cl-key']];
            if (!codeLocation) throw new Error(`repo-cl-key '${this.frontmatter['repo-cl-key']}' does not match any existing code location`);
            repoPath = path.join(codeLocation, repoPath);
        }
        return repoPath;
    }

    static processNoteData(noteData: NoteCreationData): boolean {
        if (!noteData.frontmatterData['repo-name']) {
            noteData.frontmatterData['repo-name'] = noteData.title;
        }

        // If the repo-path is not set, then we need to set it
        // If repo-cl-key is not set, then the note data is invalid
        if (!noteData.frontmatterData['repo-path']) {
            if (noteData.frontmatterData['repo-cl-key']) {
                noteData.frontmatterData['repo-path'] = noteData.title;
            } else {
                return false;
            }
        }

        if (noteData.extraData['prepend-date-to-title']) {
            noteData.title = `${getDateStringFromDate(new Date())} ${noteData.title}`;
        }

        return true;
    }

    validate(): boolean {
        return super.validate() && this.status in Repo.statuses;
    }

    getTitlePrefixDecoratorColor(): string {
        if (!this.validate()) {
            return 'var(--text-error)';
        } else {
            switch (this.status) {
                case Repo.statuses.writing:
                    return 'var(--color-blue)';
                case Repo.statuses.done:
                    return 'var(--color-green)';
                case Repo.statuses.archived:
                    return 'var(--text-faint)';
                default:
                    return '';
            }
        }
    }

    /** Obako report settings **/

    static getObakoRepoSettings(): ObakoRepoSettings {
        return _obako_plugin.settings.pluginComponentSettings.Command_CreateRepo;
    }

    static getTemplates(): Record<string, string> {
        const settings = this.getObakoRepoSettings();
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
            if (!line.trim()) continue;
            const [key, path] = line.split(/:(.+)/);
            templates[key.trim()] = path.trim();
        }

        return templates;
    }

    static getCodeLocations(): Record<string, string> {
        const settings = this.getObakoRepoSettings();
        const codeLocations: Record<string, string> = {};
        for (const line of settings.codeLocations.split('\n')) {
            if (!line.trim()) continue;
            const [key, path] = line.split(/:(.+)/);
            codeLocations[key.trim()] = path.trim();
        }
        return codeLocations;
    }

    static getOpenRepoCmds(): Record<string, string> {
        const settings = this.getObakoRepoSettings();
        const openRepoCmds: Record<string, string> = {};
        for (const line of settings.openRepoCmds.split('\n')) {
            if (!line.trim()) continue;
            const [key, cmd] = line.split(/:(.+)/);
            openRepoCmds[key.trim()] = cmd.trim();
        }
        return openRepoCmds;
    }
}


