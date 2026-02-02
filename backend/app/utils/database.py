from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    database = None

database = Database()

async def connect_to_mongo():
    try:
        # Default to localhost if MONGO_URL is not provided
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        # Use certifi bundle for TLS connections only when needed
        ca_file = certifi.where()

        use_tls = (
            mongo_url.startswith("mongodb+srv") or
            "tls=true" in mongo_url.lower() or
            "ssl=true" in mongo_url.lower()
        )

        if use_tls:
            database.client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                tlsCAFile=ca_file
            )
        else:
            database.client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
        database.database = database.client[os.getenv("DATABASE_NAME", "amniotic_fluid_db")]
        await database.client.admin.command('ping')
        print("[OK] Connected to MongoDB")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        print("[WARNING] App will start without database connection")
        database.client = None
        database.database = None

async def close_mongo_connection():
    if database.client:
        database.client.close()
        print("[OK] Disconnected from MongoDB")

def get_database():
    return database.database