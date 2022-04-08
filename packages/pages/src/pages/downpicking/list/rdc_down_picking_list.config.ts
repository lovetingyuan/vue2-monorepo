// eslint-disable-next-line import/no-extraneous-dependencies
import { definePageConfig } from 'renderer';

type PropsMap = {
  SearchProTable: import('ui').SearchProTableProps;
};

export default definePageConfig<PropsMap>({
  // title: '下架规则列表页',
  name: '',
  description: '下架规则列表页',
  version: '0.0.1',
  components: [
    {
      type: 'SearchProTable',
      ref: 'table',
      props: {
        fetchTable: '{{$.fetchTable}}',
        filters: [
          {
            label: '业务类型',
            prop: 'businessType',
            type: 'form-select',
            props: {
              options: [
                { label: '补货下架', value: 11 },
                { label: '拣货下架', value: 1 },
                {
                  label: 'PC仓拣货下架',
                  value: 45,
                },
              ],
              clearable: true,
            },
          },
          {
            type: 'log-poi-select',
            label: '适用地点',
            field: true,
            prop: 'poiId',
            props: {
              usePermission: true,
              businessTypeList: [1, 2],
              multiple: false,
              clearable: true,
            },
          },
          {
            label: '规则代码',
            prop: 'ruleNo',
            type: 'form-input',
            props: {
              clearable: true,
              placeholder: '请输入规则代码',
            },
          },
          {
            label: '规则名称',
            prop: 'ruleName',
            type: 'form-input',
            props: {
              clearable: true,
              placeholder: '请输入规则名称',
            },
          },
        ],
        buttons: [
          {
            text: '新建规则',
            click: '{{ () => $.$tools.linkTo("./detail.html", {mode:"create"}) }}',
          },
        ],
        columns: [
          {
            label: '规则代码',
            prop: 'ruleNo',
          },
          {
            label: '适用门店类型',
            prop: 'poiType.label',
          },
          {
            label: '业务类型',
            prop: 'businessType.label',
          },
          {
            label: '适用门店',
            prop: 'poiList',
            // format: '{{ val => val.row.poiIdList.map(v => v.label).toString() }}',
            config: {
              showOverflowTooltip: true,
            },
          },
          {
            label: '规则名称',
            prop: 'ruleName',
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
            buttons: [
              {
                text: '查看',
                click: '{{(item) => {$.$tools.linkTo("./detail.html", {mode:"view", ruleNo: item.row.ruleNo})} }}',
              },
              {
                text: '编辑',
                click: '{{(item) => {$.$tools.linkTo("./detail.html", {mode:"edit", ruleNo: item.row.ruleNo})} }}',
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
