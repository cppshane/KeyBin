using KeyBin.Infrastructure;
using KeyBin.Services;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin.Middlewares
{
    public class WebSocketConnectionsMiddleware
    {
        private GoogleAuthService _googleAuthService;
        private WebSocketConnectionsOptions _options;
        private IWebSocketConnectionsService _connectionsService;

        public WebSocketConnectionsMiddleware(RequestDelegate next, GoogleAuthService googleAuthService, WebSocketConnectionsOptions options, IWebSocketConnectionsService connectionsService)
        {
            _googleAuthService = googleAuthService ?? throw new ArgumentNullException(nameof(googleAuthService));
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _connectionsService = connectionsService ?? throw new ArgumentNullException(nameof(connectionsService));
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                if (ValidateOrigin(context))
                {
                    ITextWebSocketSubprotocol textSubProtocol = NegotiateSubProtocol(context.WebSockets.WebSocketRequestedProtocols);

                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync(textSubProtocol?.SubProtocol);

                    WebSocketConnection webSocketConnection = new WebSocketConnection(webSocket, _options.SendSegmentSize, textSubProtocol ?? _options.DefaultSubProtocol, _options.ReceivePayloadBufferSize);
                    webSocketConnection.ReceiveText += async (sender, message) => {
                        webSocketConnection.UserId = await _googleAuthService.GetUserId(message);
                    };

                    _connectionsService.AddConnection(webSocketConnection);

                    await webSocketConnection.ReceiveMessagesUntilCloseAsync();

                    if (webSocketConnection.CloseStatus.HasValue)
                    {
                        await webSocket.CloseAsync(webSocketConnection.CloseStatus.Value, webSocketConnection.CloseStatusDescription, CancellationToken.None);
                    }

                    _connectionsService.RemoveConnection(webSocketConnection.Id);
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                }
            }
            else
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private bool ValidateOrigin(HttpContext context)
        {
            return (_options.AllowedOrigins == null) || (_options.AllowedOrigins.Count == 0) || (_options.AllowedOrigins.Contains(context.Request.Headers["Origin"].ToString()));
        }

        private ITextWebSocketSubprotocol NegotiateSubProtocol(IList<string> requestedSubProtocols)
        {
            ITextWebSocketSubprotocol subProtocol = null;

            foreach (ITextWebSocketSubprotocol supportedSubProtocol in _options.SupportedSubProtocols)
            {
                if (requestedSubProtocols.Contains(supportedSubProtocol.SubProtocol))
                {
                    subProtocol = supportedSubProtocol;
                    break;
                }
            }

            return subProtocol;
        }
    }
}
