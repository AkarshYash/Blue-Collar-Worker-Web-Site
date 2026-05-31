@echo off
echo ==============================================
echo Cleaning up unwanted generator scripts...
echo ==============================================

del /Q "bluecollar-platform\pages\build_b64.py" 2>nul
del /Q "bluecollar-platform\pages\encode_html.py" 2>nul
del /Q "bluecollar-platform\pages\gen2.py" 2>nul
del /Q "bluecollar-platform\pages\gen_admin.py" 2>nul
del /Q "bluecollar-platform\pages\gen_final.py" 2>nul
del /Q "bluecollar-platform\pages\make_admin.py" 2>nul

echo Unwanted files removed!
echo.
echo Starting the app now...
call run_app.bat
