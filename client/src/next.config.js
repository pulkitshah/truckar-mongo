const path = require('path');

module.exports = {
  reactStrictMode: true,
  webpack(config) {
    if (process.env.NODE_ENV === 'production') {
      config.target = 'electron-renderer';
      config.output.globalObject = 'this';
    } else {
      config.module.rules.push({
        test: path.resolve(__dirname, '../node_modules/electron'),
        use: 'null-loader',
      });
      config.optimization.minimizer = [];
    }
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: { plugins: [{ removeViewBox: false }] },
          },
        },
      ],
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/welcome',
        permanent: true,
      },
      {
        source: '/',
        destination: '/authentication/login?returnUrl=%2Fdashboard',
        permanent: true,
      },
    ];
  },
};
