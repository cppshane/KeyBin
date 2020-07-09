using Google.Apis.Auth;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static Google.Apis.Auth.JsonWebToken;

namespace KeyBin.Services
{
    public class GoogleAuthService
    {
        private readonly ConcurrentDictionary<string, Payload> _authTokens = new ConcurrentDictionary<string, Payload>();

        public GoogleAuthService()
        {
            ExpiredTokenCleaner();
        }

        public async Task<string> GetUserId(string idToken)
        {
            Payload payload;

            if (_authTokens.TryGetValue(idToken, out payload))
            {
                if (!TokenExpired(payload))
                    return payload.Subject;

                _authTokens.Remove(idToken, out _);
                return null;
            }
            else
            {
                try
                {
                    payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

                    _authTokens.TryAdd(payload.Subject, payload);

                    return payload.Subject;
                }
                catch (InvalidJwtException e)
                {
                    return null;
                }
            }            
        }

        private bool TokenExpired(Payload payload)
        {
            return payload.ExpirationTimeSeconds > GetCurrentUnixTimestamp();
        }

        private long GetCurrentUnixTimestamp()
        {
            return (long)(DateTime.UtcNow.Subtract(DateTime.UnixEpoch)).TotalSeconds;
        }

        private async Task ExpiredTokenCleaner()
        {
            while (true)
            {
                foreach (KeyValuePair<string, Payload> entry in _authTokens)
                {
                    if (TokenExpired(entry.Value))
                    {
                        _authTokens.Remove(entry.Key, out _);
                    }
                }

                await Task.Delay(10000000);
            }
        }
    }
}
