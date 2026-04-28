@echo off
setlocal

set "BASE_DIR=%~dp0"
set "WRAPPER_PROPS=%BASE_DIR%.mvn\wrapper\maven-wrapper.properties"

if not exist "%WRAPPER_PROPS%" (
  echo Missing %WRAPPER_PROPS%
  exit /b 1
)

for /f "tokens=1,* delims==" %%A in (%WRAPPER_PROPS%) do (
  if "%%A"=="distributionUrl" set "DISTRIBUTION_URL=%%B"
)

if "%DISTRIBUTION_URL%"=="" (
  echo distributionUrl is not configured
  exit /b 1
)

if "%MAVEN_USER_HOME%"=="" set "MAVEN_USER_HOME=%USERPROFILE%\.m2"
set "WRAPPER_DIR=%MAVEN_USER_HOME%\wrapper\dists"

for %%F in ("%DISTRIBUTION_URL%") do set "ARCHIVE_NAME=%%~nxF"
set "DIST_NAME=%ARCHIVE_NAME:-bin.zip=%"
set "ARCHIVE_PATH=%WRAPPER_DIR%\%ARCHIVE_NAME%"
set "INSTALL_DIR=%WRAPPER_DIR%\%DIST_NAME%"

if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"

if not exist "%INSTALL_DIR%\bin\mvn.cmd" (
  if not exist "%ARCHIVE_PATH%" (
    echo Downloading Maven from %DISTRIBUTION_URL%
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%ARCHIVE_PATH%'"
    if errorlevel 1 exit /b 1
  )

  if exist "%INSTALL_DIR%.tmp" rmdir /s /q "%INSTALL_DIR%.tmp"
  mkdir "%INSTALL_DIR%.tmp"

  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Expand-Archive -Path '%ARCHIVE_PATH%' -DestinationPath '%INSTALL_DIR%.tmp' -Force"
  if errorlevel 1 exit /b 1

  for /d %%D in ("%INSTALL_DIR%.tmp\*") do (
    move "%%~fD" "%INSTALL_DIR%" >nul
    goto :done_extract
  )

  echo Failed to extract Maven archive
  exit /b 1
)

:done_extract
"%INSTALL_DIR%\bin\mvn.cmd" %*
endlocal
