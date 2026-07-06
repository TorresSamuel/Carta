$ErrorActionPreference = "Stop"

$ProjectDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ProjectDir "..")).Path
$WatchPaths = @(
  $ProjectDir,
  (Join-Path $RepoRoot "netlify.toml")
)

$DebounceSeconds = 8
$LastChange = Get-Date
$Pending = $false

function Write-Status($Message) {
  $time = Get-Date -Format "HH:mm:ss"
  Write-Host "[$time] $Message"
}

function Invoke-Sync {
  Push-Location $RepoRoot
  try {
    $status = git status --short -- "pagina sm foods" "netlify.toml"

    if ([string]::IsNullOrWhiteSpace($status)) {
      Write-Status "No hay cambios para subir."
      return
    }

    git add "pagina sm foods" "netlify.toml"

    $staged = git diff --cached --name-only
    if ([string]::IsNullOrWhiteSpace($staged)) {
      Write-Status "No hay cambios preparados."
      return
    }

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto update SM Foods site $stamp"
    git push origin main
    Write-Status "Cambios subidos. Netlify deberia iniciar deploy automaticamente."
  }
  catch {
    Write-Status "No se pudo sincronizar: $($_.Exception.Message)"
  }
  finally {
    Pop-Location
  }
}

Write-Status "Sincronizador SM Foods iniciado."
Write-Status "Carpeta observada: $ProjectDir"
Write-Status "Guarda cambios normalmente. Se subiran a GitHub y Netlify despues de unos segundos."
Write-Status "Para detenerlo, cierra esta ventana."

$watchers = @()

foreach ($path in $WatchPaths) {
  if (Test-Path $path -PathType Container) {
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $path
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true
    $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'

    Register-ObjectEvent $watcher Changed -Action {
      $script:Pending = $true
      $script:LastChange = Get-Date
    } | Out-Null
    Register-ObjectEvent $watcher Created -Action {
      $script:Pending = $true
      $script:LastChange = Get-Date
    } | Out-Null
    Register-ObjectEvent $watcher Deleted -Action {
      $script:Pending = $true
      $script:LastChange = Get-Date
    } | Out-Null
    Register-ObjectEvent $watcher Renamed -Action {
      $script:Pending = $true
      $script:LastChange = Get-Date
    } | Out-Null

    $watchers += $watcher
  }
}

while ($true) {
  Start-Sleep -Seconds 2

  if ($Pending -and ((Get-Date) - $LastChange).TotalSeconds -ge $DebounceSeconds) {
    $Pending = $false
    Invoke-Sync
  }
}
