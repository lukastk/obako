import { Zettel } from '../zettel';

export abstract class Source extends Zettel {
    static noteTypeStr = "source";
    static noteTypeDisplayName = "Source";
}
