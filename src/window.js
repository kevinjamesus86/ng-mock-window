import {
  warn,
  hasOwnProperty,
  getPrototypeOf
} from './util';

import globals from './globals';
import globalEventHandlers from './global-event-handlers';

import createMockLocation from './location';

export default function mockWindow({
  gripeAboutOnEventAssignment = false,
  initialHref
} = {}) {
  const mockLocation = createMockLocation(initialHref);

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
      writable: true,
      enumerable: true,
      configurable: true,
      value: function addEventListener(...args) {
        return window.addEventListener(...args);
      }
    },
    removeEventListener: {
      writable: true,
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
      // from location.href. It'd be odd, but possible.
      set(nextHref) {
        // Don't double up on the warning
        mockLocation.__internalWriteHref(nextHref);
        warn(`Warning: set $window.location to "${ nextHref }", ` +
          `please use $window.location.assign() instead.`);
      }
    }
  };

  globalEventHandlers.forEach(function(globalOnEventName) {
    mockWindowDescriptors[globalOnEventName] = {
      enumerable: true,
      configurable: true,
      get() {
        return window[globalOnEventName];
      },
      set(nextValue) {
        window[globalOnEventName] = nextValue;
        if (gripeAboutOnEventAssignment) {
          const name = nextValue && nextValue.name || 'handler';
          warn(`Warning: saw assignment to window.${ globalOnEventName }. ` +
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

  // Create the mock window instance
  const mockWindow = Object.create(getPrototypeOf(window), mockWindowDescriptors);

  return mockWindow;
}
