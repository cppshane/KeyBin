using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Infrastructure
{
    public class WebSocketConnectionsOptions
    {
        public HashSet<string> AllowedOrigins { get; set; }

        public IList<ITextWebSocketSubprotocol> SupportedSubProtocols { get; set; }

        public ITextWebSocketSubprotocol DefaultSubProtocol { get; set; }

        public int? SendSegmentSize { get; set; }

        public int ReceivePayloadBufferSize { get; set; }

        public TimeSpan KeepAliveInterval { get; set; }

        public WebSocketConnectionsOptions()
        {
            KeepAliveInterval = TimeSpan.FromSeconds(120);
            ReceivePayloadBufferSize = 4 * 1024;
        }
    }
}
