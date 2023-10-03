// Remove this if you're not using Fullcalendar features
const path = require("path");
const withFonts = require("next-fonts");

module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: path.resolve(__dirname, "../node_modules/electron"),
      use: "null-loader",
    });
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: "@svgr/webpack",
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
        source: "/docs",
        destination: "/docs/welcome",
        permanent: true,
      },
    ];
  },
};

module.exports = withFonts({
  enableSvg: true,
  webpack(config, options) {
    return config;
  },
});
