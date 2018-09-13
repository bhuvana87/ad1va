#!/bin/bash
cd /home/centos/deployment/dam-front-end/
pid=`ps aux | grep 'node\|npm'|grep -v grep| awk '{print $2}'`
kill -9 $pid

