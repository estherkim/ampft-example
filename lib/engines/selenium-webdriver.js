import webdriver from 'selenium-webdriver';

export function create(config) {
  const {browsers} = config;

  // hardcode ChromeDriver for now. TODO(esth): use config param to set browsers
  const capabilities = webdriver.Capabilities.chrome();
  
  // For headless, see https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/chrome.html
  // const chromeOptions = {'args': ['--headless']};
  // capabilities.set('chromeOptions', chromeOptions);

  const builder = new webdriver.Builder()
      .withCapabilities(capabilities);
  return Promise.resolve({testController: builder.build()});  
}
