#!/bin/sh
set -e

# Start Ollama server in background
ollama serve &
PID=$!

# Wait for Ollama service readiness
echo "Waiting for Ollama service to start..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
  sleep 1
done

echo "Ollama server is active. Pulling CPU-optimized models..."
echo "1. Pulling qwen2.5-coder:1.5b..."
ollama pull qwen2.5-coder:1.5b

echo "2. Pulling phi3:mini..."
ollama pull phi3:mini

echo "3. Pulling moondream..."
ollama pull moondream

echo "All required open-weight models loaded successfully into local Ollama server."

# Keep background process alive
wait $PID
