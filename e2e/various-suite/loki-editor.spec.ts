import { e2e } from '@grafana/e2e';

const dataSourceName = 'LokiEditor';
const addDataSource = () => {
  e2e.flows.addDataSource({
    type: 'Loki',
    expectedAlertMessage:
      'Unable to fetch labels from Loki (Failed to call resource), please check the server logs for more details',
    name: dataSourceName,
    form: () => {
      e2e.components.DataSource.DataSourceHttpSettings.urlInput().type('http://loki-url:3100');
    },
  });
};

e2e.scenario({
  describeName: 'Loki Query Editor',
  itName: 'Autocomplete features should work as expected.',
  addScenarioDataSource: false,
  addScenarioDashBoard: false,
  skipScenario: false,
  scenario: () => {
    addDataSource();

    e2e().intercept(/labels?/, (req) => {
      req.reply({ status: 'success', data: ['instance', 'job', 'source'] });
    });

    e2e().intercept(/series?/, (req) => {
      req.reply({ status: 'success', data: [{ instance: 'instance1' }] });
    });

    // Go to Explore and choose Loki data source
    e2e.pages.Explore.visit();
    e2e.components.DataSourcePicker.container().should('be.visible').click();
    e2e().contains(dataSourceName).scrollIntoView().should('be.visible').click();

    e2e().contains('Code').click();

    // Wait for lazy loading
    const monacoLoadingText = 'Loading...';

    e2e.components.QueryField.container().should('be.visible').should('have.text', monacoLoadingText);
    e2e.components.QueryField.container().should('be.visible').should('not.have.text', monacoLoadingText);

    const queryField = e2e.components.QueryField.container();
    const queryFieldValue = e2e().get('.monaco-editor textarea:first');

    // adds closing braces around empty value
    queryField.type('time(', { parseSpecialCharSequences: false });
    queryFieldValue.should(($el) => {
      expect($el.val()).to.eq('time()');
    });

    // removes closing brace when opening brace is removed
    queryField.type('{backspace}');
    queryFieldValue.should(($el) => {
      expect($el.val()).to.eq('time');
    });

    // keeps closing brace when opening brace is removed and inner values exist
    queryField.type(`{selectall}{backspace}time(test{leftArrow}{leftArrow}{leftArrow}{leftArrow}{backspace}`);
    queryFieldValue.should(($el) => {
      expect($el.val()).to.eq('timetest)');
    });

    // overrides an automatically inserted brace
    queryField.type(`{selectall}{backspace}time()`);
    queryFieldValue.should(($el) => {
      expect($el.val()).to.eq('time()');
    });

    // does not override manually inserted braces
    queryField.type(`{selectall}{backspace}))`);
    queryFieldValue.should(($el) => {
      expect($el.val()).to.eq('))');
    });

    /** Runner plugin */

    // Should execute the query when enter with shift is pressed
    queryField.type(`{selectall}{backspace}{shift+enter}`);
    e2e().get('[data-testid="explore-no-data"]').should('be.visible');

    /** Suggestions plugin */
    e2e().get('[role="code"]').type(`{selectall}av`);
    e2e().contains('avg').should('be.visible');
    e2e().contains('avg_over_time').should('be.visible');
  },
});
