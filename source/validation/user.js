var isString = function(x) {
  return typeof x === 'string';
};

var notEmpty = function(x) {
  return x.length > 0;
};

var hasNonEmptyString = function(object, key) {
  if (!object.hasOwnProperty(key)) {
    return false;
  }
  var value = object[key];
  return isString(value) && notEmpty(value);
};

module.exports = function(input) {
  var type = typeof input;
  return type === 'object' &&
    Boolean(input) &&
    hasNonEmptyString(input, 'first') &&
    hasNonEmptyString(input, 'last') &&
    hasNonEmptyString(input, 'email') &&
    hasNonEmptyString(input, 'password');
};
