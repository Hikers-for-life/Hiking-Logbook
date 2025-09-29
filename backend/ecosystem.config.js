// PM2 Process Manager Configuration
// This helps prevent crashes and automatically restarts the server

module.exports = {
    apps: [{
        name: 'hiking-logbook-backend',
        script: 'src/server.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 3001
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3001
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        // Restart settings
        min_uptime: '10s',
        max_restarts: 10,
        restart_delay: 4000,
        // Memory and CPU limits
        max_memory_restart: '500M',
        // Kill timeout
        kill_timeout: 5000,
        // Graceful shutdown
        listen_timeout: 3000,
        shutdown_with_message: true
    }]
};

