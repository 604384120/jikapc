import Method from "../method";
const $ = new Method();

class WorksData {
	async user() {
		let purchased = await $.get("/user/product/list", { product_type: "extjson" });
		return {
			purchased,
			miniProgram: ext_code => {
				let list = [];
				purchased.forEach(p => {
					let ext = p.extension;
					if (ext && ext.ext_code) {
						ext.ext = p.permission;
						if (ext_code && ext_code.indexOf(ext.ext_code) > -1) {
							list.push(ext);
						}
						if (!ext_code) {
							list.push(ext);
						}
					}
				});
				return {
					list,
					permission: ext_code => {
						return purchased.some(p => {
							let ext = p.extension;
							if (ext && ext.ext_code) {
								if (ext_code && ext_code === ext.ext_code) {
									return true;
								}
							}
							return false;
						});
					}
				};
			}
		};
	}

	async campus(uuid) {
		let campus_uuid = uuid || $.campus_uuid();
		let detail = await $.get("/campus/detail/" + campus_uuid);
		return {
			detail,
			enable: {
				xcx_appid: () => {
					let testid = "wx7f2c5598fc6f63b8";
					let appid = detail.xcx_appid;
					if (!appid && $.isLocal) {
						appid = testid;
						console.error("注意：当前本地环境下该校区没有绑定小程序，默认返回[享学卓越版]测试appid");
					}
					return appid;
				}
			}
		};
	}
}

export default new WorksData();
