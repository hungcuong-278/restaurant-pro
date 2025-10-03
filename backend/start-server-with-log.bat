@echo off
cd /d d:\First\backend
echo Starting server with logging...
npm run dev > server-output.log 2>&1
