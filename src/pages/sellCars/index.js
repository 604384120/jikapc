import React, { useState, useEffect } from 'react';
import { Divider, Tabs, Cascader } from "antd";
import { $, Page, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";
import Add from "./add";
import "./index.css";

const { TabPane } = Tabs;

export default function() {
  let { newOpen, newList }={};
  let [brandList, setBrandList]=useState([]);
  let [truckList, setTruckList]=useState([]);

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
    let brandResList = await $.get('/brand/query', {cnt_totalnum: "NO"});
    if(!brandResList.data)return;
    let list1 = brandResList.data.map((node) => {
      node.label = node.brand_name;
      node.value = node.brand_uuid;
      node.children = node.seriess.map((ser) => {
        ser.label = ser.series_name;
        ser.value = ser.series_uuid;
        return ser
      });
      return node
    })
    setBrandList(list1);
    let res = await $.get('/truck/cat1/query');
    let list = res.category.map((node) => {node.value = node.cat1 ; node.label = node.name1; node.children = node.cat2s.map((item) => {item.value = item.cat2 ; item.label = item.name2; return item}); return node});
    setTruckList(list);
  };

	let newColumns = [
		{
			title: "序号",
			dataIndex: "_key"
		},
		{
      title: "品牌",
      dataIndex: "brand_name"
		},
		{
			title: "车系",
			dataIndex: "series_name"
		},
		{
      title: "车型",
      dataIndex: "car_model"
		},
		{
      title: "价格",
      dataIndex: "price",
      render: (text, record) => (
        <span>{text}万元 </span>
      )
		},
		{
			title: "操作",
			width: 170,
			align:'center',
			render: (text, record) => (
				<span>
					<a onClick={() => newOpen.open("编辑", {...record, type: "set"})}>编辑</a>
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
            let res = await $.get("/old/truck/remove", {old_truck_uuid: record.old_truck_uuid});
            newList.reload();
            $.msg("操作成功~");
            return res;}} className="fc_err">删除</a>
				</span>
			)
		}
  ];

	return (
		<div className="br_3 bg_white pall_15">
      <Btn className="mb_10" onClick={() => {
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
        newOpen.open("发布二手车")
      }}>发布二手车</Btn>
      <TablePagination api="/old/truck/user/query" columns={newColumns} ref={(rs) => newList = rs} />
			<Page ref={(rs) => newOpen = rs} onClose={() => newList.reload()}>
				<Add brandList={brandList} truckList={truckList} />
			</Page>
		</div>
	);
}
