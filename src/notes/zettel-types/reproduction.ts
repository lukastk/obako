import { Source } from './source';

export class Reproduction extends Source {
    static isAbstract = false;
    static noteTypeStr = "rep";
    static noteTypeDisplayName = "Reproduction";
}
