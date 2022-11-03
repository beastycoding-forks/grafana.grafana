import React from 'react';
import { ColumnInstance, HeaderGroup } from 'react-table';

import { selectors } from '@grafana/e2e-selectors';

import { useStyles2 } from '../../themes';

import { EmptyCell, FooterCell } from './FooterCell';
import { getTableStyles, TableStyles } from './styles';
import { FooterItem } from './types';

export interface FooterRowProps {
  totalColumnsWidth: number;
  footerGroups: HeaderGroup[];
  footerValues: FooterItem[];
  isPaginationVisible: boolean;
  isCountAllSet: boolean;
  height: number;
}

export const FooterRow = (props: FooterRowProps) => {
  const { totalColumnsWidth, footerGroups, height, isPaginationVisible, isCountAllSet } = props;
  const e2eSelectorsTable = selectors.components.Panels.Visualization.Table;
  const tableStyles = useStyles2(getTableStyles);

  return (
    <div
      style={{
        position: isPaginationVisible ? 'relative' : 'absolute',
        width: totalColumnsWidth ? `${totalColumnsWidth}px` : '100%',
        bottom: '0px',
      }}
    >
      {footerGroups.map((footerGroup: HeaderGroup) => {
        const { key, ...footerGroupProps } = footerGroup.getFooterGroupProps();
        return (
          <div
            className={tableStyles.tfoot}
            {...footerGroupProps}
            key={key}
            data-testid={e2eSelectorsTable.footer}
            style={height ? { height: `${height}px` } : undefined}
          >
            {footerGroup.headers.map((column: ColumnInstance, index: number) =>
              isCountAllSet && index > 0 ? EmptyCell : renderFooterCell(column, tableStyles, height, isCountAllSet)
            )}
          </div>
        );
      })}
    </div>
  );
};

function renderFooterCell(column: ColumnInstance, tableStyles: TableStyles, height?: number, isCountAllSet?: boolean) {
  const footerProps = column.getHeaderProps();

  if (!footerProps) {
    return null;
  }

  footerProps.style = footerProps.style ?? {};
  footerProps.style.position = 'absolute';
  footerProps.style.justifyContent = (column as any).justifyContent;
  if (height) {
    footerProps.style.height = height;
  }

  return (
    <div className={tableStyles.headerCell} {...footerProps}>
      {column.render('Footer')}
    </div>
  );
}

export function getFooterValue(index: number, footerValues?: FooterItem[], isCountAllSet?: boolean) {
  if (footerValues === undefined) {
    return EmptyCell;
  }

  if (isCountAllSet) {
    return FooterCell({ value: [{ Count: footerValues[index] as string }] });
  }

  return FooterCell({ value: footerValues[index] });
}
