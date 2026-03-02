#!/bin/bash
LOGFILE='/home/ubuntu/cleanup.log'
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
echo "[$DATE] Starting Docker cleanup..." >> $LOGFILE
echo "[$DATE] Disk before: $(df -h / | tail -1 | awk '{print $5}') used" >> $LOGFILE
REMOVED_IMAGES=$(docker image prune -f 2>&1)
echo "[$DATE] Images: $REMOVED_IMAGES" >> $LOGFILE
REMOVED_CONTAINERS=$(docker container prune -f 2>&1)
echo "[$DATE] Containers: $REMOVED_CONTAINERS" >> $LOGFILE
echo "[$DATE] Disk after: $(df -h / | tail -1 | awk '{print $5}') used" >> $LOGFILE
echo "[$DATE] Docker cleanup complete" >> $LOGFILE
echo '---' >> $LOGFILE