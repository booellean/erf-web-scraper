#!/bin/bash

: ${SERVICE:=}
: ${PORT:=5000}

if [[ $SERVICE == 'dev' ]]
then
    exec npm run dev
else
# This is production. Serve the app!
    # exec ./scripts/wait-for-it.sh $APOS_MONGODB_URI -- npm start
    exec npm start
fi