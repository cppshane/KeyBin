using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin.Infrastructure
{
    public class WebSocketConnection
    {
        private WebSocket _webSocket;
        private ITextWebSocketSubprotocol _textSubProtocol;
        private int _receivePayloadBufferSize;
        private int _segmentSize;

        public string UserId { get; set; }

        public Guid Id { get; } = Guid.NewGuid();

        public WebSocketCloseStatus? CloseStatus { get; private set; } = null;

        public string CloseStatusDescription { get; private set; } = null;

        public event EventHandler<string> ReceiveText;

        public WebSocketConnection(WebSocket webSocket, int? segmentSize, ITextWebSocketSubprotocol textSubProtocol, int receivePayloadBufferSize)
        {
            _webSocket = webSocket ?? throw new ArgumentNullException(nameof(webSocket));
            _segmentSize = segmentSize ?? throw new ArgumentNullException(nameof(segmentSize));
            _textSubProtocol = textSubProtocol ?? throw new ArgumentNullException(nameof(textSubProtocol));
            _receivePayloadBufferSize = receivePayloadBufferSize;
        }

        public Task SendAsync(string message, CancellationToken cancellationToken)
        {
            return _textSubProtocol.SendAsync(message, _segmentSize, _webSocket, cancellationToken);
        }

        public async Task ReceiveMessagesUntilCloseAsync()
        {
            try
            {
                byte[] receivePayloadBuffer = new byte[_receivePayloadBufferSize];
                WebSocketReceiveResult webSocketReceiveResult = await _webSocket.ReceiveAsync(new ArraySegment<byte>(receivePayloadBuffer), CancellationToken.None);
                while (webSocketReceiveResult.MessageType != WebSocketMessageType.Close)
                {
                    string webSocketMessage = Encoding.ASCII.GetString(receivePayloadBuffer.Take(webSocketReceiveResult.Count).ToArray());
                    OnReceiveText(webSocketMessage);

                    webSocketReceiveResult = await _webSocket.ReceiveAsync(new ArraySegment<byte>(receivePayloadBuffer), CancellationToken.None);
                }

                CloseStatus = webSocketReceiveResult.CloseStatus.Value;
                CloseStatusDescription = webSocketReceiveResult.CloseStatusDescription;
            }
            catch (WebSocketException wsex) when (wsex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely)
            { }
        }

        private void OnReceiveText(string webSocketMessage)
        {
            string message = _textSubProtocol.Read(webSocketMessage);

            ReceiveText?.Invoke(this, message);
        }
    }
}
