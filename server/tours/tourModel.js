/**
 * A module that accesses the mysql database and responds to requests from the controller
 * @module tours/tourModel
 * @type {connection|exports|module.exports}
 * @requires db
 */
var db = require('../db');

module.exports = {
  /** Queries the database for all tours
   * TODO: query based on city, will need to grab city id first
   * @method queryTours
   * @param {array} params
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  queryTours: function (params, callback) {
    var queryStr = "SELECT t.*, c.cityName, c.state, c.country from tours t \
									 LEFT OUTER JOIN cities c on t.cityId = c.id";

    db.query(queryStr, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  },

  /** Queries the database based on the parameter that was passed.
   * If a tour id was passed, it will return that specific tour
   * If a user id was passed, it will return all tours by that user
   * @method querySpecificTour
   * @param {object} params - an object that could contain a userId or tourId
   * @param {function} callback -  a callback which will take the arguments err and results from the database query
   */
  querySpecificTour: function (params, callback) {
    var queryStr = "SELECT t.*, c.cityName, c.state, c.country from tours t \
									LEFT OUTER JOIN cities c on t.cityId = c.id WHERE ";

    if (params['tourId'] !== undefined) {
      queryStr += "t.id = ?";
    } else {
      queryStr += "userId = ?";
    }

    db.query(queryStr, params[Object.keys(params)[0]], function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  },

  /**
   * Inserts or selects a city from the city table.
   * Queries the cities table for a city.
   * If it exists, the city's id is given to the callback.
   * If it doesn't exist, the city is added to the table and the city's id is given to the callback.
   *
   * @param {string} params - an array containing the cityName, state, and country
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  addOrGetCity: function (params, callback) {
    var selectQuery = "SELECT id from cities WHERE cityName = ? AND state = ? AND country = ?"
    var insertQuery = "INSERT into cities(cityName, state, country) \
                       value (?, ?, ?)";
    db.query(selectQuery, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        if (results.length !== 0) {
          callback(err, results[0].id);
        } else {
          db.query(insertQuery, params, function (err, results) {
            if (err) {
              callback(err);
            } else {
              callback(err, results.insertId);
            }
          })
        }
      }
    })
  },

  /**
   * Inserts a new tour into the table.
   * If successful, gives a callback the tourId.
   *
   * @param {string} params - an array containing the cityName, state, and country
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  insertTour: function (params, callback) {
    var insertStr = "INSERT into tours(tourName, userId, description, category, duration, cityId) \
			              value (?, ?, ?, ?, ?, ?)";

    db.query(insertStr, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results.insertId);
      }
    });
  },

  /**
   * Updates a specific tour in the tours table.
   * If successful, gives a callback the tourId.
   *
   * @param {string} params - an array containing the tourName, userId, description, category, duration, cityId, tourId
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  updateTour: function (params, callback) {
    var updateTourQuery = "UPDATE tours SET tourName = ?, userId = ?, description = ?, category = ?, duration = ?, cityId = ? WHERE id = ?";

    db.query(updateTourQuery, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    })

  },

  /**
   * Updates a specific tour with a new image url.
   * If successful, gives a callback the queryResult.
   *
   * @param {string} params - an array containing the imageUrl and tourId
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  addImageToTour: function (params, callback) {
    var updateTourQuery = "UPDATE tours SET image = ? WHERE id = ?";

    db.query(updateTourQuery, params, function (err, results) {
      if (err) {
        callback(err);
        console.log('error: ', err);
      } else {
        callback(err, results);
      }
    })

  },

  addImageToPlace: function (params, callback) {
    var query = "UPDATE places SET image = ? WHERE id = ?";

    db.query(query, params, function (err, results) {
      if (err) {
        callback(err);
        console.log('error: ', err);
      } else {
        callback(err, results);
      }
    })
  },

  addAudioToPlace: function (params, callback) {
    var query = "UPDATE places SET audio = ? WHERE id = ?";

    db.query(query, params, function (err, results) {
      if (err) {
        callback(err);
        console.log('error: ', err);
      } else {
        callback(err, results);
      }
    })
  },

  /**
   * Deletes tour with given id from the table.
   * If successful, gives a callback with the query result.
   *
   * @param {int} tourId - tourId of tour to be deleted
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  deleteTour: function (tourId, callback) {
    var deleteQuery = "DELETE FROM tours WHERE id = ?";

    db.query(deleteQuery, tourId, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  },

  /**
   * Updates the placeOrders of all places in a tour that have the inputed placeOrder or greater after.
   * If successful, gives a callback the placeId.
   *
   * @param {array} params - tourId, placeOrder
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  updatePlaceOrders: function (params, callback) {
    var updateTourQuery = "UPDATE places SET placeOrder = placeOrder + 1 WHERE tourId = ? AND placeOrder >= ? AND id <> ?";

    db.query(updateTourQuery, params, function (err, result) {
      if (err) {
        console.log('error updating place order: ', err);
        callback(err);
      } else {
        callback(err, result);
      }
    });
  },

  /**
   * Updates the placeOrders of all places in a tour that have the inputed placeOrder or greater incrementing all placeOrders.
   * If successful, gives a callback the placeId.
   *
   * @param {array} params - tourId, placeOrder
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  updatePlaceOrdersAfterEdit: function (params, callback) {
    var updateTourQuery = '';

    if (params[params.length - 1] > params[1]) {
      updateTourQuery = "UPDATE places SET placeOrder = placeOrder + 1 WHERE tourId = ? AND placeOrder >= ? AND id <> ? AND placeOrder < ?";
    } else {
      updateTourQuery = "UPDATE places SET placeOrder = placeOrder - 1 WHERE tourId = ? AND placeOrder <= ? AND id <> ? AND placeOrder > ?";
    }

    db.query(updateTourQuery, params, function (err, result) {
      if (err) {
        console.log('error updating place order: ', err);
        callback(err);
      } else {
        callback(err, result);
      }
    });
  },

  /** Queries the places table for all places with the matching tourId
   * @method queryPlaces
   * @param {number} tourId - a number that represents the tour id
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  queryPlaces: function (tourId, callback) {
    var placesQuery = "SELECT * from places WHERE tourId = ? ORDER BY placeOrder"

    db.query(placesQuery, tourId, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  },

  /**
   * Inserts a new place into the table.
   * If successful, queries the place table for the recently created place and invokes
   * the callback with the tourId.
   *
   * @param {string} params - an array containing the placeName, address, description, placeOrder, and tourId
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  insertPlace: function (params, callback) {
    var insertQuery = "INSERT into places(placeName, address, description, placeOrder, tourId) \
	                  value (?, ?, ?, ?, ?)";
    var selectQuery = "SELECT tourId from places where id = ?";

    db.query(insertQuery, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        var data = {
          placeId: results.insertId,
          tourId: null
        }
        db.query(selectQuery, results.insertId, function (err, results) {
          if (err) {
            callback(err);
          } else {
            data.tourId = results[0].tourId
            console.log('sending this back', data)
            callback(err, data);
          }
        });
      }
    });
  },

  /**
   * Updates a specific place in the places table.
   * If successful, gives a callback the placeId.
   *
   * @param {string} params - an array containing the placeName, address, description, placeOrder, tourId, placeId
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  updatePlace: function (params, callback) {
    var updatePlaceQuery = "UPDATE places SET placeName = ?, address = ?, description = ?, placeOrder = ?, tourId = ? WHERE id = ?";

    db.query(updatePlaceQuery, params, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  },

  /**
   * Deletes place with given id from the table.
   * If successful, gives a callback with the query result.
   *
   * @param {int} placeId - placeId of tour to be deleted
   * @param {function} callback - a callback which will take the arguments err and results from the database query
   */
  deletePlace: function (placeId, callback) {
    var deleteQuery = "DELETE FROM places WHERE id = ?";

    db.query(deleteQuery, placeId, function (err, results) {
      if (err) {
        callback(err);
      } else {
        callback(err, results);
      }
    });
  }
};
