import React, { useState, useEffect } from "react";
import { Form as Forms, Radio, Tabs, Row, Col, Popover, Table, Divider, Pagination } from "antd";
import { Method, Page } from "../comlibs";
import "./index.css";
import OldCarInfo from "./oldCarInfo";

const { TabPane } = Tabs;
export default function(props) {
	let $ = new Method();
	let [parent] = [props.Parent?.data]
	let [brandList, setBrandList] = useState([]);
	let [brandData, setBrandData] = useState(new Map([
    // ['热门', []],
    ['A', []],
    ['B', []],
    ['C', []],
    ['D', []],
    ['E', []],
    ['F', []],
    ['G', []],
    ['H', []],
    ['J', []],
    ['K', []],
    ['L', []],
    ['M', []],
    ['N', []],
    ['O', []],
    ['P', []],
    ['Q', []],
    ['R', []],
    ['S', []],
    ['T', []],
    ['W', []],
    ['X', []],
    ['Y', []],
    ['Z', []],
  ]));
  let [categoryData, setCategoryData] = useState(new Map([]));
  let [marketList, setMarketList] = useState([]);
  let [brandKey, setBrandKey] = useState("");
  let [cat1Key, setCat1Key] = useState("");
  let [cat2Key, setCat2Key] = useState("");
  let [emissionKey, setEmissionKey] = useState("");
	let [seriesData, setSeriesData] = useState({});
	let [page, setPage] = useState(1);
  let [pageSize, setPageSize] = useState(10);
  let [hover, setHover] = useState(false);
  let [tempHover, setTempHover] = useState([]);
  
  let {oldCarInfoOpen} = {};

	useEffect(() => { getQuery(); handleSeriesList() }, []);

  async function getBrandList(key, value){
    setHover(true)
    if (value.length > 0) {
      return
    }
    if (tempHover.indexOf(key) >= 0) {
      setBrandList([]);
      brandData.set(key, []);
      setBrandData(brandData);
      return;
    }
    let res;
    let list;
    // if (key === "热门") {
    //   res = await $.get('/brand/hot');
    //   if(!res.data)return;
    //   list = res.data;
    // } else {
      res = await $.get('/brand/query', {pinyin_tag: key});
      if(!res.data)return;
      list = res.data;
    // }
    if (list.length === 0) {
      tempHover.push(key)
      setTempHover(tempHover)
    }
    setBrandList(list);
    brandData.set(key, list);
    setBrandData(brandData);
  };

  async function getQuery(){
    let res = await $.get('/truck/cat1/query');
    if(!res.category)return;
    const map = new Map();
    for (let cate of res.category) {
      map.set(cate, cate.cat2s)
    }
    setCategoryData(map);
    res = await $.get('/emission/standards');
    if(!res)return;
    setMarketList(res)
  };

  async function handleSeriesList(value, type, parent){
    let params = {};
    if (type === "brand_uuid") {
      if (value === "不限") {
        params.brand_uuid = "";
        setBrandKey("");
      } else {
        params.brand_uuid = value;
        setBrandKey(value);
      }
    } else {
      params.brand_uuid = brandKey;
    }
    if (type === "truck_cat") {
      if (value === "不限") {
        params.truck_cat = "";
        setCat1Key("");
        setCat2Key("");
      } else {
        params.truck_cat = parent.cat1+""+value;
        setCat1Key(parent.cat1);
        setCat2Key(value);
      }
    } else {
      params.truck_cat = cat1Key+""+cat2Key;
    }
    if (type === "emission_standards") {
      if (value === "不限") {
        params.emission_standards = "";
        setEmissionKey("");
      } else {
        params.emission_standards = value;
        setEmissionKey(value);
      }
    } else {
      params.emission_standards = emissionKey;
    }
    params.page = page;
    params.limit = 10;
    params.totalnum = "YES";
    getSerise(params)
  };

  async function getSerise (params) {
    let res = await $.get('/old/truck/query', params);
    if(!res.data)return;
    setSeriesData(res);
  };

  const handleRadioChange = (e, type, parent) => {
    handleSeriesList(e.target.value, type, parent);
  };

  const handlePopClick = (key, type) => {
    handleSeriesList(key, type);
  };

  const handlePageChange = (page) => {
    let params = {
      page: page,
      limit: 10,
      totalnum: "YES",
      brand_uuid: brandKey,
      emission_standards: emissionKey,
      truck_cat: cat1Key+""+cat2Key
    };
    getSerise(params)
    setPage(page);
  };

  const creatContent = (type, dataList, parent) => {
      let cols = [];
      let index = 0
      if (type === "emission_standards") {
          cols.push(<Radio.Button value="不限" key={index++} style={{margin: "0 5px", border: "none"}}>不限</Radio.Button>)
        for (let node of marketList) {
          cols.push(<Radio.Button value={node} key={index++} style={{margin: "0 10px", border: "none"}}>{node}</Radio.Button>)
        }
      } else if (type === "truck_cat") {
        for (let node of dataList) {
          cols.push(<Radio.Button value={node.cat2} key={index++} style={{margin: "0 10px", border: "none"}}>{node.name2}</Radio.Button>)
        }
      } else if (type === "brand_uuid") {
        for (let node of dataList.length === 0 ? brandList: dataList) {
          cols.push(<Radio.Button value={node.brand_uuid} key={index++} style={{margin: "0 10px", border: "none"}}>{node.brand_name}</Radio.Button>)
        }
        type = "brand_uuid"
      }
      return <Radio.Group className="radioBtn" size="small" onChange={(e) => handleRadioChange(e, type, parent)}>{cols}</Radio.Group>
  };

  const creatCriteria = (data, type) => {
    let index = 0;
    let cols = [];
    cols.push(<a onClick={() => handlePopClick("不限", type)}>不限</a>)
    for (let [key, value] of data.entries()) {
      if (type === "brand_uuid") {
        cols.push(<Popover placement="bottom" key={index++} autoAdjustOverflow onMouseEnter={() => getBrandList(key, value)} content={tempHover.indexOf(key) >= 0 ? "暂无数据" : creatContent(type, value)} onClick={key ==="不限" ? () => handlePopClick(key, type) : undefined} className={(hover && "activeHover") + " " + (tempHover.indexOf(key) >= 0 && "easyui")}>{key}</Popover>)
      }
      if (type === "truck_cat") {
        cols.push(<Popover className={(hover && "activeHover") + " " + (value.length <= 0 && "easyui")} onMouseEnter={() => setHover(!hover)} placement="bottom" key={index++} autoAdjustOverflow content={value.length <= 0 ? "暂无数据" : creatContent(type, value, key)}>{key.name1}</Popover>)
      }
    }
    return <div className="popoverBox" >{cols}</div>
  };

  const creatSeriseList = () => {
    let cols = [];
    cols = seriesData.data?.map((node, index) => {
      return <Col span={8} key={index} style={{height: 300, padding: "12px", marginBottom: "24px"}} onClick={() => oldCarInfoOpen.open("二手车详情", node)}>
          <div style={{border: "1px solid #F0F2F5"}}>
            <img src={node.car_imgs[0]} style={{width: "100%", height: "176px", backgroundColor: "#DEDEDE"}}></img>
            <p className="fs_16 fb pl_10 pt_10">{node.car_model}</p>
            <p className="pl_10">类别：{node.truck_cat_name}</p>
            <p className="fc_pink pl_10">{node.price || '无'}万元</p>
          </div>
        </Col>
    });
    return <div>
      <Row>{seriesData.data?.length > 0 ? cols : <Table className="mb_20" columns={[]} dataSource={[]} />}</Row>
      <Row><Pagination current={page} total={seriesData.totalnum} showTotal={total => `共 ${seriesData.totalnum} 条数据`} onChange={handlePageChange} />
        {/* {seriesData.limit}条/页 共{seriesData.totalnum}条  */}
      </Row>
    </div>
  };

	return (
		<div className="br_3 bg_white pall_15">
      <Row>
        <Col span={2}>卡车品牌：</Col>
        <Col span={22} style={{marginBottom: "20px"}}>{creatCriteria(brandData, "brand_uuid")}</Col>
      </Row>
      <Row>
        <Col span={2}>用途类别：</Col>
        <Col span={22} style={{marginBottom: "20px"}}>{creatCriteria(categoryData, "truck_cat")}</Col>
      </Row>
      <Row>
        <Col span={2}>排放：</Col>
        <Col span={22}>{creatContent("emission_standards")}</Col>
      </Row>
      <Divider />
      {creatSeriseList()}
      <Page ref={(rs) => oldCarInfoOpen = rs}>
        <OldCarInfo/>
      </Page>
		</div>
	);
}
