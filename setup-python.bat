@echo off
echo 🐍 Setting up Python environment...

REM Create virtual environment
python -m venv venv

REM Activate environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install core dependencies
pip install requests flask pymongo python-dotenv

REM Optional: install dev tools
pip install black pytest

echo ✅ Python environment configured and ready.
pause
