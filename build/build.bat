set SRC=%~dp0\..\..\ephemeris
set DST=%~dp0\ephemeris

mkdir "%DST%"
mkdir "%DST%\style"
mkdir "%DST%\js"
mkdir "%DST%\images"

copy "%SRC%\style" "%DST%\style"
copy "%SRC%\js" "%DST%\js"
copy "%SRC%\images" "%DST%\images"
copy "%SRC%\index.html" "%DST%\index.html"

del /Q /F /S *.orig
del /Q /F /S *.rej
del /Q "%DST%\js\aajs.js"
copy "%SRC%\js\aajs.js.nonoptimized" "%DST%\js\aajs.js"
del /Q /F /S *.mem
del /Q /F /S *.optimized
del /Q /F /S *.nonoptimized

7z a -y ephemeris.7z ephemeris

cd "%DST%"
del /F /Q /S *
cd ..
rd /S /Q "%DST%"

copy ephemeris.7z ..\zip\ephemeris.7z
del /Q /F /S *.7z
