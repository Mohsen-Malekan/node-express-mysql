/**
 * Sequelize initialization module
 */

'use strict';

import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.Picture = db.sequelize.import('../api/picture/picture.model');
db.Property = db.sequelize.import('../api/property/property.model');
db.Thing = db.sequelize.import('../api/thing/thing.model');
db.User = db.sequelize.import('../api/user/user.model');

db.Property.hasMany(db.Picture, {foreignKey: 'propertyId', sourceKey: 'id'});
db.Picture.belongsTo(db.Property, {
  foreignKey: 'propertyId',
  targetKey: 'id'
});

module.exports = db;
