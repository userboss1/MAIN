import { MongoClient } from 'mongodb';

let db = null;

export async function connect(done) {
  const url = process.env.MONGO_URI;
  const dbName = 'POOLSYSTEM';

  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);
    done();
  } catch (err) {
    done(err);
  }
}

export function get() {
  return db;
}
