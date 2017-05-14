/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/pictures              ->  index
 * POST    /api/pictures              ->  create
 * GET     /api/pictures/:id          ->  show
 * PUT     /api/pictures/:id          ->  upsert
 * PATCH   /api/pictures/:id          ->  patch
 * DELETE  /api/pictures/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Picture} from '../../sqldb';
import {Property} from '../../sqldb';
var fs = require('fs');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log('>>>error: ', err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Pictures
export function index(req, res) {
  return Picture.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Picture from the DB
export function show(req, res) {
  return Picture.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Picture in the DB
export function create(req, res) {
  // return Picture.create(req.body)
  //   .then(respondWithResult(res, 201))
  //   .catch(handleError(res));
  console.log('>>>req.file: ', req.file);
  let tmpPath = req.file.path;
  let targetPath = `./client/assets/images/${req.file.originalname}`;
  fs.rename(tmpPath, targetPath, function(err) {
    if(err) {
      return handleError(res)(err);
    }
    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    fs.unlink(tmpPath, function() {
      if(err) {
        return handleError(res)(err);
      }
      if(!req.body.propertyId) {
        Property.create({})
          .then(function(property) {
            req.body.propertyId = Number(property.id);
            savePicture();
          })
          .catch(handleError(res));
      } else {
        savePicture();
      }
    });
  });
  function savePicture() {
    return Picture.create({
      propertyId: Number(req.body.propertyId),
      path: targetPath.replace('/client', '')
    })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }
}

// Upserts the given Picture in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.id) {
    Reflect.deleteProperty(req.body, 'id');
  }

  return Picture.upsert(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Picture in the DB
export function patch(req, res) {
  if(req.body.id) {
    Reflect.deleteProperty(req.body, 'id');
  }
  return Picture.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Picture from the DB
export function destroy(req, res) {
  return Picture.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    // .then(removeFile)
    .then(removeEntity(res))
    .catch(handleError(res));

  // function removeFile(picture) {
  //   if(picture) {
  //     return new Promise(
  //       function(resolve, reject) {
  //         var p = path.join('./client', picture.path);
  //         fs.unlink(`./${p}`, error => {
  //           if(error) {
  //             reject(error);
  //           } else {
  //             resolve(picture);
  //           }
  //         });
  //       });
  //   }
  // }
}
