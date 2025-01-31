import { Transient } from './transient';

export class Pad extends Transient {
    static isAbstract = false;
    static noteTypeStr = "pad";
    static noteTypeDisplayName = "Pad";
    static noteIcon = "✎";
}
