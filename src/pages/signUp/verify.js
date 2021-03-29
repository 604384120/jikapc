import React, { useState, useEffect } from "react";
import { Form as Forms, Checkbox, Cascader, Button, Alert } from "antd";
import { Method, Form, Inputs, Btn, Uploadimgs } from "../comlibs";
import { optionsList } from "../../common/plugins/cityData";
import "./index.css"
 
export default function(props) {
  let $ = new Method();
  let parent = props?.Parent?.data;

  let [infoData, setInfoData]=useState(null);
  let [showTime, setShowTime]=useState(false);

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
  };

  let AvatarBox=(props)=>{
    let imgs = props?.img || "";
    let [avatar,setAvatar] = useState(imgs);
    let {valSet}=props;
    let {
      uploadimgs,
      url = "https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/af07d75c-f957-11ea-8bb3-00163e04cc20.png"
    }={};
    return (
        <div>
            {avatar ? <div>
                <img src={avatar}/>
                {!showTime && <Button className='ml_20' type='primary' onClick={()=>{ uploadimgs.open() }}>重新上传</Button>}
            </div> :
            <div >
                <img src={url}/>
                <Button className='ml_20' type='primary' onClick={()=>{ uploadimgs.open() }}>上传</Button>
            </div>}
            <Uploadimgs
              multiple={false}
              prefix={props.type === "brand_logo" ? 'newtruck/' : "seriescover/"}
              ref={e => (uploadimgs = e)}
              onSure={cover => {
                valSet(cover)
                setAvatar(cover)
      }}
    />
        </div>
    )
}

	return (
		<div className="br_3 pall_15">
			<Form
        style={{width: "970px", margin: "0 auto"}}
				onSubmit={async values => {
          values.company_area = values.company_area[values.company_area.length-1]
          let rs = await $.post('/user/verify/company', values)
          $.msg("认证提交成功！");
          window.location.href = "/adminPc/buyCar";
          return;
				}}
			>
				{({ form, submit, set }) => {
					return (<div>
            <div className="bg_white pall_15 mb_20">
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  企业名称： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_name}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_name" />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  企业地址： 
                </span>
                {showTime ? <span className="ml_15">{infoData.verify_material.company_area_name + infoData.verify_material.company_address}</span> : <div style={{display: "inline-block", width: "600px", paddingLeft: "16px"}}>
                  {set({
                      name: 'company_area',
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
                  <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_address" />
                </div>}
              </Forms.Item>
              <div className="phoneBox">
                <span>
                  <span className="fc_err" style={{float: 'left'}}> * </span>
                  营业执照照片：
                  <span>必须为清晰彩色图片</span>
                </span>
                {set({
                    name:'company_license',
                    // required: setting ? false : true
                },(valSet)=>(
                    <AvatarBox valSet={valSet} img={infoData?.verify_material.company_license}/>
                ))}
              </div>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  企业法人姓名： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.legal_person}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="legal_person"/>}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  现有车辆： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.cnt_cars}辆</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="cnt_cars" />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  注册人姓名： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_register}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_register" />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  注册人岗位： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_post}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_post" />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  联系电话： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_phone}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_phone" />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  工作邮箱： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_email}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_email" />}
              </Forms.Item>
            </div>
            {!showTime && <div className="ta_c mt_15">
              <Btn
                className="mt_15"
                htmlType="submit"
                style={{ width:  84}}
              >
                提交认证
              </Btn>
            </div>}
					</div>)
				}}
			</Form>
			
		</div>
	);
}
