<template>
<div>
  <div id="header">{{detailData.projectName}}</div>
<table align='center' id="table">
          <tr><td>名称</td><td>{{detailData.projectName}}</td></tr>
          <tr><td>客户名称</td><td>{{customerData.name}}</td></tr>
          <tr><td>客户编号</td><td>{{detailData.customerId}}</td></tr>
          <tr><td>客户类别</td><td>{{customerData.state == 0?'收款':'付款'}}</td></tr>
          <tr><td>部门</td><td>{{deptData.deptName}}</td></tr>
          <tr><td>部门编号</td><td>{{deptData.deptNum}}</td></tr>
          <tr><td>项目经理</td><td>{{managerName}}</td></tr>
          <tr><td>项目成员</td><td>{{managerName+","+nameData.join(',')}}</td></tr>
          <tr><td>成本中心</td><td>{{detailData.costCenter}}</td></tr>
          <tr><td>WBS元素</td><td>{{detailData.wbsElement}}</td></tr>
          <tr><td>收入中心</td><td>{{detailData.incomeCenter}}</td></tr>
          <tr><td>WBS元素</td><td>{{detailData.wbsrElement}}</td></tr>
</table>
<div style="margin:0 auto;width:100px">
    <el-button @click="$router.go(-1)" type='primary'>返回</el-button></div>
</div>
</template>
<script>
export default{
 name:'projectDetail',
 data(){
     return{
       detailData:[],
       pagerData:[],
       deptData:[],
       customerData:[],
       managerName:'',
       memberData:[],
       nameData:[]
       
    }
 },
 methods: {
    
     getDetailData(){
          let id = this.$route.query.id;
         this.$http.get(`project/${id}`,{id:id}).then((res)=>{
             this.detailData = res.data.data
             this.$http.get("dept/"+this.detailData.deptId,{id:this.detailData.deptId}).then((res)=>{
                 this.deptData=res.data.data })
              this.$http.get("customer/"+this.detailData.customerId,{id:this.detailData.customerId}).then((res)=>{
              this.customerData = res.data.data })
            this.$http.get("user/"+this.detailData.managerId,{userId:this.detailData.managerId}).then((res)=>{
                this.managerName = res.data.data.trueName
            })
            this.memberData = this.detailData.memberId
            console.log(this.memberData)
              let len = this.memberData.length;
              for(var i = 0; i<len; i++){
                  this.$http.get("user/"+this.memberData[i],{userId:this.memberData[i]}).then((res)=>{
                     this.nameData.push(res.data.data.trueName)
                   })
              }
              
         })
        
     },
 },
 mounted () {
     this.getDetailData()

 }
}
</script>
 <style lang="css" scoped>
#header{
    width: 100%;
    height: 80px;
    line-height: 80px;
    color: white;
    text-align: center;
    background-color: rgb(0,153,204);
}
#table{
    border-collapse: collapse;
    border: none;
}

</style>
