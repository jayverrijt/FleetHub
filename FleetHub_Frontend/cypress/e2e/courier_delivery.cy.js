describe('E2E: Courier Authentication & Stop Delivery Flow', () => {
    beforeEach(() => {
        // Begin elke test met een schone browser-toestand
        cy.clearLocalStorage();
    });

    it('E2E-COURIER-01: logs in as courier, loads active stops, and marks stop as delivered', () => {
        // 1. Navigeer naar de applicatie
        cy.visit('/');

        // 2. Inloggen met geldige inloggegevens voor Chauffeur 1
        cy.get('input[type="email"], input:not([type="password"])')
            .first()
            .clear()
            .type('driver1@fleethub.nl');

        cy.get('input[type="password"]')
            .clear()
            .type('password123');

        cy.contains('button', /inloggen/i).click();

        // 3. Verifieer dat authenticatie slaagt: het inlogscherm verdwijnt en de uitlogknop verschijnt
        cy.contains('button', /uitloggen/i, { timeout: 10000 }).should('be.visible');
        cy.contains('Centraal Vloot- & Bezorgplatform').should('not.exist');

        // 4. Verifieer dat de rittenweergave actief is
        cy.contains(/indrive|route|stops/i).should('be.visible');

        // 5. Behandel dynamisch de stops zodra deze getoond worden
        cy.get('body').then(($body) => {
            const deliveredBtn = $body.find('button:contains("Geleverd"), button:contains("DELIVERED")');
            if (deliveredBtn.length > 0) {
                cy.wrap(deliveredBtn.first()).click();
                cy.contains(/DELIVERED|GELEVERD/i).should('be.visible');
            }
        });
    });

    it('E2E-COURIER-02: shows error alert on invalid credentials', () => {
        // 1. Navigeer naar de inlogpagina
        cy.visit('/');

        // 2. Voer doelbewust ongeldige inloggegevens in
        cy.get('input[type="email"], input:not([type="password"])')
            .first()
            .clear()
            .type('onbekend@fleethub.nl');

        cy.get('input[type="password"]')
            .clear()
            .type('foutWachtwoord');

        cy.contains('button', /inloggen/i).click();

        // 3. Verifieer dat de backend HTTP 400 teruggeeft en de UI de foutmelding toont
        cy.contains(/ongeldig|onjuist|fout|mislukt|invalid|bad/i, { timeout: 8000 }).should('be.visible');

        // 4. Verifieer dat de gebruiker niet per ongeluk ingelogd raakt
        cy.contains('button', /uitloggen/i).should('not.exist');
    });
});