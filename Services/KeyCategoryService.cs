using KeyBin.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Services
{
    public class KeyCategoryService
    {
        private readonly IMongoCollection<KeyCategory> _keyCategories;

        public KeyCategoryService(IKeyBinDatabaseSettings settings)
        {
            _keyCategories = new MongoClient(settings.ConnectionString)
                .GetDatabase(settings.DatabaseName)
                .GetCollection<KeyCategory>(settings.KeyCategoriesCollectionName);
        }

        public KeyCategory GetKeyCategory(string keyCategoryId)
        {
            return _keyCategories.Find<KeyCategory>(keyCategory => keyCategory.Id.Equals(keyCategoryId)).FirstOrDefault();
        }

        public List<KeyCategory> GetKeyCategories(string userId)
        {
            return _keyCategories.Find(keyCategory => keyCategory.UserId.Equals(userId)).ToList();
        }

        public void CreateKeyCategory(KeyCategory keyCategory)
        {
            _keyCategories.InsertOne(keyCategory);
        }

        public void UpdateKeyCategory(KeyCategory keyCategory)
        {
            _keyCategories.ReplaceOne(keyCategoryIndex => keyCategoryIndex.Id.Equals(keyCategory.Id), keyCategory);
        }

        public void RemoveKeyCategory(KeyCategory keyCategory)
        {
            _keyCategories.DeleteOne(keyCategoryIndex => keyCategoryIndex.Id.Equals(keyCategory.Id));
        }
    }
}
