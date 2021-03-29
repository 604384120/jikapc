import React from "react";
import { Unlimitedfalls } from "../comlibs";
import "../../common/style/mainPaddingOff.css";

export default function(props) {
	let List = ({ index, data, img }) => {
		return (
			<div>
				<img
					src={data.avatar}
					alt={data.name}
					style={{
						height: img.height,
						width: img.width
					}}
				/>
				<h4>
					{data.name}:{index}
				</h4>
			</div>
		);
	};

	return (
		<div
			style={{
				padding: "0 0 0 24px"
			}}
		>
			<div>惊世毒妃金卡挥洒房价看就看哈复健科</div>
			<Unlimitedfalls
				api="/campusstudent/screen"
				params={{
					identity: "formal"
				}}
				width={160}
				RenderList={_props => <List {..._props} />}
				{...props}
			/>
		</div>
	);
}
