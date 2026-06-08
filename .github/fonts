#!/usr/bin/env bash
# setup-fonts.sh — Downloads self-hosted variable fonts from Google Fonts.
# Run once locally, or let the GitHub Action run it at deploy time.
# Usage: bash setup-fonts.sh

set -e
FONTS_DIR="$(dirname "$0")/fonts"
mkdir -p "$FONTS_DIR"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

download_font() {
  local NAME="$1" API_URL="$2"
  echo "→ Fetching $NAME..."
  CSS=$(curl -sL "$API_URL" -H "User-Agent: $UA")
  WOFF2_URL=$(echo "$CSS" | grep -o 'https://fonts\.gstatic\.com[^)]*' | head -1)
  if [ -z "$WOFF2_URL" ]; then
    echo "  ✗ Could not find woff2 URL — check your network connection."; return 1
  fi
  curl -sL "$WOFF2_URL" -o "$FONTS_DIR/$NAME"
  echo "  ✓ $NAME ($(wc -c < "$FONTS_DIR/$NAME" | tr -d ' ') bytes)"
}

download_font "outfit-variable.woff2" \
  "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"

download_font "jetbrains-mono-variable.woff2" \
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap"

echo ""
echo "✓ Done. Serve the project with a local server to use self-hosted fonts:"
echo "  python3 -m http.server 8080   →   open http://localhost:8080"
