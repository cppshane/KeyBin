using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Models
{
    public class WebSocketMessage
    {
        public string Type { get; set; }

        public string ClientId { get; set; }

        public KeyCategory KeyCategory { get; set; }

        public WebSocketMessage(string type, string clientId, KeyCategory keyCategory)
        {
            this.Type = type;
            this.ClientId = clientId;
            this.KeyCategory = keyCategory;
        }

        public WebSocketMessage(string type, KeyCategory keyCategory)
        {
            this.Type = type;
            this.KeyCategory = keyCategory;
        }
    }
}
