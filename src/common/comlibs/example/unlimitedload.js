import React from "react";
import { Unlimitedload } from "../comlibs";
import "../../common/style/mainPaddingOff.css";

export default function(props) {
	let Top = () => <div>isdfjksdjgksjgk，jkhjkh就看见看</div>;

	let List = ({ data, index }) => {
		return (
			<span>
				{index === 0 && <Top />}
				<span>
					{data.name} - index:{index + 1}
				</span>
			</span>
		);
	};

	let Load = ({ index }) => {
		return <span>Loading({index})...</span>;
	};

	return (
		<div
			className="wh_full"
			style={{
				padding: "0 0 0 24px"
			}}
		>
			<Unlimitedload
				api="/campusstudent/screen"
				params={{
					identity: "formal"
				}}
				RenderList={_props => <List {..._props} />}
				RenderLoad={_props => <Load {..._props} />}
				{...props}
			/>
		</div>
	);
}
