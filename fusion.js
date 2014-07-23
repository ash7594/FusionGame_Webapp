function fusion() {

document.getElementById('start_screen').style.display="none";
document.getElementById('canvas').style.display="block";

var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');

canvas.width=window.innerWidth-20;
canvas.height=window.innerHeight-20;
//var song=document.getElementById('song');

var grid_size=document.getElementById('grid_size').value;//"g1";//"<?php if(isset($_POST['grid_size'])) echo $_POST['grid_size']; else echo "g1"; ?>";
var rows=0;
var columns=0;
if(grid_size=="g1")
	{
	rows=10;
	columns=6;
	}
else if(grid_size=="g2")
	{
	rows=15;
	columns=10;
	}	

var bigger;	
if((canvas.width/columns)>=(canvas.height/rows))
	bigger=1;
else
	bigger=0;	

var cell_width;//Math.floor(canvas.width/columns);
var cell_height;//Math.floor(canvas.height/rows);
if(bigger==0)
	{
	cell_width=cell_height=Math.floor(canvas.width/columns);
	canvas.width=cell_width*columns;
	canvas.height=cell_height*rows;
	}
else
	{
	cell_width=cell_height=Math.floor(canvas.height/rows);
	canvas.width=cell_width*columns;
	canvas.height=cell_height*rows;
	}

var offsetX=parseInt((window.innerWidth-canvas.width)/2);
var offsetY=parseInt((window.innerHeight-canvas.height)/2);

canvas.style.left=offsetX;
canvas.style.top=offsetY;
	
var count1=0;
var check_on=0;
var reaction=0;
var count=0;
var clicked=0;
var mouseX=-1;
var mouseY=-1;

var num_players= document.getElementById('num_players').value;//"2";//"<?php if(isset($_POST['num_players'])) echo $_POST['num_players']; else echo "0"; ?>";
var num_players=parseInt(num_players);

var width_line=2;
var turn=0; //default
var colors=["#FF0000","#00FF00","#0000FF","purple","white","#005555","yellow"];
var colors_grid=["#B00000","#009900","#0000B0","purple","#888888","#005555","yellow"];
var unstable_cells=new Array();
var ballborder="#303030";
var ballborderwidth=3;
var explode_moveby=2;
var ongoing_color="none"; //default
var eliminated=new Array(num_players);
for(var i=0;i<num_players;i++)
	eliminated[i]=0;
var colors_check=new Array(num_players);
for(var i=0;i<num_players;i++)
	colors_check[i]=0;
	
canvas.addEventListener("click",setmousepointer);

function unstable(i,j)
	{
	this.start=0;
	this.finish=0;
	this.i=i;
	this.j=j;
	}
	
function ball()
	{
	this.x=-1; //default
	this.y=-1; //default
	this.angle=0;
	if(cell_width<=cell_height)	
		this.r=Math.floor(cell_width/6);
	else
		this.r=Math.floor(cell_height/6);	
	}	

function cells(x,y,i,j)
	{
	this.x=x;
	this.y=y;
	this.split_active=0; //default
	this.carry_balls=0; //default
	this.num_balls=0; //default
	if((i==0 && j==0) || (i==rows-1 && j==columns-1) || (i==0 && j==columns-1) || (i==rows-1 && j==0))
		this.maxballs=2; //maxballs is the condition of split
	else if(i==0 || i==rows-1 || j==0 || j==columns-1)
		this.maxballs=3;
	else
		this.maxballs=4;
	this.grid_color="none"; //default
	this.centerX=parseInt(x+cell_width/2);
	this.centerY=parseInt(y+cell_height/2);
	this.balls=new Array();
	this.cballs=new Array();
	for(var k=0;k<this.maxballs;k++)
		this.balls.push(new ball());
	for(var k=0;k<this.maxballs;k++)
		this.cballs.push(new ball());
	}
	
var grid_cell=new Array(rows);
for(var i=0;i<rows;i++)
grid_cell[i]=new Array(columns);

for(var i=0;i<rows;i++)	
for(var j=0;j<columns;j++)
grid_cell[i][j]=new cells(j*cell_width,i*cell_height,i,j)	

function setmousepointer(e)
	{
	mouseX=parseInt((e.clientX-offsetX)/cell_width);
	mouseY=parseInt((e.clientY-offsetY)/cell_height);
	if(mouseX>=columns)
		mouseX=columns-1;
	if(mouseX<0)
		mouseX=0;
	if(mouseY>=rows)
		mouseY=rows-1;
	if(mouseY<0)
		mouseY=0;		
	clicked=1;
	}

function create_grid()
	{
	canvas.style.border=width_line+"px "+colors_grid[turn]+" solid";
	var x=cell_width,y=0;
	for(var i=0;i<columns-1;i++)
		{
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x,canvas.height);
		ctx.lineWidth=width_line;
		ctx.strokeStyle=colors_grid[turn];
		ctx.stroke();
		ctx.closePath();
		x+=cell_width;
		}
	y=cell_height,x=0;
	for(var i=0;i<rows-1;i++)
		{
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(canvas.width,y);
		ctx.lineWidth=width_line;
		ctx.strokeStyle=colors_grid[turn];
		ctx.stroke();
		ctx.closePath();
		y+=cell_height;
		}
	}
	
