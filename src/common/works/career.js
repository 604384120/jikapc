import React, { useState, useEffect } from "react";
import { Cascader } from "antd";
import { $ } from "../../pages/comlibs";

export default function(props) {
	let [list, setList] = useState([]);
	useEffect(() => {
		(async () => {
			let res = await $.get("/career/list");
			if (!res.careers) return;
			let careers = res.careers.map(cc => {
				let children = cc.degrees
					? cc.degrees.map(dd => ({
							value: dd.degree_uuid,
							label: dd.degree_name
					  }))
					: [];
				return {
					label: cc.name,
					value: cc.uuid,
					children
				};
			});
			setList(careers);
		})();
	}, []);

	return <Cascader style={{ marginRight: 15 }} {...props} options={list} />;
}
