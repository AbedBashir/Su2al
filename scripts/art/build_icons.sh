#!/bin/bash
# Renders every app icon from mark.js with headless Chrome. Run from anywhere.
cd "$(dirname "$0")"; A=../../assets; CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
r(){ "$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --default-background-color=00000000 --virtual-time-budget=2000 --window-size=1024,1024 --screenshot="$3" "file://$PWD/render.html?mode=$1&size=1024" 2>/dev/null; sips -Z $2 "$3" >/dev/null; }
r full 1024 $A/icon.png
# iOS rejects icons with an alpha channel: round-trip through JPEG to drop it.
sips -s format jpeg -s formatOptions 100 $A/icon.png --out /tmp/su2al_icon.jpg >/dev/null && sips -s format png /tmp/su2al_icon.jpg --out $A/icon.png >/dev/null
r bg 512 $A/android-icon-background.png
r fg 512 $A/android-icon-foreground.png
r mono 432 $A/android-icon-monochrome.png
r splash 1024 $A/splash-icon.png
r full 48 $A/favicon.png
mkdir -p ../../store && r full 512 ../../store/play-icon-512.png
