using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Services
{
    public static class WebSocketConnectionsServiceExtensions
    {
        public static IServiceCollection AddWebSocketConnections(this IServiceCollection services)
        {
            services.AddSingleton<WebSocketConnectionsService>();
            services.AddSingleton<IWebSocketConnectionsService>(serviceProvider => serviceProvider.GetService<WebSocketConnectionsService>());

            return services;
        }
    }
}
