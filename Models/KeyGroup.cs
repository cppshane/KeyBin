using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Models
{
    public class KeyGroup
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Title")]
        public string Title { get; set; }

        [BsonElement("KeyGroupType")]
        public KeyGroupType KeyGroupType { get; set; }

        [BsonElement("KeyItems")]
        public IEnumerable<KeyItem> KeyItems { get; set; }
    }

    public enum KeyGroupType
    {
        Key = 0,
        Command = 1
    }
}
