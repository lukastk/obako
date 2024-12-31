import { Zettel } from '../zettel';

export abstract class Transient extends Zettel {
    static noteTypeStr = "transient";
    static noteTypeDisplayName = "Transient";
}
