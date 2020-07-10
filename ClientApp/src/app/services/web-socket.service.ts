import { Injectable, isDevMode } from '@angular/core';
import { KeyCategory } from '../models/key-category.model';
import { WebSocketMessage } from '../models/web-socket-message';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private static socket: WebSocket;
  static clientId: string;
  static homeComponent;

  static startSocket() {
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
          WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "update_keycategory":
          if (webSocketMessage.ClientId !== WebSocketService.clientId)
            WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keycategory":
          WebSocketService.homeComponent.keyCategoryDatabaseDelete(webSocketMessage.KeyCategory);
          break;
        case "create_keygroup":
          WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keygroup":
          WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "create_keyitem":
          WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
        case "delete_keyitem":
          WebSocketService.homeComponent.keyCategoryDatabaseUpdate(webSocketMessage.KeyCategory);
          break;
      }
    }));

    WebSocketService.socket.addEventListener("open", (ev => {
      if (WebSocketService.homeComponent !== undefined)
        WebSocketService.homeComponent.updateUserLoginWebSocketState();
    }));

    WebSocketService.socket.addEventListener("close", (ev => {
      WebSocketService.startSocket();
    }));

    WebSocketService.socket.addEventListener("error", (ev => {
      var retryDelay = 5000;

      setTimeout(WebSocketService.startSocket, retryDelay);
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

    setTimeout(WebSocketService.keepAlive, timeout);
  }
}
