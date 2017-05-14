/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/properties              ->  index
 * POST    /api/properties              ->  create
 * GET     /api/properties/:id          ->  show
 * PUT     /api/properties/:id          ->  upsert
 * PATCH   /api/properties/:id          ->  patch
 * DELETE  /api/properties/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Property} from '../../sqldb';

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
    res.status(statusCode).send(err);
  };
}

// Gets a list of Properties
export function index(req, res) {
  return Property.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Property from the DB
export function show(req, res) {
  return Property.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Property in the DB
export function create(req, res) {
  return Property.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Property in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.id) {
    Reflect.deleteProperty(req.body, 'id');
  }

  return Property.upsert(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Property in the DB
export function patch(req, res) {
  if(req.body.id) {
    Reflect.deleteProperty(req.body, 'id');
  }
  return Property.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Property from the DB
export function destroy(req, res) {
  return Property.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
