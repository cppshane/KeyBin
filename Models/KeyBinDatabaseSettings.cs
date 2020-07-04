using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Models
{
    public class KeyBinDatabaseSettings : IKeyBinDatabaseSettings
    {
        public string KeyCategoriesCollectionName { get; set; }
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }

    public interface IKeyBinDatabaseSettings
    {
        string KeyCategoriesCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
