const randomstring = require("randomstring");
Cypress.config('defaultCommandTimeout', 20000);

const genString = (length) => {
  return randomstring.generate({
    length,
    charset: 'alphabetic'
  });
}

const genCategory = (categoryName) => {
  cy.clickInFirst('a[href="/admin/shipping-categories/"]');
  cy.get('*[class^="ui labeled icon button  primary "]').click();
  cy.get('[id="sylius_shipping_category_code"]').type(categoryName);
  cy.get('[id="sylius_shipping_category_name"]').type(categoryName);
  cy.get('[id="sylius_shipping_category_description"]').type(categoryName);

  cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();
}

const deleteCategory = (categoryName) => {
  cy.clickInFirst('a[href="/admin/shipping-categories/"]');
  cy.contains('tr', categoryName)
  .within(() => {
    cy.get('*[class^="ui red labeled icon button"]')
      .click();
  });
  cy.get('*[class="ui green ok inverted button"]').click()
}

describe('shipping categories', () => {
  beforeEach({retries: 3}, () => {
    cy.visit('/admin');
    cy.get('[id="_username"]').type('sylius');
    cy.get('[id="_password"]').type('sylius');
    cy.get('.primary').click();
    cy.wait(1500);
  });
  it('create a new shipping category', () => {
    // Click in shipping categories in side menu
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    // Click on create button
    cy.get('*[class^="ui labeled icon button  primary "]').click();
    // Type category code
    cy.get('[id="sylius_shipping_category_code"]').type('33');
    // Type category name
    cy.get('[id="sylius_shipping_category_name"]').type('33');
    // Type category description
    cy.get('[id="sylius_shipping_category_description"]').type('3333');

    // Click on create button
    cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();
    // Assert that shipping category has been created.
    cy.get('body').should('contain', 'Shipping category has been successfully created.');
    deleteCategory('33');
  });
  it('should delete a shipping category if the user click YES', () => {
    const categoryName = genString(15);
    genCategory(categoryName);
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    cy.contains('tr', categoryName)
    .within(() => {
      cy.get('*[class="ui red labeled icon button"]')
        .click();
    });
    cy.get('*[class="ui green ok inverted button"]').click()

    cy.get('body').should('contain', 'Shipping category has been successfully deleted.');
    cy.get('body').should('not.contain', categoryName);
  });
  it('should not delete a shipping category if the user click NO', () => {
    const categoryName = genString(15);
    genCategory(categoryName);
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    cy.contains('tr', categoryName)
    .within(() => {
      cy.get('*[class="ui red labeled icon button"]')
        .click();
    });
    cy.get('*[class="ui red basic cancel inverted button"]').click()

    cy.get('body').should('not.contain', 'Shipping category has been successfully deleted.');
    cy.get('body').should('contain', categoryName);
    deleteCategory(categoryName);
  });
  it('edit a shipping category', () => {
    const categoryName = genString(15);
    genCategory(categoryName);
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    cy.contains('tr', categoryName)
    .within(() => {
      cy.get('*[class^="ui labeled icon button"]')
        .click();
    });

    cy.get('[id="sylius_shipping_category_name"]').clear().type('New Name 22');
    cy.get('[id="sylius_shipping_category_description"]').clear().type('New Description 22');

    cy.get('*[class="ui labeled icon primary button"]').scrollIntoView().click();

    cy.get('body').should('contain', 'Shipping category has been successfully updated.');
    cy.get('body').should('contain', 'New Name 22');
    cy.get('body').should('contain', 'New Description 22');
    deleteCategory('New Name 22');
  });
  it('should filter categories equals to "RandomCategory"', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create some category
    const categoryName1 = "RandomCategory";
    const categoryName2 = "OtherName";
    genCategory(categoryName1);
    genCategory(categoryName2);

    // Set filter to 'equals'
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('#criteria_search_type').select('equal');
    cy.get('[id="criteria_search_value"]').type(categoryName1);

    cy.get('[class="ui blue labeled icon button"').click();

    // Assert only category 'RandomCategory' appear
    cy.contains('tr', categoryName1).should('exist');
    cy.contains('tr', categoryName2).should('not.exist');

    deleteCategory(categoryName1);
    deleteCategory(categoryName2);
  });
  it('should filter categories that contains "Rand"', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create categories
    const categoryName1 = "RandomCategory";
    const categoryName2 = "RandCategory";
    const categoryName3 = "OtherName";
    genCategory(categoryName1);
    genCategory(categoryName2);
    genCategory(categoryName3);

    // Set filter to 'contains'
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('#criteria_search_type').select('contains');
    cy.get('[id="criteria_search_value"]').type('Rand');
    cy.get('[class="ui blue labeled icon button"').click();

    // Assert only category 'RandomCategory' and 'RandCategory' appear
    cy.contains('tr', categoryName1).should('exist');
    cy.contains('tr', categoryName2).should('exist');
    cy.contains('tr', categoryName3).should('not.exist');

    deleteCategory(categoryName1);
    deleteCategory(categoryName2);
    deleteCategory(categoryName3);
  });
  it('should filter categories that not contains "Random"', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create a category
    const categoryName = "RandomCategory";
    genCategory(categoryName);

    // Set filter to 'no contains'
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('#criteria_search_type').select('not_contains');
    cy.get('[id="criteria_search_value"]').type('Random');

    cy.get('[class="ui blue labeled icon button"').click();

    //Assert that none category appear
    cy.contains('tr', categoryName).should('not.exist');

    deleteCategory(categoryName);
  });
  it('should filter categories that start with "Random"', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create some category
    const categoryName1 = "RandomCategory";
    const categoryName2 = "OtherCategory";
    genCategory(categoryName1);
    genCategory(categoryName2);

    // Set filter to 'start with'
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('#criteria_search_type').select('starts_with');
    cy.get('[id="criteria_search_value"]').type('Random');

    cy.get('[class="ui blue labeled icon button"').click();

    
    //Assert that only category 'RandomCategory' appear
    cy.contains('tr', categoryName1).should('exist');
    cy.contains('tr', categoryName2).should('not.exist');

    deleteCategory(categoryName1);
    deleteCategory(categoryName2);
  });
  it('should filter categories that end with "foo"', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create some category
    const categoryName1 = "Categoryfoo";
    const categoryName2 = "Categoryhaha";
    genCategory(categoryName1);
    genCategory(categoryName2);

    // Set filter to 'end with'
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('#criteria_search_type').select('ends_with');
    cy.get('[id="criteria_search_value"]').type('foo');

    cy.get('[class="ui blue labeled icon button"').click();

    
    //Assert that only category 'Categoryfoo' appear
    cy.contains('tr', categoryName1).should('exist');
    cy.contains('tr', categoryName2).should('not.exist');

    deleteCategory(categoryName1);
    deleteCategory(categoryName2);
  });
  it('delte all categories', () => {
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');

    //Create some category
    const categoryName1 = "c1";
    const categoryName2 = "c2";
    const categoryName3 = "c3";
    genCategory(categoryName1);
    genCategory(categoryName2);
    genCategory(categoryName3);

    // Select all categories
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('input[data-js-bulk-buttons=".sylius-grid-nav__bulk"]').click();
    
    // Click delete button
    cy.get('button[data-bulk-action-requires-confirmation=""]').click();

    cy.get('*[class="ui green ok inverted button"]').click();

    //Assert that all categories was deleted
    cy.get('body').should('contain', 'There are no results to display');
  });
});
