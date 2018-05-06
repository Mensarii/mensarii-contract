#!/bin/bash

cp -r ./build/contracts ./mensarii-client/src/contracts/
echo "Contracts copied to client"
cp -r ./build/contracts ./mensarii-ico/src/contracts/
echo "Contract copied to ico"
