import React, { useState, useEffect } from "react";
import { Form as Forms, Table, Cascader } from "antd";
import { Method, Form, Inputs, Uploadimgs, Btn } from "../comlibs";
import { optionsList } from "../../common/plugins/cityData";
 
export default function(props) {
  let $ = new Method();
  const Iconfont = $.icon();
  let infoData = props.Parent.data;
  let {img_ref} = {};

  const creatValue = (dataSub, form) => {
    let val = [];
    if (dataSub?.length === 3) {
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
  
  let AvatarBox = ({imgs, valSet}) => {
    let [avatar, setAvatar] = useState(imgs ? [...imgs] : []);
    let {
      uploadimgs,
      url = "https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/07ec91c0-e3ad-11ea-8ba7-00163e04cc20.png"
    }={};
    const handleDelete = (index) => {
      let ava = [...avatar];
      ava.splice(index, 1);
      setAvatar([...ava]);
      valSet(ava.toString());
    };
    return (
        <div className="uploadImgBox">
            {avatar.length > 0 ? <div style={{margin:"-20px 0 0 0"}}>
              <span style={{background: `url(${url}) no-repeat center`, width:120, height: 90, border: "1px dashed rgb(161, 161, 161)", margin: "5px", float: "left"}} onClick={()=>{ uploadimgs.open() }}></span>
              {avatar?.map((node, index) => {
                return <span className="pst_rel dis_ib pall_5">
                  <img style={{width:120,height:90}} key={index} src={node}/>
                  <Iconfont type="icon-guanbi" className="deleteImg" onClick={() => handleDelete(index)}></Iconfont>
                </span>
              })}
            </div> :
            <div className="uploadDisImg" onClick={()=>{ uploadimgs.open() }}>
                <img style={avatar.length > 0 ? {width: 120, height: 90} : {width:14,height:14}} className="circle" src={url}/>
            </div>}
            <Uploadimgs
              ref={img_ref}
              prefix='newtruck/'
              // multiple={true}
              ref={e => (uploadimgs = e)}
              onSure={cover => {
                setAvatar(avatar.concat(cover.split(",")));
                valSet(avatar.concat(cover.split(",")).join(","));
                // valSet(cover)
                // setAvatar(cover)
              }}
            />
        </div>
    )
  };

	return (
		<div className="br_3 pall_15">
			<Form
        style={{width: "970px", margin: "0 auto"}}
				onSubmit={async values => {
          let verify = $.store().GlobalData.user.verify_material.verify;
          let verify_type = $.store().GlobalData.user.verify_material.verify_type;
          if (verify_type === 'VISITER' && verify === 'NO') {
            $.msg("当前账号未认证，无法进行操作");
            return
          };
          if (verify === 'FAILURE') {
            $.msg("当前账号认证失败，无法进行操作");
            return
          };
          if (verify === 'NO' && verify_type !== 'VISITER') {
            $.msg("当前用户正在认证中，无法进行操作");
            return
          };
          values.truck_cat = values.truck_cat.join("");
          values.old_truck_uuid = infoData?.old_truck_uuid;
          values.brand_uuid = values.brandData[0];
          values.series_uuid = values.brandData[1];
          values.car_zonecode = values.car_zonecode[values.car_zonecode.length-1]
          if (infoData) {
            let rs = await $.post('/old/truck/update', values)
            $.msg("车辆修改成功！");
          } else {
            let rs = await $.post('/old/truck/add', values)
            $.msg("车辆发布成功！");
          }
          props.Parent.close(true);
          return;
				}}
			>
				{({ form, submit, set }) => {
					return (<div>
            <div className="bg_white pall_15 mb_20">
              <div style={{borderBottom: "1px solid #E9E9E9", padding: "0px 0 12px 20px", fontWeight: "bold", fontSize: "15px", marginBottom: "14px"}}>车型信息</div>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                    品牌： 
                </span>
                <div style={{display: "inline-block", width: "150px"}}>
                {set({
                    name: 'brandData',
                    value: infoData ? [infoData?.brand_uuid, infoData?.series_uuid] : undefined,
                    required: true
                  },(valSet)=>(
                    <Cascader allowClear options={props.brandList} onChange={(value) => {
                      let truck_key;
                      props.brandList.forEach(node => {
                        if (node.brand_uuid === value[0]) {
                          node.seriess.forEach(item => {
                            if (item.series_uuid === value[1]) {
                              truck_key = item.truck_cat
                            }
                          })
                        }
                      });
                      form.setFieldsValue({"truck_cat": creatValue(truck_key)});
                    }} placeholder="全部品牌/车系" />
                  ))}
                </div>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>类别： </span>
                <div style={{display: "inline-block", width: "150px"}}>
                  {set({
                      name:'truck_cat',
                      value: infoData ? creatValue(infoData?.truck_cat, form) : (form.getFieldValue("truck_cat") && form.getFieldValue("truck_cat")),
                    },(valSet)=>{
                      return <Cascader allowClear disabled={true} options={props.truckList} style={{width: "190px"}} onChange={(value) => valSet("truck_cat", value)} placeholder="选择品牌自动添加类别" />
                  } )
                  }
                  
								</div>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  车型： 
                </span>
                <Inputs style={{ width: 150 }} form={form} name="car_model" required={true} value={infoData?.car_model}/>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>后桥速比： </span>
                <Inputs style={{ width: 150 }} form={form} name="rear_axle_speed_ratio" value={infoData?.rear_axle_speed_ratio}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>最大马力(马力)： </span>
                <Inputs style={{ width: 150 }} form={form} name="maximum_horsepower" value={infoData?.maximum_horsepower} />
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>牵引总质量(吨)： </span>
                <Inputs style={{ width: 150 }} form={form} name="towing" value={infoData?.towing}/>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>驱动形式： </span>
                <Inputs style={{ width: 150 }} form={form} name="drive_form" value={infoData?.drive_form}/>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>速箱档位： </span>
                <Inputs style={{ width: 150 }} form={form} name="cnt_gear" value={infoData?.cnt_gear} />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>排放标准： </span>
                <Inputs style={{ width: 150 }} name="emission_standards" type="select" form={form} value={infoData?.emission_standards}
                  select={[
                      {value:'国六',text:'国六'},
                      {value:'国五',text:'国五'},
                      {value:'国四',text:'国四'},
                      {value:'国三',text:'国三'},
                  ]}
                />
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>发动机品牌： </span>
                <Inputs style={{ width: 150 }} form={form} name="engine_brand" value={infoData?.engine_brand} />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  上牌时间： 
                </span>
                <Inputs
                  name="regist_date"
                  placeholder="请选择日期"
                  type="datePicker"
                  value={infoData?.regist_date}
                  form={form}
                  style={{width: "150px"}}
                  required={true}
                  // disabledDate={(current) => current && current > Moment().endOf('day')}
                />
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  交强险到期时间： 
                </span>
                <Inputs
                  name="insurance_date"
                  placeholder="请选择日期"
                  type="datePicker"
                  value={infoData?.insurance_date}
                  form={form}
                  // autoSubmit={true}
                  required={true}
                  // disabledDate={(current) => current && current > Moment().endOf('day')}
                />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  表显里程(万公里)： 
                </span>
                <Inputs style={{ width: 150 }} form={form} name="mileage" required={true} value={infoData?.mileage}/>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  按揭贷款： 
                </span>
                <Inputs
                  name="loan"
                  form={form}
                  required={true}
                  type="radio"
                  value={infoData?.loan}
                  radios={[
                    {
                      value: "已还清",
                      text: "已还清",
                    },
                    {
                      value: "未还清",
                      text: "未还清",
                    },
                    {
                      value: "无贷款",
                      text: "无贷款",
                    },
                  ]}
                />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  报价(万元)： 
                </span>
                <Inputs style={{ width: 150 }} form={form} name="price" required={true} value={infoData?.price}/>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  分期： 
                </span>
                <Inputs
                  name="is_installment"
                  form={form}
                  required={true}
                  type="radio"
                  value={infoData?.is_installment}
                  radios={[
                    {
                      value: "可分期",
                      text: "可分期",
                    },
                    {
                      value: "不可分期",
                      text: "不可分期",
                    },
                  ]}
                />
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  车辆地址： 
                </span>
                <div style={{display: "inline-block", width: "150px"}}>
                  {set({
                      name: 'car_zonecode',
                      value: infoData ? addressVal(infoData.car_zonecode + "") : undefined,
                      required: true
                  },(valSet)=>(
                    <Cascader
                      fieldNames={{ label: 'name', value: 'code', children: 'sub' }}
                      options={optionsList}
                      // onChange={(value, selectedOptions) => }
                      // changeOnSelect
                      placeholder="请选择地址"
                    />
                      // <Cascader options={props.brandList} value={valSet} onChange={(value) => {return}} placeholder="全部品牌/车系" />
                  ))}
                </div>
              </Forms.Item>
              <Forms.Item>
                <span style={{marginLeft: "30px", display: "inline-block", width: "140px",textAlign: "right"}}>
                  <span className="fc_err ph_5">*</span>
                  车辆描述： </span>
                <Inputs style={{ width: "calc(100% - 284px)" }} rows={4} form={form} type="textArea" name="car_summary" required={true} value={infoData?.car_summary}/>
              </Forms.Item>
              <div style={{ marginLeft: 95 }} className="mt_15">
                <span className="fc_err ph_5">*</span>
                车辆照片：(请上传车头、车内饰等照片)
                <div style={{ margin: "24px 95px"}}>
                  {set({
                      name: 'car_imgs',
                      value: infoData?.car_imgs,
                  },(valSet)=>(
                      <AvatarBox img_ref={ref => {img_ref = ref}} valSet={valSet} imgs={infoData?.car_imgs}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="ta_c mt_15">
              <Btn
                className="mt_15"
                htmlType="submit"
              >
                保存并发布
              </Btn>
            </div>
					</div>)
				}}
			</Form>
			
		</div>
	);
}
