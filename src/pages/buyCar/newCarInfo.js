import React, { useState, useEffect } from 'react';
import { Divider, Affix, Badge } from "antd";
import { $, Form, TablePagination, Modals, Inputs, Btn, Page } from "../comlibs";
import Advisory from "./advisory";
import CarTypeInfo from "./carTypeInfo";

export default function(props) {
  let [parent] = [props.Parent?.data];
  let {tableList, advisoryOpen, carTypeOpen}={}

  let [infoData, setInfoData] = useState();
  let [compare, setCompare] = useState(sessionStorage.getItem("compare")?.split(",") || []);
  let [sessNum, setSessNum] = useState(compare.length);

  useEffect(()=>{getQuery()},[]);

  async function getQuery(){
    let data = await $.get('/series/detail',{series_uuid: parent.series_uuid});
    if (!data) return
    setInfoData(data)
  };

  async function deleteData(record){
    await $.get('/marketcat/remove',{marketcat_uuid: record.marketcat_uuid});
    $.msg("操作成功~");
    tableList.reload();
  };

  const handleAddCompare = (truck_uuid) => {
    if (compare.length >= 4) {
      return $.msg('最多只能对比4辆')
    }
    compare.push(truck_uuid);
    sessionStorage.setItem("compare", compare.toString());
    setCompare(compare);
    setSessNum(compare.length)
  };

  const handleDeleteCompare = (truck_uuid) => {
    compare.map((item, index) => {
      if (truck_uuid === item) {
        compare.splice(index, 1)
      }
    });
    sessionStorage.setItem("compare", compare.toString());
    setCompare(compare);
    setSessNum(compare.length)
  };

	let columns = [
		{
      title: "序号",
      dataIndex: "_key"
		},
		{
      title: "车型",
      dataIndex: "car_model",
      width: 420
		},
		{
      title: "价格",
      dataIndex: "price",
      render: (text, record) => {
        return <span>{text || "-"}万元</span>
      }
		},
		{
			title: "相关信息",
			width: "280px",
			align:'center',
			render: (text, record) => (
				<span>
					<a onClick={() => carTypeOpen.open("车型详情", {...record, tab: "1"})}>图片</a>
					<Divider type="vertical" />
          <a onClick={() => carTypeOpen.open("车型详情", {...record, tab: "2"})}>参数配置</a>
          <Divider type="vertical" />
          <a onClick={() => advisoryOpen.open("购车咨询", {...record})}>咨询</a>
          <Divider type="vertical" />
          {compare?.indexOf(record?.truck_uuid) >= 0 ? <a onClick={() => handleDeleteCompare(record.truck_uuid)}>取消对比</a>: 
          <a onClick={() => handleAddCompare(record.truck_uuid)}>+对比</a>}
				</span>
			)
		}
  ];

	return (
		<div className="br_3 bg_white pall_15">
      <div>
        <span className="fb fs_20 pl_32 pr_24">{infoData?.series_name}</span>
        指导价：<span className="fc_pink">{infoData?.min_price === infoData?.max_price ? infoData?.min_price : `${infoData?.min_price +'~' + infoData?.max_price}`} 万元</span></div>
      <Divider/>
      <TablePagination api="/truck/query" params={{series_uuid: parent.series_uuid}} columns={columns} ref={(rs) => tableList = rs} />
      <Affix className='fixBox'>
        <Badge count={sessNum} onClick={() => window.location.href="/adminPc/buyCar?compare=compare"}>
          <span className='fixBox_span'>车型对比</span>
        </Badge>
      </Affix>
      <Page ref={(rs) => advisoryOpen = rs} onClose={() => props.Parent.close()}>
        <Advisory/>
      </Page>
      <Page ref={(rs) => carTypeOpen = rs}>
        <CarTypeInfo/>
      </Page>
		</div>
	);
}
