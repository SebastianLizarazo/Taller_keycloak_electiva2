# Script para verificar el estado de Oracle

Write-Host "Verificando estado de Oracle Database..." -ForegroundColor Cyan

# 1. Verificar que el contenedor esté corriendo
Write-Host "`n1. Estado del contenedor:" -ForegroundColor Yellow
docker ps --filter name=estudiantes_oracle_db --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Verificar el listener
Write-Host "`n2. Estado del Listener:" -ForegroundColor Yellow
docker exec estudiantes_oracle_db lsnrctl status | Select-String "Service|XEPDB1|XE"

# 3. Verificar que la PDB esté abierta
Write-Host "`n3. Estado de las Pluggable Databases:" -ForegroundColor Yellow
$checkPDB = @'
SELECT name, open_mode FROM v$pdbs;
EXIT;
'@

$checkPDB | docker exec -i estudiantes_oracle_db sqlplus -s sys/OraclePass2024@XE as sysdba

# 4. Intentar abrir la PDB si está cerrada
Write-Host "`n4. Abriendo XEPDB1 (si es necesario):" -ForegroundColor Yellow
$openPDB = @'
ALTER PLUGGABLE DATABASE XEPDB1 OPEN;
EXIT;
'@

$openPDB | docker exec -i estudiantes_oracle_db sqlplus -s sys/OraclePass2024@XE as sysdba 2>&1 | Out-Null

# 5. Verificar conexión como usuario de aplicación
Write-Host "`n5. Probando conexion como estudiantes_app:" -ForegroundColor Yellow
$testConnection = @'
SELECT 'Conexion exitosa' AS resultado FROM DUAL;
EXIT;
'@

$testConnection | docker exec -i estudiantes_oracle_db sqlplus -s estudiantes_app/estudiantes_pass_2024@XEPDB1

Write-Host "`n[OK] Verificacion completada" -ForegroundColor Green
