'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection opions
  sequelize: {
    // uri: 'sqlite://',
    uri: 'mysql://root:123456@localhost:3306/real-estate',
    options: {
      logging: false,
      // storage: 'dev.sqlite',
      storage: 'mysql',
      define: {
        timestamps: false
      }
    }
  },

  // Seed database on startup
  seedDB: false

};
