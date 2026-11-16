# ClassiQuiz - servidor local para Windows PowerShell 5.1+
# Usa somente recursos que ja acompanham o Windows.
$ErrorActionPreference = 'Stop'
$port = 8765
$hostAddress = '127.0.0.1'
$url = "http://${hostAddress}:${port}/"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $root.TrimEnd([char[]]@('\','/')) + [System.IO.Path]::DirectorySeparatorChar

function Send-Response($stream, [int]$status, [string]$contentType, [byte[]]$body) {
    $reason = switch ($status) { 200 { 'OK' } 403 { 'Forbidden' } 404 { 'Not Found' } default { 'Error' } }
    $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`n`r`n"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($bytes, 0, $bytes.Length)
    if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

function Error-Body([string]$message) {
    return [System.Text.Encoding]::UTF8.GetBytes($message)
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($hostAddress), $port)
try {
    $listener.Start()
} catch {
    try {
        $client = New-Object System.Net.WebClient
        $client.Encoding = [System.Text.Encoding]::UTF8
        $client.Headers.Add('Cache-Control', 'no-cache')
        $page = $client.DownloadString($url)
        $client.Dispose()
        if ($page.Contains('ClassiQuiz')) {
            Write-Host 'O ClassiQuiz ja esta aberto. Abrindo outra aba...'
            Start-Process $url
            exit 0
        }
    } catch { }
    Write-Host "ERRO: A porta local $port esta ocupada por outro programa." -ForegroundColor Red
    Write-Host 'Feche o programa que usa essa porta e tente novamente.'
    exit 1
}

Write-Host ''
Write-Host '=========================================='
Write-Host '            CLASSIQUIZ 2.0.8'
Write-Host '=========================================='
Write-Host "Jogo disponivel em: $url"
Write-Host 'Deixe esta janela aberta enquanto joga.'
Write-Host 'Para encerrar o servidor: feche esta janela.'
Write-Host ''
try {
    try { Start-Process $url } catch {
        Write-Host 'Nao consegui abrir automaticamente o navegador.' -ForegroundColor Yellow
        Write-Host "Abra manualmente: $url"
    }
    while ($true) {
        $connection = $listener.AcceptTcpClient()
        try {
            $connection.ReceiveTimeout = 8000
            $connection.SendTimeout = 8000
            $stream = $connection.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
            $request = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($request)) { continue }
            while ($true) {
                $line = $reader.ReadLine()
                if ($null -eq $line -or $line -eq '') { break }
            }
            $parts = $request.Split(' ')
            if ($parts.Length -lt 2 -or ($parts[0] -ne 'GET' -and $parts[0] -ne 'HEAD')) {
                Send-Response $stream 403 'text/plain; charset=utf-8' (Error-Body 'Metodo nao permitido')
                continue
            }
            $urlPath = ($parts[1] -split '\?', 2)[0]
            $decoded = [System.Uri]::UnescapeDataString($urlPath)
            if ($decoded -eq '/') { $decoded = '/index.html' }
            $relative = $decoded.TrimStart([char]'/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $fullPath = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
            if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Response $stream 403 'text/plain; charset=utf-8' (Error-Body 'Acesso negado')
                continue
            }
            if (-not [System.IO.File]::Exists($fullPath)) {
                Send-Response $stream 404 'text/plain; charset=utf-8' (Error-Body 'Arquivo nao encontrado')
                continue
            }
            $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
            $mime = switch ($extension) {
                '.html' { 'text/html; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.svg' { 'image/svg+xml' }
                '.ttf' { 'font/ttf' }
                '.woff' { 'font/woff' }
                '.woff2' { 'font/woff2' }
                '.png' { 'image/png' }
                '.gif' { 'image/gif' }
                '.jpg' { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.webp' { 'image/webp' }
                '.ico' { 'image/x-icon' }
                '.txt' { 'text/plain; charset=utf-8' }
                default { 'application/octet-stream' }
            }
            $body = [System.IO.File]::ReadAllBytes($fullPath)
            if ($parts[0] -eq 'HEAD') { $body = [byte[]]@() }
            Send-Response $stream 200 $mime $body
        } catch {
            Write-Host "Aviso: falha ao atender requisicao: $($_.Exception.Message)" -ForegroundColor DarkYellow
        } finally {
            if ($null -ne $connection) { $connection.Close() }
        }
    }
} finally {
    $listener.Stop()
}
