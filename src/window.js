/* global jasmine */

import {
  warn,
  trap,
  hasOwnProperty,
  getPrototypeOf
} from './util';

import globals from './globals';
import globalEventHandlers from './global-event-handlers'

export default function mockWindowProvider({
  gripeAboutOnEventAssignment = false
} = {}) {
  return ['$provide', function provideMockWindow($provide) {
    const location = window.location;
    let isInternalWriteHref;

    // Changing the following properties on location will cause
    // the page to reload. As such, we do not allow writing to the
    // actual location object during testing.
    //
    // - hash
    // - host
    // - hostname
    // - origin
    // - pathname
    // - port
    // - protocol
    // - href
    //
    // Calls to the following methods will be trapped by jasmine
    // spys, which makes it easy to check whether or not the right
    // method was called & with the appropriate arguments.
    //
    // - assign
    // - reload
    // - replace
    //
    const mockLocationDescriptors = {
      hash: trap(location.hash),
      host: trap(location.host),
      hostname: trap(location.hostname),
      origin: trap(location.origin),
      pathname: trap(location.pathname),
      port: trap(location.port),
      protocol: trap(location.protocol),
      assign: {
        value: jasmine.createSpy('assign')
      },
      reload: {
        value: jasmine.createSpy('reload')
      },
      replace: {
        value: jasmine.createSpy('replace')
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
      var href = location.href;
      return {
        get() {
          return href;
        },
        set(nextHref) {
          href = nextHref;
          // Prevent double warning when setting
          // location.href from mockLocation
          if (!isInternalWriteHref) {
            warn(`Warning: set $window.location.href to "${ href }", ` +
              `please use $window.location.assign() instead.`);
          }
        }
      };
    })();

    const mockWindowDescriptors = {
      top: {
        enumerable: true,
        get() {
          return this;
        }
      },
      self: {
        enumerable: true,
        configurable: true, // weird
        get() {
          return this;
        }
      },
      window: {
        enumerable: true,
        get() {
          return this;
        }
      },
      addEventListener: {
        enumerable: true,
        configurable: true,
        value: function addEventListener(...args) {
          return window.addEventListener(...args);
        }
      },
      removeEventListener: {
        enumerable: true,
        configurable: true,
        value: function removeEventListener(...args) {
          return window.removeEventListener(...args);
        }
      },
      location: {
        enumerable: true,
        get() {
          return mockLocation;
        },
        // Update the mockLocation href in case the
        // test happens to write to location, then read
        // from location.href. It'd be odd, but possible
        set(nextHref) {
          // Don't double up on the warning
          isInternalWriteHref = true;
          mockLocation.href = nextHref;
          isInternalWriteHref = false;
          warn(`Warning: set $window.location to "${ nextHref }", ` +
            `please use $window.location.assign() instead.`);
        }
      }
    };

    globalEventHandlers.forEach(function(globalOnEventName) {
      mockWindowDescriptors[globalOnEventName] = {
        writable: true,
        enumerable: true,
        configurable: true,
        get() {
          return window[globalOnEventName];
        },
        set(nextValue) {
          window[globalOnEventName] = nextValue;
          if (gripeAboutOnEventAssignment) {
            const name = nextValue && nextValue.name || 'handler';
            warn(`Warning: saw assignment to window.${globalOnEventName}. ` +
              `Attaching event handlers in this way is discouraged, try using ` +
              `window.addEventListener('${ globalOnEventName }', ${ name }) instead.`);
          }
        }
      };
    });

    globals.forEach(function(globalProperty) {
      // Skip properties that have been added
      if (hasOwnProperty(mockWindowDescriptors, globalProperty)) return;

      // If it doesn't exist then it can be written, configured, etc.
      const descriptor =
        Object.getOwnPropertyDescriptor(window, globalProperty) || {
          writable: true,
          enumerable: true,
          configurable: true
        };

      mockWindowDescriptors[globalProperty] = {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        get() {
          return window[globalProperty];
        },
        set(nextValue) {
          if (descriptor.writable) {
            window[globalProperty] = nextValue;
          }
        }
      };
    });

    // Create the mock location instance
    const mockLocation = Object.create(getPrototypeOf(location), mockLocationDescriptors);

    // Create the mock window instance
    const mockWindow = Object.create(getPrototypeOf(window), mockWindowDescriptors);

    $provide.constant('$window', mockWindow);
  }];
}
