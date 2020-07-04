import { KeyCategory } from "./key-category.model";

export class WebSocketMessage {
  Type: string;
  ClientId: string;
  KeyCategory: KeyCategory;
}
