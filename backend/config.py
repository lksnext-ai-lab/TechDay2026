import os
from dotenv import load_dotenv

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Mattin AI Configuration
MATTIN_URL = os.getenv("MATTIN_URL", "https://aict-desa.lksnext.com")
API_KEY = os.getenv("API_KEY")

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
