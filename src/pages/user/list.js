import React from "react";
import { Divider } from "antd";
import {
  $,
  Page,
  Form,
  TablePagination,
  Modals,
  Inputs,
  Btn,
} from "../comlibs";
import Detail from "./detail";

export default function () {
  let { Ref_1, Ref_2, Ref_3 } = $.useRef(3);

  let columns = [
    {
      title: "序号",
      dataIndex: "_key",
    },
    {
      title: "姓名",
      render: (rs) => (
        <span>
          <a onClick={() => $(Ref_2).open("用户详情", rs.uuid)}>{rs.name}</a>
        </span>
      ),
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "性别",
      render: (rs) => (
        <span>
          {rs.gender === "male" && "男"}
          {rs.gender === "female" && "女"}
        </span>
      ),
    },
    {
      title: "身份证",
      dataIndex: "id_card",
    },
    {
      title: "学历",
      render: (rs) => (rs.edu_degree ? rs.edu_degree.name : ""),
    },
    {
      title: "注册时间",
      dataIndex: "time_create",
    },
    {
      title: "操作",
      width: 120,
      render: (rs) => (
        <span>
          <a onClick={() => $(Ref_1).open("重置密码", rs)}>重置密码</a>
          <Divider type="vertical" />
          <a onClick={() => $(Ref_2).open("用户详情", rs.uuid)}>修改</a>
        </span>
      ),
    },
  ];

  return (
    <div className="br_3 bg_white pall_15">
      <Form
        className="mb_15"
        valueReturn={(val) => {
          val.unapply_period_min = "";
          val.unapply_period_max = "";
          if (val.unapply_period.length > 0) {
            val.unapply_period_min = val.unapply_period[0];
            val.unapply_period_max = val.unapply_period[1];
          }
          return val;
        }}
        onSubmit={(values) => $(Ref_3).search(values)}
      >
        {({ form }) => (
          <div className="dis_f jc_sb">
            <div className="box box-ac">
              <span className="box">禁考日期：</span>
              <Inputs
                className="mr_15"
                name="unapply_period"
                form={form}
                type="rangePicker"
              />
              <Inputs
                className="mr_15"
                name="q"
                width={250}
                form={form}
                placeholder="输入姓名/身份证号查询"
              />
              <Btn icon="search" htmlType="submit">
                搜索
              </Btn>
            </div>
          </div>
        )}
      </Form>
      <TablePagination api="/user/list" columns={columns} ref={Ref_3} />
      <Modals ref={Ref_1}>
        {({ name, uuid }) => (
          <Form
            action="/user/passwd/reset"
            params={{ user_uuid: uuid }}
            method="POST"
            success={() => {
              $.msg("用户密码重置成功！");
              $(Ref_1).close();
            }}
          >
            {({ form, submit }) => (
              <div>
                <div style={{ marginLeft: 110 }}>用户名：{name}</div>
                <div style={{ marginLeft: 110 }} className="mt_15">
                  密码：
                  <Inputs
                    form={form}
                    name="passwd"
                    type="password"
                    required={true}
                    placeholder="请输入6-8位数的密码"
                    maxLength={8}
                  />
                </div>
                <div className="ta_c mt_15">
                  <Btn onClick={submit} />
                </div>
              </div>
            )}
          </Form>
        )}
      </Modals>
      <Page ref={Ref_2} onClose={() => $(Ref_3).reload()}>
        <Detail />
      </Page>
    </div>
  );
}
