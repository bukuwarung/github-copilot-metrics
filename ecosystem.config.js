module.exports = {
  apps: [{
    name: "copilot-dashboard",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    cwd: "/home/ubuntu/copilot-metrics-dashboard",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}