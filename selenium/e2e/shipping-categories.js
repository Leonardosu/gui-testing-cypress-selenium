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

  const deleteCategory = async (categoryName) => {
    await driver.findElement(By.linkText('Shipping categories')).click();

    // Localizar a linha com o texto 'to_be_deleted'
    const rowLocator = By.xpath(`//tr[contains(., '${categoryName}')]`);
    const rowElement = await driver.findElement(rowLocator);

    // Encontrar o botão de exclusão dentro da linha
    const deleteButton = await rowElement.findElement(By.css('*[class="ui red labeled icon button"]'));
    await deleteButton.click();

    const confirmButton = await driver.findElement(By.css('*[class="ui green ok inverted button"]'));
    await confirmButton.click();
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

  it('should delete a shipping category if the user click YES', async () => {
    const categoryName = genString(15);
    await genCategory(categoryName);
    await driver.findElement(By.linkText('Shipping categories')).click();

    const rowLocator = By.xpath(`//tr[contains(., '${categoryName}')]`);
    const rowElement = await driver.findElement(rowLocator);

    const deleteButton = await rowElement.findElement(By.css('*[class="ui red labeled icon button"]'));
    await deleteButton.click();

    const confirmButton = await driver.findElement(By.css('*[class="ui green ok inverted button"]'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Shipping category has been successfully deleted.'));
    assert(!bodyText.includes(categoryName));
  });
  
  it('should delete a shipping category if the user click NO', async () => {
    const categoryName = genString(15);
    await genCategory(categoryName);
    await driver.findElement(By.linkText('Shipping categories')).click();

    const rowLocator = By.xpath(`//tr[contains(., '${categoryName}')]`);
    const rowElement = await driver.findElement(rowLocator);

    const deleteButton = await rowElement.findElement(By.css('*[class="ui red labeled icon button"]'));
    await deleteButton.click();

    const notConfirmButton = await driver.findElement(By.css('*[class="ui red basic cancel inverted button"]'));
    await notConfirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(!bodyText.includes('Shipping category has been successfully deleted.'));
    assert(bodyText.includes(categoryName));
    deleteCategory(categoryName);
  });

  it('edit a shipping category', async () => {
    const categoryName = genString(15);
    await genCategory(categoryName);
    await driver.findElement(By.linkText('Shipping categories')).click();

    const rowLocator = By.xpath(`//tr[contains(., '${categoryName}')]`);
    const rowElement = await driver.findElement(rowLocator);

    const editButton = await rowElement.findElement(By.css('*[class^="ui labeled icon button"]'));
    await editButton.click();
    
    await driver.findElement(By.id('sylius_shipping_category_name')).clear();
    await driver.findElement(By.id('sylius_shipping_category_description')).clear();

    await driver.findElement(By.id('sylius_shipping_category_name')).sendKeys('New Name 22');
    await driver.findElement(By.id('sylius_shipping_category_description')).sendKeys('New Description 22');

    const confirmButton = await driver.findElement(By.css('*[class="ui labeled icon primary button"]'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes('Shipping category has been successfully updated.'));
    assert(bodyText.includes('New Name 22'));
    assert(bodyText.includes('New Description 22'));
    deleteCategory(categoryName);
  });

  it('should filter equals category', async () => {
    const categoryName1 = "RandomCategory";
    const categoryName2 = "OtherName";
    await genCategory(categoryName1);
    await genCategory(categoryName2);

    await driver.findElement(By.linkText('Shipping categories')).click();
    
    const selectElement = await driver.findElement(By.css('#criteria_search_type'));
    await driver.executeScript("arguments[0].value = 'equal';", selectElement);
    await driver.findElement(By.id('criteria_search_value')).sendKeys(categoryName1);
    const confirmButton = await driver.findElement(By.css('[class="ui blue labeled icon button"'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes(categoryName1));
    assert(!bodyText.includes(categoryName2));

    await deleteCategory(categoryName1);
    await deleteCategory(categoryName2);
  });

  it('should filter contains category', async () => {
    const categoryName1 = "RandomCategory";
    const categoryName2 = "RandCategory";
    const categoryName3 = "OtherName";
    await genCategory(categoryName1);
    await genCategory(categoryName2);
    await genCategory(categoryName3);

    await driver.findElement(By.linkText('Shipping categories')).click();
    
    const selectElement = await driver.findElement(By.css('#criteria_search_type'));
    await driver.executeScript("arguments[0].value = 'contains';", selectElement);
    await driver.findElement(By.id('criteria_search_value')).sendKeys('Rand');
    const confirmButton = await driver.findElement(By.css('[class="ui blue labeled icon button"'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes(categoryName1));
    assert(bodyText.includes(categoryName2));
    assert(!bodyText.includes(categoryName3));

    await deleteCategory(categoryName1);
    await deleteCategory(categoryName2);
    await deleteCategory(categoryName3);
  });

  it('should filter not contains category', async () => {
    const categoryName = "RandomCategory";
    await genCategory(categoryName);

    await driver.findElement(By.linkText('Shipping categories')).click();
    
    const selectElement = await driver.findElement(By.css('#criteria_search_type'));
    await driver.executeScript("arguments[0].value = 'not_contains';", selectElement);
    await driver.findElement(By.id('criteria_search_value')).sendKeys('Random');
    const confirmButton = await driver.findElement(By.css('[class="ui blue labeled icon button"'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(!bodyText.includes(categoryName));

    await deleteCategory(categoryName);
  });

  it('should filter starts with', async () => {
    const categoryName1 = "RandomCategory";
    const categoryName2 = "OtherCategory";
    await genCategory(categoryName1);
    await genCategory(categoryName2);

    await driver.findElement(By.linkText('Shipping categories')).click();
    
    const selectElement = await driver.findElement(By.css('#criteria_search_type'));
    await driver.executeScript("arguments[0].value = 'starts_with';", selectElement);
    await driver.findElement(By.id('criteria_search_value')).sendKeys('Random');
    const confirmButton = await driver.findElement(By.css('[class="ui blue labeled icon button"'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes(categoryName1));
    assert(!bodyText.includes(categoryName2));

    await deleteCategory(categoryName1);
    await deleteCategory(categoryName2);
  });

  it.only('should filter categories with ends_with', async () => {
    const categoryName1 = "Categoryfoo";
    const categoryName2 = "Categoryhaha";
    await genCategory(categoryName1);
    await genCategory(categoryName2);

    await driver.findElement(By.linkText('Shipping categories')).click();
    
    const selectElement = await driver.findElement(By.css('#criteria_search_type'));
    await driver.executeScript("arguments[0].value = 'ends_with';", selectElement);
    await driver.findElement(By.id('criteria_search_value')).sendKeys('foo');
    const confirmButton = await driver.findElement(By.css('[class="ui blue labeled icon button"'));
    await confirmButton.click();

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert(bodyText.includes(categoryName1));
    assert(!bodyText.includes(categoryName2));

    await deleteCategory(categoryName1);
    await deleteCategory(categoryName2);
  });

});
