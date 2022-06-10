"use strict"
let ctx;
let ship;				//自機のオブジェクト
let shots = [];			//個々の弾丸オブジェクトShotを格納する配列
let rocks = [];			//岩オブジェクトRockを格納する配列
let level = 1;			//現在何ステージ目かを管理する変数
let score = 0;			//現在のスコア
let clock = 0;			//このゲームでの時間(mainLoopを実行するたびに1増加)
let timer = NaN;
let bg;
let bgX = 0;			//背景画像を描画する際にその座標を保持する変数
let bgY = 0;			//背景画像を描画する際にその座標を保持する変数

//Rockオブジェクト
function Rock(x, y, s) {
	this.cx = x;		//中心座標
	this.cy = y;		//中心座標
	this.w = s;			//幅
	this.h = s;			//高さ
	//進行方向
	let a = Math.random() * Math.PI * 2;
	//移動量
	this.dx = Math.floor(Math.cos(a) * (128 / s));
	this.dy = Math.floor(Math.sin(a) * (128 / s));
	//画像への参照
	this.image = document.getElementById('rock');
}

//Shotオブジェクト
function Shot() {
	this.cx = 0;		//中心座標
	this.cy = 0;		//中心座標
	this.w = 6;			//幅
	this.h = 6;			//高さ
	this.dx = 0;		//移動量
	this.dy = 0;		//移動量
	//一定距離を過ぎると消滅するようにしているため、
	//最大距離をmaxCount、現在距離をcountに保持
	this.count = this.maxCount;
	this.power = 10;	//弾丸のスピード
	this.maxCount = 40;
}

//Shipオブジェクト
function Ship() {
	this.cx = 400;		//中心座標
	this.cy = 400;		//中心座標
	this.w = 90;		//幅
	this.h = 60;		//高さ
	this.dx = 0;		//移動量
	this.dy = 0;		//移動量
	this.rotate = 0;	//進行方向
	this.power = 0;		//弾丸のスピード
	this.accel = 0;		//加速度
	this.keyL = false;	//左キーの押下状態
	this.keyR = false;	//右キーの押下状態
	this.keyF = false;	//上(前)キーの押下状態
	this.keyB = false;	//下(後)キーの押下状態
	this.image = document.getElementById('ship');
}

Shot.prototype = Ship.prototype = Rock.prototype = {
	getX: function () {
		return this.cx -this.w / 2;
	},
	getY: function () {
		return this.cy -this.h / 2;
	},
	isHit: function (o) {
		return !(
				((o.getX() + o.w) < this.getX()) ||
				((this.getX() + this.w) < o.getX()) ||
				((o.getY() + o.h) < this.getY()) ||
				((this.getY() + this.h) < o.getY())
				);
	},
	update: function () {
		this.cx = (this.cx + this.dx + 800) % 800;
		this.cy = (this.cy + this.dy + 800) % 800;
	}
}

//0〜rまでの整数の乱数を返す
function rand(r) {
	return Math.floor(Math.random() * r);
}

//文書読み込み時に実行
function init() {
	//canvasのコンテキストを取得
	ctx = document.getElementById('canvas').getContext('2d');
	//フォントを設定
	ctx.font = "20pt Arial";
	bg = document.getElementById("bg");
	//自機Shipを初期化
	ship = new Ship();
	//弾丸の初期化
	for (let i = 0; i < 7; i++) {
		//配列Shotsに格納
		shots.push(new Shot());
	}
	//キーイベントハンドラーの初期化
	window.addEventListener('keydown', function (e) {
		switch (e.keyCode) {
			case 32:
				ship.keyH = true;
				break;
			case 37:
				ship.keyL = true;
				break;
			case 38:
				ship.keyF = true;
				break;
			case 39:
				ship.keyR = true;
				break;
			case 40:
				ship.keyB = true;
				break;
		}
	});
	window.addEventListener('keyup', function (e) {
		switch (e.keyCode) {
			case 32:
				ship.keyH = false;
				break;
			case 37:
				ship.keyL = false;
				break;
			case 38:
				ship.keyF = false;
				break;
			case 39:
				ship.keyR = false;
				break;
			case 40:
				ship.keyB = false;
				break;
		}
	});
	start();
	if (isNaN(timer)) {
		timer = setInterval(mainLoop, 50);
	}
}

//init()、もしくはステージクリア後に呼び出し
function start() {
	//岩の初期化
	rocks = [];
	//岩オブジェクトRockをステージ数levelにあわせて生成
	for (let i = 0; i < level; i++) {
		let x = rand(800);
		let y = rand(800);
		while (true) {
			let r = new Rock(x, y, 64);
			if (!r.isHit(ship)) {
				//配列rocksに格納
				rocks.push(r);
				break;
			}
		}
	}
}

