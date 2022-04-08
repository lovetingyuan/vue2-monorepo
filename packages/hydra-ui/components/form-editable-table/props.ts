export interface FormEditableTableProps {
  tableConfig: object;
  columnsConfigs: Array<object>;
  metadata: object;
  entityId: string | number;
  attributeId: string | number;
  parentModel?: object;
  prop: string;
}
