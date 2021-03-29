import React from "react";
import Wasm from "../wasm";
// import { Checks } from "react-ant-comlibs";
import { Form, $, Method, Uploadfile, Inputs, Btn } from "../comlibs";
//import { Career, BatchSelect } from "../works";

export default function() {
	let $1 = new Method();

	(async () => {
		console.log(await $().cityCode());
		console.log(await $1.cityCode());
	})();

	let { Ref_1, Ref_2 } = $.useRef(2);
	let { upload } = $.useRef(["upload"]);

	//console.log(Test);

	//let GlobalData = $.store().GlobalData;
	//console.log(GlobalData.user);
	// $.post("/oper/signup", {
	// 	username: "admin",
	// 	passwd: "12345678",
	// 	name: "admin",
	// 	department: "老衲",
	// 	remark: "备注嗷嗷哎"
	// });

	return (
		<div>
			<Form
				ref={Ref_1}
				action="/test/api"
				valueReturn={val => {
					console.log(val);
					return val;
				}}
			>
				{({ form }) => (
					<div>
						<Inputs
							name="lesson_statuss"
							form={form}
							value="unfinished"
							radios={[
								{
									value: "unfinished",
									text: "待上课节"
								},
								{
									value: "finished",
									text: "已完课节"
								}
							]}
							onChange={res => {
								console.log(res);
							}}
						/>
						<Inputs name="test1" form={form} type="dateTimePicker" />
						<Inputs name="test2" form={form} type="datePicker" />
						<Inputs
							name="test"
							form={form}
							type="rangePicker"
							onSure={res => {
								console.log(res);
							}}
						/>
						<Inputs
							name="test3"
							form={form}
							type="rangeTimePicker"
							onSure={res => {
								console.log(res);
							}}
						/>
						<Btn ref={Ref_2} htmlType="submit" iconfont="sousuo">
							搜索
						</Btn>
					</div>
				)}
			</Form>

			<Btn
				onClick={btn => {
					btn.loading = true;
					console.log($(Ref_1));
					$(Ref_2).loading = true;
					$(Ref_2).setloading(false, 3000);
					btn.setloading(false, 2000);
				}}
			/>
			<a onClick={() => $(upload).open()}>test</a>
			<Uploadfile
				action="/achievement/import/fields"
				params={{
					aa: 1
				}}
				multiple={false}
				ref={upload}
				onSure={rs => console.log(rs)}
			/>

			<div>
				<wasm-user>
					<span slot="person-name">
						1112233
						<div onClick={() => console.log(888)} style={{ color: "red" }}>
							借口还是健康法
						</div>
					</span>
				</wasm-user>
				<Wasm template="user" />
			</div>

			<div>
				<Btn
					onClick={async () => {
						// let base64 = await $.get("/teacher/qrcode", {
						// 	teacher_uuid: "f025f02e-9e91-11e7-b652-001696e50eef"
						// });
						// $.download(base64.img, {
						// 	name: "老师二维码",
						// 	_type: "base64"
						// });
						await $.download("/exam/theory/template", { name: "成绩导入模板" });
					}}
				>
					下载
				</Btn>
			</div>
		</div>
	);
}
