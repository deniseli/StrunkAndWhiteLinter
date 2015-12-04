echo "starting..."
browserify app.js -o main.js
python -m SimpleHTTPServer
