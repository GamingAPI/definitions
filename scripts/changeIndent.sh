#!/bin/bash
set -x

find . -name '*.json' ! -type d -exec bash -c 'expand -t 2 "$0" > /tmp/e && mv /tmp/e "$0"' {} \;