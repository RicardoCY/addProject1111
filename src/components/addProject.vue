<template>
  <div>
    <el-container>
      <el-header>
        <el-button type="primary" @click="openDialog('add')">
          <i class="el-icon-plus"></i>新建项目
        </el-button>
      </el-header>
      <el-main>
        <el-table :data="tableData" empty-text="暂无数据" border v-loading="isLoad">
          <el-table-column label="项目名称" prop="projectName" min-width="1"></el-table-column>
          <el-table-column label="客户名称" prop="customerName" min-width="1"></el-table-column>
          <el-table-column label="部门名称" prop="deptName" min-width="1"></el-table-column>
          <el-table-column label="创建项目时间" prop="createTime" min-width="1"></el-table-column>
          <el-table-column label="操作" min-width="2">
            <template slot-scope="scope">
              <i @click="openDialog('update',scope.row)">编辑</i>
              <i @click="openDialog('examine',scope.row)">查看</i>
              <i @click="deleteCustomer(scope.row)">删除</i>
            </template>
          </el-table-column>
          <el-table-column label="是否禁用" min-width="1" prop="isDisable">
            <template slot-scope="scope">
              <el-switch
                :value="scope.row.isDisable"
                @change="switchChange(scope.row)"
                active-color="#ff4949"
                inactive-color="#13ce66"
              ></el-switch>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <div style="text-align: right">
        <el-footer>
          <el-pagination
            v-if="totalCount"
            small
            :current-page="tableRequest.pageNum"
            :page-size="tableRequest.pageSize"
            :page-sizes="[5, 10, 20, 30]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            layout="prev, pager, next"
            :total="totalCount"
          ></el-pagination>
        </el-footer>
      </div>
      <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        width="600px"
        center
        @close="closeDialog"
      >
        <el-form :model="addForm" label-width="200px" v-loading="isLoad2">
          <el-form-item label="相关客户">
            <div v-if="dialogState=='add'">
              <el-autocomplete
                   v-model="customerName"
                   :fetch-suggestions="querySearchAsync"
                   placeholder="请输入内容"
                  ></el-autocomplete>
              <!-- <el-input v-model="addForm.customerName" @keyup.enter.native="search">
                <el-button slot="append" icon="el-icon-search" @click="searchCustomer"></el-button>
              </el-input> -->
            </div>
            <div v-else-if="dialogState=='update'">{{addForm.customerName}}</div>
            <div v-else-if="dialogState=='examine'">{{addForm.customerName}}</div>
          </el-form-item>
          <el-form-item label="客户编号 ">
            <span v-if="dialogState=='add'">{{addForm.customerId}}</span>
            <div v-else-if="dialogState=='update'">{{addForm.customerId}}</div>
            <div v-else-if="dialogState=='examine'">{{addForm.customerId}}</div>
          </el-form-item>
          <el-form-item label="客户类别">
            <span v-if="dialogState=='add'">{{addForm.customerType}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.category == 1?"收款":"付款"}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.category == 1?"收款":"付款"}}</span>
          </el-form-item>
          <el-form-item label="部门">
            <div v-if="dialogState=='add'">
              <el-select v-model="state">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.deptName"
                  :label="item.deptName"
                  :value="item.id"
                ></el-option>
              </el-select>
            </div>
            <span v-else-if="dialogState=='update'">{{addForm.deptName}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.deptName}}</span>
          </el-form-item>
          <el-form-item label="部门编号">
            <span v-if="dialogState=='add'">{{addForm.deptNum}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.deptNum}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.deptNum}}</span>
          </el-form-item>
          <el-form-item label="成本中心">
            <span v-if="dialogState=='add'">{{addForm.costCenter}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.costCenter}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.costCenter}}</span>
          </el-form-item>
          <el-form-item label="WBS元素">
            <span v-if="dialogState=='add'">{{addForm.wbsElement}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.wbsElement}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.wbsElement}}</span>
          </el-form-item>
          <el-form-item label="收入中心">
            <span v-if="dialogState=='add'">{{addForm.incomeCenter}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.incomeCenter}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.incomeCenter}}</span>
          </el-form-item>
          <el-form-item label="WBS元素">
            <span v-if="dialogState=='add'">{{addForm.wbsrElement}}</span>
            <span v-else-if="dialogState=='update'">{{addForm.wbsrElement}}</span>
            <span v-else-if="dialogState=='examine'">{{addForm.wbsrElement}}</span>
          </el-form-item>
          <el-form-item label="项目名称">
            <div v-if="dialogState=='add'">
              <el-input v-model="addForm.projectName"></el-input>
            </div>
            <div v-else-if="dialogState=='update'">
              <el-input v-model="addForm.projectName"></el-input>
            </div>
            <span v-else-if="dialogState=='examine'">{{addForm.projectName}}</span>
          </el-form-item>
          <el-form-item label="项目经理">
            <div v-if="dialogState=='add'">
              <el-input v-model="addForm.managerName">
                <el-button slot="append" icon="el-icon-search" @click="searchMember('manager')"></el-button>
              </el-input>
            </div>
            <div v-else-if="dialogState=='update'">
              <el-input v-model="addForm.managerName">
                <el-button slot="append" icon="el-icon-search" @click="searchMember('manager')"></el-button>
              </el-input>
            </div>
            <span v-else-if="dialogState=='examine'">{{addForm.managerName}}</span>
          </el-form-item>
          <el-form-item label="项目成员">
            <div v-if="dialogState=='add'">
              <el-input v-model="addForm.memberName">
                <el-button slot="append" icon="el-icon-search" @click="searchMember('member')"></el-button>
              </el-input>
            </div>
            <div v-else-if="dialogState=='update'">
              <el-input v-model="addForm.nameList"><el-button slot="append" icon="el-icon-search" @click="searchMember('member')"></el-button></el-input>
            </div>
            <span v-else-if="dialogState=='examine'" id="member">{{addForm.nameList}}</span>
          </el-form-item>
          <div style="text-align:center ">
            <div v-if="dialogState=='add'">
              <el-button type="primary " @click="addProject">确定</el-button>
            </div>
            <div v-else-if="dialogState=='update'">
              <el-button type="primary ">确定</el-button>
            </div>
          </div>
        </el-form>
      </el-dialog>
      <el-dialog :visible.sync="dialogVisible3" width="600px" center @close="closeDialog3">
        <div class="el-dialog-div">
          <div v-if="dialogState2=='manager'">
             <!-- <el-tree
                  :data="treeNode1"
                  :props="defaultProps"
                  :load="loadNode"
                  ref="treeForm"
                  show-checkbox
                  check-strictly
                  accordion
                  @node-click="handleNodeClick"
                  >
           </el-tree> -->
            <el-tree
               
                  :props="defaultProps"
                  :load="loadNode"
                  lazy
                  ref="treeForm"
                  show-checkbox
                  check-strictly
                  accordion
                  >
           </el-tree>
          <el-footer >
            <el-button @click="getChecked" type="primary" >确定</el-button></el-footer>
          </div>
          <div v-else-if="dialogState2=='member'">
             <el-tree
                  :data="typeOptions"
                  :props="defaultProps"
                  ref="treeForm"
                  show-checkbox
                  check-strictly
                  accordion
                  >
           </el-tree>
          <el-footer style="position:fixed; bottom:0">
            <el-button @click="getChecked" type="primary" >确定</el-button></el-footer>
          </div>
        </div>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
