# PowerShell script to test API key functionality
$baseUrl = "http://localhost:8080"

Write-Host "Testing health endpoint..." -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Health check successful:" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nTesting API keys list..." -ForegroundColor Green
try {
    $keysResponse = Invoke-RestMethod -Uri "$baseUrl/api/api-keys" -Method GET
    Write-Host "API keys list successful:" -ForegroundColor Green
    $keysResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "API keys list failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting API key creation..." -ForegroundColor Green
$newKeyData = @{
    name = "Test Key"
    accessType = "limited"
    createdBy = "test-user"
} | ConvertTo-Json

try {
    $newKeyResponse = Invoke-RestMethod -Uri "$baseUrl/api/api-keys" -Method POST -Body $newKeyData -ContentType "application/json"
    Write-Host "API key creation successful:" -ForegroundColor Green
    $newKeyResponse | ConvertTo-Json -Depth 2
    
    if ($newKeyResponse.clientId -and $newKeyResponse.clientSecret) {
        Write-Host "`nTesting API call with new credentials..." -ForegroundColor Green
        $apiKey = "$($newKeyResponse.clientId):$($newKeyResponse.clientSecret)"
        
        try {
            $headers = @{ "x-api-key" = $apiKey }
            $occurrencesResponse = Invoke-RestMethod -Uri "$baseUrl/api/occurrences" -Method GET -Headers $headers
            Write-Host "API call with new key successful!" -ForegroundColor Green
            Write-Host "Found $($occurrencesResponse.Count) occurrences" -ForegroundColor Cyan
        } catch {
            Write-Host "API call failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "API key creation failed: $($_.Exception.Message)" -ForegroundColor Red
}
