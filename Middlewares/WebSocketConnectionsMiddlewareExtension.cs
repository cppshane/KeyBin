using KeyBin.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Middlewares
{
    public static class WebSocketConnectionsMiddlewareExtension
    {
        public static IApplicationBuilder MapWebSocketConnections(this IApplicationBuilder app, PathString pathMatch, WebSocketConnectionsOptions options)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            return app.Map(pathMatch, branchedApp => branchedApp.UseMiddleware<WebSocketConnectionsMiddleware>(options));
        }
    }
}
