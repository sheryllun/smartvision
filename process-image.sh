#!/bin/bash

echo "analyzing file $1"

filename=$(basename "$1")
ext="${filename##*.}"
if [[ $ext == "mp4" ]]; then
    echo ".mp4 file found, exiting"
    exit
fi

motionResult=$(node /home/pi/smartvision/labelize.js "$1")

if [[ $motionResult == "No match" ]]; then
    mv $1 /var/lib/motioneye/Camera1/false-positives
else
    node /home/pi/smartvision/send-notification.js "$1" "$motionResult"
fi

echo "completed analysis: $motionResult"