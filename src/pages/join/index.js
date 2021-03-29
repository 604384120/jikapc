import React, { useState, useEffect } from "react";
import { Divider, Cascader } from "antd";
import { $, Page, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";
import Info from "./info";
import Publish from "./publish";

export default function() {
  let { infoOpen, tableList, addOpen }={}

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
  };

	let columns = [
		{
			title: "序号",
			dataIndex: "_key"
		},
		{
      title: "岗位名称",
      dataIndex: "job_name"
		},
		{
      title: "投递人数",
      dataIndex: "cnt_resume",
		},
		{
      title: "招聘状态",
      dataIndex: "enable",
			render: rs => <span>{rs === "YES" ? "进行中" : "已停止"}</span>
		},
		{
			title: "操作",
			width: 220,
			align:'center',
			render: (text, record) => (
				<span>
          <a onClick={() => addOpen.open("编辑招聘", record)}>编辑</a>
          <Divider type="vertical" />
					<a onClick={() => infoOpen.open("应聘信息", record)}>查看简历</a>
          <Divider type="vertical" />
          <a onClick={async () => {
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
            let url = record.enable === "YES" ? "/job/disable": "/job/enable"
            let res = await $.post(url, {job_uuid: record.job_uuid});
            tableList.reload();
            $.msg("操作成功~");
            return res;
          }}
          className={record.enable === "YES" && "fc_err"}
          >
              {record.enable === "YES" ? "停止招聘" : "开启招聘"}
            </a>
				</span>
			)
		}
  ];

	return (
		<div className="br_3 bg_white pall_15">
      <Form className="mb_15" onSubmit={async (values, btn, ext) => {
          tableList.search(values)
      }}>
        {({form, set})=>(
            <div className="dis_f jc_sb">
              <div className="box">
                <div className="h_40 mr_15 dis_ib">
                    <Inputs name="enable" value="" form={form} autoSubmit={true}
                    select={[
                      {value:'',text:'全部状态'},
                      {value:'YES',text:'进行中'},
                      {value:'NO',text:'已停止'},
                    ]}/>
                </div>
              </div>
              <div>
                <Btn onClick={() => {
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
                  addOpen.open("发布招聘")
                }}>发布招聘</Btn>
              </div>
            </div>
        )}
      </Form>
      <TablePagination api="/job/user/query" columns={columns} ref={(rs) => tableList = rs} />
			<Page ref={(rs) => infoOpen = rs} onClose={() => tableList.reload()}>
        <Info />
			</Page>
			<Page ref={(rs) => addOpen = rs} onClose={() => tableList.reload()}>
        <Publish />
			</Page>
		</div>
	);
}
