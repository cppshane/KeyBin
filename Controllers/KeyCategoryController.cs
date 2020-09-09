using KeyBin.Models;
using KeyBin.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Threading;
using MongoDB.Bson;

namespace KeyBin.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class KeyCategoryController : ControllerBase
    {
        private readonly KeyCategoryService _keyCategoryService;
        private readonly WebSocketConnectionsService _webSocketConnectionsService;
        private readonly GoogleAuthService _googleAuthService;

        public KeyCategoryController(KeyCategoryService keyCategoryService, WebSocketConnectionsService webSocketConnectionsService, GoogleAuthService googleAuthService)
        {
            _keyCategoryService = keyCategoryService;
            _webSocketConnectionsService = webSocketConnectionsService;
            _googleAuthService = googleAuthService;
        }

        [HttpGet("GetKeyCategories")]
        public async Task<ActionResult<List<KeyCategory>>> GetKeyCategories(string idToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            return _keyCategoryService.GetKeyCategories(userId);
        }

        [HttpPost("CreateKeyCategory")]
        public async Task<IActionResult> CreateKeyCategory(string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = new KeyCategory();
            keyCategory.Id = ObjectId.GenerateNewId().ToString();
            keyCategory.UserId = userId;
            keyCategory.Title = "New Category";
            keyCategory.KeyGroups = new List<KeyGroup>();

            _keyCategoryService.CreateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("create_keycategory", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpPut("UpdateKeyCategory")]
        public async Task<IActionResult> Update(string clientId, string idToken, [FromBody] KeyCategory keyCategory, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategoryRes = _keyCategoryService.GetKeyCategory(keyCategory.Id);

            if (keyCategoryRes == null)
                return NotFound();

            if (!keyCategoryRes.UserId.Equals(userId))
                return ValidationProblem();

            _keyCategoryService.UpdateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("update_keycategory", clientId, keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpDelete("DeleteKeyCategory")]
        public async Task<IActionResult> DeleteKeyCategory(string keyCategoryId, string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = _keyCategoryService.GetKeyCategory(keyCategoryId);

            if (keyCategory == null)
                return NotFound();

            if (keyCategory.UserId != userId)
                return ValidationProblem();

            _keyCategoryService.RemoveKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("delete_keycategory", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpPost("CreateKeyGroup")]
        public async Task<IActionResult> CreateKeyGroup(string keyCategoryId, KeyGroupType keyGroupType, int keyGroupIndex, string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = _keyCategoryService.GetKeyCategory(keyCategoryId);

            if (keyCategory == null)
                return NotFound();

            if (!keyCategory.UserId.Equals(userId))
                return ValidationProblem();

            if (keyCategory.KeyGroups == null)
                keyCategory.KeyGroups = new List<KeyGroup>();

            KeyGroup keyGroup = new KeyGroup();
            keyGroup.Id = ObjectId.GenerateNewId().ToString();
            keyGroup.KeyGroupType = keyGroupType;
            keyGroup.KeyItems = new List<KeyItem>();

            if (keyGroup.KeyGroupType == KeyGroupType.Key)
                keyGroup.Title = "New Key Group";
            else if (keyGroup.KeyGroupType == KeyGroupType.Command)
                keyGroup.Title = "New Command Group";

            if (keyCategory.KeyGroups.Count() > keyGroupIndex && keyGroupIndex != -1)
            {
                List<KeyGroup> newKeyGroupList = keyCategory.KeyGroups.ToList();
                newKeyGroupList.Insert(keyGroupIndex, keyGroup);

                keyCategory.KeyGroups = newKeyGroupList;
            }
            else
            {
                keyCategory.KeyGroups = keyCategory.KeyGroups.Append(keyGroup);
            }

            _keyCategoryService.UpdateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("create_keygroup", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpDelete("DeleteKeyGroup")]
        public async Task<IActionResult> DeleteKeyGroup(string keyCategoryId, string keyGroupId, string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = _keyCategoryService.GetKeyCategory(keyCategoryId);

            if (keyCategory == null)
                return NotFound();

            if (keyCategory.UserId != userId)
                return ValidationProblem();

            List<KeyGroup> keyGroups = keyCategory.KeyGroups.ToList();

            int keyGroupIndex = keyGroups.FindIndex(keyGroup => keyGroup.Id.Equals(keyGroupId));

            if (keyGroupIndex == -1)
                return NotFound();

            keyGroups.RemoveAt(keyGroupIndex);

            keyCategory.KeyGroups = keyGroups;

            _keyCategoryService.UpdateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("delete_keygroup", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpPost("CreateKeyItem")]
        public async Task<IActionResult> CreateKeyItem(string keyCategoryId, string keyGroupId, int keyItemIndex, string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = _keyCategoryService.GetKeyCategory(keyCategoryId);

            if (keyCategory == null)
                return NotFound();

            if (!keyCategory.UserId.Equals(userId))
                return ValidationProblem();

            KeyGroup keyGroup = keyCategory.KeyGroups.ToList().Find(keyGroup => keyGroup.Id.Equals(keyGroupId));

            if (keyGroup == null)
                return NotFound();

            if (keyGroup.KeyItems == null)
                keyGroup.KeyItems = new List<KeyItem>();

            KeyItem keyItem = new KeyItem();
            keyItem.Id = ObjectId.GenerateNewId().ToString();
            keyItem.Content = "";
            keyItem.Description = "";

            if (keyItemIndex != -1)
            {
                List<KeyItem> newKeyItemList = keyGroup.KeyItems.ToList();
                newKeyItemList.Insert(keyItemIndex, keyItem);

                keyGroup.KeyItems = newKeyItemList;
            }
            else
            {
                keyGroup.KeyItems = keyGroup.KeyItems.Append(keyItem);
            }

            _keyCategoryService.UpdateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("create_keyitem", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }

        [HttpDelete("DeleteKeyItem")]
        public async Task<IActionResult> DeleteKeyItem(string keyCategoryId, string keyGroupId, string keyItemId, string idToken, CancellationToken cancellationToken)
        {
            string userId = await _googleAuthService.GetUserId(idToken);

            if (userId == null)
                return ValidationProblem();

            KeyCategory keyCategory = _keyCategoryService.GetKeyCategory(keyCategoryId);

            if (keyCategory == null)
                return NotFound();

            if (keyCategory.UserId != userId)
                return ValidationProblem();

            List<KeyGroup> keyGroups = keyCategory.KeyGroups.ToList();

            int keyGroupIndex = keyGroups.FindIndex(keyGroup => keyGroup.Id.Equals(keyGroupId));

            if (keyGroupIndex == -1)
                return NotFound();

            List<KeyItem> keyItems = keyGroups[keyGroupIndex].KeyItems.ToList();

            int keyItemIndex = keyItems.FindIndex(keyItem => keyItem.Id.Equals(keyItemId));

            if (keyItemIndex == -1)
                return NotFound();

            keyItems.RemoveAt(keyItemIndex);

            keyGroups[keyGroupIndex].KeyItems = keyItems;

            keyCategory.KeyGroups = keyGroups;

            _keyCategoryService.UpdateKeyCategory(keyCategory);

            await _webSocketConnectionsService.SendToAllAsync(JsonConvert.SerializeObject(new WebSocketMessage("delete_keyitem", keyCategory)), keyCategory.UserId, cancellationToken);

            return NoContent();
        }
    }
}