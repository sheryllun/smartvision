#!/bin/bash

# define morning/night start (24 hour clock)
# optionally you can pass them as params
morning=${1:-7:00}
night=${2:-1:00}

# if this is reachable the LAN is working
router_ip=xxx.xxx.x.x

# if any of these IPs are reachable, someone is home
declare -A phones
phones[sb]=xxx.xxx.x.xx
phones[pb]=xxx.xxx.x.xx

# only run if LAN is up
ping -c 1 "$router_ip" &>/dev/null || exit 0

# check for phones
phones_present=""
for phone in "${!phones[@]}"; do
  if ping -c 4 "${phones[$phone]}" &>/dev/null; then
    phones_present="$phones_present $phone" 
  fi
done

time_in_minutes() {
  local hour=${1%:*}
  local mins=${1#*:}
  echo $(( ${hour#0} * 60 + ${mins#0} ))
}

# check for time of day
isDaytime() {
  current_time=$(time_in_minutes "$(date '+%H:%M')")
  morning_time=$(time_in_minutes "$morning")
  night_time=$(time_in_minutes "$night")
  if (( morning_time < night_time )); then
    # when night time is defined as before midnight
    (( current_time >= morning_time && current_time < night_time ))
  else
    # when night time is defined as after midnight
    (( current_time >= morning_time || current_time < night_time ))
  fi
}

motionEyeStatus=off
if systemctl -q is-active motioneye.service; then
  motionEyeStatus=on
fi

if [[ -n $phones_present ]] && isDaytime; then
  echo "$phones_present devices, and it is day time"
  if [[ $motionEyeStatus == on ]]; then
    echo "Motioneye was on, turning off: $(date)"
    systemctl stop motioneye
    NODE_PATH=/opt/nodejs/lib/node_modules node /home/pi/smartvision/ir-light.js false
  else
    echo "Motioneye was off, leaving it off"
  fi
elif [[ $motionEyeStatus == off ]]; then
  echo "$phones_present devices, or it is night time"
  echo "Motioneye was off, turning on: $(date)"
  NODE_PATH=/opt/nodejs/lib/node_modules node /home/pi/smartvision/ir-light.js true
  systemctl start motioneye
else
  echo "$phones_present devices, or it is night time"
  echo "Motioneye was on, leaving it on"
fi
