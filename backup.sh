#!/bin/bash
BACKUP_DIR='/home/ubuntu/backups'
LOGFILE='/home/ubuntu/backup.log'
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
mkdir -p $BACKUP_DIR
echo "[$DATE] Starting SmartLink database backup..." >> $LOGFILE
if docker ps | grep -q smartlink; then
  docker cp smartlink:/app/smartlink.db $BACKUP_DIR/smartlink_$DATE.db
  if [ $? -eq 0 ]; then
    echo "[$DATE] Backup SUCCESS: smartlink_$DATE.db" >> $LOGFILE
  else
    echo "[$DATE] Backup FAILED: docker cp error" >> $LOGFILE
  fi
else
  echo "[$DATE] Backup SKIPPED: container not running" >> $LOGFILE
fi
DELETED=$(find $BACKUP_DIR -name '*.db' -mtime +7 -delete -print | wc -l)
echo "[$DATE] Cleaned $DELETED old backup(s)" >> $LOGFILE
echo "[$DATE] Backup process complete" >> $LOGFILE
echo '---' >> $LOGFILE