#!/bin/bash

number=31 # 备份 31 天数据
backup_dir=/home/apps/wipi/backup  # 备份路径
dd=`date +%Y-%m-%d-%H-%M-%S` # 日期
tool=mysqldump # 备份工具
host=0.0.0.0  # mysql 地址
port=3306 # mysql 端口
username=root # 用户名
password=root # 密码
database_name=wipi # 备份数据库名

if [ ! -d $backup_dir ];
then
  mkdir -p $backup_dir;
fi

# 备份
$tool -h$host -P$port -u$username -p$password $database_name > $backup_dir/$database_name-$dd.sql

# 备份日志
echo "create $backup_dir/$database_name-$dd.dump" >> $backup_dir/log.txt

# 找出需要删除的备份
delfile=`ls -l -crt $backup_dir/*.sql | awk '{print $9}' | head`

# 判断现在的备份数量是否大于 $number
count=`ls -l -crt $backup_dir/*.sql | awk '{print $9}' | wc -l`

if [ $count -gt $number ]
then
  rm $delfile
  echo "delete $delfile" >> $backup_dir/log.txt
fi