//メインループ
function mainLoop() {
	clock++;
	//岩が全部なくなったら
	if (rocks.length == 0) {
		//しばらくの間停止
		if(clock > 100) {
			//レベルを増加
			level++;
			start();
		}
		return;
	}
	//船の場所・向きを更新
	//向きの変化
	if (ship.keyL) {
		ship.rotate -= 0.1;
	}
	//向きの変化
	if (ship.keyR) {
		ship.rotate += 0.1;
	}
	//加速度の増減
	if (ship.keyF) {
		ship.accel = Math.min(+5, ship.accel + 0.2);
	}
	//加速度の増減
	if (ship.keyB) {
		ship.accel = Math.max(-5, ship.accel - 0.1);
	}
	ship.power += ship.accel;
	//shipにブレーキをかける
	ship.power *= 0.94;
	ship.accel *= 0.94;
	ship.dx = Math.cos(ship.rotate) * ship.power;
	ship.dy = Math.sin(ship.rotate) * ship.power;
	ship.update();
	//shipの移動量にあわせて背景画像の描画開始場所を更新
	bgX = (bgX + ship.dx / 2 + 1600) % 800;
	bgY = (bgY + ship.dy / 2 + 1600) % 800;
	//弾丸の位置を更新
	//弾丸を発射したかどうかを判定するフラグ
	let fire = false;
	//配列shotsに格納されている弾丸オブジェクトをforEachで順に取り出す
	shots.forEach(function (shot) {
		//現在弾丸が発射中であるか
		if (shot.count < shot.maxCount) {
			shot.count++;
			//場所の更新
			shot.update();
			//衝突検出
			let hit = -1;
			let r = NaN;
			//配列rocksに格納されている岩オブジェクトをforEachで順に取り出す
			rocks.forEach(function (rock, i) {
				//弾丸shotと衝突しているか判定
				if (rock.isHit(shot)) {
					//衝突した岩のインデックスをhitに格納
					hit = i;
					//岩オブジェクトをrに格納
					r = rock;
				}
			});
			//弾丸が岩に衝突
			if (hit >= 0) {
				//spliceを使って衝突した岩を配列rocksから削除
				rocks.splice(hit, 1);
				//スコアの更新
				score += (64 /r.w) * 10;
				//弾丸のcountをmaxCountにして非発射状態にする
				shot.count = shot.maxCount;
				//岩の大きさを半分にする
				r.w /= 2;
				//岩の大きさが16よりも大きい
				if (r.w >= 16) {
					//1つの岩を2つの小さな岩にする
					for (let i = 0; i < 2; i++) {
						rocks.push(new Rock(r.cx, r.cy, r.w));
					}
				}
				//岩の残りが0の場合、ステージクリア
				if (rocks.length == 0) {
					clock = 0;
					draw();
				}
			}
		}
		//発射された弾丸がなく、スペースキーが押されていたら
		else if (!fire && ship.keyH) {
			shot.count = 0;
			//座標と向きをshipと同じ値とする
			shot.cx = ship.cx;
			shot.cy = ship.cy;
			shot.r = ship.rotate;
			shot.dx = ship.dx + shot.power * Math.cos(shot.r);
			shot.dy = ship.dy + shot.power * Math.sin(shot.r);
			//発射状態とする
			fire = true;
		}
	});
	//岩の場所を更新
	rocks.forEach(function (rock) {
		rock.update();
		//shipと衝突しているか
		if (ship.isHit(rock)) {
			//timerを停止
			clearInterval(timer);
			timer = NaN;
		}
	});
	draw();
}

//描画関数
function draw() {
	//背景を描写
	ctx.drawImage(bg, bgX, bgY, 400, 400, 0, 0, 800, 800);
	//弾丸の描画
	ctx.fillStyle = 'rgb(0, 255, 255)';
	shots.forEach(function (shot) {
		if (shot.count < shot.maxCount) {
			ctx.fillRect(shot.getX(), shot.getY(), shot.w, shot.h);
		}
	});
	//岩の描画
	rocks.forEach(function (rock) {
		ctx.drawImage(rock.image, rock.getX(), rock.getY(), rock.w, rock.h);
	});
	//船の描画
	ctx.save();
	//中心座標をshipの中心に移動
	ctx.translate(ship.cx, ship.cy);
	//自機の向きにあわせて座標系を回転
	ctx.rotate(ship.rotate);
	//描画
	ctx.drawImage(ship.image, -ship.w / 2, -ship.h / 2);
	ctx.restore();
	//スコアの描画
	ctx.fillStyle = 'rgb(0, 255, 255)';
	ctx.fillText(('0000000' + score).slice(-7), 670, 30);
	if (rocks.length == 0) {
		ctx.fillText('STAGE CLEAR', 300, 150);
	}
	if (isNaN(timer)) {
		ctx.fillText('GAME OVER', 320, 150);
		ctx.drawImage(bang, ship.getX() - 50, ship.getY() - 50, 200, 200);
	}
}
