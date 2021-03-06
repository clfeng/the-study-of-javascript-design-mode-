// MVC即模型(model)--视图(view)--控制器(controller),用一种将业务逻辑、数据、视图分离的方式组织架构代码
// 页面加载后创建MVC
$(function(){
	// 初始化MVC对象
	var MVC = MVC || {};
	// 初始化MVC数据模型
	MVC.model = function(){
		// 内部数据对象
		var M = {};
		// 服务器端获取的数据，通常通过Ajax获取并存储,后面的案例为简化实现，直接作为同步数据写在页面中，减少服务器端异步请求操作
		M.data = {
			// 左侧这边栏导航服务器端请求得到的响应数据
			slideBar:[
				{
					text:"萌妹子",
					icon:"thumbnail_bassist.jpg",
					content:"自古幼女有三好~",
					img:"basshead.gif",
					href:"http://moe.hao123.com"
				},
				{
					text:"动漫",
					icon:"thumbnail_concert.jpg",
					content:"猫耳萝莉的千本樱~",
					img:"bassist.gif",
					href:"http://v.hao123.com/dongman/"
				},
				{
					text:"lol直播",
					icon:"thumbnail_crowd.jpg",
					content:"猫耳萝莉的千本樱~",
					img:"drummer.gif",
					href:"http://v.hao123.com/video/lol"
				},
			]
		};
		// 配置数据，页面加载时即提供
		M.conf ={
			// 侧边导航动画配置数据
			slideBarCloseAnimate:false
		};
		// 返回数据模型层对象操作方法
		return  {
			// 获取服务器端数据
			getData :function(m){
				// 根据数据字段获取数据
				return M.data[m];
			},
			// 获取配置数据
			getConf: function(c){
				// 根据配置数据字段获取配置数据
				return M.conf[c];
			},
			// 设置服务器端数据(通常将服务器端异步获取到的数据，更新该数据)
			setData: function (m,v){
				//设置数据字段m对应的数据v
				M.data[m] =v;
				return this;
			},
			// 设置配置数据(通常在页面中执行某些操作，为做记录而更新配置数据)
			setConf:function(c,v){
				// 设置配置数据字段c对应的配置数据v
				M.conf[c] = v;
				return this;
			}
		}
	}();
	// 初始化MVC视图层
	MVC.view = function(){
		// 模型数据层对象操作方法引用
		var M = MVC.model;
		// 内部视图创建方法对象
		var V ={
			// 创建则边导航模块视图
			createSlideBar:function(){
				// 导航图标内容
				var html ="",
				// 视图渲染数据
						data = M.getData("slideBar");
				// 屏蔽无效数据
				if (!data || !data.length) {
					return;
				}
				// 创建视图容器(参考附录A中，A框架中创建元素方法create)
				var dom = $.create("div",{
					"class":"slidebar",
					"id":"slidebar"
				});
				// 视图容器模板
				var tpl ={
					container:[
					'<div class="slidebar-inner"><ul>{#content#}</ul></div>',
					'<a hidefocus href="#" class="slidebar-close" title="收起"/>'
					].join(''),
					// 导航图标模块模板
					item : [
						'<li>',
							'<a class="icon" href="{#href#}">',
								'<img src="images/photos/{#icon#}"/>',
								'<span>{#text#}</span>',
							'</a>',
							'<div class="box">',
								'<div>',
									'<a class="title" href="{#href#}">{#title#}</a>',
									'<a href="{#href#}">{#content#}</a>',
								'</div>',
								'<a class="image" href="{#href#}"><img src="images/{#img#}"/></a>',
							'</div>',
						'</li>'							
					].join('')
				};
				// 渲染全部导航图片模块
				for(var i =0,len =data.length; i<len;i++){
					html+=$.formateString(tpl.item,data[i]);
				}
				// 在页面中创建则边导航视图
				dom
					// 向则边导航模块容器中插入则边导航视图
					.html(
						// 渲染导航视图(content为导航图片内容)
						$.formateString(tpl.container,{content:html})
						)
					// 将则边导航模块容器插入页面中
					.appendTo('body');
			}
		};
		// 获取视图接口方法
		return function(v){
			// 根据视图名称返回视图(由于获取的是一个方法，这里需要将该方法执行一遍以获取相应视图)
			V[v]();
		}
	}();
	// 初始化MVC控制器层
	MVC.ctrl = function(){
		// 模型数据层对象操作方法引用
		var M = MVC.model;
		// 视图数据层兑现该操作方法引用
		var V = MVC.view;
		// 控制器创建方法对象
		var C = {
			// 则边导航栏模块
			initSlideBar: function(){
				// 渲染导航栏模块视图
				V("createSlideBar");
				// 为每一个导航图标添加鼠标光标滑过与鼠标光标离开交互事件(具体方法参照A框架)
				$("li","slidebar")
				// 将鼠标移入导航icon图标显示导航浮层
				.on("mouseover",function(e){
					$(this).addClass("show");
				})
				// 将鼠标移除导航icon图标隐藏导航浮层
				.on("mouseout",function(){
					$(this).removeClass("show");
				});
				// 箭头icon图标动画交互
				$(".slidebar-close","slidebar")
				// 点击箭头icon时
					.on("click",function(e){
						// 如果正在执行动画
						if (M.getConf("slideBarCloseAnimate")) {
							// 终止操作
							return false;
						}
						// 设置则边导航模块动画配置数据开关为打开状态
						M.setConf("slideBarCloseAnimate",true);
						// 获取当前元素(箭头icon)
						var $this = $(this);
						// 如果箭头icon是关闭状态(含有is-close类)
						if ($this.hasClass("is-close")) {
							// 为则边导航模块添加显示动画
							$(".slidebar-inner","slidebar")
							.animate({
								// 动画时间
								duration: 800,
								// 动画类型
								type: "easeOutQuart",
								// 动画主函数
								main:function(dom){
									// 每一帧改变导航模块容器left值
									dom.css("left",-50+this.tween*50+"px");
								},
								// 动画结束时回调函数
								end:function(){
									// 设置箭头icon为打开状态(删除is-close)类
									$this.removeClass("is-close");
									// 设置则边导航模块动画配置数据开关为关闭状态(此时可继续进行模块显隐动画交互)
									M.setConf("slideBarCloseAnimate",false);
								}
							});
							// 如果箭头icon是打开状态(不含is-close类)
						}else{
							// 为则边导航模块添加显示动画
							$(".slidebar-inner","slidebar")
							.animate({
								// 动画时间
								duration: 800,
								// 动画类型
								type:"easeOutQuart",
								// 动画主函数
								main:function(dom){
									// 每一帧改变导航模块容器left值
									dom.css("left",this.tween*-50+"px");
								},
								// 动画结束时回调函数
								end:function(){
									// 设置箭头icon为打开状态(删除is-close)类
									$this.addClass("is-close");
									// 设置则边导航模块动画配置数据开关为关闭状态(此时可继续进行模块显隐动画交互)
									M.setConf("slideBarCloseAnimate",false);
								}
							});
						}
					})
			}
		};
			/*// 第二种，可以在对象末尾处遍历内部对象C中的每一个方法并执行
			for(var i in C){
				// 如果模块方法存在则执行
				C[i] && C[i]();
			}*/
		// 为则边导航模块添加交互与动画特效
		C.initSlideBar();
	}();
})