function explode(i,j,k)
	{
	if(unstable_cells[k].start==0)
		{
		//song.pause();
		//song.play();
		unstable_cells[k].start=1;
		for(var l=0;l<grid_cell[i][j].maxballs;l++)    //bring to default center
			{
			grid_cell[i][j].cballs[l].x=grid_cell[i][j].centerX;
			grid_cell[i][j].cballs[l].y=grid_cell[i][j].centerY;
			}
		grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;	
		if(grid_cell[i][j].num_balls>0)
			grid_cell[i][j].grid_color=ongoing_color;
		else grid_cell[i][j].grid_color="none";	
		grid_cell[i][j].carry_balls=0;
		}
		
	if(grid_cell[i][j].maxballs==4)
		{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[1].x-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[2].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[2].y+=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[3].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[3].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;  
				grid_cell[i+1][j].grid_color=ongoing_color;  
				grid_cell[i][j-1].grid_color=ongoing_color; 
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;} 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
		}
		////////////////////////////////
		////////////////3///////////////
		////////////////////////////////
	else if(grid_cell[i][j].maxballs==3)
		{
		if(i==0)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[0].x-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[1].y+=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[2].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[2].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;  
				grid_cell[i+1][j].grid_color=ongoing_color;  
				grid_cell[i][j-1].grid_color=ongoing_color; 
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/ 	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;} 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}	
			}
		else if(i==rows-1)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[1].x-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[2].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[2].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;    
				grid_cell[i][j-1].grid_color=ongoing_color; 
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;} 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
			}
		else if(j==0)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[1].y+=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[2].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[2].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;  
				grid_cell[i+1][j].grid_color=ongoing_color;  
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
			}
		else if(j==columns-1)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[1].x-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[2].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[2].y+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;  
				grid_cell[i+1][j].grid_color=ongoing_color;  
				grid_cell[i][j-1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;} 	 	
				grid_cell[i][j].split_active=0;
				}
			}		
		}
	//////////////////////////////////////
	//////////////////2///////////////////
	//////////////////////////////////////
	else if(grid_cell[i][j].maxballs==2)
		{
		if(i==0 && j==0)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[0].y+=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[1].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;  
				grid_cell[i+1][j].grid_color=ongoing_color;   
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;		
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/ 	
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
			}
		else if(i==rows-1 && j==0)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x<grid_cell[i][j+1].centerX)
				{grid_cell[i][j].cballs[1].x+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;  
				grid_cell[i][j+1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;		
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs) grid_cell[i][j+1].carry_balls++;
				else grid_cell[i][j+1].num_balls++;
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	 	
				if(grid_cell[i][j+1].num_balls==grid_cell[i][j+1].maxballs && grid_cell[i][j+1].split_active==0) 
					{unstable_cells.push(new unstable(i,j+1));grid_cell[i][j+1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
			}
		else if(i==0 && j==columns-1)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[0].x-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].y<grid_cell[i+1][j].centerY)
				{grid_cell[i][j].cballs[1].y+=explode_moveby;count++;}
			
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i+1][j].grid_color=ongoing_color;  
				grid_cell[i][j-1].grid_color=ongoing_color; 
					
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs) grid_cell[i+1][j].carry_balls++;
				else grid_cell[i+1][j].num_balls++;	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;	
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i+1][j].num_balls==grid_cell[i+1][j].maxballs && grid_cell[i+1][j].split_active==0) 
					{unstable_cells.push(new unstable(i+1,j));grid_cell[i+1][j].split_active=1;} 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;} 	
				grid_cell[i][j].split_active=0;
				}
			}
		else if(i==rows-1 && j==columns-1)
			{
			count=0;
			if(grid_cell[i][j].cballs[0].y>grid_cell[i-1][j].centerY)
				{grid_cell[i][j].cballs[0].y-=explode_moveby;count++;}
			if(grid_cell[i][j].cballs[1].x>grid_cell[i][j-1].centerX)
				{grid_cell[i][j].cballs[1].x-=explode_moveby;count++;}
						
			if(count==0)
				{
				unstable_cells[k].finish=1;
				grid_cell[i-1][j].grid_color=ongoing_color;    
				grid_cell[i][j-1].grid_color=ongoing_color; 
				
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs) grid_cell[i-1][j].carry_balls++;
				else grid_cell[i-1][j].num_balls++;	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs) grid_cell[i][j-1].carry_balls++;
				else grid_cell[i][j-1].num_balls++;	
				/*grid_cell[i][j].num_balls=grid_cell[i][j].carry_balls;
				if(grid_cell[i][j].carry_balls>0) grid_cell[i][j].grid_color=ongoing_color;
				else grid_cell[i][j].grid_color="none";
				*/
				if(grid_cell[i-1][j].num_balls==grid_cell[i-1][j].maxballs && grid_cell[i-1][j].split_active==0) 
					{unstable_cells.push(new unstable(i-1,j));grid_cell[i-1][j].split_active=1;} 	 	
				if(grid_cell[i][j-1].num_balls==grid_cell[i][j-1].maxballs && grid_cell[i][j-1].split_active==0) 
					{unstable_cells.push(new unstable(i,j-1));grid_cell[i][j-1].split_active=1;}
				grid_cell[i][j].split_active=0;
				}
			}		
		}
	
	if(unstable_cells[k].finish==0)
	for(var l=0;l<grid_cell[i][j].maxballs;l++)
		{
		ctx.beginPath();
		ctx.arc(grid_cell[i][j].cballs[l].x,grid_cell[i][j].cballs[l].y,grid_cell[i][j].cballs[l].r,0,2*Math.PI);
		ctx.fillStyle=colors[turn];
		ctx.strokeStyle=ballborder;
		ctx.lineWidth=ballborderwidth;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		}
	
	for(var z=0;z<num_players;z++)
	colors_check[z]=0;
	
	for(var q=0;q<rows;q++)	
	for(var w=0;w<columns;w++)
	for(var z=0;z<num_players;z++)
		if(grid_cell[q][w].grid_color==colors[z])
			{
			colors_check[z]++;
			z=num_players;
			}

			count1=0;	
	for(var z=0;z<num_players;z++)		
		if(colors_check[z]==0 && colors[z]!=ongoing_color)
			{
			eliminated[z]=1;
			count1++;
			}
	
	if(k==unstable_cells.length-1 && unstable_cells[k].finish==1)
		{
		turn++;
		turn=turn%num_players;
		while(eliminated[turn]==1)
			{
			turn++;
			turn%=num_players;
			}
		reaction=0;
		unstable_cells = [];
		canvas.addEventListener("click",setmousepointer);
		}
		
	}
	
