import { Injectable, isDevMode } from '@angular/core';
import { KeyCategory } from '../models/key-category.model';
import { WebSocketMessage } from '../models/web-socket-message';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: WebSocket;
  clientId: string;

  startSocket(homeComponent) {
    if (isDevMode())
      this.socket = new WebSocket('wss://localhost:44313/ws', 'keybin-ws.json');
    else
      this.socket = new WebSocket('wss://keybin.org/ws', 'keybin-ws.json');

    this.socket.addEventListener("message", (ev => {
      const webSocketMessage: WebSocketMessage = JSON.parse(ev.data);

      switch (webSocketMessage.Type) {
        case "create_keycategory":
          homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "update_keycategory":
          if (webSocketMessage.ClientId !== this.clientId)
            homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keycategory":
          homeComponent.keyCategoryDatabaseDelete(webSocketMessage.KeyCategory);
          break;
        case "create_keygroup":
          homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keygroup":
          homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "create_keyitem":
          homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keyitem":
          homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        
      }
      
    }));
  }

  sendMessage(message) {
    this.socket.send(message);
  }
}