export default {
  name: "addProject",
  data() {
    return {
      treeNode1:[],
      customerName:null,
      res: [],
      timeout:  null,
      title: null,
      id: null,
      deptNum: null,
      checkList: [],
      radio: null,
      state: null,
      isLoad: true,
      isLoad2: true,
      isLoad3: true,
      tableData: [],
      tableRequest: {
        pageNum: 1,
        pageSize: 10,
        paramData: {
          name: null
        }
      },
      defaultProps: {
            children: 'children',
            label: 'label'
        },
      paperRequest: {
        pageNum: 1,
        pageSize: 10,
        paramData: {}
      },
      userData: [],
      paperData: [],
      totalCount: 0,
      totalCount2: 0,
      addForm: {
      },
      checkList1: [],
      checkList2: [],
      checkList3: [],

      //添加/编辑弹窗
      dialogVisible3: false,
      dialogVisible2: false,
      dialogVisible: false,
      dialogState: "add",
      dialogState2: "manager",
      typeOptions: [
      ]
    };
  },
  methods: {
    //异步请求node
   async loadNode(node, resolve){
       let res1 = await this.$http.get('/dept/list')
       this.typeOptions=res1.data.data
       console.log( this.typeOptions)
      this.typeOptions.map(item=>{
        this.treeNode1.push({label:item.deptName,value:item.id})
      })
      // let res2 = await this.$http.get(`/user/${val.value}/dept`)
      if (node.level === 0) {
         return resolve(this.treeNode1);
         console.log(node)
      }
     
    },
    // async handleNodeClick(val){
    //   let res = await this.$http.get(`/user/${val.value}/dept`)
    //   let arr = []
    //   res.data.data.map(item=>{
    //     arr.push({label:item.trueName,id:item.userId})
    //   })
    //   val.children=arr
    // },
    addProject() {
      this.$http
        .post("project/add", {
          costCenter: this.addForm.costCenter,
          customerId: this.addForm.customerId,
          deptId: this.addForm.deptId,
          deptNum: this.addForm.deptNum,
          incomeCenter: this.addForm.incomeCenter,
          managerId: this.addForm.managerId,
          memberId: this.addForm.memberId,
          projectName: this.addForm.projectName,
          wbsElement: this.addForm.wbsElement,
          wbsrElement: this.addForm.wbsrElement
        })
        .then(res => {
          alert("添加成功");
          this.getTableData();
        })
        .catch(res => {
          alert("上传失败");
        });
      this.dialogVisible = false;
    },
    querySearchAsync(queryString,cb){
          let res = this.res
          let results = queryString ? res.filter(this.createStateFilter(queryString)) : res;
         clearTimeout(this.timeout)
         this.timeout = setTimeout(() => {
            cb(results)
         }, 3000*Math.random());
    },
    loadAll(){
           this.$http.post("customer/pager", {
                   pageNum: 1,
                   pageSize:100,
                   paramData: {
                  }}).then((res)=>{
                    for(let i=0;i<res.data.data.resultData.length;i++){
                    this.res.push({'value':res.data.data.resultData[i].name,'id':res.data.data.resultData[i].id})
                    
                  }
                  console.log(this.res)
                  })    
    },
    createStateFilter(queryString){
          return (state)=>{
            return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
          }
    },
    getTableData() {
      this.$http.post("project/paper", this.tableRequest).then(res => {
        this.tableData = res.data.data.resultData;
        this.totalCount = res.data.data.pagination.totalCount;
        this.isLoad = false;
      });
    },
    searchMember(val) {
      this.dialogState2 = val;
      this.dialogVisible3 = true;
      this.typeOptions.map(item=>{
        this.treeNode1.push({label:item.deptName,value:item.id})
      })
    },
    getChecked() {
      this.dialogVisible3 = false;
      this.addForm.managerId = this.checkList2[0];
      this.$http
        .get("user/" + this.addForm.managerId, {
          userId: this.addForm.managerId
        })
        .then(res => {
          this.addForm.managerName = res.data.data.trueName;
        });
    },
    getChecked2() {
      this.dialogVisible3 = false;
      this.addForm.memberId = this.checkList3;
      //   this.$http.post("user/userIds",{userIds:this.addForm.memberId}).then((res)=>{
      //       this.addForm.memberName = res.data.data
      //   })
    },
    getWbsData() {
      this.$http
        .post("project/wbs", {
          customerId: this.addForm.customerId,
          deptNum: this.addForm.deptNum
        })
        .then(res => {
          if (this.dialogState == "add") {
            this.addForm.costCenter = res.data.data.costCenter;
            this.addForm.wbsElement = res.data.data.wbsElement;
            this.addForm.incomeCenter = res.data.data.incomeCenter;
            this.addForm.wbsrElement = res.data.data.wbsrElement;
          }
        });
    },
    handleCurrentChange(val) {
      this.tableRequest.pageNum = val;
      //console.log(`当前页: ${this.tableRequest.pageNum}`);
      this.getTableData();
    },
    handleSizeChange(val) {
      this.tableRequest.pageSize = val;
      //console.log(`每页 ${this.tableRequest.pageSize} 条`);
      this.handleCurrentChange(1);
    },
    switchChange(row) {
      console.log(row.isDisable);
      let str = " ";
      let message = " ";
      if (row.isDisable) {
        str = "该用户及其相关权限将被启用, 是否继续? ";
        message = "该用户已被启用 ";
      } else {
        str = "该用户及其相关权限将被禁用, 是否继续? ";
        message = "该用户已被禁用 ";
      }
      this.$confirm(str, "提示 ", {
        confirmButtonText: "确定 ",
        cancelButtonText: "取消 ",
        type: "warning "
      }).then(() => {
        this.isLoad = true;
        this.$http
          .post("project/update", {
            id: row.id,
            isDisable: Number(!row.isDisable)
          })
          .then(res => {
            this.$notify({
              title: "成功 ",
              message: message,
              type: "success "
            });
            this.getTableData();
          })
          .catch(err => {
            console.log("获取失败");
          });
      });
    },
    getProjectData(row){
      this.addForm.customerName = row.customerName
      this.addForm.deptName = row.deptName
      this.addForm.projectName = row.projectName
             this.$http.get("project/"+row.id).then((res)=>{
             let ref = res.data.data
             this.addForm.category = ref.category
             this.addForm.costCenter = ref.costCenter
             this.addForm.createTime = ref.createTime
             this.addForm.customerId = ref.customerId
             this.addForm.customerName = ref.customerName
             this.addForm.deptName = ref.deptName
             this.addForm.deptNum = ref.deptNum
             this.addForm.incomeCenter = ref.incomeCenter
             this.addForm.managerName = ref.managerName
             this.addForm.nameList = ref.memberName.join(" ")
             this.addForm.wbsElement = ref.wbsElement
             this.addForm.wbsrElement = ref.wbsrElement
             this.isLoad2 = false
           })
    },
    closeDialog3() {
      this.isLoad3 = true;
      this.dialogVisible3 = false;
      this.checkList2 = [];
      this.checkList3 = []
    },
   async openDialog(val, row) {
      this.dialogState = val;
      console.log(this.dialogState);
      this.dialogVisible = true;
      let res = await this.$http.get('/dept/list')
      this.typeOptions=res.data.data
      console.log( this.typeOptions)
      if (this.dialogState == "update") {
            this.title = "编辑项目";
            this.getProjectData(row);
      } else if (this.dialogState == "add") {
            this.isLoad2 = false;
            this.title = "添加项目";
            this.addForm = {
        };
      } else if (this.dialogState == "examine") {
        this.title = "查看详情";
        this.getProjectData(row);
      }
    },
    closeDialog() {
      this.isLoad2 = true;
      (this.addForm = {}), (this.state = null);
    },
    search() {
      this.$http
        .post("customer/pager", {
          paramData: { name: this.addForm.customerName }
        })
        .then(res => {
          if (res.data.data.resultData != null) {
            for (let i = 0; i < res.data.data.resultData.length; i++) {
              if (
                this.addForm.customerName == res.data.data.resultData[i].name
              ) {
                this.addForm.customerId = res.data.data.resultData[i].id;
                this.addForm.state = res.data.data.resultData[i].state;
                if (this.addForm.state == 0) {
                  this.addForm.customerType = "收款";
                } else {
                  this.addForm.customerType = "付款";
                }
              } else {
                this.addForm.customerId = null;
                this.addForm.state = null;
                this.addForm.customerType = null;
              }
            }
          }
        });
    },
    deleteCustomer(row) {
      this.$confirm("该项目将被删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.isLoad = true;
        this.$http
          .post("project/delete", { id: row.id })
          .then(res => {
            this.$notify({
              title: "成功",
              message: "该项目已被删除",
              type: "success"
            });
            this.handleCurrentChange(1);
          })
          .catch(() => {});
      });
    }

  },

  mounted() {
    this.getTableData()
    this.loadAll()
  },
  computed: {

  },
  watch: {
   
  
customerName(newVal,oldVal){
      this.$http.post("customer/pager",{
               pageNum: 1,
               pageSize: 1,
               paramData: {
                    name:this.newVal
             }
            }).then((res)=>{
               this.addForm.customerId = res.data.data.resultData[0].id
               this.addForm.category = res.data.data.resultData[0].category
               if(this.addForm.category == 1){
                 this.addForm.customerType = "收款"
               }
               else if(this.addForm.category == 2){
                 this.addForm.customerType = "付款"
               }
               this.$forceUpdate();
            })      
    },
// state(newVal,oldVal){
//       console.log(newVal)
//       this.$http.get("dept/"+newVal).then((res)=>{
//         this.addForm.deptNum = res.data.data.deptNum
//         console.log(this.addForm.deptNum)
//         this.$forceUpdate();
//       })

//     }
  }
}
</script>
<style scoped>
li {
  list-style: none;
}
.el-checkbox {
  display: block;
}
.el-dialog-div {
  height: 75vh;
  overflow: auto;
}
</style>
