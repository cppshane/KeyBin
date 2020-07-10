import { Injectable, isDevMode } from '@angular/core';
import { KeyCategory } from '../models/key-category.model';
import { WebSocketMessage } from '../models/web-socket-message';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private static socket: WebSocket;
  clientId: string;

  startSocket(homeComponent) {
    if (isDevMode())
      WebSocketService.socket = new WebSocket('wss://localhost:44313/ws', 'keybin-ws.json');
    else
      WebSocketService.socket = new WebSocket('wss://keybin.org/ws', 'keybin-ws.json');

    WebSocketService.socket.addEventListener("message", (ev => {
      if (ev.data === '')
        return;

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

    WebSocketService.keepAlive();
  }

  static sendMessage(message) {
    WebSocketService.socket.send(message);
  }

  static keepAlive() {
    var timeout = 20000;

    if (WebSocketService.socket.readyState === 1)
      WebSocketService.sendMessage('');

    setTimeout(this.keepAlive, timeout);
  }
}
