<#  smoke.ps1 — Smoke tests da API  http://localhost:5000
    Requisitos: API up (docker compose), PowerShell 5+  #>

$ErrorActionPreference = 'Stop'
$api = "http://localhost:5000"

function Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    ✔ $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "    ✖ $msg" -ForegroundColor Red }

function PostJson($url, $body) {
  return Invoke-RestMethod -Method POST -Uri $url -ContentType "application/json" -Body ($body | ConvertTo-Json -Depth 6)
}

try {
  Step "Health check"
  $health = Invoke-RestMethod "$api/health"
  if ($health.status -ne 'ok') { throw "Health != ok" }
  Ok "/health => ok"

  Step "Seed (se ALLOW_SEED=true no container)"
  try {
    $seed = Invoke-RestMethod -Method POST "$api/admin/seed"
    Ok "/admin/seed => $($seed.message) | created: users=$($seed.created.users), candidates=$($seed.created.candidates)"
  } catch {
    Write-Host "    (seed pulado/negado - provavelmente ALLOW_SEED=false)" -ForegroundColor Yellow
  }

  Step "Ping de blueprints (se existir)"
  try { $u = Invoke-RestMethod "$api/users/ping";       Ok "/users/ping => $($u.message)" }       catch { Write-Host "    (/users/ping indisponível)" -ForegroundColor Yellow }
  try { $c = Invoke-RestMethod "$api/candidates/ping";  Ok "/candidates/ping => $($c.message)" }  catch { Write-Host "    (/candidates/ping indisponível)" -ForegroundColor Yellow }

  # ---------------- USERS ----------------
  Step "Users - LIST"
  $usersBefore = Invoke-RestMethod "$api/users"
  Ok "GET /users => $($usersBefore.Count) registros"

  Step "Users - CREATE"
  $newUser = @{
    email      = "smoke_user@empresa.com"
    full_name  = "Smoke User"
    password   = "123456"
    role       = "viewer"
  }
  $createdUser = PostJson "$api/users" $newUser
  $uid = $createdUser.id
  Ok "POST /users => id=$uid email=$($createdUser.email)"

  Step "Users - GET by ID"
  $gotUser = Invoke-RestMethod "$api/users/$uid"
  Ok "GET /users/$uid => email=$($gotUser.email)"

  Step "Users - PATCH"
  $updUser = @{ full_name = "Smoke User Renamed"; language = "pt-BR" }
  $patched = Invoke-RestMethod -Method PATCH -Uri "$api/users/$uid" -ContentType "application/json" -Body ($updUser | ConvertTo-Json)
  Ok "PATCH /users/$uid => full_name=$($patched.full_name)"

  Step "Users - DELETE (soft)"
  $delUser = Invoke-RestMethod -Method DELETE "$api/users/$uid"
  Ok "DELETE /users/$uid => status=$($delUser.status)"

  # ---------------- CANDIDATES ----------------
  Step "Candidates - LIST"
  $candsBefore = Invoke-RestMethod "$api/candidates"
  Ok "GET /candidates => $($candsBefore.Count) registros"

  Step "Candidates - CREATE"
  $newCand = @{
    full_name        = "Smoke Candidato"
    email            = "smoke.cand@exemplo.com"
    position_applied = "Analista de Dados"
    experience_years = 2
    skills           = @("Python","SQL")
    source           = "Teste"
  }
  $createdCand = PostJson "$api/candidates" $newCand
  $cid = $createdCand.id
  Ok "POST /candidates => id=$cid email=$($createdCand.email)"

  Step "Candidates - GET by ID"
  $gotCand = Invoke-RestMethod "$api/candidates/$cid"
  Ok "GET /candidates/$cid => position=$($gotCand.position_applied)"

  Step "Candidates - PATCH (recalcula overall_score)"
  $updCand = @{ status = "entrevista"; technical_score = 8.1 }
  $patchedCand = Invoke-RestMethod -Method PATCH -Uri "$api/candidates/$cid" -ContentType "application/json" -Body ($updCand | ConvertTo-Json)
  Ok "PATCH /candidates/$cid => status=$($patchedCand.status) overall=$($patchedCand.overall_score)"

  Step "Candidates - DELETE (soft)"
  $delCand = Invoke-RestMethod -Method DELETE "$api/candidates/$cid"
  Ok "DELETE /candidates/$cid => status=$($delCand.status)"

  Step "Resumo final"
  $usersAfter = Invoke-RestMethod "$api/users"
  $candsAfter = Invoke-RestMethod "$api/candidates"
  Ok "Users ativos: $($usersAfter.Count) | Candidates ativos: $($candsAfter.Count)"
  Write-Host "`nSMOKE TESTS OK ✅" -ForegroundColor Green

} catch {
  Fail $_.Exception.Message
  Write-Host "SMOKE TESTS FALHARAM ❌" -ForegroundColor Red
  exit 1
}

