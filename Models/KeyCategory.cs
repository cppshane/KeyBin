using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KeyBin.Models
{
    public class KeyCategory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Index")]
        public int Index { get; set; }

        [BsonElement("UserId")]
        public string UserId { get; set; }

        [BsonElement("Title")]
        public string Title { get; set; }

        [BsonElement("KeyGroups")]
        public IEnumerable<KeyGroup> KeyGroups { get; set; }
    }
}
