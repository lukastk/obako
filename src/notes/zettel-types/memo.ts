import { Zettel } from '../zettel';

export class Memo extends Zettel {
    static isAbstract = false;
    static noteTypeStr = "memo";
    static noteTypeDisplayName = "Memo";
    static noteIcon = "◆";
}
