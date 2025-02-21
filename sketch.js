let pusher, channel;
let players = {};
let myId = Math.random().toString(36).substring(7);
let myColor = '#000000';
let brushType = 'circle';
let brushSize = 10;
let canvasData = [];
let isPenActive = false;
let isCursorActive = false;
let showCursorButton = true;
let penIndicator, spaceKey, shiftKey, cursorButton;

const fs = typeof require !== 'undefined' ? require('fs') : null; // For Node.js testing, ignored in browser

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    // Only write to file if in Node.js environment (optional for local testing)
    if (fs) fs.appendFileSync('client-log.txt', logMessage);
}

function setup() {
    createCanvas(windowWidth, windowHeight - 250);
    background(255);

    try {
        pusher = new Pusher('YOUR_APP_KEY', { // Replace with your Key
            cluster: 'YOUR_APP_CLUSTER' // Replace with your Cluster
        });
        channel = pusher.subscribe('cosmic-canvas');
        log('Pusher initialized and subscribed to cosmic-canvas');
    } catch (error) {
        log(`Pusher setup error: ${error.message} - Check app key and cluster`);
    }

    if (channel) {
        channel.bind('player-update', (data) => {
            if (data.id !== myId) {
                players[data.id] = { x: data.x, y: data.y, color: data.color, brush: data.brush, size: data.size, pen: data.pen, cursor: data.cursor };
            }
        });
        channel.bind('clear-canvas', () => {
            background(255);
            log('Canvas cleared via Pusher event');
        });
        channel.bind('load-canvas', (data) => {
            canvasData = data.actions;
            redrawCanvas();
            log('Canvas loaded via Pusher event');
        });
    }

    setInterval(sendPosition, 100);
    createPalette();
    penIndicator = select('#pen-indicator');
    spaceKey = select('#space-key');
    shiftKey = select('#shift-key');
    cursorButton = select('#cursor-button');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => log('Service Worker registered: ' + reg.scope))
            .catch(err => log('Service Worker failed: ' + err.message));
    }
}

function draw() {
    penIndicator.html(`Pen: ${isPenActive ? 'On' : 'Off'} | Cursor: ${isCursorActive ? 'On' : 'Off'}`);
    penIndicator.style('background-color', isPenActive || isCursorActive ? '#00FF00' : '#FF0000');

    if (showCursorButton && isCursorActive) {
        stroke(myColor);
        noFill();
        drawBrush(mouseX, mouseY, brushType, brushSize);
    }

    for (let id in players) {
        stroke(players[id].color);
        if (players[id].cursor) drawBrush(players[id].x, players[id].y, players[id].brush, players[id].size);
        if (players[id].pen && players[id].lastX && players[id].lastY) {
            drawBrushLine(players[id].lastX, players[id].lastY, players[id].x, players[id].y, players[id].brush, players[id].size);
        }
        players[id].lastX = players[id].x;
        players[id].lastY = players[id].y;
    }

    if (isPenActive && mouseIsPressed && mouseY < height) {
        stroke(myColor);
        drawBrushLine(pmouseX, pmouseY, mouseX, mouseY, brushType, brushSize);
        canvasData.push({ x1: pmouseX, y1: pmouseY, x2: mouseX, y2: mouseY, color: myColor, brush: brushType, size: brushSize });
    }
}

function sendPosition() {
    let data = { id: myId, x: mouseX, y: mouseY, color: myColor, brush: brushType, size: brushSize, pen: isPenActive, cursor: isCursorActive };
    fetch('http://localhost:3001/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'cosmic-canvas', event: 'player-update', data })
    }).catch(err => log(`Trigger fetch error: ${err.message} - Check server at http://localhost:3001`));
}

function drawBrush(x, y, type, size) {
    if (type === 'circle') ellipse(x, y, size, size);
    else if (type === 'square') rect(x - size / 2, y - size / 2, size, size);
    else if (type === 'spray') {
        for (let i = 0; i < 10; i++) point(x + random(-size / 2, size / 2), y + random(-size / 2, size / 2));
    }
}

function drawBrushLine(x1, y1, x2, y2, type, size) {
    if (type === 'circle' || type === 'square') line(x1, y1, x2, y2);
    else if (type === 'spray') {
        for (let i = 0; i < 10; i++) {
            let mx = lerp(x1, x2, i / 10) + random(-size / 2, size / 2);
            let my = lerp(y1, y2, i / 10) + random(-size / 2, size / 2);
            point(mx, my);
        }
    }
}

function createPalette() {
    let palette = select('#palette');
    let colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#FFA500', '#800080'];
    for (let c of colors) {
        let swatch = createDiv('').parent(palette).addClass('color-swatch');
        swatch.style('background-color', c);
        swatch.mousePressed(() => myColor = c);
    }
    let randomButton = createButton('Random Color').parent(palette);
    randomButton.mousePressed(() => myColor = '#' + Math.floor(Math.random() * 16777215).toString(16));
}

function setBrush(type) {
    brushType = type;
}

function toggleCursor() {
    showCursorButton = !showCursorButton;
    cursorButton.html(showCursorButton ? 'Cursor Toggle: On' : 'Cursor Toggle: Off');
    cursorButton.toggleClass('active');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 250);
}

function keyPressed() {
    if (key === ' ') {
        isCursorActive = !isCursorActive;
        spaceKey.toggleClass('active');
    } else if (keyCode === SHIFT) {
        isPenActive = !isPenActive;
        shiftKey.toggleClass('active');
    }
}

function keyReleased() {
    if (keyCode === SHIFT) shiftKey.removeClass('active');
    else if (key === ' ') spaceKey.removeClass('active');
}

function clearCanvas() {
    fetch('http://localhost:3001/clear', { method: 'POST' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                log('Clear successful, triggering client event');
                channel.trigger('client-clear-canvas', {});
            } else {
                log(`Clear failed: ${data.error}`);
            }
        })
        .catch(err => log(`Clear fetch error: ${err.message} - Check server or credentials`));
}

function saveCanvas() {
    fetch('http://localhost:3001/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: canvasData })
    })
        .then(response => response.json())
        .then(data => log(data.success ? 'Save successful' : `Save failed: ${data.error}`))
        .catch(err => log(`Save fetch error: ${err.message}`));
}

function loadCanvas() {
    fetch('http://localhost:3001/load', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                channel.trigger('client-load-canvas', { actions: data.actions });
                log('Load successful');
            } else {
                log(`Load failed: ${data.error}`);
            }
        })
        .catch(err => log(`Load fetch error: ${err.message}`));
}

function redrawCanvas() {
    background(255);
    for (let action of canvasData) {
        stroke(action.color);
        drawBrushLine(action.x1, action.y1, action.x2, action.y2, action.brush, action.size);
    }
}

select('#brush-size').input(() => brushSize = int(select('#brush-size').value()));