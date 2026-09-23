module.exports = {
  apps: [
    {
      name: "vtc-claude",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
    },
  ],
};
