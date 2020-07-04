using KeyBin.Infrastructure;
using KeyBin.Middlewares;
using KeyBin.Models;
using KeyBin.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace KeyBin
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddWebSocketConnections();

            services.Configure<KeyBinDatabaseSettings>(
                Configuration.GetSection(nameof(KeyBinDatabaseSettings)));

            services.AddSingleton<IKeyBinDatabaseSettings>(sp =>
                sp.GetRequiredService<IOptions<KeyBinDatabaseSettings>>().Value);

            services.AddSingleton<KeyCategoryService>();
            services.AddSingleton<GoogleAuthService>();

            services.AddControllersWithViews()
                .AddNewtonsoftJson(options => options.UseMemberCasing());

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            ITextWebSocketSubprotocol textWebSocketSubprotocol = new JsonWebSocketProtocol();
            WebSocketConnectionsOptions webSocketConnectionsOptions = new WebSocketConnectionsOptions
            {
                SupportedSubProtocols = new List<ITextWebSocketSubprotocol>
                {
                    textWebSocketSubprotocol
                },
                DefaultSubProtocol = textWebSocketSubprotocol,
                SendSegmentSize = 4 * 1024
            };

            app.UseWebSockets();
            app.MapWebSocketConnections("/ws", webSocketConnectionsOptions);

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
