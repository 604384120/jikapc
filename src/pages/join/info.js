import React, { useState, useEffect } from "react";
import { Tag, Tabs, Divider, Row, Table, Menu } from "antd";
import { $, Page, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";
import "./index.css";
import { nodeName } from "jquery";

const { TabPane } = Tabs;
const { SubMenu } = Menu;

export default function(props) {
  let [parentData] = [props.Parent.data];
  let [resumeList, setResumeList] = useState([]);
  let [resumeKey, setResumeKey] = useState(0);

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
    let res = await $.get('/resume/query', {job_uuid: parentData.job_uuid});
    if(!res)return;
    setResumeList(res.data)
  };

  const creatResumeMenu = () => {
    return resumeList?.map((item, index) => {
      return <Menu.Item key={index + ''} style={{height: '100px'}}>
      <div>
        <p><span>{item.material.name+" "+item.material.gender}</span></p>
        <p><span>{item.education}</span><Divider type="vertical" /><span>{item.age}岁</span><Divider type="vertical" /><span>{item.drive_age}年驾龄</span></p>
      </div>
    </Menu.Item>
    })
  };

  const creatResumeInfo = () => {
    if (resumeList.length === 0) {
      return
    }
    let data = resumeList[resumeKey]
      return (<div style={{display: "inline-block", paddingLeft: "20px"}}>
      <div style={{marginBottom: "20px"}}>
        <span style={{fontWeight: "bold", fontSize: "24px", lineHeight: "60px"}}>{data.material.name+" "+data.material.gender}</span>
        <p><span>{data.education}</span><Divider type="vertical" /><span>{data.age}岁</span><Divider type="vertical" /><span>{data.drive_age}年驾龄</span></p>
        <p>
          <span style={{display: "inline-block", width: "240px"}}>联系电话：{data.user?.phone || "无"} </span>
          <span style={{display: "inline-block", width: "240px"}}>驾驶证类型：{data.drive_license || "无"} </span>
          <span style={{display: "inline-block", width: "240px"}}>薪资要求：{`${data.min_salary}~${data.max_salary}元` || "无"}</span>
        </p>
        <p>福利要求：{data?.welfare?.map((item, index) => {
          return <span key={index} className="mr_10"> { item || "无" } </span>
        })} </p>
      </div>
      <div style={{marginBottom: "20px"}}>
        <p className="title">原工作信息</p>
        <p className="ph_16">工作地址：{data.job_address || "无"}</p>
        <p className="ph_16">驾驶车辆型号：{data.truck_model || "无"}</p>
        <p className="ph_16">驾驶路线：{data.drive_line || "无"}</p>
      </div>
      <div style={{marginBottom: "20px"}}>
        <p className="title">意向工作信息</p>
        <p className="ph_16">工作地址：{data.intent_job_address || "无"}</p>
        <p className="ph_16">驾驶车辆型号：{data.intent_truck_model || "无"}</p>
        <p className="ph_16">驾驶路线：{data.intent_drive_line || "无"}</p>
      </div>
      <div style={{marginBottom: "20px"}}>
        <p className="title">其他要求</p>
        <p className="ph_16">{data.else_require || "无"}</p>
      </div>
    </div>)
  };

	return (
		<div className="br_3 bg_white pall_15">
      {resumeList.length === 0 ? <Table className="mb_20" columns={[]} dataSource={[]} /> : <div>
        <Menu style={{ width: 256, float: "left" }} mode="inline" defaultSelectedKeys={['0']} onClick={(e) => setResumeKey(parseInt(e.key))}>
          {creatResumeMenu()}
        </Menu>
        {creatResumeInfo()}
      </div>}
		</div>
	);
}
