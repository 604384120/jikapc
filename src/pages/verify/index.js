import React, { useState, useEffect } from "react";
import { Form as Forms, Checkbox, Cascader, Button, Alert } from "antd";
import { Method, Form, Inputs, Btn, Uploadimgs } from "../comlibs";
import { optionsList } from "../../common/plugins/cityData";
import "./index.css"
 
export default function(props) {
  let $ = new Method();
  let parent = props?.Parent?.data;

  let [infoData, setInfoData]=useState();
  let [showTime, setShowTime]=useState(false);

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
    let data = await $.get('/user/info');
    if(!data)return;
    setInfoData(data);
    data?.verify_material?.verify === "YES" && setShowTime(true)
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
      {infoData?.verify_material?.verify === 'FAILURE' && <Alert type="error" message={`非常抱歉，由于您填写的资料存在${infoData?.verify_material?.reason}等问题，请您补充完整后点击再次提交。`} banner style={{margin: '-24px 0 15px 0'}} />}
      {infoData?.verify_material?.verify === 'YES' && <Alert type="info" showIcon message='如要修改认证信息请关注“集卡e家”公众号咨询' banner style={{margin: '-24px 0 15px 0'}} />}
			<Form
        style={{width: "970px", margin: "0 auto"}}
				onSubmit={async values => {
          // if (infoData) {
          //   values.job_uuid = infoData.job_uuid;
          // }
          values.company_area = values.company_area[values.company_area.length-1]
          let rs = await $.post('/user/verify/company', values)
          $.msg("认证提交成功！");
          // props.Parent.close(true);
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
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_name" value={infoData?.verify_material.company_name} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  企业地址： 
                </span>
                {showTime ? <span className="ml_15">{infoData.verify_material.company_area_name + infoData.verify_material.company_address}</span> : <div style={{display: "inline-block", width: "600px", paddingLeft: "16px"}}>
                  {set({
                      name: 'company_area',
                      value: infoData ? addressVal(infoData.verify_material.company_area + "") : undefined,
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
                  <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_address" value={infoData?.verify_material.company_address} />
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
                    value: infoData?.verify_material.company_license,
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
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="legal_person" value={infoData?.verify_material.legal_person} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  现有车辆： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.cnt_cars}辆</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="cnt_cars" value={infoData?.verify_material.cnt_cars} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  注册人姓名： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_register}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_register" value={infoData?.verify_material.company_register} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  注册人岗位： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_post}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_post" value={infoData?.verify_material.company_post} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  联系电话： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_phone}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_phone" value={infoData?.verify_material.company_phone} />}
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  工作邮箱： 
                </span>
                {showTime ? <span className="ml_15">{infoData?.verify_material.company_email}</span> : 
                <Inputs className="ml_15" style={{ width: 300 }} form={form} name="company_email" value={infoData?.verify_material.company_email} />}
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
