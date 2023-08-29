#!/bin/bash

docker run \
       --rm \
       --entrypoint bash \
       --name node \
       -v $PWD:/app \
       -w /app \
       node \
       -c 'npm i && npm run build'
