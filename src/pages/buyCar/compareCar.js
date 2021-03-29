import React, { useState, useEffect } from "react";
import { Select, Checkbox } from "antd";
import { $, Method, Form, Inputs, Btn, TablePagination } from "../comlibs";
import "./index.css";
import { push } from "../../config/routes_adminPc";

const { Option } = Select;
export default function() {


  let [compareList, setCompareList] = useState([]);
  let [brandList, setBrandList] = useState([]);
  let [brandMap, setBrandMap] = useState({});
  let [visible, setVisible] = useState(false);

  let {dataList = [], compareIdList = sessionStorage.getItem("compare")?.split(",") || []} = {};

  useEffect(()=>{ getInitData() },[]);

  const getInitData = () => {
    (async () => {
      let data = await $.get('/brand/query',{cnt_totalnum: 'NO'});  //  获取所有品牌
      if (!data) return;
      data.data.forEach((node) => {
        brandMap[node.brand_uuid] = node
      });
      setBrandMap(brandMap);
      setBrandList(data.data);
    })();

    compareIdList.forEach((uuid) => {//  获取已经加到对比的数据并处理为list
      getQuery(uuid)
    });
  };

  async function getQuery (uuid, index) {
    let data = await $.get('/truck/detail',{truck_uuid: uuid});
    if (!data) return;
    if (!isNaN(index)) {
      compareList[index] = {...compareList[index], ...data};
      setCompareList([...compareList])
    } else {
      dataList.push(data);
      compareIdList?.length === dataList.length && setCompareList(dataList);
    }
  };

  async function getTruck (props) {
    let index = props.index
    let param = {
      brand_uuid: compareList[index]?.brand_uuid || '',
      series_uuid: compareList[index]?.series_uuid || '',
    };
    if (props.brand_uuid) {
      param.brand_uuid = props.brand_uuid;
    }
    if (props.series_uuid) {
      param.series_uuid = props.series_uuid;
    }
    let data = await $.get('/truck/query', param);
    if (!data) return;
    compareList[index].truckList = data.data;
    setCompareList([...compareList]);
  };

  const handleBrandChange = (value, index) => {
    if (!compareList[index]) {
      compareList[index] = {
        brand_uuid: value,
        seriessList: brandMap[value].seriess
      };
    } else {
      compareList[index].brand_uuid = value;
      compareList[index].seriessList = brandMap[value].seriess;
      compareList[index].series_uuid = '';
      compareList[index].truck_uuid = '';
      compareList[index].truckList = [];
    }
    getTruck({brand_uuid: value, index});
  };

  const handleSeriessChange = (value, index) => {
    if (!compareList[index]) {
      compareList[index] = {
        series_uuid : value
      };
    } else {
      compareList[index].series_uuid = value;
      compareList[index].truck_uuid = '';
      compareList[index].truckList = [];
    }
    getTruck({series_uuid: value, index})
  };

  const handleTruckChange = (value, index) => {
    if (compareIdList.indexOf(value) >= 0) {
      $.msg('已存在');
      return
    }
    if (!compareList[index]) {
      compareList[index] = {
        truck_uuid : value
      };
    } else {
      compareList[index].truck_uuid = value
    }
    setCompareList([...compareList]);
    getQuery(value, index);
    handleAddCompare(value)
  }

  const handleAddCompare = (truck_uuid) => {
    if (compareIdList.indexOf(truck_uuid) >= 0 || compareIdList.length >= 4) return;
    compareIdList.push(truck_uuid);
    sessionStorage.setItem("compare", compareIdList.toString());
  };

  const handleDelete = (i) => {
    compareIdList.splice(i, 1)
    if (compareIdList.length === 0) {
      sessionStorage.removeItem('compare');
      setCompareList([]);
    } else {
      sessionStorage.setItem("compare", compareIdList.toString());
      // getInitData();
      compareList.splice(i, 1);
      setCompareList([...compareList]);
    }
  };

  const handleFilter = (value, i) => {  //  隐藏相同的方法
    if (compareList[i]) {
      if (!visible) {
        let text = compareList[i][value];
        compareList.forEach((item, index) => {
          if (i !== index && compareList[i][value] === item[value]) {
            text = '-'
          }
        })
        return text
      } else {
        return compareList[i][value]
      }
    }
  };

  const creatBrand = () => {
    return brandList?.map((node, index) => {
      return <Option value={node?.brand_uuid} key={index}>{node?.brand_name}</Option>
    })
  };

  const creatSeriess = (i) => {
    return compareList[i]?.seriessList?.map((node, index) => {
      return <Option value={node?.series_uuid} key={index}>{node?.series_name}</Option>
    })
  };

  const creatTruck = (i) => {
    return compareList[i]?.truckList?.map((node, index) => {
      return <Option value={node?.truck_uuid} key={index}>{node?.car_model}</Option>
    })
  };

  const creatThs = () => {
    let ths = [];
    for (let i = 0; i < 4; i ++) {
      ths.push(<th key={i} className='thFirst'>
        <span onClick={() => handleDelete(i)}>×</span>
        <div>
          <div className='mb_10'>{compareList[i]?.car_model}</div>
          <Select placeholder='选择品牌' value={compareList[i]?.brand_uuid} style={{ width: '100%', marginBottom: '10px' }} onChange={(value) => handleBrandChange(value, i)}>
            {creatBrand()}
          </Select>
          <Select placeholder='选择车系' value={compareList[i]?.series_name || compareList[i]?.series_uuid} style={{ width: '100%', marginBottom: '10px' }} onChange={(value) => handleSeriessChange(value, i)}>
            {creatSeriess(i)}
          </Select>
          <Select placeholder='选择车型' value={compareList[i]?.car_model || compareList[i]?.truck_uuid} style={{ width: '100%' }} onChange={(value) => handleTruckChange(value, i)}>
            {creatTruck(i)}
          </Select>
        </div>
      </th>)
    }
    return ths
  };

	return (
		<div className="br_3 bg_white pall_15 customTable">
      <table>
        <thead>
          <tr>
            <th>
              {/* <Checkbox onChange={(e) => setVisible(e.target.checked)}>隐藏相同</Checkbox> */}
            </th>
            {creatThs()}
          </tr>
        </thead>
        <tbody>
          <tr className="thTitle">
            <th colspan={5}>车型信息</th>
          </tr>
          <tr>
            <td >裸车价</td>
            {/* <td >{compareList[0]?.price && `${handleFilter('price', 0)}万元`}</td> 隐藏相同 */}
            <td >{compareList[0]?.price && compareList[0]?.price + '万元'}</td>
            <td >{compareList[1]?.price && compareList[1]?.price + '万元'}</td>
            <td >{compareList[2]?.price && compareList[2]?.price + '万元'}</td>
            <td >{compareList[3]?.price && compareList[3]?.price + '万元'}</td>
          </tr>
          <tr>
            <td >公告型号</td>
            <td >{compareList[0]?.announcement_model}</td>
            <td >{compareList[1]?.announcement_model}</td>
            <td >{compareList[2]?.announcement_model}</td>
            <td >{compareList[3]?.announcement_model}</td>
          </tr>
          <tr>
            <td >驱动形式</td>
            <td >{compareList[0]?.drive_form}</td>
            <td >{compareList[1]?.drive_form}</td>
            <td >{compareList[2]?.drive_form}</td>
            <td >{compareList[3]?.drive_form}</td>
          </tr>
          <tr>
            <td >轴距</td>
            <td >{compareList[0]?.wheelbase && compareList[0]?.wheelbase + 'mm'}</td>
            <td >{compareList[1]?.wheelbase && compareList[1]?.wheelbase + 'mm'}</td>
            <td >{compareList[2]?.wheelbase && compareList[2]?.wheelbase + 'mm'}</td>
            <td >{compareList[3]?.wheelbase && compareList[3]?.wheelbase + 'mm'}</td>
          </tr>
          <tr>
            <td >车身长度</td>
            <td >{compareList[0]?.body_length && compareList[0]?.body_length + '米'}</td>
            <td >{compareList[1]?.body_length && compareList[1]?.body_length + '米'}</td>
            <td >{compareList[2]?.body_length && compareList[2]?.body_length + '米'}</td>
            <td >{compareList[3]?.body_length && compareList[3]?.body_length + '米'}</td>
          </tr>
          <tr>
            <td >车身宽度</td>
            <td >{compareList[0]?.partnership_width && compareList[0]?.partnership_width + '米'}</td>
            <td >{compareList[1]?.partnership_width && compareList[1]?.partnership_width + '米'}</td>
            <td >{compareList[2]?.partnership_width && compareList[2]?.partnership_width + '米'}</td>
            <td >{compareList[3]?.partnership_width && compareList[3]?.partnership_width + '米'}</td>
          </tr>
          <tr>
            <td >前轮距</td>
            <td >{compareList[0]?.front_track && compareList[0]?.front_track + 'mm'}</td>
            <td >{compareList[1]?.front_track && compareList[1]?.front_track + 'mm'}</td>
            <td >{compareList[2]?.front_track && compareList[2]?.front_track + 'mm'}</td>
            <td >{compareList[3]?.front_track && compareList[3]?.front_track + 'mm'}</td>
          </tr>
          <tr>
            <td >后轮距</td>
            <td >{compareList[0]?.rear_track && compareList[0]?.rear_track + 'mm'}</td>
            <td >{compareList[1]?.rear_track && compareList[1]?.rear_track + 'mm'}</td>
            <td >{compareList[2]?.rear_track && compareList[2]?.rear_track + 'mm'}</td>
            <td >{compareList[3]?.rear_track && compareList[3]?.rear_track + 'mm'}</td>
          </tr>
          <tr>
            <td >整车重量</td>
            <td >{compareList[0]?.vehicle_weight && compareList[0]?.vehicle_weight + '吨'}</td>
            <td >{compareList[1]?.vehicle_weight && compareList[1]?.vehicle_weight + '吨'}</td>
            <td >{compareList[2]?.vehicle_weight && compareList[2]?.vehicle_weight + '吨'}</td>
            <td >{compareList[3]?.vehicle_weight && compareList[3]?.vehicle_weight + '吨'}</td>
          </tr>
          <tr>
            <td >总质量</td>
            <td >{compareList[0]?.total_mass && compareList[0]?.total_mass + '吨'}</td>
            <td >{compareList[1]?.total_mass && compareList[1]?.total_mass + '吨'}</td>
            <td >{compareList[2]?.total_mass && compareList[2]?.total_mass + '吨'}</td>
            <td >{compareList[3]?.total_mass && compareList[3]?.total_mass + '吨'}</td>
          </tr>
          <tr>
            <td >牵引总质量</td>
            <td >{compareList[0]?.total_mass_of_traction && compareList[0]?.total_mass_of_traction + '吨'}</td>
            <td >{compareList[1]?.total_mass_of_traction && compareList[1]?.total_mass_of_traction + '吨'}</td>
            <td >{compareList[2]?.total_mass_of_traction && compareList[2]?.total_mass_of_traction + '吨'}</td>
            <td >{compareList[3]?.total_mass_of_traction && compareList[3]?.total_mass_of_traction + '吨'}</td>
          </tr>
          <tr>
            <td >最高车速</td>
            <td >{compareList[0]?.maximum_speed && compareList[0]?.maximum_speed + 'KM/h'}</td>
            <td >{compareList[1]?.maximum_speed && compareList[1]?.maximum_speed + 'KM/h'}</td>
            <td >{compareList[2]?.maximum_speed && compareList[2]?.maximum_speed + 'KM/h'}</td>
            <td >{compareList[3]?.maximum_speed && compareList[3]?.maximum_speed + 'KM/h'}</td>
          </tr>
          <tr>
            <td >细分市场</td>
            <td >{compareList[0]?.marketcat_name}</td>
            <td >{compareList[1]?.marketcat_name}</td>
            <td >{compareList[2]?.marketcat_name}</td>
            <td >{compareList[3]?.marketcat_name}</td>
          </tr>
          <tr>
            <td >产地</td>
            <td >{compareList[0]?.origin}</td>
            <td >{compareList[1]?.origin}</td>
            <td >{compareList[2]?.origin}</td>
            <td >{compareList[3]?.origin}</td>
          </tr>
          <tr>
            <td >售卖区域</td>
            <td >{compareList[0]?.sales_area}</td>
            <td >{compareList[1]?.sales_area}</td>
            <td >{compareList[2]?.sales_area}</td>
            <td >{compareList[3]?.sales_area}</td>
          </tr>
          <tr>
            <td >吨位级别</td>
            <td >{compareList[0]?.tonnage_class}</td>
            <td >{compareList[1]?.tonnage_class}</td>
            <td >{compareList[2]?.tonnage_class}</td>
            <td >{compareList[3]?.tonnage_class}</td>
          </tr>
          <tr>
            <td >备注</td>
            <td >{compareList[0]?.remarks}</td>
            <td >{compareList[1]?.remarks}</td>
            <td >{compareList[2]?.remarks}</td>
            <td >{compareList[3]?.remarks}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>发动机信息</th>
          </tr>
          <tr>
            <td >发动机</td>
            <td >{compareList[0]?.engine}</td>
            <td >{compareList[1]?.engine}</td>
            <td >{compareList[2]?.engine}</td>
            <td >{compareList[3]?.engine}</td>
          </tr>
          <tr>
            <td >发动机品牌</td>
            <td >{compareList[0]?.engine_brand}</td>
            <td >{compareList[1]?.engine_brand}</td>
            <td >{compareList[2]?.engine_brand}</td>
            <td >{compareList[3]?.engine_brand}</td>
          </tr>
          <tr>
            <td >气缸数</td>
            <td >{compareList[0]?.number_of_cylinders}</td>
            <td >{compareList[1]?.number_of_cylinders}</td>
            <td >{compareList[2]?.number_of_cylinders}</td>
            <td >{compareList[3]?.number_of_cylinders}</td>
          </tr>
          <tr>
            <td >燃料种类</td>
            <td >{compareList[0]?.fuel_type}</td>
            <td >{compareList[1]?.fuel_type}</td>
            <td >{compareList[2]?.fuel_type}</td>
            <td >{compareList[3]?.fuel_type}</td>
          </tr>
          <tr>
            <td >气缸排列形式</td>
            <td >{compareList[0]?.cylinder_classification_form}</td>
            <td >{compareList[1]?.cylinder_classification_form}</td>
            <td >{compareList[2]?.cylinder_classification_form}</td>
            <td >{compareList[3]?.cylinder_classification_form}</td>
          </tr>
          <tr>
            <td >排量</td>
            <td >{compareList[0]?.displacement && compareList[0]?.displacement + 'L'}</td>
            <td >{compareList[1]?.displacement && compareList[1]?.displacement + 'L'}</td>
            <td >{compareList[2]?.displacement && compareList[2]?.displacement + 'L'}</td>
            <td >{compareList[3]?.displacement && compareList[3]?.displacement + 'L'}</td>
          </tr>
          <tr>
            <td >排放标准</td>
            <td >{compareList[0]?.emission_standards}</td>
            <td >{compareList[1]?.emission_standards}</td>
            <td >{compareList[2]?.emission_standards}</td>
            <td >{compareList[3]?.emission_standards}</td>
          </tr>
          <tr>
            <td >最大马力</td>
            <td >{compareList[0]?.maximum_horsepower && compareList[0]?.maximum_horsepower + '马力'}</td>
            <td >{compareList[1]?.maximum_horsepower && compareList[1]?.maximum_horsepower + '马力'}</td>
            <td >{compareList[2]?.maximum_horsepower && compareList[2]?.maximum_horsepower + '马力'}</td>
            <td >{compareList[3]?.maximum_horsepower && compareList[3]?.maximum_horsepower + '马力'}</td>
          </tr>
          <tr>
            <td >最大输出功率</td>
            <td >{compareList[0]?.maximum_output_power && compareList[0]?.maximum_output_power + 'kw'}</td>
            <td >{compareList[1]?.maximum_output_power && compareList[1]?.maximum_output_power + 'kw'}</td>
            <td >{compareList[2]?.maximum_output_power && compareList[2]?.maximum_output_power + 'kw'}</td>
            <td >{compareList[3]?.maximum_output_power && compareList[3]?.maximum_output_power + 'kw'}</td>
          </tr>
          <tr>
            <td >扭矩</td>
            <td >{compareList[0]?.budget && compareList[0]?.budget + 'N·m'}</td>
            <td >{compareList[1]?.budget && compareList[1]?.budget + 'N·m'}</td>
            <td >{compareList[2]?.budget && compareList[2]?.budget + 'N·m'}</td>
            <td >{compareList[3]?.budget && compareList[3]?.budget + 'N·m'}</td>
          </tr>
          <tr>
            <td >最大扭矩转速</td>
            <td >{compareList[0]?.maximum_budget && compareList[0]?.maximum_budget + 'RPM'}</td>
            <td >{compareList[1]?.maximum_budget && compareList[1]?.maximum_budget + 'RPM'}</td>
            <td >{compareList[2]?.maximum_budget && compareList[2]?.maximum_budget + 'RPM'}</td>
            <td >{compareList[3]?.maximum_budget && compareList[3]?.maximum_budget + 'RPM'}</td>
          </tr>
          <tr>
            <td >额定转速</td>
            <td >{compareList[0]?.rating && compareList[0]?.rating + 'RPM'}</td>
            <td >{compareList[1]?.rating && compareList[1]?.rating + 'RPM'}</td>
            <td >{compareList[2]?.rating && compareList[2]?.rating + 'RPM'}</td>
            <td >{compareList[3]?.rating && compareList[3]?.rating + 'RPM'}</td>
          </tr>
          <tr>
            <td >驾驶室参数</td>
            <td >{compareList[0]?.rating && compareList[0]?.rating + 'RPM'}</td>
            <td >{compareList[1]?.rating && compareList[1]?.rating + 'RPM'}</td>
            <td >{compareList[2]?.rating && compareList[2]?.rating + 'RPM'}</td>
            <td >{compareList[3]?.rating && compareList[3]?.rating + 'RPM'}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>驾驶室参数</th>
          </tr>
          <tr>
            <td >驾驶室</td>
            <td >{compareList[0]?.cab}</td>
            <td >{compareList[1]?.cab}</td>
            <td >{compareList[2]?.cab}</td>
            <td >{compareList[3]?.cab}</td>
          </tr>
          <tr>
            <td >准乘人员</td>
            <td >{compareList[0]?.passenger && compareList[0]?.passenger + '人'}</td>
            <td >{compareList[1]?.passenger && compareList[1]?.passenger + '人'}</td>
            <td >{compareList[2]?.passenger && compareList[2]?.passenger + '人'}</td>
            <td >{compareList[3]?.passenger && compareList[3]?.passenger + '人'}</td>
          </tr>
          <tr>
            <td >座位排数</td>
            <td >{compareList[0]?.number_of_seats}</td>
            <td >{compareList[1]?.number_of_seats}</td>
            <td >{compareList[2]?.number_of_seats}</td>
            <td >{compareList[3]?.number_of_seats}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>变速箱信息</th>
          </tr>
          <tr>
            <td >变速箱</td>
            <td >{compareList[0]?.gearbox}</td>
            <td >{compareList[1]?.gearbox}</td>
            <td >{compareList[2]?.gearbox}</td>
            <td >{compareList[3]?.gearbox}</td>
          </tr>
          <tr>
            <td >变数箱品牌</td>
            <td >{compareList[0]?.gearbox_brand}</td>
            <td >{compareList[1]?.gearbox_brand}</td>
            <td >{compareList[2]?.gearbox_brand}</td>
            <td >{compareList[3]?.gearbox_brand}</td>
          </tr>
          <tr>
            <td >换挡方式</td>
            <td >{compareList[0]?.shift_mode}</td>
            <td >{compareList[1]?.shift_mode}</td>
            <td >{compareList[2]?.shift_mode}</td>
            <td >{compareList[3]?.shift_mode}</td>
          </tr>
          <tr>
            <td >倒挡数</td>
            <td >{compareList[0]?.number_of_reverse_gears && compareList[0]?.number_of_reverse_gears + '个'}</td>
            <td >{compareList[1]?.number_of_reverse_gears && compareList[1]?.number_of_reverse_gears + '个'}</td>
            <td >{compareList[2]?.number_of_reverse_gears && compareList[2]?.number_of_reverse_gears + '个'}</td>
            <td >{compareList[3]?.number_of_reverse_gears && compareList[3]?.number_of_reverse_gears + '个'}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>轮胎</th>
          </tr>
          <tr>
            <td >轮胎数</td>
            <td >{compareList[0]?.number_of_tires && compareList[0]?.number_of_tires + '个'}</td>
            <td >{compareList[1]?.number_of_tires && compareList[1]?.number_of_tires + '个'}</td>
            <td >{compareList[2]?.number_of_tires && compareList[2]?.number_of_tires + '个'}</td>
            <td >{compareList[3]?.number_of_tires && compareList[3]?.number_of_tires + '个'}</td>
          </tr>
          <tr>
            <td >轮胎规格</td>
            <td >{compareList[0]?.tire_specifications && compareList[0]?.tire_specifications + '个'}</td>
            <td >{compareList[1]?.tire_specifications && compareList[1]?.tire_specifications + '个'}</td>
            <td >{compareList[2]?.tire_specifications && compareList[2]?.tire_specifications + '个'}</td>
            <td >{compareList[3]?.tire_specifications && compareList[3]?.tire_specifications + '个'}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>底盘</th>
          </tr>
          <tr>
            <td >前桥描述</td>
            <td >{compareList[0]?.front_axle_description}</td>
            <td >{compareList[1]?.front_axle_description}</td>
            <td >{compareList[2]?.front_axle_description}</td>
            <td >{compareList[3]?.front_axle_description}</td>
          </tr>
          <tr>
            <td >后桥描述</td>
            <td >{compareList[0]?.rear_axle_description}</td>
            <td >{compareList[1]?.rear_axle_description}</td>
            <td >{compareList[2]?.rear_axle_description}</td>
            <td >{compareList[3]?.rear_axle_description}</td>
          </tr>
          <tr>
            <td >后桥允许载荷</td>
            <td >{compareList[0]?.allow_blood_sugar_on_the_rear_axle && compareList[0]?.allow_blood_sugar_on_the_rear_axle + 'kg'}</td>
            <td >{compareList[1]?.allow_blood_sugar_on_the_rear_axle && compareList[1]?.allow_blood_sugar_on_the_rear_axle + 'kg'}</td>
            <td >{compareList[2]?.allow_blood_sugar_on_the_rear_axle && compareList[2]?.allow_blood_sugar_on_the_rear_axle + 'kg'}</td>
            <td >{compareList[3]?.allow_blood_sugar_on_the_rear_axle && compareList[3]?.allow_blood_sugar_on_the_rear_axle + 'kg'}</td>
          </tr>
          <tr>
            <td >前桥允许载荷</td>
            <td >{compareList[0]?.front_bridge_allows_blood_sugar && compareList[0]?.front_bridge_allows_blood_sugar + 'kg'}</td>
            <td >{compareList[1]?.front_bridge_allows_blood_sugar && compareList[1]?.front_bridge_allows_blood_sugar + 'kg'}</td>
            <td >{compareList[2]?.front_bridge_allows_blood_sugar && compareList[2]?.front_bridge_allows_blood_sugar + 'kg'}</td>
            <td >{compareList[3]?.front_bridge_allows_blood_sugar && compareList[3]?.front_bridge_allows_blood_sugar + 'kg'}</td>
          </tr>
          <tr>
            <td >后桥速比</td>
            <td >{compareList[0]?.rear_axle_speed_ratio}</td>
            <td >{compareList[1]?.rear_axle_speed_ratio}</td>
            <td >{compareList[2]?.rear_axle_speed_ratio}</td>
            <td >{compareList[3]?.rear_axle_speed_ratio}</td>
          </tr>
          <tr>
            <td >弹簧片数</td>
            <td >{compareList[0]?.number_of_springs}</td>
            <td >{compareList[1]?.number_of_springs}</td>
            <td >{compareList[2]?.number_of_springs}</td>
            <td >{compareList[3]?.number_of_springs}</td>
          </tr>
          <tr>
            <td >鞍座</td>
            <td >{compareList[0]?.saddle}</td>
            <td >{compareList[1]?.saddle}</td>
            <td >{compareList[2]?.saddle}</td>
            <td >{compareList[3]?.saddle}</td>
          </tr>
          <tr className="thTitle">
            <th colspan={5}>
              操控配置
              <div>
                <span className='norm'></span>标配
                <span className='elect'></span>选配
                <span className='low'>-</span>无
              </div>
            </th>
          </tr>
          <tr>
            <td >ABS防抱死</td>
            <td >
              {compareList[0]?.abs_anti_lock === 'standard' && <span className='norm'></span> || 
              compareList[0]?.abs_anti_lock === 'optional' && <span className='elect'></span> ||
              compareList[0]?.abs_anti_lock === 'no' || <span className='low'>-</span>
              }
            </td>
            <td >
              {compareList[1]?.abs_anti_lock === 'standard' && <span className='norm'></span> || 
              compareList[1]?.abs_anti_lock === 'optional' && <span className='elect'></span> ||
              compareList[2]?.abs_anti_lock === 'no' || <span className='low'>-</span>
              }
            </td>
            <td >
              {compareList[2]?.abs_anti_lock === 'standard' && <span className='norm'></span> || 
              compareList[2]?.abs_anti_lock === 'optional' && <span className='elect'></span> ||
              compareList[2]?.abs_anti_lock === 'no' || <span className='low'>-</span>
              }
            </td>
            <td >
              {compareList[3]?.abs_anti_lock === 'standard' && <span className='norm'></span> || 
              compareList[3]?.abs_anti_lock === 'optional' && <span className='elect'></span> ||
              compareList[3]?.abs_anti_lock === 'no' || <span className='low'>-</span>
              }
            </td>
          </tr>
        </tbody>
      </table>
		</div>
	);
}
