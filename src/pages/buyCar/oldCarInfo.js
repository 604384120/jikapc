import React, { useState, useEffect } from "react";
import { Form as Forms, Table, Tabs, Row, Col, Card, Divider, Comment, Icon, Button, Avatar } from "antd";
import { Method, Form, Inputs, Btn, TablePagination } from "../comlibs";
import "./index.css"

const { TabPane } = Tabs;
export default function(props) {
	let $ = new Method();
	let { Parent } = props;
  let [parentData] = [props.Parent.data]
  
  let [moveLeft, setMoveLeft] = useState(0);
  let [moveImg, setMoveImg] = useState("");
  let [infoData, setInfoData] = useState(null);
  let [bannerKey, setBannerKey] = useState("");

  let {
    carsInfo = new Map([
      ['品牌', 'brand_name'],
      ['车系', 'series_name'],
      ['发动机品牌', 'engine_brand'],
      ['排放标准', 'emission_standards'],
      ['速箱档位(挡)', 'cnt_gear'],
      ['马力(马力)', 'maximum_horsepower'],
      ['驱动形式', 'drive_form'],
      ['后桥速比', 'rear_axle_speed_ratio'],
      ['准牵引总重量(吨)', 'towing'],
      ['表显里程(万公里)', 'mileage'],
      ['上牌时间', 'regist_date'],
      ['交强险到期时间', 'insurance_date'],
      ['按揭贷款', 'loan'],
    ]),
    oldCarsTab = "info",
    historyList
  } = {}

	useEffect(() => {
		(async () => {
      let res = await $.get("/old/truck/detail", {old_truck_uuid: parentData.old_truck_uuid});
      if (!res) return;
      setInfoData(res);
      setBannerKey(res.car_imgs[0]);
		})();
  }, []);
  
  const handlePrev = () => {
    if (infoData?.car_imgs.length < 5) {
      return
    }
    if (moveLeft == 0) {
      setMoveLeft(-(infoData?.car_imgs.length * 25 - 100))
    } else {
      setMoveLeft(moveLeft+25)
    }
  };

  const handleNext = () => {
    if (infoData?.car_imgs.length < 5) {
      return
    }
    if (moveLeft <= (-(infoData?.car_imgs.length * 25 - 100))) {
      setMoveLeft(0)
    } else {
      setMoveLeft(moveLeft-25)
    }
  };

  const handleBanner = (index) => {
    setMoveImg("改变上面图片的url,也是当前对应的banner地址")
  };

  let columns = [
		{
			title: "序号",
			dataIndex: "_key"
		},
		{
      title: "时间",
      dataIndex: "time_create",
		},
		{
			title: "联系人",
      dataIndex: "material",
      render: rs => <span>{rs.name}</span>
		},
		{
      title: "联系方式",
      dataIndex: "user",
      render: rs => <span>{rs.phone}</span>
		},
  ];

  const creatCarInfo = () => {
    let row = [];
    let index = 0;
    let cols = [];
    let i = 0;
    if (infoData) {
      for (let [key, value] of carsInfo.entries()) {
        cols.push(<div key={index} style={{width: "200px"}}><span style={{display: "inline-block"}}>{key}</span>：{infoData[value] || "无"}</div>)
        if (index == 3) {
          row[i] = <div className="dis_f jc_sb mv_15 ph_24">{cols}</div>
          cols = []
          i ++
          index = 0
        } else {
          row[i] = <div className="dis_f jc_sb mv_15 ph_24">{cols}</div>
          index ++;
        }
      }
    }
    return row
  };

  const creatBanner = () => {
    let cols = [];
    cols = infoData?.car_imgs.map((image, index) => {
      if (index === 0) {
        return <img src={image} key={index} style={{width: "25%", height: "100px", marginLeft: `${moveLeft}%`, padding: '0 5px'}} onClick={() => setBannerKey(image)}></img>
      } else {
        return <img src={image} key={index} style={{width: "25%", height: "100px", padding: '0 5px'}} onClick={() => setBannerKey(image)}></img>
      }
    })
    return cols;
  };

	return (
		<div className="br_3 bg_white pall_15">
      <Row style={{height: "478px"}}>
        <Col span={12}>
          <div style={{width: "100%", height: "376px"}}>
            <img width="100%" height={376} src={bannerKey}></img>
          </div>
          <div style={{position: "relative", marginTop: "16px", overflow: "hidden", width: "100%", height: "86px"}}>
            <span className="bannerPrev" onClick={handlePrev}>{"<"}</span>
            {creatBanner()}
            <span className="bannerNext" onClick={handleNext}>{">"}</span>
          </div>
        </Col>
        <Col span={12} style={{paddingLeft: "20px"}}>
          <span style={{fontWeight: "bold", fontSize: "24px"}}>{infoData?.car_model}</span>
          <Card
            className="cardbody"
            bordered={false}
            type="inner"
            title={<div style={{lineHeight: "40px"}}>
              <div>卖家报价： <span style={{color: "#EC808D"}}><span style={{fontSize: "18px"}}>¥{infoData?.price}</span> 万，{infoData?.is_installment}</span></div>
              <div>看车地址： <span>{infoData?.car_zonecode_name}</span></div>
              </div>}
          >
            <div style={{display: "flex", justifyContent: "space-between", lineHeight: "30px", padding: "0 24px"}}>
              <div style={{display: "inline-block"}}>
                <div>{infoData?.regist_date}</div>
                <div>上牌时间</div>
              </div>
              <Divider type="vertical" style={{height: "30px", marginTop: "8px"}} />
              <div style={{display: "inline-block"}}>
                <div>{infoData?.insurance_date}</div>
                <div>交强险到期时间</div>
              </div>
              <Divider type="vertical" style={{height: "30px", marginTop: "8px"}} />
              <div style={{display: "inline-block"}}>
                <div>{infoData?.loan}</div>
                <div>按揭贷款</div>
              </div>
              <Divider type="vertical" style={{height: "30px", marginTop: "8px"}} />
              <div style={{display: "inline-block"}}>
                <div>{infoData?.mileage}万公里</div>
                <div>表显里程</div>
              </div>
            </div>
            <div>
            <Comment
              style={{height: "88px", backgroundColor: "#F4F5F6", marginTop: "15px", paddingLeft: "24px", }}
              author={<span style={{fontWeight: "bold"}}>{infoData?.material?.name}</span>}
              avatar={
                <Avatar
                  src={infoData?.user?.user_avatar}
                  alt="user_avatar"
                  style={{width: "48px", height: "48px"}}
                />
              }
              content={
                <p>
                  <span style={{color: "#FFFFFF", background: "#2196FF", padding: "2px 8px", fontSize: "12px"}}>
                    {infoData?.verify_material?.verify === 'YES' && '已认证'}
                    {infoData?.verify_material?.verify === 'NO' && infoData?.verify_material?.verify_type !== 'VISITER' && '认证中'}
                    {infoData?.verify_material?.verify === 'NO' && infoData?.verify_material?.verify_type === 'VISITER' && '未认证'}
                    {infoData?.verify_material?.verify === 'FAILURE' && '认证失败'}
                  </span>
                  <Btn type="primary" style={{float: "right", margin: "-10px 24px 0 0"}}>卖家联系方式：{infoData?.user?.phone ? infoData?.user?.phone : "无"} </Btn>
                </p>
              }
            />
            </div>
          </Card>
          <Divider type="horizontal" />
          <p style={{color: "#FF9502"}}>车源信息均为用户自行发布，联系卖家时，请说明是从集卡e家二手车平台看到的。购车时请核对车辆手续、发票等相关证件。如与企业进行交易时，还需验明企业资质等信息，并仔细验明真伪</p>
        </Col>
      </Row>
      <div className="mv_15">
        <div className="borderL">车辆信息</div>
        {creatCarInfo()}
      </div>
      <div>
        <p className="borderL">车辆描述</p>
        <div className="ph_24">{infoData?.car_summary}</div>
      </div>
		</div>
	);
}
