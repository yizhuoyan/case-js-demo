(function(window) {
	var Deque={
			newInstance:function(){
				var deque={};
				deque.first=null;
				deque.last=null;
				deque.length=0;
				deque.addFirst=function(item){
					if(this.length===0){
						this.first=item;
						this.last=item;
					}else{
						this.first.__front=item;
						item.__behind=this.first;
						this.first=item;
					}
					this.length++;
				};
				deque.addLast=function(item){
					if(this.length===0){
						this.first=item;
						this.last=item;
					}else{
						this.last.__behind=item;
						item.__front=this.last;
						this.last=item;
					}
					this.length++;
				};
				deque.pollFirst=function(){
					if(this.length===0){
						return null;
					}
					var f=this.first;
					if(this.length===1){
						this.last=null;
						this.first=null;
						this.length--;
						return f;
					}
					
					this.first=f.__behind;
					this.first.__front=null;	
					this.length--;
					f.__behind=null;
					return f;
				};
				deque.pollLast=function(){
					if(this.length===0){
						return null;
					}
					var e=this.last;
					if(this.length===1){
						this.last=null;
						this.first=null;
						this.length--;
						return e;
					}
					this.last=e.__front;
					this.last.__behind=null;
					this.length--;
					e.__front=null;
					return e;
				};
				deque.peekFirst=function(){
					return this.first;
				};
				deque.peekLast=function(){
					return this.last; 
				};
				deque.clear=function(){
					while(this.length!==0){
						this.pollFirst();
					}
				};
				deque.each=function(f){
					var e=this.first;
					var i=0;
					while(e){
						if(!f(e,i++)){
							e=e.__behind;	
						}else{
							break;
						}
					}
				};
				deque.find=function(f){
					var e=this.first;
					var i=0;
					while(e){
						if(f(e,i++)){
							return e;
						}
						e=e.__behind;
					}
					return null;
				};
				return deque;
			}
			
	};
	// define the direction,just equals the key code
	var L = 37, U = 38, R = 39, D = 40;
	var Game={
			canvas:function(){
				this._box=document.getElementById("box");
				this._box.innerHTML="";
				return this._box;
			},
			speed:200,
			snakeLengthUI:null,
			isPause:false,//is game pause
			start: function() {
				snakeLenthUI=document.getElementById("snakeLength");
				// build map
				Map.init(30, 30);
				//init Snake
				Snake.init();
				// listener key
				Game.setKeyListener();
				//random snake part
				Map.randomNewPart();
				
			},
			resume:function(){
				Game.isPause=false;
				Snake.autoRun(true);
			},
			pause:function(){
				Game.isPause=true;
				Snake.autoRun(false);
				if(window.confirm("游戏暂停,点击确定恢复,点击取消重来")){
					Game.resume();
				}else{
					Game.restart();
				}
			},
			restart:function(){
				Snake.die();
				Map.clear();
				Game.start();
			},
			setKeyListener:function(){
				document.onkeydown = function(evt) {
					evt = evt || window.event;
					switch (evt.keyCode) {
					case L:// left
					case U:// up
					case R:// right
					case D:// down
						Snake.currentD(evt.keyCode);
						break;
					}
				};
				document.onkeyup = function(evt) {
					evt = evt || window.event;
					if((!Game.isPause)&&evt.keyCode===32){
						Game.pause();	
					}
				};
			},
			over:function(){
				Map.clear();
				
				if(window.confirm("游戏结束,再来一次？")){
					this.start();
				}else{
					this.canvas().innerHTML="游戏结束";
				}
			},
			updateSnakeLength:function(len){
				snakeLenthUI.innerHTML=len+"";
			}
	};
	// define the map
	var Map = {
		cells: null,
		w:0,
		h:0,
		randomPart:null,
		init:function(x,y){
			var tn = document.createElement("table");
			Game.canvas().appendChild(tn);
			var tr, td;
			var tds=[];
			for ( var i = 0; i <x; i++) {
				tr = document.createElement("tr");
				tn.appendChild(tr);
				tds[i] = [];
				for ( var j = 0; j <y; j++) {
					td = document.createElement("td");
					tr.appendChild(td);
					td.style.backgroundColor = "white";
					tds[i][j] = td;
				}
			}
			this.cells=tds;
			this.w=x;
			this.h=y;
		},
		clear:function(){
			var tds=this.cells;
			for(var i=tds.length;i-->0;){
				tds[i].splice(0,tds[i].length);
			}
			tds.splice(0,tds.length);
			this.cells=null;
			if(this.randomPart){
				this.randomPart.flicker(false);
				this.randomPart=null;
			}
		},
		getCell: function(x, y) {
			return this.cells[y][x];
		},
		randomNewPart:function(){
			//do not random on snake
			var x,y;
			do{
				x=Math.floor(Math.random()*this.w);
				y=Math.floor(Math.random()*this.h);
			}while(Snake.getPart(x,y)!==null);
			this.randomPart=Snake.Part.newInstance(x,y);
			this.randomPart.flicker(true);
		},
		hasNewPart:function(x,y){
			var rPart=this.randomPart;
			if(rPart!=null){
				if(rPart.x===x&&rPart.y===y){
					return rPart;
				}
			}
			return null;
		}
		
	};
	
	// define the snake
	var Snake = {
		body :function(){
			if(arguments.length===0){
				return this._body;
			}
			this._body=arguments[0];
		},
		currentD:function(){
			if(arguments.length===0){
				return this._currentD;
			}
			var next=arguments[0];
			if(typeof this._currentD===undefined||Math.abs(this._currentD-next)!==2){//not same line
				this._currentD=next;
			}
		},
		init:function(){
			this.currentD(R);
			this.body(Deque.newInstance());
			this.newHead(Snake.Part.newInstance(0, 0));
			Game.updateSnakeLength(this.body().length);
			this.autoRun(true);
		},	
		die : function() {
			this.autoRun(false);
			this.body().clear();
			Game.over();
		},
		head : function() {
			return this.body().peekFirst();
		},
		tail : function() {
			return this.body().peekLast();
		},
		newHead : function(part) {
			this.body().addFirst(part);
			part.snake(this);
		},
		removeTail:function(){
			var tail=this.body().pollLast();
			tail.draw(false);
		},
		eatHead:function(head){
			head.flicker(false);
			this.newHead(head);	
			Game.updateSnakeLength(this.body().length);
			Map.randomNewPart();
			
		},
		hitSelf:function(x,y){
			return this.getPart(x,y)!==null;
		},
		getPart:function(x,y){
			return this.body().find(function(e){
				return e.x===x&&e.y===y;
			});
		},
		
		move2left : function() {
			var head=this.head();
			this.move(head.x-1, head.y);
		},
		move2up : function() {
			var head=this.head();
			this.move(head.x, head.y-1);
		},
		move2right : function() {
			var head=this.head();
			this.move(head.x+1, head.y);
		},
		move2down : function() {
			var head=this.head();
			this.move(head.x, head.y+1);
		},
		move:function(x,y){
			if(x<0||x>=Map.w||y<0||y>=Map.h||this.hitSelf(x,y)){
				this.die();
				return;
			}
			var newPart=Map.hasNewPart(x, y);
			if(newPart!=null){
				this.eatHead(newPart);
			}else{
				var newHead=Snake.Part.newInstance(x, y);
				this.newHead(newHead);
				this.removeTail();
			}
		},
		autoRun:function(flag){
			if(!flag){
				clearInterval(this.autoRunThread);
				return;
			}
			this.autoRunThread=setInterval(function(){
				switch(Snake.currentD()){
				case L:// left
					Snake.move2left();
					break;
				case U:// up
					Snake.move2up();
					break;
				case R:// right
					Snake.move2right();
					break;
				case D:// down
					Snake.move2down();
					break;
				}
			}, Game.speed);
		}
	};
	
	
	Snake.Part={
		newInstance:function(x,y){
			var part={};
			part.x=x;
			part.y=y;
			part.cell=Map.getCell(x, y);
			part.snake=function(){
				if(arguments.length==0){
					return part._snake;
				}else{
					part._snake=arguments[0];
					part.draw(true);
				}
			};
			part.draw=function(flag){
				if(flag){
					this.cell.style.backgroundColor ="#ff9900";
				}else{
					this.cell.style.backgroundColor ="#ffffff";
				}
			};
			part.flicker=function(flag){
				if(!flag){
					clearInterval(this.flickerThread);
					return;
				}
				var part=this;
				part.flickerThread=setInterval(function(){
					if(part.toggle){
						part.cell.style.backgroundColor ="#000";
						part.toggle=false;
					}else{
						part.cell.style.backgroundColor ="#ffffff";
						part.toggle=true;
					}	
					
				}, 500);
			};
			return part;
		}
		
	};
	window.Game=Game;
})(window);
