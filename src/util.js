export function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

export function hasOwnProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

export const getPrototypeOf = Object.getPrototypeOf ||
  function getPrototypeOf(object) {
    if (object == null) throw new TypeError('Cannot convert undefined or null to object');
    return object.__proto__ || object.constructor && object.constructor.prototype || undefined;
  };
