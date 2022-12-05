let images = {};

let map;
let debug;

const Mouse = {
	clickX: 0,
	clickY: 0,
	clickStart: 0,
	hoverStart: 0,
};

class Debug{
	/**
	 * 
	 * @param {Object} isMarking has {submap: bool, course: bool, center: bool},
	 */
	constructor(isMarking){
		this.isMarking = isMarking;
		this.isMarking.submap ??= false;
		this.isMarking.course ??= false;
		this.isMarking.center ??= false;
	}

	markAll(map){
		if(this.isMarking.submap){
			for(const move of map.moves){
				if(move.from === map.selectedSubmap){
					Debug.mark("#c4cbffcc",...map.getCanvasPos(move.x,move.y),move.width,move.height);
				}
			}
		}
		
		if(this.isMarking.course){
			for(const course of map.courses){
				if(course.map === map.selectedSubmap){
					Debug.mark("#8bb37dcc",...map.getCanvasPos(course.x,course.y),20,20);
				}
			}
		}


		if(this.isMarking.center){
			Debug.mark("#ffadff",147,107,25,25)
		}
	}

	static mark(c,x,y,w,h){
		push()
		stroke(0);
		fill(c);
		rect(x,y,w,h);
		pop()
	}
}

class Move{
	constructor(from,to,x,y,width = 25,height = 25){
		this.from = from;
		this.to = to;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		return this;
	}
	setMapDestination(x,y){
		this.toMapX = x;
		this.toMapY = y;

		return this;
	}
}
class Course{
	constructor(map,x,y,name){
		this.map = map;
		this.x = x;
		this.y = y;
		this.name = name;
	}
	setMemo(memo){
		this.memo = memo;
	}
}

class Map{
	constructor(){
		this.x = 0;
		this.y = 0;
		this.selectedSubmap = 0; //0: None, 1: W1, 2: W3, 3: W5, 4: W7, 5: Star, 6: SP
		this.selectedCourse = -1;

		this.moves = [
			new Move(0,1,  3,350,130,110),
			new Move(0,2,170, 75, 90, 90),
			new Move(0,3,385,160,125,110),
			new Move(0,4,182,280,120, 85),

			new Move(0,4,139,250),
			new Move(0,4,170,220),
			new Move(4,0, 43, 90).setMapDestination(  0,143),
			new Move(4,0, 75, 58).setMapDestination( 23,113),

			new Move(0,2,155, 43),
			new Move(0,2,267,107),
			new Move(2,0, 91, 50).setMapDestination(  8,  0),
			new Move(2,0,203,193).setMapDestination(120,  0),

			new Move(0,4,283,363),
			new Move(0,4,155,380),
			new Move(4,0,235,186).setMapDestination(136,256),
			new Move(4,0,107,186).setMapDestination(  8,272),
			
			new Move(0,5,108,284),
			new Move(2,5, 44, 99),
			new Move(0,5,252,237),
			new Move(0,5,315,253),
			new Move(4,5,108, 90),

			new Move(5,0, 76,170).setMapDestination(  0,177),
			new Move(5,2, 76, 89),
			new Move(5,0,155, 58).setMapDestination(105,130),
			new Move(5,0,234, 89).setMapDestination(168,146),
			new Move(5,4,234,170),

			new Move(5,6,155, 90),
			new Move(6,5, 60,176),
			new Move(6,1, 60,146).setMapDestination(  0,225),

			new Move(1,0, 96, 18, 50, 70).setMapDestination(  0,156),

			// new Move(0,0,0,0,512,48),	//テスト用
		];
		// this.courses = [
		// 	{map: 1,x: 94,y: 172,name: "ヨースター島 コース1"},
		// ];
	}

	draw(){
		{	//メインマップ描画
			let dx = 0;
			let dy = 0;
			if(!this.isSubmapOpening() && mouseIsPressed){
				dx = int(Mouse.clickX - mouseX);
				dy = int(Mouse.clickY - mouseY);
			}
			image(images.map[0],0,0,width,height,
				Math.min(Math.max(this.x + dx,0),512 - width),
				Math.min(Math.max(this.y + dy,0),512 - height),
				width,height);
		}

		{	//サブマップ描画
			if(this.isSubmapOpening()){
				const smX = (width - 276) / 2;
				const smY = (height - 220) / 2;
				image(images.submapBG,smX,smY);
				image(images.map[this.selectedSubmap],smX + 26,smY + 36);
			}
		}

		// {	//コースデータ描画
		// 	if(this.selectedCourse !== -1){
		// 		image(images.courseBG,this.courses[this.selectedCourse].x - 12,this.courses[this.selectedCourse].y - 83);	//背景
		// 		image(images.courses[this.selectedCourse],this.courses[this.selectedCourse].x - 10,this.courses[this.selectedCourse].y - 80,40,40);
		// 		push()
		// 		textSize(10);
		// 		textStyle(BOLD);
		// 		text(this.courses[this.selectedCourse].name,this.courses[this.selectedCourse].x - 8,this.courses[this.selectedCourse].y - 30);
		// 		pop();
		// 	}
		// }
	}
	move(dx,dy){
		if(this.selectedSubmap) return;
		this.x = Math.min(Math.max(this.x + dx,0),512 - width);
		this.y = Math.min(Math.max(this.y + dy,0),512 - height);
	}
	changeSubmap(id = 0,x,y){
		if(id < 0 || 6 < id) return;
		this.selectedSubmap = id;
		if(x !== undefined && y !== undefined){
			this.x = x;
			this.y = y;
		}
	}
	courseHovered(index){
		this.selectedCourse = index;
	}

