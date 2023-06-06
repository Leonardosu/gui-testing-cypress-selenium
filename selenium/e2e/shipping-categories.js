const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const randomstring = require("randomstring");

const genString = (length) => {
  return randomstring.generate({
    length,
    charset: 'alphabetic'
  });
}

describe('shipping categories', () => {
  let driver;

  const genCategory = async (categoryName) => {
    await driver.findElement(By.linkText('Shipping categories')).click();

    const buttons = await driver.findElements(By.css('*[class^="ui labeled icon button  primary "]'));
    await buttons[0].click();

    await driver.findElement(By.id('sylius_shipping_category_code')).sendKeys(categoryName);
    await driver.findElement(By.id('sylius_shipping_category_name')).sendKeys(categoryName);
    await driver.findElement(By.id('sylius_shipping_category_description')).sendKeys(categoryName);

    const buttonToCreate = await driver.findElements(By.css('*[class^="ui labeled icon primary button"]'));
    await buttonToCreate[0].click();
  }

  before(async () => {
    driver = await new Builder().forBrowser('firefox').build();
  });

  after(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    driver.manage().deleteAllCookies();
    await driver.get('http://localhost:8080/admin');
    // await driver.get('http://150.165.75.99:8080/admin');
    await driver.findElement(By.id('_username')).sendKeys('sylius');
    await driver.findElement(By.id('_password')).sendKeys('sylius');
    await driver.findElement(By.css('.primary')).click();
    await driver.sleep(1000);
  });

  // Remove .only and implement others test cases!
  it('create a new shipping category', async () => {
    // Click in shipping categories in side menu
    await driver.findElement(By.linkText('Shipping categories')).click();

    // Click on create button
    const buttons = await driver.findElements(By.css('*[class^="ui labeled icon button  primary "]'));
    await buttons[0].click();

    // Type category code
    await driver.findElement(By.id('sylius_shipping_category_code')).sendKeys('33');
    // Type category name
    await driver.findElement(By.id('sylius_shipping_category_name')).sendKeys('33');
    // Type category description
    await driver.findElement(By.id('sylius_shipping_category_description')).sendKeys('3333');

    // Click on create button
    const buttonToCreate = await driver.findElements(By.css('*[class^="ui labeled icon primary button"]'));
    await buttonToCreate[0].click();

    // Assert that shipping category has been created.
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Shipping category has been successfully created.'));
  });

  it.only('should delete a shipping category if the user click YES', async () => {
    const categoryName = genString(15);
    await genCategory(categoryName);
    await driver.findElement(By.linkText('Shipping categories')).click();

    // Localizar a linha com o texto 'to_be_deleted'
    const rowLocator = By.xpath(`//tr[contains(., '${categoryName}')]`);
    const rowElement = await driver.findElement(rowLocator);

    // Encontrar o botão de exclusão dentro da linha
    const deleteButton = await rowElement.findElement(By.css('*[class="ui red labeled icon button"]'));
    await deleteButton.click();

    const confirmButton = await driver.findElement(By.css('*[class="ui green ok inverted button"]'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Shipping category has been successfully deleted.'));
    assert(!bodyText.includes(categoryName));
  });
});
