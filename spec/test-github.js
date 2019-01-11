import 'babel-regenerator-runtime';
import * as describes from '../lib/describes';
import {expect} from '../lib/expect';

const Keys = {
  ENTER: 'enter',
};

describes.endtoend('GitHub search results', {
  engines: ['selenium'],  
}, async env => {
  let controller;  

  beforeEach(async () => {    
    //TODO: get controller from single driver session    
    controller = env.controller; 
    await controller.navigateTo('https://github.com/');
  });

  it('should contain a result for the search term', async () => {
    const searchButtonHandle = await controller.findElement('.header-search-input');
    await controller.type(searchButtonHandle, 'TestCafe');
    await controller.type(null, Keys.ENTER);

    await expect(controller.getTitle()).to.match(/TestCafe/);

    const itemHandle = await controller.findElement('.repo-list-item');
    await expect(controller.getElementText(itemHandle)).to.contain('DevExpress/testcafe');
  });
});

describes.endtoend('GitHub login', {
  engines: ['selenium'],
}, async env => {
  let controller;

  beforeEach(async () => {
    controller = env.controller;
    await controller.navigateTo('https://github.com/login');
  });

  it('should fail to login with no credentials', async () => {
    const loginButton = await controller.findElement('.btn.btn-primary.btn-block');
    await controller.click(loginButton);

    const errorHandle = await controller.findElement('#js-flash-container > div > div');
    const text = await controller.getElementText(errorHandle).then(text => text.trim());
    await expect(controller.getElementText(errorHandle)).to.include('Incorrect username or password.');
  });
});
