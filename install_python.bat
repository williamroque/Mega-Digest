powershell -command "(New-Object Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.7.4/python-3.7.4.exe', 'C:/Tools/python-3.7.4.exe'); & c:\Tools\python-3.7.4.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0 TargetDir=c:\Tools\Python374; [Environment]::SetEnvironmentVariable('PATH', ${env:path} + ';C:\Tools\Python374', 'Machine')"
