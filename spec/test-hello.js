import * as describes from '../lib/describes';
import {expect} from 'chai';

describes.testcafe('First test', {
    browsers: ['chrome'],
}, async env => {
  let controller;

  beforeEach(async () => {
    controller = env.controller;
    await controller.navigateTo('https://www.google.com');
  });

  it('should expect hello to not equal world', () => {
    expect('hello').to.not.equal('world');
  });
});


describes.selenium('First test', {
    browsers: ['chrome'],
}, async env => {
  let controller;

  beforeEach(async () => {
    controller = env.controller;
    await controller.navigateTo('https://www.google.com');
  });

  it('should expect hello to not equal world', () => {
    expect('hello').to.not.equal('world');
  });
});
