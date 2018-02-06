// import cy from 'cypress'

describe("Movies List App", function() {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Search Results Page", function() {
    it("has a max pagelength of 10", () => {
      cy.get("h3>a").should("have.length", 10); // 10 titles exist on page
    });

    it("can search for a partial title", () => {
      cy
        .get('input[type="text"]')
        .first()
        .type("third{enter}"); // Search for "The Third Man"
      cy
        .get("h3>a")
        .first()
        .should("contain", "The Third Man");
    });

    it("fetches many titles on empty search term", () => {
      cy
        .get('input[type="text"]')
        .first()
        .clear()
        .type("{enter}");
      cy.get("h3>a").should("have.length", 10);
    });

    it("displays a message when no results", () => {
      cy
        .get('input[type="text"]')
        .first()
        .type("asdfasdfasdf{enter}"); // search term matching no movies
      cy.contains("No movies.");
    });

    it("can sort by title", function() {
      cy.visit("/");
      // check to see if movie titles are in ascending alphabetical order
      cy.get("h3>a").should(el => {
        let titles = el.map((i, val) => val.textContent).toArray();
        titles.reduce((a, b) => {
          expect(a <= b).to.be.true;
          return b;
        });
      });
    });

    it("can sort by year", () => {
      cy.get("#sort-by-dropdown").click();
      cy.contains("Year").click();
      // check to see if movie years are in ascending order
      cy.get(".movie-info").should(el => {
        let years = el
          .map((i, val) => parseInt(val.textContent.slice(0, 4)))
          .toArray();
        years.reduce((a, b) => {
          expect(a).to.be.at.most(b);
          return b;
        });
      });
    });

    it("can sort by runtime", () => {
      cy.get("#sort-by-dropdown").click();
      cy.contains("runtime").click();
      // check to see if runtimes are in ascending order
      cy.get(".movie-info").should(el => {
        let years = el
          .map((i, val) => parseInt(val.textContent.slice(4, 6)))
          .toArray();
        years.reduce((a, b) => {
          expect(a).to.be.at.most(b);
          return b;
        });
      });
    });

    it("can click to edit a movie", () => {
      cy
        .get(".glyphicon-edit")
        .first()
        .click(); // click on the edit icon
      cy.get("div.modal-content"); // verify edit modal exists
      cy.get("body").type("{esc}"); // close out of the edit modal
      cy
        .get("h3>a")
        .first()
        .click(); // click on the title
      cy.get("div.modal-content"); // verify edit modal exists
    });

    it("can remove a listing", () => {
      cy
        .get(".glyphicon-remove")
        .first()
        .click();
      cy.contains("Ok").click();
      cy.get("h3>a").should("not.contain", "12 Angry Men");
    });

    it("can add a new listing", () => {
      cy
        .get(".glyphicon-plus")
        .first()
        .click();
      cy.get('input[name="title"]').type("0 new listing");
      cy.get('input[name="director"]').type("director");
      cy.get('textarea[name="actors"]').type("actors");
      cy
        .get("button")
        .contains("Save")
        .click();
      cy.get("h3>a").contains("0 new listing");
    });
  });

  describe("Edit Movie Dialog", () => {
    beforeEach(() => {
      cy.visit("/");
      cy
        .get("h3>a")
        .first()
        .click({ force: true });

      cy
        .get("div.modal-content")
        .get(".Select-control")
        .as("tags-dropdown");

      cy.get("div.modal-content").as("modal");
    });

    it("toasts successfully on save", () => {
      cy
        .get("div.modal-content")
        .find('button').contains('Save')
        .click();
      cy.get(".toast-message").should("contain", "Movie was saved");
    });

    describe("Movie Tags", () => {
      it("can add movie tags with click", () => {
        cy.get("@tags-dropdown").click();
        cy.contains("Comedy").click();
        cy.contains("Genres").click(); // hide the select menu
        cy.contains("Comedy");
      });

      it("can remove tags with click", () => {
        cy
          .get("@tags-dropdown")
          .contains("×")
          .click(); // click the x button to remove a genre

        cy.get("@tags-dropdown").should("not.contain", "Crime");
      });

      it("can remove movie tags with backspace", () => {
        cy
          .get("@tags-dropdown")
          .find("input")
          .click()
          .type("{backspace}".repeat(2));

        cy
          .get("@tags-dropdown")
          .should("not.contain", "Crime")
          .and("not.contain", "Drama");
      });

      it("can arrow through movie tags", () => {
        cy
          .get("@tags-dropdown")
          .find("input")
          .click({ force: true })
          .type("{downarrow}".repeat(10) + "{enter}", { force: true });

        // TODO: check to see if selected genre gets populated in the field
        // Not sure if this tests anything
      });
    });

    describe("Edit Movie Validation", () => {
      beforeEach("Close and open an edit movie modal", () => {});

      it("warns for year less than 1900", () => {
        cy
          .get('input[name="year"]')
          .clear()
          .type("1899");
        cy
          .get("button")
          .contains("Save")
          .click();

        cy.contains("Invalid");
      });

      it("warns for year greater than 2050", () => {
        cy
          .get('input[name="year"]')
          .clear()
          .type("2051");
        cy
          .get("button")
          .contains("Save")
          .click();

        cy.contains("Invalid");

        cy
          .get('input[name="year"]')
          .clear()
          .type("2050");
        cy
          .get("button")
          .contains("Save")
          .click();
      });

      it("warns for empty title field", () => {
        cy.get('input[name="title"]').clear();
        cy
          .get("button")
          .contains("Save")
          .click();
        cy.get("@modal").contains("Field is required.");
      });

      it("warns for empty year field", () => {
        cy.get('input[name="year"]').clear();
        cy
          .get("button")
          .contains("Save")
          .click();
        cy.get("@modal").contains("Field is required.");
      });

      it("warns for empty runtime field", () => {
        cy.get('input[name="runtime"]').clear();
        cy
          .get("button")
          .contains("Save")
          .click();
        cy.get("@modal").contains("Field is required.");
      });

      it("warns for empty director field", () => {
        cy.get('input[name="director"]').clear();
        cy
          .get("button")
          .contains("Save")
          .click();
        cy.get("@modal").contains("Field is required.");
      });

      it("warns for empty actors field", () => {
        cy.get('textarea[name="actors"]').clear();
        cy
          .get("button")
          .contains("Save")
          .click();
        cy.get("@modal").contains("Field is required.");
      });
    });
  });
});
