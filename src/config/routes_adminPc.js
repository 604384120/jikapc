module.exports = [
	/*
	 * 管理员端路由
	 * path: 路由浏览器地址
	 * name: 路由中文名
	 * icon: 路由图标，详情：https://ant.design/components/icon-cn/
	 * component: 根目录pages目录下路由文件地址
	 * sublist： 伪二级路由，对应为左侧主菜单的子菜单，注意：当没有子菜单时值必须为空数组
	 * type: 路由类型，暂时只支持设置index、404
	 */
	{
		name: "注册",
		path: "/adminPc/signUp",
		component: "/signUp/index",
		hide: true,
		sublist: [],
	},
	{
		name: "微信跳转",
		path: "/adminPc/wxRedirect",
		component: "/signUp/wxRedirect",
		hide: true,
		sublist: [],
	},
	{
		name: "去认证",
		path: "/adminPc/verifyGo",
		component: "/signUp/verify",
		hide: true,
		sublist: [],
	},
	{
		name: "认证",
		path: "/adminPc/verify",
		component: "/verify/index",
		hide: true,
		sublist: [],
	},
	{
		name: "买车",
		icon: "icon-car",
		path: "/adminPc/buyCar",
		component: "/buyCar/index",
		type: "index",
		sublist: [],
	},
	{
		name: "卖车",
		icon: "icon-money-copy",
		path: "/adminPc/sellCars",
		component: "/sellCars/index",
		sublist: [],
	},
	{
		name: "招聘",
		icon: "icon-buy-copy",
		path: "/adminPc/join",
		component: "/join/index",
		sublist: [],
	},
	{
		path: "/adminPc/404",
		name: "页面不存在",
		type: "404",
		hide: true,
		component: "/other/404",
		sublist: [],
	},
	{
		path: "/adminPc/test",
		name: "test",
		hide: true,
		component: "/other/test",
		sublist: [],
	},
];
