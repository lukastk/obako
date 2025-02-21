import { Source } from './source';

export class Concept extends Source {
    static isAbstract = false;
    static noteTypeStr = "con";
    static noteTypeDisplayName = "Concept";
    static noteIcon = "☐";
}
