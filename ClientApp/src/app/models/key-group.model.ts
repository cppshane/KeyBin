import { KeyItem } from '../models/key-item.model';

export class KeyGroup {
  Id = "";
  Title = "";
  KeyGroupType: number;
  KeyItems: Array<KeyItem>;
}
