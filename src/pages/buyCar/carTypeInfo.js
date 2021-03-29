import React, { useState, useEffect } from 'react';
import { Tabs, Affix, Form as Forms, Table, Badge } from "antd";
import { $, Form, TablePagination, Modals, Inputs, Btn } from "../comlibs";
import "./index.css";

const { TabPane } = Tabs;

export default function(props) {
  let [parent] = [props.Parent?.data];
  let [carTypeData, setCarTypeData] = useState(new Map([
    ['车型信息', ''],
    ['车价', "price"],
    ['公告型号', "announcement_model"],
    ['驱动形式', "drive_form"],
    ['轴距', "wheelbase"],
    ['车身长度', "body_length"],
    ['车身宽度', "partnership_width"],
    ['前轮距', "front_track"],
    ['后轮距', "rear_track"],
    ['整车重量', "vehicle_weight"],
    ['总质量', "total_mass"],
    ['牵引总质量', "total_mass_of_traction"],
    ['最高车速', "maximum_speed"],
    ['细分市场', "marketcat_name"],
    ['产地', "origin"],
    ['售卖区域', "sales_area"],
    ['吨位级别', "tonnage_class"],
    ['备注', "remarks"],
    ['发动机信息', ''],
    ['发动机', "engine"],
    ['发动机品牌', "engine_brand"],
    ['气缸数', "number_of_cylinders"],
    ['燃料种类', "fuel_type"],
    ['气缸排列形式', "cylinder_classification_form"],
    ['排量', "displacement"],
    ['排放标准', "emission_standards"],
    ['最大马力', "maximum_horsepower"],
    ['最大输出功率', "maximum_output_power"],
    ['扭矩', "budget"],
    ['最大扭矩转速', "maximum_budget"],
    ['额定转速', "rating"],
    ['驾驶室参数', ""],
    ['驾驶室', "cab"],
    ['准乘人员', "passenger"],
    ['座位排数', "number_of_seats"],
    ['变速箱信息', ""],
    ['变速箱', "gearbox"],
    ['变数箱品牌', "gearbox_brand"],
    ['换挡方式', "shift_mode"],
    ['倒挡数', "number_of_reverse_gears"],
    ['轮胎', ""],
    ['轮胎数', "number_of_tires"],
    ['轮胎规格', "tire_specifications"],
    ['底盘', ""],
    ['前桥描述', "front_axle_description"],
    ['后桥描述', "rear_axle_description"],
    ['后桥允许载荷', "allow_blood_sugar_on_the_rear_axle"],
    ['前桥允许载荷', "front_bridge_allows_blood_sugar"],
    ['后桥速比', "rear_axle_speed_ratio"],
    ['弹簧片数', "number_of_springs"],
    ['鞍座', "saddle"],
    ['操控配置', ""],
    ['ABS防抱死', "abs_anti_lock"],
  ]));
  let [infoData, setInfoData] = useState({});
  let [tabKey, setTabKey] = useState(1);
  let [compare, setCompare] = useState(sessionStorage.getItem("compare")?.split(",") || []);
  let [sessNum, setSessNum] = useState(compare.length);

  useEffect(()=>{getQuery(); setTabKey(parent.tab)},[]);

  async function getQuery(){
    let data = await $.get('/truck/detail',{truck_uuid: parent.truck_uuid});
    if (!data) return
    setInfoData(data)
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

  let Imgs = () => {
    let cols = [];
    cols = infoData?.imgs?.map((node, index) => {
      return <div key={index} style={{width: "25%", height: "200px", padding: "12px 12px", display: "inline-block"}}>
        <img src={node} style={{width: "100%", height: "180px"}}></img>
      </div>
    })
    return <div>
      {cols}
    </div>
  }

  const creatTable = ()=> {
    let ths = [];
    let tds = [];
    let index = 0;
    let tables = [];
    for (let [key, value] of carTypeData.entries()) {
      if (value) {
        if (key === "ABS防抱死") {
          let tdVal = [];
          if (infoData[value] === "standard") {
            tdVal.push(<span className='norm'></span>)
          } else if (infoData[value] === "optional") {
            tdVal.push(<span className='elect'></span>)
          } else {
            tdVal.push(<span className='low'>-</span>)
          }
          tds.push(<tr key={index} key={index++}>
            <td>{key}</td>
            <td>{tdVal}</td>
          </tr>)
        } else {
          let unit = '';
          if (key === '车价') {// 加单位
            unit = '万元'
          }
          if (key === '轴距' || key === '前轮距' || key === '后轮距' || key === '后轮距') {// 加单位
            unit = 'mm'
          }
          if (key === '车身长度' || key === '车身宽度') {
            unit = '米'
          }
          if (key === '整车重量' || key === '总质量' || key === '牵引总质量') {
            unit = '吨'
          }
          if (key === '最高车速') {
            unit = 'KM/h'
          }
          if (key === '排量') {
            unit = 'L'
          }
          if (key === '最大马力') {
            unit = '马力'
          }
          if (key === '最大输出功率') {
            unit = 'kw'
          }
          if (key === '扭矩') {
            unit = 'N·m'
          }
          if (key === '最大扭矩转速' || key === '额定转速') {
            unit = 'RPM'
          }
          if (key === '准乘人员') {
            unit = '人'
          }
          if (key === '倒挡数' || key === '轮胎数') {
            unit = '个'
          }
          if (key === '后桥允许载荷' || key === '前桥允许载荷') {
            unit = 'kg'
          }
          tds.push(<tr key={index} key={index++}>
            <td>{key}</td>
            <td>{infoData[value] && (infoData[value] + '' + unit) || "无"}</td>
          </tr>)
        }
        tables.push(tds);
        tds = [];
      } else {
        if (key === '操控配置') {
          ths.push(<tr key={index++} className="thTitle">
            <th colspan={2}>
              {key}
              <div>
                <span className='norm'></span>标配
                <span className='elect'></span>选配
                <span className='low'>-</span>无
              </div>
            </th>
          </tr>)
        } else {
          ths.push(<tr key={index++} className="thTitle">
            <th colspan={2}>{key}</th>
          </tr>)
        }
        tables.push(ths);
        ths = [];
      }
    }
    return <table>
      <tr key={index++} style={{height: 164, marginBottom: "20px"}}>
        <th></th>
        <th>
          {infoData?.car_model}
          <div className="mt_15">
            {compare?.indexOf(infoData?.truck_uuid) >= 0 ? <Btn type="primary" onClick={() => handleDeleteCompare(infoData.truck_uuid)}>取消对比</Btn> :
              <Btn type="primary" onClick={() => handleAddCompare(infoData.truck_uuid)}>+对比</Btn>
            }
          </div>
        </th>
      </tr>
      {tables}
    </table>
  };

	return (
		<div className="br_3 bg_white pall_15">
      <Tabs
        activeKey={tabKey}
        onChange={(e) => {
          setTabKey(e);
        }}
      >
        <TabPane tab="图片" key="1">
          {infoData?.imgs?.length > 0 ? <Imgs /> : <Table className="mb_20" columns={[]} dataSource={[]} />}
        </TabPane>
        <TabPane tab="参数配置" key="2" className="customTable">
          {creatTable()}
        </TabPane>
      </Tabs>
      {tabKey == 2 && <Affix style={{ position: 'absolute', bottom: '420px', right: '60px', cursor: 'pointer'}}>
        <Badge count={sessNum} onClick={() => window.location.href="/adminPc/buyCar?compare=compare"}>
          <span style={{display: 'inline-block', width: '50px', height: "50px", margin: '5px 5px 0 0', padding: '10px', borderRadius: '50%', background: 'rgba(24, 144, 255, 1)'}}>车型对比</span>
        </Badge>
      </Affix>}
    </div>
	);
}
