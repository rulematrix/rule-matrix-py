#!/usr/bin/env bash

root_dir=`pwd`

cd ./rulematrix/rule-matrix-js

npm run build

cd root_dir

cp ./rulematrix/rule-matrix-js/build/rulematrix.development.css ./rulematrix/static/rulematrix.development.css
cp ./rulematrix/rule-matrix-js/build/rulematrix.development.js ./rulematrix/static/rulematrix.development.js
