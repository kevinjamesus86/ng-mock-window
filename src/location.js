/* global window */

import {
  warn,
  getPrototypeOf
} from './util';

import URL from './url';

export default function mockLocation(initialHref = window.location.href) {
  const url = new URL(initialHref);
  let isInternalWriteHref;

  function proxy(prop) {
    return {
      enumerable: true,
      set(nextValue) {
        url[prop] = nextValue;
      },
      get() {
        return url[prop];
      }
    };
  }

  // Changing the following properties on location will cause
  // the page to reload. As such, we do not allow writing to the
  // actual location object during testing.
  //
  // - host
  // - hostname
  // - origin
  // - pathname
  // - port
  // - protocol
  // - href
  //
  // These methods are not configurable on the native location object,
  // but if we want to spy on these methods they must be writable.
  //
  // - assign
  // - replace
  // - reload
  //
  const mockLocationDescriptors = {
    hash: proxy('hash'),
    host: proxy('host'),
    hostname: proxy('hostname'),
    origin: proxy('origin'),
    pathname: proxy('pathname'),
    port: proxy('port'),
    protocol: proxy('protocol'),
    assign: {
      writable: true,
      value: function assign(nextHref) {
        this.__internalWriteHref(nextHref);
      }
    },
    replace: {
      writable: true,
      value: function replace(nextHref) {
        this.__internalWriteHref(nextHref);
      }
    },
    reload: {
      writable: true,
      value: function reload() {
        /* noop */
      }
    },
    toString: {
      value: function toString() {
        return this.href;
      }
    },
    valueOf: {
      value: function valueOf() {
        return this;
      }
    }
  };

  mockLocationDescriptors.href = (function() {
    return {
      enumerable: true,
      get() {
        return url.href;
      },
      set(nextHref) {
        url.href = nextHref;
        if (!isInternalWriteHref) {
          warn(`Warning: set $window.location.href to "${ nextHref }", ` +
            `please use $window.location.assign() instead.`);
        }
      }
    };
  })();

  mockLocationDescriptors.__internalWriteHref = {
    value(nextHref) {
      isInternalWriteHref = true;
      mockLocation.href = nextHref;
      isInternalWriteHref = false;
    }
  };

  // Create the mock location instance
  const mockLocation = Object.create(getPrototypeOf(location), mockLocationDescriptors);

  return mockLocation;
}
