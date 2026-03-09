
$ErrorActionPreference = "Continue"


try {
  $rawInput = $input | Out-String
  if ([string]::IsNullOrWhiteSpace($rawInput)) {
    Write-Error "No input provided via stdin."
    Write-Host "Failure: No input provided via stdin."
    exit 1
  }
  $inputObj = $rawInput | ConvertFrom-Json

  $timestampMs = $inputObj.timestamp
  $cwd = $inputObj.cwd
  $prompt = $inputObj.prompt

  # Optional example redaction. Adjust to match your organization’s needs.
  $redactedPrompt = $prompt -replace 'ghp_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]'

  $logDir = ".github/hooks/logs"
  if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  }

  $logEntry = @{
    event       = "userPromptSubmitted"
    timestampMs = $timestampMs
    cwd         = $cwd
    prompt      = $redactedPrompt
    hostname    = $env:COMPUTERNAME
    username    = $env:USERNAME
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    timestamp   = (Get-Date -Format "o")
  } | ConvertTo-Json -Compress

  Add-Content -Path (Join-Path $logDir "audit.jsonl") -Value $logEntry
  Write-Host "Success: Prompt logged."
  exit 0
} catch {
  Write-Error $_
  Write-Host "Failure: $($_.Exception.Message)"
  exit 1
}
