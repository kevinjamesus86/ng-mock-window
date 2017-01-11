import createMockWindow from './window';

export default function mockWindowProvider(mockWindowConfig) {
  return ['$provide', function provideMockWindow($provide) {
    $provide.constant('$window', createMockWindow(mockWindowConfig));
  }];
}
