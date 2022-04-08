<template>
  <div v-if="metaConfig">
    <page
      :key="'meta' + currentPoiType + '_' + currentBusinessType"
      :local-config="uiConfig"
      :meta-config="metaConfig"
      :horn-key="hornKey"
      @rendered="renderedFn"
    />
  </div>
  <div v-else-if="!isLoading">
    <strong>MetaConfig 加载失败</strong>
  </div>
</template>

<script>
import Vue from 'vue';
import MayaUI from 'ui';
import xtcConfig from './xtc_down_picking_detail.config';
import rdcConfig from './rdc_down_picking_detail.config';

Vue.use(MayaUI);

export default {
  props: {
    isXtcRepo: Boolean,
    isRdcRepo: Boolean,
    poiId: {
      type: [Number, String],
      default: '',
    },
  },
  data() {
    const QUERY_MODE = this.$tools.search('mode');
    return {
      isLoading: false,
      uiConfig: null,
      metaConfig: null,
      hornKey: '',
      mataConfigMap: {},
      // 是否新建页面
      isCreateable: QUERY_MODE === 'create',
      // 是否编辑页面
      isEditable: QUERY_MODE === 'edit',
      // 是否查看页面
      isViewable: QUERY_MODE === 'view',
      // api 路径前缀
      pathPrefix: '',
      currentPoiType: '',
      currentBusinessType: '',
      poiTypeBusinessFirstMap: {},
    };
  },
  watch: {
    'maya.model.ruleForm.businessType'() {
      const { businessType } = this.maya.model.ruleForm;
      if (
        businessType
        && this.currentPoiType
        // eslint-disable-next-line eqeqeq
        && businessType != this.currentBusinessType
      ) {
        this.currentBusinessType = businessType;
        this.reloadMetaConfig();
      }
    },
    'maya.model.ruleForm.poiType'() {
      const { poiType } = this.maya.model.ruleForm;

      if (this.isFirstQuery) {
        this.isFirstQuery = false;
        this.reloadMetaConfig();
        // 如果 poiType 修改了，重新 reload 配置，并且置businessType 为空
        // eslint-disable-next-line eqeqeq
      } else if (poiType && this.currentPoiType && poiType != this.currentPoiType) {
        this.currentPoiType = poiType;
        // 不是查询切换，则切换能到第一个 businessType
        this.currentBusinessType = this.poiTypeBusinessFirstMap[poiType];
        this.reloadMetaConfig();
      }
    },
  },
  created() {
    if (this.isRdcRepo) {
      this.pathPrefix = '/api/m/inventory';
      this.uiConfig = rdcConfig;
      this.hornKey = 'rdc_down_picking_detail';
    }
    if (this.isXtcRepo) {
      this.pathPrefix = '/api/m/xt/inventory';
      this.uiConfig = xtcConfig;
      this.hornKey = 'xtc_down_picking_detail';
    }

    this.getMetaConfig();
  },
  methods: {
    async getMetaConfig() {
      try {
        const matadata = await this.queryMetaData();
        this.isLoading = false;
        if (!matadata || !Array.isArray(matadata) || !matadata.length) {
          console.error('matadata 未成功加载');
          this.$mtd.message.error('matadata 未成功加载');
          return;
        }

        const [{ poiType, businessType }] = matadata;

        matadata.forEach((item) => {
          if (!this.poiTypeBusinessFirstMap[item.poiType]) {
            this.poiTypeBusinessFirstMap[item.poiType] = item.businessType;
          }
          const data = JSON.parse(item.attribute);
          this.mataConfigMap[`${item.poiType}_${item.businessType}`] = {
            metaAttrs: data.metaAttrs,
            entityId: item.entityId,
          };
          // item.attributeJson = data.metaAttrs;
        });

        this.currentPoiType = poiType;
        this.currentBusinessType = businessType;

        this.metaConfig = this.mataConfigMap[`${poiType}_${businessType}`];
      } catch (error) {
        console.error(error);
        this.isLoading = false;
      }
    },
    async queryMetaData() {
      this.isLoading = true;
      const isXtcRepo = this.isXtcRepo ? 1 : 0;
      const path = `${this.pathPrefix}/rule/query/attribute/list?isXtcRepo=${isXtcRepo}&upOrDown=2`;
      return this.$hGet(path);
    },
    async submit() {
      // TODO form 表单 校验时未 caught error
      await this.$mtd.confirm('确认保存修改?');

      try {
        const path = `${this.pathPrefix}/rule/update/attribute`;
        const ruleConfig = JSON.parse(JSON.stringify(this.maya.model.ruleForm));
        if (this.isCreateable) {
          delete ruleConfig.ruleNo;
        }
        const temp = {
          ruleConfig: JSON.stringify(ruleConfig),
        };
        if (this.isXtcRepo) {
          temp.poiId = this.poiId;
        }
        await this.$hPost(path, temp);
        this.$mtd.message({
          type: 'success',
          message: `${this.isCreateable ? '新建' : '编辑'}成功`,
        });
        this.jumpToList();
      } catch (error) {
        console.error(error);
      }
    },
    cancel() {
      if (this.isViewable) {
        return this.jumpToList();
      }
      return this.$mtd.confirm('确认放弃编辑吗').then(() => {
        this.jumpToList();
      });
    },
    jumpToList() {
      this.$tools.linkTo('./list.html');
    },
    async queryDetail(ruleNo) {
      let path = `${this.pathPrefix}/rule/query/attribute/data`;
      if (this.isXtcRepo) {
        path += `?poiId=${this.poiId}`;
      }
      try {
        const result = await this.$hGet(path, { ruleNo });
        if (result) {
          console.log(JSON.parse(result));
          this.maya.model.ruleForm = JSON.parse(result);
        }
      } catch (error) {
        console.error(error);
        this.$mtd.message.error(error.message);
      }
    },
    reloadMetaConfig() {
      this.metaConfig = this.mataConfigMap[`${this.currentPoiType}_${this.currentBusinessType}`];
    },
    renderedFn() {
      this.maya.model.ruleForm.poiType = this.currentPoiType;
      this.maya.model.ruleForm.businessType = this.currentBusinessType;

      // 协同仓写死 poiIdLIST
      if (this.isXtcRepo && this.poiId && this.isCreateable) {
        this.maya.model.ruleForm.poiIdList = [this.poiId];
      }

      const ruleNo = this.$tools.search('ruleNo');
      if (!this.isCreateable && ruleNo) {
        this.isFirstQuery = true;
        this.queryDetail(ruleNo);
      }
    },
  },
};
</script>
