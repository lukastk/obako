import { Source } from './source';

export class Reference extends Source {
    static isAbstract = false;
    static noteTypeStr = "ref";
    static noteTypeDisplayName = "Reference";
    static noteIcon = "➭";
}
