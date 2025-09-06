#!/bin/sh

mkdir -p /root/.ssh

echo "$SERVEO_PRIVATE_KEY" > /root/.ssh/id_rsa
echo "$SERVEO_PUBLIC_KEY" > /root/.ssh/id_rsa.pub

chmod 600 /root/.ssh/id_rsa
chmod 644 /root/.ssh/id_rsa.pub

ssh -o StrictHostKeyChecking=no -R gang-gang-gang:80:frontend:5173 serveo.net