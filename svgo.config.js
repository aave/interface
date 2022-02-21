module.exports = {
  multipass: true,
  plugins: [
    'preset-default',
    // viewBox is required to resize SVGs with CSS.
    // @see https://github.com/svg/svgo/issues/1128
    {
      name: 'removeViewBox',
      active: false,
    },
  ],
};
