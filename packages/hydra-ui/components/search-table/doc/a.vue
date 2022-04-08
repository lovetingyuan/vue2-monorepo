<template>
  <div class="demo">
    <pro-table ref="table" :async-data="fetchTableData">
      <template #filter>
        <!-- pro-table-filter 是基于 query-filter 的抽象封装，query-filter 上的所有配置项均可使用 -->
        <pro-table-filter v-model="formData" inline>
          <form-input label="姓名" prop="name" />
        </pro-table-filter>
      </template>
      <template #default>
        <pro-table-column align="center" label="序号" prop="id" />
        <pro-table-column label="姓名" prop="name" />
        <pro-table-column label="日期" prop="date" />
        <pro-table-column label="其他" prop="arr[0].other" />
        <!-- prop作为唯一标示 -->
        <pro-table-column label="操作">
          <mtd-button type="text-primary" size="small">
            删除
          </mtd-button>
        </pro-table-column>
        <div>sdf</div>
      </template>
    </pro-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      formData: {
        name: '',
      },
    };
  },
  methods: {
    /**
     * pageParams 包含了两个字段：pageNo（当前页码）和pageSize（分页大小）
     * 可以将这些参数传给后端接口
     */
    fetchTableData(pageParams) {
      const nameList = ['张三', '李四', '王五', '-'];
      const data = Array.from(new Array(Math.ceil(Math.random() * 5))).map((item, index) => ({
        id: index + 1,
        date: new Date().toDateString(),
        name: nameList[parseInt(Math.random() * 10, 10) % 4],
        arr: [
          {
            other: '其他',
          },
        ],
      }));
      console.log('当前页码', pageParams.pageNo);
      console.log('分页大小', pageParams.pageSize);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data,
            total: 100,
          });
        }, 1000);
      });
    },
  },
};
</script>
