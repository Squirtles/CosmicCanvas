const express = require('express');
const Pusher = require('pusher');
const fs = require('fs'); // For logging and file ops
const app = express();
app.use(express.json());

const pusher = new Pusher({
    appId: 'YOUR_APP_ID',      // Replace with your App ID (e.g., '1234567')
    key: 'YOUR_APP_KEY',       // Replace with your Key (e.g., 'a1b2c3d4e5f6g7h8i9j0')
    secret: 'YOUR_APP_SECRET', // Replace with your Secret (e.g., 'k9l8m7n6o5p4q3r2s1t0')
    cluster: 'YOUR_APP_CLUSTER' // Replace with your Cluster (e.g., 'us2')
});

const whitelist = require('./whitelist');

// Log function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync('server-log.txt', logMessage);
}

function isWhitelisted(req) {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log(`Request IP: ${clientIp}`);
    const isAllowed = whitelist.includes(clientIp);
    log(`Whitelist check: IP=${clientIp}, Allowed=${isAllowed}, Whitelist=${JSON.stringify(whitelist)}`);
    return isAllowed;
}

app.post('/trigger', (req, res) => {
    try {
        pusher.trigger(req.body.channel, req.body.event, req.body.data);
        log('Trigger event sent successfully');
        res.json({ success: true });
    } catch (error) {
        log(`Trigger error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/clear', (req, res) => {
    if (!isWhitelisted(req)) {
        log('Unauthorized attempt blocked');
        return res.status(403).json({ success: false, error: 'Unauthorized - IP not in whitelist' });
    }
    try {
        pusher.trigger('cosmic-canvas', 'clear-canvas', {});
        log('Clear canvas triggered');
        res.json({ success: true });
    } catch (error) {
        log(`Clear error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/save', (req, res) => {
    if (!isWhitelisted(req)) {
        log('Unauthorized save attempt blocked');
        return res.status(403).json({ success: false, error: 'Unauthorized - IP not in whitelist' });
    }
    try {
        fs.writeFileSync('canvas.json', JSON.stringify(req.body.actions));
        log('Canvas saved');
        res.json({ success: true });
    } catch (error) {
        log(`Save error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/load', (req, res) => {
    if (!isWhitelisted(req)) {
        log('Unauthorized load attempt blocked');
        return res.status(403).json({ success: false, error: 'Unauthorized - IP not in whitelist' });
    }
    try {
        if (fs.existsSync('canvas.json')) {
            const actions = JSON.parse(fs.readFileSync('canvas.json'));
            pusher.trigger('cosmic-canvas', 'load-canvas', { actions });
            log('Canvas loaded and triggered');
            res.json({ success: true, actions });
        } else {
            log('No saved canvas found');
            res.json({ success: false, error: 'No saved canvas' });
        }
    } catch (error) {
        log(`Load error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3001, () => log('Server running on port 3001'));
