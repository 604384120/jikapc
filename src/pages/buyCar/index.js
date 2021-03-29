import React, { useState, useEffect } from 'react';
import { Divider, Tabs, Cascader } from "antd";
import { $, Page, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";
import NewCar from "./newCar";
import OldCar from "./oldCar";
import CompareCar from "./compareCar";

const { TabPane } = Tabs;

export default function() {
  let {tab, curTab = "newCars", newOpen, oldOpen, newList, oldList }={};
  
  let [brandList, setBrandList]=useState([]);
  let [marketcatList, setMarketcatList]=useState([]);
  let [curTabKey, setCurTabKey] = useState('newCar')

  useEffect(()=>{
    if (window.location.search.substr(1)) {
      setCurTabKey('compareCar')
    }
  },[]);

  async function getQuery(){
    // let brandResList = await $.get('/brand/query', {cnt_totalnum: "NO"});
    // let marketcatResList= await $.get('/marketcat/query', {cnt_totalnum: "NO"});
    // if(!brandResList.data)return;
    // if(!marketcatResList.data)return;
    // let list1 = brandResList.data.map((node) => {node.label = node.brand_name; node.value = node.brand_uuid; node.children = node.seriess.map((ser) => {ser.label = ser.series_name; ser.value = ser.series_uuid; return ser} ); return node});
    // let list2 = marketcatResList.data.map((node) => {node.value = node.marketcat_uuid; node.text = node.marketcat_name; return node});
    // setBrandList(list1);
    // setMarketcatList(list2);
  };

  const handleChange = (activeKey) => {
    setCurTabKey(activeKey)
  };

	return (
		<div className="br_3 bg_white pall_15">
      <Tabs onChange={handleChange} activeKey={curTabKey}>
        <TabPane tab="新车" key="newCar">
          {curTabKey === 'newCar' && <NewCar />}
        </TabPane>
        <TabPane tab="二手车" key="oldCar">
          {curTabKey === 'oldCar' && <OldCar />}
        </TabPane>
        <TabPane tab="车型比较" key="compareCar">
          {curTabKey === 'compareCar' && <CompareCar />}
        </TabPane>
      </Tabs>
		</div>
	);
}
