using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin.Infrastructure
{
    public interface ITextWebSocketSubprotocol
    {
        string SubProtocol { get; }

        Task SendAsync(string message, int segmentSize, WebSocket webSocket, CancellationToken cancellationToken);

        string Read(string rawMessage);
    }
}
