@echo off
echo Starting HTTP server...
echo Open your browser to: http://localhost:3000/curio-h5.html
cd /d "c:\Users\t-yixinxia\figma mcp test"
python -m http.server 3000
pause
