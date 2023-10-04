const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config()
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Environment variables
const targetUrl = process.env.TARGET_URL;

const port = process.env.PORT || 8000;
// CORS 
app.use(cors({
    origin: '*'
}));

// Compress responses
app.use(compression());

// Create proxy
const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
        [`^/proxy`]: ''
    },

});

// Validate headers
app.use((req, res, next) => {
    if (req.headers['private-token']) {
        return res.status(403).send('Private token not allowed');
    }
    next();
});

// Security headers  
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'deny');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Proxy requests
app.use('/proxy', proxy, (req, res) => {
    console.log(req.body)
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

// Start server
app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});