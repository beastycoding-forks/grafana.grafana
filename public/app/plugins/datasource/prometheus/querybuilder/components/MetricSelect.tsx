import { css } from '@emotion/css';
import React, { useCallback, useState } from 'react';
import Highlighter from 'react-highlight-words';

import { SelectableValue, toOption, GrafanaTheme2 } from '@grafana/data';
import { Select, FormatOptionLabelMeta, useStyles2, EditorField, EditorFieldGroup } from '@grafana/ui';

import { PromVisualQuery } from '../types';

// We are matching words split with space
const splitSeparator = ' ';

export interface Props {
  query: PromVisualQuery;
  onChange: (query: PromVisualQuery) => void;
  onGetMetrics: () => Promise<SelectableValue[]>;
}
const getFakeMetric = (i: number) => {
  return {
    label: `LABEL_${i}`,
    title: `TITLE_${i}`,
    value: `VALUE_${i}`,
  };
};

export function MetricSelect({ query, onChange, onGetMetrics }: Props) {
  const styles = useStyles2(getStyles);
  const [state, setState] = useState<{
    metrics?: Array<SelectableValue<any>>;
    isLoading?: boolean;
  }>({});

  const customFilterOption = useCallback((option: SelectableValue<any>, searchQuery: string) => {
    const label = option.label ?? option.value;
    if (!label) {
      return false;
    }

    // custom value is not a string label but a react node
    if (!label.toLowerCase) {
      return true;
    }

    const searchWords = searchQuery.split(splitSeparator);
    return searchWords.reduce((acc, cur) => acc && label.toLowerCase().includes(cur.toLowerCase()), true);
  }, []);

  const formatOptionLabel = useCallback(
    (option: SelectableValue<any>, meta: FormatOptionLabelMeta<any>) => {
      // For newly created custom value we don't want to add highlight
      if (option['__isNew__']) {
        return option.label;
      }

      return (
        <Highlighter
          searchWords={meta.inputValue.split(splitSeparator)}
          textToHighlight={option.label ?? ''}
          highlightClassName={styles.highlight}
        />
      );
    },
    [styles.highlight]
  );

  return (
    <EditorFieldGroup>
      <EditorField label="Metric">
        <Select
          inputId="prometheus-metric-select"
          placeholder="Select metric"
          virtualized
          onOpenMenu={async () => {
            setState({ isLoading: true });
            // const metrics = await onGetMetrics();
            const metrics = new Array(1000000).fill(getFakeMetric(0));
            console.log('METRRIC SAMPLE', metrics);
            // metrics.splice(0, metrics.length - 100000)
            setState({ metrics, isLoading: undefined });
          }}
          isLoading={state.isLoading}
          options={state.metrics}
          onChange={({ value }) => {}}
        />
      </EditorField>
    </EditorFieldGroup>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  select: css`
    min-width: 125px;
  `,
  highlight: css`
    label: select__match-highlight;
    background: inherit;
    padding: inherit;
    color: ${theme.colors.warning.contrastText};
    background-color: ${theme.colors.warning.main};
  `,
});
