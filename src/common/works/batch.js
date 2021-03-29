import React, { useState, useEffect } from "react";
import { Inputs, $ } from "../../pages/comlibs";

export default function(props) {
	let [list, setList] = useState([]);
	let { def } = props;
	useEffect(() => {
		(async () => {
			let res = await $.get("/batch/list",{limit:9999});
			if (!res.data) return;
			let list = res.data.map(rs => ({ value: rs.uuid, text: rs.name }));
			setList(list);
		})();
	}, []);
	return (
		<Inputs
			type="select"
			style={{ width: 150 }}
			placeholder="请选择报名批次"
			value={def ? list[0] && list[0].value : undefined}
			select={list}
			{...props}
		/>
	);
}
