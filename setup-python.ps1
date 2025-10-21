Write-Host "🐍 Setting up Python environment..."

# Create virtual environment
python -m venv venv

# Activate environment
. .\venv\Scripts\Activate.ps1

# Upgrade pip
pip install --upgrade pip

# Install core dependencies
pip install requests flask pymongo python-dotenv

# Optional: install dev tools
pip install black pytest

Write-Host "✅ Python environment configured and ready."
