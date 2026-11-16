@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title ClassiQuiz 2.0.9 - Inicializador

echo.
echo ==========================================
echo             CLASSIQUIZ 2.0.9
echo ==========================================
echo.

if not exist "index.html" (
    echo ERRO: nao achei o arquivo index.html.
    echo Extraia o ZIP inteiro antes de abrir este .bat.
    echo O .bat deve estar na mesma pasta do index.html.
    echo.
    pause
    exit /b 1
)

rem Primeiro usa o PowerShell que ja acompanha o Windows 10/11.
where powershell.exe >nul 2>&1
if not errorlevel 1 (
    echo Iniciando servidor local com PowerShell...
    powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher.ps1"
    if not errorlevel 1 goto :fim
    echo.
    echo PowerShell nao conseguiu iniciar o servidor.
)

rem Alternativa: Python instalado no computador.
where py.exe >nul 2>&1
if not errorlevel 1 (
    py.exe -3 -c "import http.server" >nul 2>&1
    if not errorlevel 1 (
        echo Tentando Python...
        py.exe -3 "%~dp0launcher.py"
        if not errorlevel 1 goto :fim
    )
)
where python.exe >nul 2>&1
if not errorlevel 1 (
    python.exe -c "import http.server" >nul 2>&1
    if not errorlevel 1 (
        echo Tentando Python...
        python.exe "%~dp0launcher.py"
        if not errorlevel 1 goto :fim
    )
)

rem Alternativa: Node.js instalado no computador.
where node.exe >nul 2>&1
if not errorlevel 1 (
    echo Tentando Node.js...
    node.exe "%~dp0launcher.js"
    if not errorlevel 1 goto :fim
)

rem Ultima alternativa: HTML direto, sem servidor.
echo.
echo Abrindo ClassiQuiz diretamente no navegador...
echo AVISO: sem servidor, o salvamento pode variar entre navegadores.
start "" "%~dp0index.html"
if errorlevel 1 (
    echo ERRO: nao consegui abrir o navegador.
    echo Abra o arquivo index.html manualmente.
)
echo.
echo Pressione uma tecla para fechar esta janela.
pause >nul

:fim
endlocal
