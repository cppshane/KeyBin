using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin.Infrastructure
{
    public abstract class TextWebSocketSubprotocolBase
    {
        public virtual Task SendAsync(string message, int segmentSize, WebSocket webSocket, CancellationToken cancellationToken)
        {
            byte[] messageBytes = Encoding.ASCII.GetBytes(message);

            return SendAsync(webSocket, messageBytes, segmentSize, WebSocketMessageType.Text, cancellationToken);
        }

        public virtual string Read(string webSocketMessage)
        {
            return webSocketMessage;
        }

        private async Task SendAsync(WebSocket webSocket, byte[] message, int sendSegmentSize, WebSocketMessageType messageType, CancellationToken cancellationToken)
        {
            if (webSocket.State == WebSocketState.Open)
            {
                if (sendSegmentSize < message.Length)
                {
                    int messageOffset = 0;
                    int messageBytesToSend = message.Length;

                    while (messageBytesToSend > 0)
                    {
                        int messageSegmentSize = Math.Min(sendSegmentSize, messageBytesToSend);
                        ArraySegment<byte> messageSegment = new ArraySegment<byte>(message, messageOffset, messageSegmentSize);

                        messageOffset += messageSegmentSize;
                        messageBytesToSend -= messageSegmentSize;

                        await webSocket.SendAsync(messageSegment, messageType, (messageBytesToSend == 0), cancellationToken);
                    }
                }
                else
                {
                    ArraySegment<byte> messageSegment = new ArraySegment<byte>(message, 0, message.Length);

                    await webSocket.SendAsync(messageSegment, messageType, true, cancellationToken);
                }
            }
        }
    }
}
