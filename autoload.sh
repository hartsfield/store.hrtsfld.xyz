#!/bin/bash
trap -- '' SIGTERM

pkill -f $1
go build -o $1
nohup ./$1 > /dev/null & disown
