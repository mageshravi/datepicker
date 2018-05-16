#!/bin/bash

CYAN='\e[0;36m'
NC='\e[0m' # NO_COLOR
color=${CYAN}
tag='INFO'

# Make folders required for npm-frontend-workflow

for folder in scripts-es6 scss public public/css public/js public/wicons
do
    mkdir ${folder}
    echo -e "${color}[${tag}] Creating folder: ${folder}${NC}"
done