	isSubmapOpening(){
		return this.selectedSubmap !== 0;
	}

	getCanvasPos(mapX,mapY){
		if(this.isSubmapOpening()){
			return [mapX,mapY];
		}else{
			return [mapX - this.x,mapY - this.y];
		}
	}
	getMapPos(canvasX,canvasY){
		if(this.isSubmapOpening()){
			return [canvasX,canvasY];
		}else{
			return [canvasX + this.x,canvasY + this.y];
		}
	}
}

function preload(){
	images.background = loadImage("./assets/background.png");

	images.courses = [
		loadImage("./assets/course/1-1.png"),
		loadImage("./assets/course/ys.png"),
		loadImage("./assets/course/1-2.png"),
		loadImage("./assets/course/1-3.png"),
		loadImage("./assets/course/1-4.png"),
		loadImage("./assets/course/1c.png"),
		loadImage("./assets/course/2-1.png"),
		loadImage("./assets/course/2-2.png"),
		loadImage("./assets/course/gs.png"),
		loadImage("./assets/course/2s.png"),
		loadImage("./assets/course/2g.png"),
		loadImage("./assets/course/2gs.png"),
		loadImage("./assets/course/2s2.png"),
		loadImage("./assets/course/2-3.png"),
		loadImage("./assets/course/2-4.png"),
		loadImage("./assets/course/2c.png"),
	];
	images.courseBG = loadImage("./assets/courseBG.png");

	images.map = [
		loadImage("./assets/map_all.png"),
		loadImage("./assets/map_1.png"),
		loadImage("./assets/map_3.png"),
		loadImage("./assets/map_5.png"),
		loadImage("./assets/map_7.png"),
		loadImage("./assets/map_star.png"),
		loadImage("./assets/map_sp.png"),
	];
	images.submapBG = loadImage("./assets/submap_window.png");
}

function setup(){
	// const c = createCanvas(640,480);
	const c = createCanvas(320,240);
	c.style("width",width * 2 + "px");
	c.style("height",height * 2 + "px");
	drawingContext.imageSmoothingEnabled = false; 
	map = new Map();
	debug = new Debug({
		submap: true,
		course: true,
		center: false,
	})
}


function draw(){
	drawBG();
	map.draw();
	drawStroke();
	debug.markAll(map);

	if(pmouseX === mouseX && pmouseY === mouseY && mouseIsPressed === false){
		if(frameCount - Mouse.hoverStart === 30){
			hovered(int(mouseX),int(mouseY));
		}
	}else{
		Mouse.hoverStart = frameCount;
	}
}
function drawBG(){
	image(images.background,0,0,width,height);
}
function drawStroke(){
	push()
	strokeWeight(2);
	stroke(0);
	fill(0,0,0,0);
	rect(0,0,width,height);
	pop()
}




function mousePressed(){
	if(mouseX > width || mouseY > height) return;
	Mouse.clickX = int(mouseX);
	Mouse.clickY = int(mouseY);
	Mouse.clickStart = frameCount;
}
function mouseReleased(){	
	map.move(int(Mouse.clickX - mouseX),int(Mouse.clickY - mouseY));

	if(frameCount - Mouse.clickStart < 12){
		if(abs(Mouse.clickX - mouseX) < 3 &&  abs(Mouse.clickY - mouseY) < 3){
			clicked(mouseX,mouseY);
		}
	}
}

function clicked(x,y){	
	const hit = (x,y,x0,y0,x1,y1) =>{
		return (x0 < x && x < x1 && y0 < y && y < y1);
	}

	for(let move of map.moves){
		const x0 = move.x;		//左端
		const y0 = move.y;		//上端
		const x1 = x0 + move.width;	//右端
		const y1 = y0 + move.height;	//下端

		if(map.isSubmapOpening()){
			if(hit(x,y,265,10,298,44)){
				map.changeSubmap(0);
				return;
			}
		}

		if(move.from !== map.selectedSubmap){
			continue;
		}
		if(hit(...map.getMapPos(x,y),x0,y0,x1,y1)){
			map.changeSubmap(move.to,move.toMapX,move.toMapY);
			return;
		}
	}
}
function hovered(x,y){
	const hit = (x,y,x0,y0,x1,y1) =>{
		return (x0 < x && x < x1 && y0 < y && y < y1);
	}

	for(const [index,course] of map.courses.entries()){
		if(hit(...map.getMapPos(x,y),course.x,course.y,course.x + 20,course.y + 20)){
			map.courseHovered(index);
		}
	}
}