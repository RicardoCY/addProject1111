<template>
    <div>  <el-container>
            <el-header>
                <el-button type='primary' @click="openDialog('add')"><i class="el-icon-plus"></i>新建项目</el-button>
            </el-header>
            <el-main>
                <el-table :data='tableData' empty-text='暂无数据' border v-loading = "isLoad">
                    <el-table-column label='项目名称' prop='projectName' min-width='1'></el-table-column>
                    <el-table-column label='客户名称' prop='customerName' min-width='1'></el-table-column>
                    <el-table-column label='部门名称' prop='deptName' min-width='1'></el-table-column>
                    <el-table-column label='创建项目时间' prop='createTime' min-width='1'></el-table-column>
                    <el-table-column label='操作' min-width='2'>
                        <template slot-scope='scope'>
                                <i  @click="openDialog('update',scope.row)">编辑</i>
                                <i  @click="openDialog('examine',scope.row)">查看</i>
                                <i  @click="deleteCustomer(scope.row)">删除</i>
                        </template>
                    </el-table-column>
                    <el-table-column label='是否禁用' min-width='1' prop='isDisable'>
                        <template slot-scope="scope">
                                    <el-switch
                                      :value="scope.row.isDisable"
                                      @change="switchChange(scope.row)"
                                      active-color="#ff4949"
                                      inactive-color="#13ce66">
                                    </el-switch>
                                  </template>
                    </el-table-column>
                </el-table>
            </el-main>
            <div style="text-align: right">
                <el-footer>
                    <el-pagination v-if="totalCount" small :current-page="tableRequest.pageNum" :page-size="tableRequest.pageSize" :page-sizes="[5, 10, 20, 30]" @size-change="handleSizeChange" @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalCount"></el-pagination>
                </el-footer>
            </div>
            <el-dialog :title="title" :visible.sync='dialogVisible' width="600px" center @close='closeDialog' >
                <el-form :model='addForm' label-width='200px' v-loading="isLoad2">
                    <el-form-item label="相关客户" >
                        <div v-if="dialogState=='add'">
                            <el-input v-model="addForm.customerName" @keyup.enter.native="search" >
                                <el-button slot="append" icon="el-icon-search" @click="searchCustomer"></el-button>
                            </el-input>
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
                       <span v-else-if="dialogState=='update'">{{addForm.state == 0?"付款":"收款"}}</span>
                         <span v-else-if="dialogState=='examine'">{{addForm.state == 0?"付款":"收款"}}</span>
                    </el-form-item>
                    <el-form-item label='部门'>
                        <div v-if="dialogState=='add'">
                            <el-select v-model='state' @change="handler">
                                <el-option v-for='item in typeOptions' :key='item.value' :label='item.label' :value='item.value'></el-option>
                            </el-select>
                        </div>
                        <span v-else-if="dialogState=='update'">{{addForm.deptName}}</span>
                       <span v-else-if="dialogState=='examine'">{{addForm.deptName}}</span>
                    </el-form-item>
                    <el-form-item label='部门编号'>
                        <span v-if="dialogState=='add'">{{addForm.deptNum}}</span>
                          <span v-else-if="dialogState=='update'">{{addForm.deptNum}}</span>
                       <span v-else-if="dialogState=='examine'">{{addForm.deptNum}}</span>
                    </el-form-item>
                    <el-form-item label='成本中心'>
                          <span v-if="dialogState=='add'">{{addForm.costCenter}}</span>
                        <span v-else-if="dialogState=='update'">{{addForm.costCenter}}</span>
                       <span v-else-if="dialogState=='examine'">{{addForm.costCenter}}</span>
                    </el-form-item>
                    <el-form-item label='WBS元素'>
                          <span v-if="dialogState=='add'">{{addForm.wbsElement}}</span>
                        <span v-else-if="dialogState=='update'">{{addForm.wbsElement}}</span>
                         <span v-else-if="dialogState=='examine'">{{addForm.wbsElement}}</span>
                       
                    </el-form-item>
                    <el-form-item label='收入中心'>
                            <span v-if="dialogState=='add'">{{addForm.incomeCenter}}</span>
                      <span v-else-if="dialogState=='update'">{{addForm.incomeCenter}}</span>
                       <span v-else-if="dialogState=='examine'">{{addForm.incomeCenter}}</span>
                    
                    </el-form-item>
                    <el-form-item label='WBS元素'>
                          <span v-if="dialogState=='add'">{{addForm.wbsrElement}}</span>
                           <span v-else-if="dialogState=='update'">{{addForm.wbsrElement}}</span>
                         <span v-else-if="dialogState=='examine'">{{addForm.wbsrElement}}</span>
                    </el-form-item>
                    <el-form-item label='项目名称'>
                        <div v-if="dialogState=='add'"><el-input v-model='addForm.projectName'></el-input></div>
                        <div v-else-if="dialogState=='update'"><el-input v-model='addForm.projectName'></el-input></div>
                        <span v-else-if="dialogState=='examine'">{{addForm.projectName}}</span>
                    </el-form-item>
                    <el-form-item label='项目经理'>
                        <div v-if="dialogState=='add'">
                    <el-input v-model="addForm.managerName">
                                <el-button slot="append" icon="el-icon-search" @click="searchMember('manager')"></el-button>
                            </el-input></div>
                             <div v-else-if="dialogState=='update'">
                    <el-input v-model="addForm.managerName">
                                <el-button slot="append" icon="el-icon-search" @click="searchMember('manager')"></el-button>
                            </el-input></div>
                            <span v-else-if="dialogState=='examine'">{{addForm.managerName}}</span>
                    </el-form-item>
                    <el-form-item label='项目成员'>
                        <div v-if="dialogState=='add'">
                       <el-input v-model="addForm.memberName"><el-button slot="append" icon="el-icon-search" @click="searchMember('member')"></el-button></el-input></div>
                        <div v-else-if="dialogState=='update'">
                       <el-input></el-input></div>
                       <span v-else-if="dialogState=='examine'" id="member">{{}}</span>
                    </el-form-item> 
                    <div style="text-align:center ">
                        <div v-if="dialogState=='add'">
                    <el-button type="primary " @click="addProject">确定</el-button></div>
                       <div v-else-if="dialogState=='update'">
                    <el-button type="primary ">确定</el-button></div>
                            
                </div>
                </el-form >
            </el-dialog>  
            <!-- <el-dialog :visible.sync='dialogVisible2' width="600px" center>
                 <div>请选择客户</div>
                <el-checkbox-group v-model="checkList" :max="1">
                    <el-checkbox v-for="item in paperData" :label="item.name" :key="item.id"></el-checkbox>
                </el-checkbox-group>
                 <div>
                     
                 <el-pagination v-if="totalCount2" small :current-page="paperRequest.pageNum" :page-size="paperRequest.pageSize" :page-sizes="[5, 10, 20, 30]" @size-change="handleSizeChange2" @current-change="handleCurrentChange2" layout="prev, pager, next" :total="totalCount2"></el-pagination>
                 </div>
               
            </el-dialog> -->
           <el-dialog :visible.sync='dialogVisible3' width="600px" center @close='closeDialog3'>
               <div class="el-dialog-div">
                   <div v-if="dialogState2=='manager'">
                 <el-collapse v-model="typeOptions.value" @change="handleChange" accordion >
                      <el-collapse-item v-for="item in typeOptions" :key="item.value" :title="item.label" :name="item.value" >
                           <el-checkbox-group v-model="checkList2" v-loading="isLoad3" :min="0" :max="1">
                          <el-checkbox v-for="item in userData" :key="item.userId" :label="item.userId" >{{item.trueName}}</el-checkbox>
                           </el-checkbox-group>
                      </el-collapse-item>
                 </el-collapse>
                  <el-button @click="getChecked">确定</el-button></div>
                 <div v-else-if="dialogState2=='member'">
                    <el-collapse v-model="typeOptions.value" @change="handleChange" accordion >
                      <el-collapse-item v-for="item in typeOptions" :key="item.value" :title="item.label" :name="item.value" >
                           <el-checkbox-group v-model="checkList3" v-loading="isLoad3" :min="0">
                          <el-checkbox v-for="item in userData" :key="item.userId" :label="item.userId">{{item.trueName}}</el-checkbox>
                           </el-checkbox-group>
                      </el-collapse-item>
                 </el-collapse> 
                  <el-button @click="getChecked2">确定</el-button>
                 </div>
                 </div>
               
            </el-dialog>
        </el-container>
        </div>
