import { Zettel } from '../zettel';

export class Memo extends Zettel {
    static noteTypeStr = "memo";
    static noteTypeDisplayName = "Memo";
    static titleDecoratorString = "◆";
}
