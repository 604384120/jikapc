import React, { useState, useEffect } from 'react';
import { InputNumber, Checkbox, Form as Forms, Modal } from "antd";
import { $, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";

const col = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
};

export default function(props) {
  console.log(props)
  let [parent] = [props.Parent?.data];
  let [installment, setInstallment] = useState('YES');
  let [modalVisible, setModalVisible] = useState(false);

  const options = [
    { label: '车头', value: '车头' },
    { label: '拖挂', value: '拖挂' },
    { label: '保险', value: '保险' },
    { label: '购置税', value: '购置税' },
  ];

	return (
		<div className="br_3 bg_white pall_15">
      <Form
        {...col}
        onSubmit={async (values, btn, ext) => {
          values.truck_uuid = parent.truck_uuid;
          let rs = await $.post("/truck/intention/add", values);
          // $.msg("意向提交成功");
          Modal.success({
            title: '提交成功',
            content: (
              <div>
                <p>2小时后会有工作人员致电联系，给予详细的贷款方案介绍，请注意接听电话</p>
              </div>
            ),
            onOk() {
              props.Parent.close(true);
            },
          });
          btn.loading = false;  //关闭提交按钮loading加载状态
      }}
      >
        {({ form, set, submit }) => {
          let is_installment;
          return <div>
            <div className="mt_15">
              <span className="dis_ib w_220 ta_r">品牌/车系：</span>
              {parent?.brand_name + "/" + parent?.series_name}
            </div>
            <div className="mt_15">
              <span className="dis_ib w_220 ta_r">车型：</span>
              {parent?.car_model}
            </div>
            <div className="mt_15">
              <span className="dis_ib w_220 ta_r">购车数量：</span>
              {set({
                  name: 'num',
                  value: 1,
                  required: true
              },(valSet)=>(
                <InputNumber min={1} max={100000} />
              ))}
            </div>
            <div className="mt_15">
              <span className="dis_ib w_220 ta_r">总价：</span>
              {form.getFieldValue("num") * parent?.price}万元
            </div>
            <div className="mt_15">
              <span className="dis_ib w_220 ta_r">是否分期：</span>
              <Inputs
                name="is_installment"
                required={true}
                form={form}
                value={installment}
                radios={[
                  {
                    value: "YES",
                    text: "是"
                  },
                  {
                    value: "NO",
                    text: "否"
                  }
                ]}
                onChange={(value) => setInstallment(value)}
              />
            </div>
            {installment === "YES" && <div className="mt_15">
              <span className="dis_ib w_220 ta_r">项目融资：</span>
              {set({
                  name: 'finance',
                  required: installment === "YES" ? true : false
              },(valSet)=>(
                <Checkbox.Group options={options} defaultValue={['Apple']} />
              ))}
            </div>}
            {installment === "YES" && <div className="mt_15">
              <span className="dis_ib w_220 ta_r">意向分期数：</span>
              <Inputs
                name="installment_num"
                form={form}
                required= {installment === "YES" ? true : false}
                radios={[
                  {
                    value: "24期",
                    text: "24期"
                  },
                  {
                    value: "36期",
                    text: "36期"
                  }
                ]}
              />
            </div>}
            {installment === "YES" && <Forms.Item {...col}>
              <span className="dis_ib ta_r" style={{width: 210}}>意向分期数：</span>
              <Inputs
                name="down_payment"
                form={form}
                required= {installment === "YES" ? true : false}
                radios={[
                  {
                    value: "13%",
                    text: "13%"
                  },
                  {
                    value: "20%",
                    text: "20%"
                  },
                  {
                    value: "30%",
                    text: "30%"
                  },
                  {
                    value: "40%",
                    text: "40%"
                  },
                  {
                    value: "其他",
                    text: "其他"
                  },
                ]}
                onChange={(value) => {
                  if (value !== "其他") {
                    form.setFieldsValue({"ratio": ""})
                  }
                }}
              />
              <Inputs
                className="input_wrap"
                form={form}
                required= {form.getFieldValue("down_payment") === "其他" ? true : false}
                name="ratio"
                onChange={() => form.setFieldsValue({"down_payment": "其他"})}
              />%
            </Forms.Item>}
            <div className="ta_c mt_15">
              <Btn onClick={submit} >提交信息</Btn>
            </div>
          </div>
        }}
      </Form>
		</div>
	);
}
