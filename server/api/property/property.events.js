/**
 * Property model events
 */

'use strict';

import {EventEmitter} from 'events';
var Property = require('../../sqldb').Property;
var PropertyEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PropertyEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Property) {
  for(var e in events) {
    let event = events[e];
    Property.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    PropertyEvents.emit(`${event}:${doc._id}`, doc);
    PropertyEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Property);
export default PropertyEvents;
