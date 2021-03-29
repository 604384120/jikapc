import React, { useState, useEffect } from "react";
import { Form as Forms, Checkbox, Cascader } from "antd";
import { Method, Form, Inputs, Btn } from "../comlibs";
import { optionsList } from "../../common/plugins/cityData";
import btnloading from "../../common/comlibs/btnloading";
 
export default function(props) {
  let $ = new Method();
  let parent = props.Parent.data;

  let [worksList, setWorksList]=useState([]);
  let [jobTypeList, setJobTypeList]=useState([]);
  let [driveLicenseList, setDriveLicenseList]=useState([]);
  let [welfareList, setWelfareList]=useState([]);
  let [infoData, setInfoData]=useState();

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
    let data = await $.get('/recruit/works');
    if(!data)return;
    let list = data.map((node) => {node.text = node.name; node.value = node.id; return node});
    setWorksList(list);
    data = await $.get('/recruit/job/types');
    if(!data)return;
    list = data.map((node) => {node.text = node.name; node.value = node.id; return node});
    setJobTypeList(list);
    data = await $.get('/drive/license/types');
    if(!data)return;
    list = data.map((node) => {let map = {}; map.label = node; map.value = node; return map});
    setDriveLicenseList(list);
    data = await $.get('/recruit/welfare');
    if(!data)return;
    list = data.map((node) => {let map = {}; map.label = node; map.value = node; return map});
    setWelfareList(list);
    if (parent) {
      data = await $.get('/job/detail', {job_uuid: parent.job_uuid});
      if(!data)return;
      setInfoData(data);
    }
  };

  const creatValue = (dataSub, form) => {
    let val = [];
    if (dataSub.length === 3) {
      val = [dataSub.slice(0, 1), dataSub.slice(1, 3)]
    } else {
      val = [dataSub]
    }
    return val
  };

  const addressVal = (zonecode) => {
    let a,b,c;
    let code;
    if (zonecode % 10000 === 0) {
      code = [zonecode]
    } else if (zonecode % 100 === 0) {
      a = zonecode.slice(0, 2)
      b = zonecode.slice(2, 4)
      code = [a * 10000, (a + '' + b) * 100]
    } else if (zonecode % 1 === 0) {
      a = zonecode.slice(0, 2)
      b = zonecode.slice(2, 4)
      c = zonecode.slice(4, 6)
      code = [(a * 10000).toString(), ((a + '' + b) * 100).toString(), a + '' + b + c]
    }
    return code;
  };

	return (
		<div className="br_3 pall_15">
			<Form
        style={{width: "970px", margin: "0 auto"}}
				onSubmit={async (values, btn, ext) => {
          if (infoData) {
            values.job_uuid = infoData.job_uuid;
          }
          values.job_zone = values.job_zone[values.job_zone.length-1]
          if (infoData) {
            let rs = await $.post('/job/update', values)
            $.msg("招聘修改成功！");
          } else {
            let rs = await $.post('/job/add', values)
            $.msg("招聘发布成功！");
          }
          props.Parent.close(true);
          return;
				}}
			>
				{({ form, submit, set }) => {
					return (<div>
            <div className="bg_white pall_15 mb_20">              
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  招聘职位： 
                </span>
                <Inputs name="work" form={form} required={true} type="radio" value={infoData?.work} radios={worksList} />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  岗位类型： 
                </span>
                <Inputs name="job_type" form={form} required={true} type="radio" value={infoData?.job_type} radios={jobTypeList} />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  岗位名称： 
                </span>
                <Inputs style={{ width: 150 }} form={form} required={true} name="job_name" value={infoData?.job_name} />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right", float: "left"}}>
                  <span className="fc_err ph_5">*</span>
                  驾照要求： 
                </span>
                <div style={{display: "inline-block", width: "600px"}}>
                  {set({
                      name: 'drive_license',
                      value: infoData?.drive_license.split(','),
                      required: true
                  },(valSet)=>(
                    <Checkbox.Group options={driveLicenseList} />
                  ))}
                </div>
              </Forms.Item>
              <div className="mb_15">
                <span style={{marginLeft: "30px", display: "inline-block", width: "150px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  薪资范围： 
                </span>
                <Inputs style={{ width: 150 }} form={form} required={true} name="min_salary" value={infoData?.min_salary} suffix="元" />
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "center"}}>至</span>
                <Inputs style={{ width: 150 }} form={form} required={true} name="max_salary" value={infoData?.max_salary} suffix="元" />
              </div>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  办公地址： 
                </span>
                <div style={{display: "inline-block", width: "600px"}}>
                  {set({
                      name: 'job_zone',
                      value: infoData ? addressVal(infoData.job_zone + "") : undefined,
                      // required: true
                  },(valSet)=>(
                    <Cascader
                      style={{width: "150px"}}
                      fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                      options={optionsList}
                      allowClear
                      placeholder="请选择地址"
                    />
                  ))}
                  <Inputs className="ml_15" style={{ width: 300 }} form={form} name="job_address" value={infoData?.job_address} />
                </div>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  驾驶车辆： 
                </span>
                <Inputs style={{ width: "calc(100% - 284px)" }} rows={4} form={form} type="textArea" name="truck_model" required={true} value={infoData?.truck_model}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  运营线路： 
                </span>
                <Inputs style={{ width: "calc(100% - 284px)" }} rows={4} form={form} type="textArea" name="drive_line" required={true} value={infoData?.drive_line}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  工作内容： 
                </span>
                <Inputs style={{ width: "calc(100% - 284px)" }} rows={4} form={form} type="textArea" name="job_content" required={true} value={infoData?.job_content}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  任职要求： 
                </span>
                <Inputs style={{ width: "calc(100% - 284px)" }} rows={4} form={form} type="textArea" name="job_require" required={true} value={infoData?.job_require}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right", float: "left"}}>
                  <span className="fc_err ph_5">*</span>
                  福利待遇： 
                </span>
                <div style={{display: "inline-block", width: "600px"}}>
                  {set({
                      name: 'welfare',
                      value: infoData?.welfare,
                      required: true
                  },(valSet)=>(
                    <Checkbox.Group options={welfareList} />
                  ))}
                </div>
              </Forms.Item>
            </div>
            <div className="ta_c mt_15">
              <Btn
                className="mt_15"
                htmlType="submit"
                style={{ width: 65 }}
              >
                确定
              </Btn>
            </div>
					</div>)
				}}
			</Form>
			
		</div>
	);
}
