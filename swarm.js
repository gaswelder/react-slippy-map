function randomPos() {
	return {
		latitude: 53.9049 + (Math.random()-0.5) * 0.01,
		longitude: 27.5609 + (Math.random()-0.5) * 0.01
	};
}

function diff(p1, p2) {
	return Math.abs(p1.latitude - p2.latitude) + Math.abs(p1.longitude - p2.longitude);
}

export default class Swarm {
	constructor(size = 10) {
		let balloons = [];
		for(let i = 0; i < size; i++) {
			balloons.push({
				pos: randomPos(),
				dest: randomPos()
			});
		}
		this.balloons = balloons;
		this.start();
	}

	start() {
		setInterval(() => {
			for(let m of this.balloons) {
				let dr = diff(m.pos, m.dest);
				if(dr < 0.0001) {
					m.dest = randomPos();
				}

				let d1 = m.dest.latitude - m.pos.latitude;
				let d2 = m.dest.longitude - m.pos.longitude;

				m.pos.latitude += d1/Math.abs(d1) * 0.0001;
				m.pos.longitude += d2/Math.abs(d2) * 0.0001;
			}
		}, 10);
	}

	subscribe(func) {
		setInterval(() => {
			func(this.balloons.map(b => b.pos));
		}, 100);
	}
}
