import { Zettel } from '../zettel';

export abstract class Source extends Zettel {
    static isAbstract = true;
    static noteTypeStr = "source";
    static noteTypeDisplayName = "Source";
}
