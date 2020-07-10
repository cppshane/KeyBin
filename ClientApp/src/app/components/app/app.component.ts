import { Component } from '@angular/core';
import { Guid } from "guid-typescript";
import { HttpService } from '../../services/http.service';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private httpService: HttpService) {
    const clientId = Guid.create().toString();
    this.httpService.clientId = clientId;
    WebSocketService.clientId = clientId;
  }
}
