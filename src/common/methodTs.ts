import method from "./method";

export default function(t: any) {
	t.prototype.$ = new method();
}
