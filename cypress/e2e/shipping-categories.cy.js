const randomstring = require("randomstring");

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

describe('shipping categories', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.get('[id="_username"]').type('sylius');
    cy.get('[id="_password"]').type('sylius');
    cy.get('.primary').click();
  });
  // Remove .only and implement others test cases!
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
  it.only('should not delete a shipping category if the user click NO', () => {
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
  });
  it('test case 3', () => {
    
  });

  // Implement the remaining test cases in a similar manner
});
