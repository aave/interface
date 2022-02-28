//const webpackPreprocessor = require('@cypress/webpack-preprocessor');
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configWithDotenv = require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH });
    const env = { ...config.env, ...configWithDotenv.parsed };
    const result = { ...config, env };
    return result;
  } catch (e) {
    return config;
  }
};
