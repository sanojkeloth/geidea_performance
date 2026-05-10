#!/usr/bin/env bash
# Double-click this in Finder to open Cloud Shell with a one-click
# "Redeploy" button ready in the tutorial pane.
#
# First time only: macOS will ask if you trust this script (right-click
# in Finder → Open → Open).
#
# What it does:
#   - opens https://shell.cloud.google.com pointed at your branch
#   - loads cloudshell-tutorial.md in the side panel
#   - in the tutorial there's a 'Copy to Cloud Shell' button — click it
#     to run `bash redeploy.sh`

URL='https://shell.cloud.google.com/cloudshell/editor'
URL+='?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fsanojkeloth%2Fgeidea_performance'
URL+='&cloudshell_git_branch=claude%2Fgeidea-performance-dashboard-uaB5Z'
URL+='&cloudshell_workspace=.'
URL+='&cloudshell_tutorial=cloudshell-tutorial.md'

open "$URL"
