#!/bin/bash
# Double-click this file to preview your portfolio locally.
# It starts a tiny web server and opens your browser. Leave the window open;
# press Control-C to stop. (A server is needed because Safari blocks links
# between local files opened with file://.)
cd "$(dirname "$0")"
PORT=8000
echo ""
echo "  Serving your portfolio at:  http://localhost:$PORT"
echo "  Leave this window open. Press Control-C to stop."
echo ""
( sleep 1; open "http://localhost:$PORT" ) 2>/dev/null &
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PORT
else
  echo "python3 was not found. Install it, or run any static server in this folder."
  read -r _
fi
