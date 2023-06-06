const randomstring = require("randomstring");

const genString = () => {
  return randomstring.generate({
    length: 10,
    charset: 'alphabetic'
  });
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
  it.only('delete a new shipping category', () => {
    // Implement your test case 2 code here
    const categoryName = genString();
    cy.clickInFirst('a[href="/admin/shipping-categories/"]');
    cy.get('*[class^="ui labeled icon button  primary "]').click();
    cy.get('[id="sylius_shipping_category_code"]').type(categoryName);
    cy.get('[id="sylius_shipping_category_name"]').type(categoryName);
    cy.get('[id="sylius_shipping_category_description"]').type(categoryName);

    cy.get('*[class^="ui labeled icon primary button"]').scrollIntoView().click();

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
  it('test case 3', () => {
    // Implement your test case 3 code here
  });

  // Implement the remaining test cases in a similar manner
});
