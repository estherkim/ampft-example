/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {create as createSeleniumWebdriver} from './engines/selenium-webdriver';
import {SeleniumWebdriverController} from './controller/selenium-webdriver-controller';

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TIMEOUT = 20000;

/**
 * TODO(esth): use this to specify browsers and fixtures to opt into or out of
 * @typedef {{
 *   fakeRegisterElement: (boolean|undefined),
 * }}
 */
export let TestSpec;

/**
 * An end2end test using selenium web driver on a regular amp page
 */
export const endtoend = describeEnv(spec => [
  new AmpPageFixture(spec),
  // TODO(esth): add fixtures for viewer, shadow, cache, etc
]);

/**
 * Returns a wrapped version of Mocha's describe(), it() and only() methods
 * that also sets up the provided fixtures and returns the corresponding
 * environment objects of each fixture to the test method.
 * @param {function(!Object):!Array<?Fixture>} factory
 */
function describeEnv(factory) {
  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function(name, spec, fn, describeFunc) {
    const fixtures = [];
    factory(spec).forEach(fixture => {
      if (fixture && fixture.isOn()) {
        fixtures.push(fixture);
      }
    });
    return describeFunc(name, function() {
      const env = Object.create(null);
      this.timeout(TIMEOUT);
      beforeEach(() => {
        let totalPromise = undefined;
        // Set up all fixtures.
        fixtures.forEach((fixture, unusedIndex) => {
          if (totalPromise) {
            totalPromise = totalPromise.then(() => fixture.setup(env));
          } else {
            const res = fixture.setup(env);
            if (res && typeof res.then == 'function') {
              totalPromise = res;
            }
          }
        });
        return totalPromise;
      });

      afterEach(function () {
        // Tear down all fixtures.
        fixtures.slice(0).reverse().forEach(fixture => {
          // TODO(cvializ): handle errors better
          // if (this.currentTest.state == 'failed') {
          //   fixture.handleError();
          // }
          fixture.teardown(env);
        });

        // Delete all other keys.
        for (const key in env) {
          delete env[key];
        }
      });

      describe(SUB, function() {
        fn.call(this, env);
      });
    });
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  const mainFunc = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe);
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  mainFunc.only = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe./*OK*/only);
  };

  mainFunc.skip = function(name, variants, fn) {
    return templateFunc(name, variants, fn, describe.skip);
  };

  return mainFunc;
}


/** @interface */
class FixtureInterface {

  /** @return {boolean} */
  isOn() {}

  /**
   * @param {!Object} env
   * @return {!Promise|undefined}
   */
  setup(unusedEnv) {}

  /**
   * @param {!Object} env
   */
  teardown(unusedEnv) {}
}

/** @implements {FixtureInterface} */
class AmpPageFixture {

  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @private @const */
    this.spec = spec;

    /** @private */
    this.driver_ = null;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  setup(env) {
    const {browsers} = this.spec;
    //TODO(esth): create driver session so you don't open a new instance for every test
    //TODO(esth): make sure that tests are isolated and don't affect other tests!
    // See https://w3c.github.io/webdriver/#sessions
    return createSeleniumWebdriver({browsers}).then(({testController}) => {
      this.driver_ = testController;
      env.controller = new SeleniumWebdriverController(testController);
    });
  }

  /** @override */
  teardown(env) {
    this.driver_.quit();
    this.driver_ = null;
  }
}
