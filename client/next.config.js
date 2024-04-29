module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};

// if changes are not reflected then kill pod and
// kuberentes will automatically start new pod
// with new changes
