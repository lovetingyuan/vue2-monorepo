import { definePageConfig } from 'renderer';

type PropsMap = {
  SearchProTable: import('ui').SearchProTableProps;
};
export default definePageConfig<PropsMap>({
  // title: '下架规则',
  name: '',
  description: '下架规则列表页',
  version: '0.0.1',
  components: [
    {
      type: 'SearchProTable',
      ref: 'table',
      props: {
        fetchTable: '{{$.fetchTable}}',
        filterProps: { maxSize: 1 },
        filters: [
          {
            label: '业务类型',
            prop: 'businessType',
            type: 'form-select',
            props: {
              options: [
                { label: '补货下架', value: 11 },
                { label: '拣货下架', value: 34 },
                {
                  label: 'CPC拣货下架规则',
                  value: 51,
                },
              ],
              clearable: true,
            },
          },
          {
            label: '规则代码',
            prop: 'ruleNo',
            type: 'form-input',
            props: {
              placeholder: '请输入规则代码',
              clearable: true,
            },
          },
          {
            label: '规则名称',
            prop: 'ruleName',
            type: 'form-input',
            props: {
              placeholder: '请输入规则名称',
              clearable: true,
            },
          },
        ],
        columns: [
          {
            label: '规则代码',
            prop: 'ruleNo',
          },
          {
            label: '规则名称',
            prop: 'ruleName',
          },
          {
            label: '业务类型',
            prop: 'businessType.label',
          },
          {
            label: '状态',
            prop: 'statusName',
          },
          {
            label: '最后更新时间',
            prop: 'updateAt',
          },
          {
            label: '最新编辑人',
            prop: 'updateBy',
          },
          {
            label: '操作',
            prop: '_operation',
            buttons: [
              {
                text: '查看',
                click:
                  '{{(item) => {$.$tools.linkTo("./detail.html", {mode:"view", ruleNo: item.row.ruleNo, poiId: $.poiId,})} }}',
              },
              {
                text: '编辑',
                click:
                  '{{(item) => {$.$tools.linkTo("./detail.html", {mode:"edit", ruleNo: item.row.ruleNo, poiId: $.poiId,})} }}',
              },
              {
                text: '{{ scope => scope.row.statusName === "有效" ? "禁用" : "启用" }}',
                confirm: '{{ scope => "确认" + (scope.row.statusName === "有效" ? "禁用" : "启用") + "该规则吗？" }}',
                click: '{{ item => $.switchRule(item.row, refs.table)}}',
              },
              {
                text: '删除',
                visible: "{{ item => item.row.statusName === '无效' }}",
                confirm: '确认删除该规则吗？',
                click: '{{ item => $.deleteRule(item.row, refs.table)}}',
              },
            ],
          },
        ],
      },
    },
  ],
});
