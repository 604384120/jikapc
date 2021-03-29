import React, { useState, useEffect } from "react";
import { Descriptions } from "antd";
import { $, Form, Img, Inputs, Btn } from "../comlibs";

export default function (props) {
  let { Parent } = props;
  let user_uuid = Parent.data;
  let [data, setData] = useState({
    user_base_info: {},
    user_ext_info: { experiences: [] },
    rangeDate: null,
  });
  let user = data.user_base_info;
  let ext = data.user_ext_info;
  let rangeDate = data.rangeDate;

  let get = async () => {
    let d = await $.get("/user/info", {
      user_uuid,
    });
    d.rangeDate = null;
    if (d.user_base_info.unapply_period_min) {
      d.rangeDate = [
        d.user_base_info.unapply_period_min,
        d.user_base_info.unapply_period_max,
      ];
    }
    setData(d);
  };

  useEffect(() => {
    get();
  }, [user_uuid]);

  return (
    <div className="br_3 bg_white pall_15">
      <Form
        valueReturn={(val) => {
          val.unapply_period_min = "NO";
          val.unapply_period_max = "NO";
          if (val.unapply_period.length > 0) {
            val.unapply_period_min = val.unapply_period[0];
            val.unapply_period_max = val.unapply_period[1];
          }
          return val;
        }}
        onSubmit={async (val) => {
          val.user_uuid = user_uuid;
          await $.post("/user/info/update", val);
          $.msg("数据更新成功！");
          Parent.close(true);
        }}
      >
        {({ form, submit }) => (
          <div>
            <Descriptions title="考生禁考设置">
              <div className="box">
                <Inputs
                  name="unapply_period"
                  form={form}
                  type="rangePicker"
                  value={rangeDate}
                />
              </div>
            </Descriptions>
            <div className="box">
              <div className="box box-1">
                <Descriptions title="基本信息">
                  <Descriptions.Item label="姓名">
                    <Inputs
                      name="name"
                      value={user.name}
                      form={form}
                      required={true}
                      placeholder="请输入姓名"
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="联系电话">
                    {user.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="性别">
                    {user.gender === "male" && "男"}
                    {user.gender === "female" && "女"}
                  </Descriptions.Item>
                  <Descriptions.Item label="文化程度">
                    {user.edu_degree ? user.edu_degree.name : ""}
                  </Descriptions.Item>
                  <Descriptions.Item label="出生日期">
                    {user.birthday}
                  </Descriptions.Item>
                  <Descriptions.Item label="身份证号">
                    <Inputs
                      name="id_card"
                      value={user.id_card}
                      form={form}
                      required={true}
                      placeholder="请输入身份证号"
                    />
                  </Descriptions.Item>
                </Descriptions>
              </div>
              <div className="box">
                <Img width={137} height={170} src={user.id_photo} />
              </div>
            </div>
            <Descriptions title="技能信息">
              <Descriptions.Item label="当前工作单位">
                {ext.company}
              </Descriptions.Item>
              <Descriptions.Item label="入职时间">
                {ext.join_date}
              </Descriptions.Item>
              <Descriptions.Item label="是否参加过消防职业技能培训">
                {ext.is_educated === "YES" ? "是" : "否"}
              </Descriptions.Item>
              <Descriptions.Item label="培训等级">
                {ext.educate && ext.educate.degree_name}
              </Descriptions.Item>
              <Descriptions.Item label="取证时间">
                {ext.educate && ext.educate.pass_date}
              </Descriptions.Item>
              <Descriptions.Item label="原职业(工种)">
                {ext.career_name}
              </Descriptions.Item>
              <Descriptions.Item label="原技能等级">
                {ext.career && ext.career.degree_name}
              </Descriptions.Item>
              <Descriptions.Item label="资格证书编号">
                {ext.career && ext.career.ca_no}
              </Descriptions.Item>
              <Descriptions.Item label="取证时间">
                {ext.career && ext.career.ca_date}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions title="个人简历">
              <div className="box box-ver">
                {ext.experiences &&
                  ext.experiences.map((d) => (
                    <div className="box mb_10" key={d.uuid}>
                      <span className="box" style={{ width: 200 }}>
                        {d.start_date.date} - {d.end_date.date}
                      </span>
                      <span className="box" style={{ width: 200 }}>
                        {d.company}
                      </span>
                      <span className="box box-1">{d.job}</span>
                    </div>
                  ))}
              </div>
            </Descriptions>
            <div className="ta_c mt_15">
              <Btn onClick={submit} />
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}
