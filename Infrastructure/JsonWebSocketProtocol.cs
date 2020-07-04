using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin.Infrastructure
{
    public class JsonWebSocketProtocol : TextWebSocketSubprotocolBase, ITextWebSocketSubprotocol
    {
        public string SubProtocol => "keybin-ws.json";

        public override Task SendAsync(string message, int segmentSize, WebSocket webSocket, CancellationToken cancellationToken)
        {
            return base.SendAsync(message, segmentSize, webSocket, cancellationToken);
        }
    }
}
