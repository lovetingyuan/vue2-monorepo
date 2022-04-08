import { definePageConfig } from 'renderer';

const config = {
  version: '0.0.1',
  title: '',
  name: 'donwpicking-details',
  components: [
    {
      ref: 'proForm',
      type: 'ProForm',
      model: 'ruleForm',
      defaultValue: {
        poiType: '',
        businessType: '',
        ruleNo: '',
        ruleName: '',
        poiIdList: [],
        effectivePeriodStatusList: [],
        whAreaIdList: [],
        wrsShelfTypeList: [],
        whShelfIdList: [],
        logicZoneIdList: [],
        sortRuleFieldList: [],
      },
      props: {
        requireRules: true,
        submit: '{{$.isViewable ? null : $.submit}}',
        cancel: '{{ $.cancel }}',
        cancelText: '{{$.isViewable ? "返回": "取消"}}',
        labelWidth: 150,
        fieldWidth: 'lg',
        readonly: '{{$.isViewable}}',
      },
      slots: [
        {
          type: 'MyText',
          props: { type: 'h1', content: '配置对象' },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'poiType',
          props: {
            parentModel: 'ruleForm',
            disabled: '{{ $.isEditable}}',
            // label: "适用地点类型",
            // prop: "poiType",
            // required: true,
            // options: [
            //   { label: "中心仓", value: 2 },
            //   { label: "协同仓", value: 6 },
            //   { label: "加工仓", value: 7 },
            //   { label: "自动化仓", value: 101 },
            // ],
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'businessType',
          // modelKey: "ruleForm.businessType",
          props: {
            parentModel: 'ruleForm',
            disabled: '{{ $.isEditable}}',
            // label: "业务类型",
            // prop: "businessType",
            // required: true,
            // options: [
            //   {
            //     label: "收货上架",
            //     value: 101,
            //     hint: "",
            //     selectable: true,
            //   },
            //   {
            //     label: "协同仓收货上架",
            //     value: 109,
            //     hint: "",
            //     selectable: true,
            //   },
            //   {
            //     label: "移库上架",
            //     value: 112,
            //     hint: "",
            //     selectable: true,
            //   },
            //   {
            //     label: "调拨上架",
            //     value: 116,
            //     hint: "",
            //     selectable: true,
            //   },
            // ],
          },
        },

        {
          type: 'FormInput',
          isVisible: '{{!$.isCreateable}}',
          attributeName: 'ruleNo',
          props: {
            parentModel: 'ruleForm',
            // label: "规则代码",
            // prop: "ruleNo",
            // required: true,
            disabled: true,
          },
        },
        {
          type: 'FormInput',
          attributeName: 'ruleName',
          props: {
            parentModel: 'ruleForm',
            // label: "规则名称",
            // prop: "ruleName",
            // required: true,
          },
        },

        {
          type: 'MyFormPoiSelect',
          attributeName: 'poiIdList',
          props: {
            // label: "适用地点",
            // prop: "poiIdList",
            // required: true,
            parentModel: 'ruleForm',
            poiTypeCustom: '{{ model.ruleForm.poiType }}',
          },
        },
        {
          type: 'MyText',
          props: {
            content: '库区库位匹配策略',
            type: 'h1',
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'effectivePeriodStatusList',
          props: {
            parentModel: 'ruleForm',
            // label: "商品效期状态",
            // prop: "effectivePeriodStatusList",
            // required: true,
            clearable: true,
            multiple: true,
            // options: [
            //   { value: 1, label: "正常" },
            //   { value: 2, label: "风险期" },
            //   { value: 3, label: "临期" },
            //   { value: 4, label: "禁售" },
            //   { value: 5, label: "过期" },
            // ],
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'whAreaIdList',
          props: {
            parentModel: 'ruleForm',
            // label: "指定库区",
            // prop: "whAreaIdList",
            // required: true,
            clearable: true,
            multiple: true,
            // options: [
            //   { label: "冷藏区", value: 1 },
            //   { label: "冷冻区", value: 2 },
            // ],
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'wrsShelfTypeList',
          props: {
            parentModel: 'ruleForm',
            // label: "指定库位类型",
            // prop: "shelfTypeList", 为什么改了呢
            // required: true,
            clearable: true,
            multiple: true,
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'logicZoneIdList',
          props: {
            parentModel: 'ruleForm',
            // label: "指定逻辑区",
            // prop: "logicZoneIdList",
            clearable: true,
            multiple: true,
            filterable: true,
            // options: [
            //   { label: "00-00-00-00", value: "00-00-00-00" },
            //   { label: "11-00-00-00", value: "11-00-00-00" },
            // ],
          },
        },
        {
          type: 'MyFormSelector',
          attributeName: 'whShelfIdList',
          props: {
            parentModel: 'ruleForm',
            // label: "指定库位",
            // prop: "whShelfIdList",
            // required: true,
            clearable: true,
            multiple: true,
            filterable: true,
            // options: [
            //   { label: "00-00-00-00", value: "00-00-00-00" },
            //   { label: "11-00-00-00", value: "11-00-00-00" },
            // ],
          },
        },
        {
          type: 'MyText',
          props: { content: '优先库位判断规则', type: 'h1' },
        },
        {
          type: 'MyFormEdiatbleTable',
          attributeName: 'sortRuleFieldList',
          props: {
            parentModel: '{{model.ruleForm}}',
            labelWidth: 80,
            requireMeta: true,
            style: 'width: 1300px;',
            prop: 'sortRuleFieldList',
            tableConfig: {
              setModel: '{{(xx) => (model.ruleForm.sortRuleFieldList=xx)}}',
              dataSync: '{{model.ruleForm.sortRuleFieldList}}',
              mode: 'row',
              recordCreatorProps: "{{ $.isViewable ? false : { position: 'bottom', creatorButtonText: '新增规则'} }}",
              // rules: {
              //   priority: { required: true, message: '必填' },
              //   sortField: { required: true, message: '必填' },
              //   sortContent: { required: true, message: '必填' }
              // },
            },
            columnsConfigs: [
              {
                // width: "100",
                // label: "优先级",
                // required: true,
                prop: 'priority',
                uniqueItems: true,
                config: { type: 'input' },
              },
              {
                // label: "策略字段",
                prop: 'sortField',
                uniqueItems: true,
                optionsTrigger: 'sortContent',
                config: {
                  type: 'select',
                  clearable: true,
                },
              },
              {
                // label: "顺序",
                prop: 'sortContent',
                optionsWatcher: 'sortField',
                isMultipleAndAll: {
                  sortField: ['effectivePeriodStatus', 'wrsShelfType'],
                },
                config: {
                  type: 'select',
                  clearable: true,
                  multiple: false,
                },
              },
              {
                visible: '{{!$.isViewable}}',
                label: '操作',
                fixed: 'right',
                width: 200,
                // onDelete: "{{$.onDelete}}",
                // onOk: "{{$.onOk}}",
                operations: ['delConfirm', 'edit'],
              },
            ],
          },
        },
        {
          type: 'MyText',
          props: {
            content:
              "{{model.ruleForm.businessType === 11 ? '默认打底规则：先进先出' : '默认打底规则：库位拣货优先级'}}",
            type: 'text',
            style: 'font-size: 12px;margin-left: 80px;color: #95989e;',
          },
        },
      ],
    },
  ],
};

export default definePageConfig(config);
