'use strict';
import path from 'path';
import fs from 'fs';

export default function(sequelize, DataTypes) {
  return sequelize.define('Picture', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    propertyId: DataTypes.INTEGER,
    path: DataTypes.STRING
  }, {
    hooks: {
      afterDestroy: function(picture) {
        var p = path.join('./client', picture.path);
        fs.unlink(`./${p}`, error => {
          if(error) {
            console.log('>>>error: ', error);
            throw error;
          }
        });
      }
    }
  });
}
