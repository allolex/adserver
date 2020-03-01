const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoClient} = require('mongodb');

let database = null;

async function startDatabase() {
  const mongo = new MongoMemoryServer();
  const mongoDbUrl = await mongo.getConnectionString();
  const connection = await MongoClient.connect(
    mongoDbUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  database = connection.db();
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

module.exports = {
  getDatabase,
  startDatabase,
};