</template>
<script>
export default{
    name:'addProject',
    data(){
        return{ 
                title:null,
                id:null,
                type:null,
                deptNum:null,
                checkList:[],
                radio:null,
                state: null,
                isLoad: true,
                isLoad2:true,
                isLoad3:true,
                tableData: [],
                tableRequest: {
                    pageNum: 1,
                    pageSize: 10,
                    paramData: {
                        name: null
                    }
                },
                paperRequest:{
                    pageNum: 1,
                    pageSize: 10,
                    paramData: {
                }
                },
                userData:[],
                paperData:[],
                totalCount: 0,
                totalCount2: 0,
                addForm: {
                    costCenter: null,
                    createTime: null,
                    customerId: null,
                    customerName: null,
                    deptName: null,
                    deptNum: null,
                    deptId:null,
                    incomeCenter: null,
                    isDisable: true,
                    managerId: null,
                    memberId: [],
                    projectName: null,
                    wbsElement: null,
                    wbsrElement: null,
                    state:null,
                    memberName:null,
                    managerName:null,
                    customerType:null,
                    nameData:[],
                },
                checkList1:[],
                checkList2:[],
                checkList3:[],
               
                //添加/编辑弹窗
                dialogVisible3:false,
                dialogVisible2:false,
                dialogVisible: false,
                dialogState:"add",
                dialogState2:"manager",
                typeOptions: [
                {
                    value: 1,
                    label: '武汉管理部',
                }, {
                    value: 2,
                    label: '武汉项目部'
                }, {
                    value: 3,
                    label: '武汉职能部'
                }, {
                    value: 4,
                    label: '管理部'
                }],
                 
            }

        },
            methods: {
                addProject(){
                      this.$http.post("project/add",
                     {
                       costCenter: this.addForm.costCenter,
                       customerId: this.addForm.customerId,
                       deptId: this.addForm.deptId,
                       deptNum: this.addForm.deptNum,
                       incomeCenter: this.addForm.incomeCenter,
                       managerId: this.addForm.managerId,
                       memberId:this.addForm.memberId,
                       projectName: this.addForm.projectName,
                       wbsElement: this.addForm.wbsElement,
                       wbsrElement: this.addForm.wbsrElement
                       }
                      ).then((res)=>{
                          alert("添加成功")
                          this.getTableData()
                      }).catch((res)=>{
                          alert('上传失败')
                      })
                      this.dialogVisible = false
                },
                getTableData() {
                        this.$http.post('project/paper',this.tableRequest).then((res) => {
                        this.tableData = res.data.data.resultData;
                        this.totalCount = res.data.data.pagination.totalCount
                        this.isLoad = false
                        console.log(this.tableData)
                    })
              
                },
                searchMember(val){
                     this.dialogState2 = val
                     this.dialogVisible3 = true;
                },
                getChecked(){
                      this.dialogVisible3 = false 
                      this.addForm.managerId = this.checkList2[0]
                      this.$http.get("user/"+this.addForm.managerId,{userId:this.addForm.managerId}).then((res)=>{
                          this.addForm.managerName = res.data.data.trueName
                      })
                },
                 getChecked2(){
                      this.dialogVisible3 =false
                      this.addForm.memberId = this.checkList3
                    //   this.$http.post("user/userIds",{userIds:this.addForm.memberId}).then((res)=>{
                    //       this.addForm.memberName = res.data.data
                    //   })
                },
                getWbsData(){
                    this.$http.post("project/wbs",{customerId:this.addForm.customerId,deptNum:this.addForm.deptNum}).then((res)=>{
                        if(this.dialogState == "add"){
                        this.addForm.costCenter = res.data.data.costCenter
                        this.addForm.wbsElement = res.data.data.wbsElement
                        this.addForm.incomeCenter = res.data.data.incomeCenter
                        this.addForm.wbsrElement = res.data.data.wbsrElement
                        }
                    })
                },
                handler(val){
                    this.addForm.deptId = val
                      this.$http.get("dept/"+val,{id:val}).then((res)=>{
                          this.addForm.deptNum = res.data.data.deptNum
                      })
                },
                handleCurrentChange(val) {
                    this.tableRequest.pageNum = val;
                    //console.log(`当前页: ${this.tableRequest.pageNum}`);
                    this.getTableData();
                },
                handleChange(val) {
                   for(var i in this.typeOptions){
                       if(this.typeOptions[i].value == val){
                           this.$http.get("user/"+this.typeOptions[i].value+"/dept",{deptId:this.typeOptions[i].value}).then((res)=>{
                               this.userData = res.data.data 
                               this.isLoad3 = false
                           })
                       }
                   }
                  

                },
                handleSizeChange(val) {
                    this.tableRequest.pageSize = val;
                    //console.log(`每页 ${this.tableRequest.pageSize} 条`);
                    this.handleCurrentChange(1);
                },
                // handleCurrentChange2(val) {
                //     this.paperRequest.pageNum = val;
                //     //console.log(`当前页: ${this.tableRequest.pageNum}`);
                //     this.searchCustomer()
                // },
                // handleSizeChange2(val) {
                //     this.paperData.pageSize = val;
                //     //console.log(`每页 ${this.tableRequest.pageSize} 条`);
                //     this.handleCurrentChange(1);
                // },
                searchCustomer(val) {
                    this.dialogVisible2 = true,
                    this.$http.post("customer/pager",this.paperRequest).then((res)=>{
                        this.paperData = res.data.data.resultData
                    })
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
                        this.$http.post("project/update",{
                           id:row.id,
                           isDisable:Number(!row.isDisable)
                           }).then((res) => {
                            this.$notify({
                                title: "成功 ",
                                message: message,
                                type: "success "
                            });
                            this.getTableData();
                        }).catch((err) => {
                            console.log('获取失败')
                        })
                    })
                },
                getProjectData(row){
                    console.log(row)
                                this.addForm.state = row.state
                                this.addForm.customerName = row.customerName
                                this.addForm.deptName = row.deptName
                                this.addForm.projectName = row.projectName
                                this.$http.get("project/"+row.id,{id:row.id}).then((res) => {
                                this.addForm.costCenter = res.data.data.costCenter;
                                this.addForm.customerId = res.data.data.customerId;
                                this.addForm.incomeCenter = res.data.data.incomeCenter;
                                this.addForm.projectName = res.data.data.projectName;
                                this.addForm.wbsElement = res.data.data.wbsElement;
                                this.addForm.wbsrElement = res.data.data.wbsrElement;
                                this.addForm.deptId = res.data.data.deptId;
                                this.$http.get("dept/"+res.data.data.deptId,{id:res.data.data.deptId}).then((res)=>
                                {
                                    this.addForm.deptNum = res.data.data.deptNum
                                })
                                 this.addForm.managerId = res.data.data.managerId
                                 this.$http.get("user/"+res.data.data.managerId,{userId:res.data.data.managerId.managerId}).then((res)=>{
                                 this.addForm.managerName = res.data.data.trueName})
                                 this.addForm.memberId = res.data.data.memberId
                                 this.$http.post("user/userIds",this.addForm.memberId).then((res)=>{
                                   this.addForm.memberName = res.data.data
                                   
                                 })
                                  this.isLoad2 = false
                               })
                },
                closeDialog3(){
                      this.isLoad3 = true
                      this.dialogVisible3 = false
                      this.checkList2 = []
                      this.checkList3 = []
                },
                openDialog(val, row) {
                    this.dialogState = val
                    console.log(this.dialogState)
                    this.dialogVisible = true
                    if (this.dialogState == 'update') {
                        this.title = "编辑项目"
                        this.getProjectData(row)
                     }else if (this.dialogState == 'add') {
                                this.isLoad2 = false
                                this.title = "添加项目"
                                this.addForm ={
                                   costCenter: null,
                                   createTime: null,
                                   customerId: null,
                                   customerName: null,
                                   deptName: null,
                                   deptNum: null,
                                   deptId:null,
                                   incomeCenter: null,
                                   isDisable: true,
                                   managerId: null,
                                   memberId: [],
                                   projectName: null,
                                   wbsElement: null,
                                   wbsrElement: null,
                                   state:null,
                                   memberName:null,
                                   managerName:null,
                                   customerType:null,
                                   nameData:[],

                    }
                       
                    }else if(this.dialogState == 'examine'){
                                 this.title = "查看详情"
                                 this.getProjectData(row)
                                
                                 
                    }
                },
                closeDialog(){
                        this.addForm = {
                                     costCenter: null,
                                   createTime: null,
                                   customerId: null,
                                   customerName: null,
                                   deptName: null,
                                   deptNum: null,
                                   deptId:null,
                                   incomeCenter: null,
                                   isDisable: true,
                                   managerId: null,
                                   memberId: [],
                                   projectName: null,
                                   wbsElement: null,
                                   wbsrElement: null,
                                   state:null,
                                   memberName:null,
                                   managerName:null,
                                   customerType:null,
                                   nameData:[],
                                
                    },
                    this.state = null
                },
                search(){
                    this.$http.post('customer/pager',{paramData:{name:this.addForm.customerName}}).then((res)=>{
                        if(res.data.data.resultData!=null){
                         for(let i =0; i < res.data.data.resultData.length; i++){
                             if(this.addForm.customerName == res.data.data.resultData[i].name){
                                 this.addForm.customerId = res.data.data.resultData[i].id
                                 this.addForm.state = res.data.data.resultData[i].state
                                 if(this.addForm.state == 0){
                                     this.addForm.customerType = "收款"
                                 }else{
                                     this.addForm.customerType = "付款"
                                 }
                             }
                             else{
                                  this.addForm.customerId = null
                                  this.addForm.state = null
                                  this.addForm.customerType = null
                             }
                         } 
                        }
                   
                   })
               },
                deleteCustomer(row) {
                    this.$confirm('该项目将被删除, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.isLoad = true
                        this.$http.post('project/delete',{id:row.id}).then((res) => {
                            this.$notify({
                                title: '成功',
                                message: '该项目已被删除',
                                type: 'success'
                            });
                            this.handleCurrentChange(1)
                        }).catch(()=>{})
                    });
                       
                },
            // openDetail(row){
            //    this.$router.push({
            //    name: "projectDetail",
            //    query: {
            //      id: row.id
            //           }
            //           });
            // } 
          },
         
          mounted() {
                this.getTableData()
            },
            computed: {
               address() {
              if(this.dialogState == "add"){
                  this.id = this.addForm.customerId;
                  this.type = this.addForm.customerType;
                  this.deptNum = this.addForm.deptNum
              }
              const {id,type,deptNum} = this
               return {
                 id,type,deptNum
            }
  }
 
            },
            watch: {
               address:{
              handler: function(newval , oldval) {
                  let sum = 0;
                for(var i in newval){
                    if(newval[i]!=null){
                       sum+=1;
                    }
                }
                if(sum == 3){
                    this.getWbsData()
                }
       },
    deep: true
  }

            }
           
}
</script>
<style scoped>
li{
    list-style: none;
}
.el-checkbox{
    display: block;
}
.el-dialog-div{
    height: 75vh;
    overflow: auto;
}

</style>
