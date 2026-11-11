describe('E2E: Courier Authentication Flow', () => {
    beforeEach(() => {
        // Schone browser-status vóór elke testrun
        cy.clearLocalStorage();
        cy.clearCookies();

        // Intercept de authenticatie endpoint
        cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    });

    it('E2E-COURIER-01: logs in as courier and navigates to the active courier workspace (Happy Flow)', () => {
        cy.visit('/');

        // 1. Vul geldige inloggegevens in
        cy.get('input#login-email, input[type="email"]')
            .should('be.visible')
            .clear()
            .type('driver1@fleethub.nl');

        cy.get('input#login-password, input[type="password"]')
            .should('be.visible')
            .clear()
            .type('password123');

        cy.contains('button', /inloggen/i).click();

        // 2. Valideer de API-respons (HTTP 200 OK)
        cy.wait('@loginRequest').then((interception) => {
            assert.isDefined(interception.response, 'API response moet ontvangen zijn');
            expect(interception.response.statusCode).to.eq(200);
        });

        // 3. Verifieer dat het inlogscherm verdwijnt en de werkruimte laadt
        cy.contains('Centraal Vloot- & Bezorgplatform').should('not.exist');
        cy.contains('button', /uitloggen/i, { timeout: 10000 }).should('be.visible');

        // 4. Verifieer dat de chauffeur-context actief is
        cy.contains(/indrive|route|stops|chauffeur|welkom|jan de vries/i, { timeout: 8000 })
            .should('be.visible');
    });

    it('E2E-COURIER-02: shows error alert on invalid credentials (Alternative Flow)', () => {
        cy.visit('/');

        // 1. Vul doelbewust foutieve gegevens in
        cy.get('input#login-email, input[type="email"]')
            .should('be.visible')
            .clear()
            .type('onbekend@fleethub.nl');

        cy.get('input#login-password, input[type="password"]')
            .should('be.visible')
            .clear()
            .type('foutWachtwoord');

        cy.contains('button', /inloggen/i).click();

        // 2. Valideer de server-afwijzing (HTTP 400 of 401)
        cy.wait('@loginRequest').then((interception) => {
            assert.isDefined(interception.response, 'API response moet ontvangen zijn');
            expect([400, 401]).to.include(interception.response.statusCode);
        });

        // 3. Verifieer de foutmelding in de UI
        cy.contains(/ongeldig|onjuist|fout|mislukt|invalid|bad/i, { timeout: 8000 })
            .should('be.visible');

        // 4. Verifieer dat er geen sessie is gestart
        cy.contains('button', /uitloggen/i).should('not.exist');
    });
});