function gameplay()
	{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	if(clicked==1)
		{
		if(grid_cell[mouseY][mouseX].grid_color==colors[turn] || grid_cell[mouseY][mouseX].grid_color=="none")
			{
			grid_cell[mouseY][mouseX].num_balls++;
			grid_cell[mouseY][mouseX].grid_color=colors[turn];
			if(grid_cell[mouseY][mouseX].maxballs==grid_cell[mouseY][mouseX].num_balls)
				{ongoing_color=colors[turn];reaction=1;canvas.removeEventListener("click",setmousepointer);unstable_cells.push(new unstable(mouseY,mouseX));}
			else
				{
				turn++;
				turn=turn%num_players;
				while(eliminated[turn]==1)
					{
					turn++;
					turn%=num_players;
					}
				}
			}
		clicked=0;
		}
	
	create_grid();
	
	for(var i=0;i<rows;i++)
	for(var j=0;j<columns;j++)
	if(grid_cell[i][j].num_balls!=grid_cell[i][j].maxballs)// && grid_cell[i][j].split_active==0)
		switch(grid_cell[i][j].num_balls)
			{
			case 1: ctx.beginPath();
					ctx.arc(grid_cell[i][j].centerX,grid_cell[i][j].centerY,grid_cell[i][j].balls[0].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[0].x=grid_cell[i][j].centerX;
					grid_cell[i][j].balls[0].y=grid_cell[i][j].centerY;
					break;
			
			case 2: ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+7/12*cell_width,grid_cell[i][j].y+5/12*cell_height,grid_cell[i][j].balls[0].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[0].x=grid_cell[i][j].x+7/12*cell_width;
					grid_cell[i][j].balls[0].y=grid_cell[i][j].y+5/12*cell_height;

					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+5/12*cell_width,grid_cell[i][j].y+7/12*cell_height,grid_cell[i][j].balls[1].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[1].x=grid_cell[i][j].x+5/12*cell_width;
					grid_cell[i][j].balls[1].y=grid_cell[i][j].y+7/12*cell_height;
					break;
			
			case 3: ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+12/24*cell_width,grid_cell[i][j].y+9/24*cell_height,grid_cell[i][j].balls[0].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[0].x=grid_cell[i][j].x+12/24*cell_width;
					grid_cell[i][j].balls[0].y=grid_cell[i][j].y+9/24*cell_height;

					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+9/24*cell_width,grid_cell[i][j].y+15/24*cell_height,grid_cell[i][j].balls[1].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[1].x=grid_cell[i][j].x+9/24*cell_width;
					grid_cell[i][j].balls[1].y=grid_cell[i][j].y+15/24*cell_height;
					
					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+15/24*cell_width,grid_cell[i][j].y+15/24*cell_height,grid_cell[i][j].balls[2].r,0,2*Math.PI);
					ctx.fillStyle=grid_cell[i][j].grid_color;
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[2].x=grid_cell[i][j].x+15/24*cell_width;
					grid_cell[i][j].balls[2].y=grid_cell[i][j].y+15/24*cell_height;
					break;

			case 4: ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+12/24*cell_width,grid_cell[i][j].y+9/24*cell_height,grid_cell[i][j].balls[0].r,0,2*Math.PI);
					ctx.fillStyle=colors[turn];
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[0].x=grid_cell[i][j].x+12/24*cell_width;
					grid_cell[i][j].balls[0].y=grid_cell[i][j].y+9/24*cell_height;

					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+9/24*cell_width,grid_cell[i][j].y+12/24*cell_height,grid_cell[i][j].balls[1].r,0,2*Math.PI);
					ctx.fillStyle=colors[turn];
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[1].x=grid_cell[i][j].x+9/24*cell_width;
					grid_cell[i][j].balls[1].y=grid_cell[i][j].y+12/24*cell_height;
					
					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+12/24*cell_width,grid_cell[i][j].y+15/24*cell_height,grid_cell[i][j].balls[2].r,0,2*Math.PI);
					ctx.fillStyle=colors[turn];
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[2].x=grid_cell[i][j].x+12/24*cell_width;
					grid_cell[i][j].balls[2].y=grid_cell[i][j].y+15/24*cell_height;
					
					ctx.beginPath();
					ctx.arc(grid_cell[i][j].x+15/24*cell_width,grid_cell[i][j].y+12/24*cell_height,grid_cell[i][j].balls[3].r,0,2*Math.PI);
					ctx.fillStyle=colors[turn];
					ctx.strokeStyle=ballborder;
					ctx.lineWidth=ballborderwidth;
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
					grid_cell[i][j].balls[3].x=grid_cell[i][j].x+15/24*cell_width;
					grid_cell[i][j].balls[3].y=grid_cell[i][j].y+12/24*cell_height;
					break;
			}
	
	if(count1==num_players-1)
		{
		document.getElementById('game_over').style.display="block";//gameover
		document.getElementById('won').innerHTML="PLayer "+(turn+1)+" rocks!";
		canvas.removeEventListener("click",setmousepointer);
		}
	
	for(var k=0;k<unstable_cells.length;k++)
		if(unstable_cells[k].finish!=1)
			explode(unstable_cells[k].i,unstable_cells[k].j,k);
	
	setTimeout(function(){gameplay()},10);
	}
	create_grid();
	gameplay();
}		