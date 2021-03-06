// MVP即模型(Model)--视图(View)--管理器(Presenter):View层不直接应用model层内的数据，而是通过presenter层实现对Model层内的数据访问。
// 即所有层次的交互都发生在Presenter层中
// MVP模块
~(function(){
	// MVP构造函数
	var MVP =function(){};
	// 数据层
	MVP.model = function(){
		var M = {};
		M.data = {
			// 导航木块渲染数据
			nav : [
			{
				text:"新闻头条",
				mode:"news",
				url:"http://www.example.com/01"
			},
			{
				text:"最新电影",
				mode:"movie",
				url:"http://www.example.com/02"
			},
			{
				text:"热门游戏",
				mode:"game",
				url:"http://www.example.com//03"
			},
			{
				text:"今日特价",
				mode:"price",
				url:"http://www.example.com/04"
			}
			]
		};
		M.conf = {};
		return {
			getData: function (m){
				return M.data[m];
			},
			/***
			*设置数据
			*@param m 模块名称
			*@param v 模块数据
			*
			*/
			setData:function(m,v){
				M.data[m]=v;
				return v;
			},
			getConf:function(c){
				return M.conf[c];
			},
			/***
			*设置配置
			*@param c 配置名称
			*@param v 配置项值
			*/
			setConf:function(c,v){
				M.conf[c] = v;
				return v;
			}
		}
	}();
	// 视图层
	MVP.view = function(){
		// 子元素或者兄弟元素替换模板
		var REPLACEKEY = "_REPLACEKEY_";
		/***
		*获取完整元素模板
		*@param str 元素字符串
		*@param type 元素类型
		*/
		function getHTML(str,type){
			// 简化实现，只处理字符串中第一个{}里面的内容
			// 'li.@mode @choose @last[data-mode=@mode]>a#nav_@mode.nav-@mode[href=@url title=@text]>i.nav-icon-@mode+span{@text}'
			return str
						.replace(/^(\w+)([^\{\}]*)?(\{([@\w]+)\})?(.*?)$/,function(match,$1,$2,$3,$4,$5){
							// 元素属性参数容错处理
							$2 =$2 ||"";
							// {元素内容}参数容错处理
							$3 =$3 || "";
							// 元素内容参数容错处理
							$4 = $4 || "";
							// 去除元素内容后面添加的元素属性中的{}内容
							$5 = $5.replace(/\{([@\w+])\}/g,"");
			// 以str=div举例，如果div元素有子元素则表示成<div>_REPLACEKEY_,否则表示成<div></div>
							return type === "in"?
								'<'+ $1 + $2 + $5 +'>'+ $4 +REPLACEKEY +'</'+$1+'>':type ==="add"?
								'<'+ $1 + $2 + $5 +'>'+ $4 +'</'+$1+'>'+REPLACEKEY:
								'<'+ $1 + $2 + $5 +'>'+ $4 +'</'+$1+'>';
						})
						// 处理特殊标志#--id属性
						.replace(/#([@\-\w]+)/g,' id="$1"')//<li.@mode @choose ></li>
						// 处理特殊标志.--class属性
						.replace(/\.([@\-\s\w]+)/g,' class="$1"')
						// 处理其他属性组
						.replace(/\[(.+)\]/g,function(match,key){
							// 元素属性组
							var a =key 
									// 过滤其中引号
									.replace(/'|"/g,'')
									// 以空格分组
									.split(' '),
								h='';
						// 遍历属性组
						for(var j = 0, len = a.length; j < len; j++){
							// 处理并拼接每一个属性
							h+=' '+a[j].replace(/=(.*)/g,'="$1"');
						}
						// 返回属性组模板字符串
						return h;
						})
						// 处理可替换内容，可根据不同模板渲染引擎自由处理
						.replace(/@(\w+)/g,'{#$1#}');
		}
		/****
		*数组迭代器
		*@param arr 数组
		*@param fn 回调函数
		*/
		function eachArray(arr,fn){
			// 遍历数组
			for(var i =0,len = arr.length;i < len;i++){
				// 将索引值、索引对应值、数组长度传入回调函数中并执行
				fn(i,arr[i],len);
			}
		}
		/***
		*替换兄弟元素模板或者子元素模板
		*@param str 原始字符串
		*@param rep 兄弟元素模板或者子元素模板
		*/
		function formateItem(str,rep){
			// 用对应元素字符串替换兄弟元素模板或者子元素模板
			return str.replace(new RegExp(REPLACEKEY,"g"),rep);
		}
		// 模板解析器
		return function(str){
			// 模板层级数组
			var part = str
			// 去除首尾空白符
			.replace(/^\s+|\s+$/g,"")
			// 处处>两端的空白符
			.replace(/^\s+(>)\s+/g,"$1")
			// 以>分组
			.split(">"),
			// 模块视图根模板
				html = REPLACEKEY,
			// 同层元素
				item,
			// 统计元素模板
			nodeTpl;
			// 遍历每组元素
			eachArray(part,function(partIndex,partValue,partLen){
				// 为同级元素分组
				item = partValue.split("+");
				// 设置同级元素初始模板
				nodeTpl = REPLACEKEY;
				// 遍历同级每一个元素
				eachArray(item,function(itemIndex,itemValue,itemLen){
					// 用渲染元素得到的模板去渲染同级元素模板，此处简化逻辑处理
					// 如果itemIndex(同级元素索引)对应元素不是最后一个 则作为兄弟元素处理
					// 否则,如果partIndex(层级索引)对应的层级不是最后一层 则作为父层级处理(该层级有子层级)否则该元素无兄弟元素，无子元素
					nodeTpl = formateItem(nodeTpl,getHTML(itemValue,itemIndex===itemLen-1?(partIndex===partLen -1?"":"in"):"add"));
				});
				//用渲染子层级得到的模板去渲染父层级模板
				html = formateItem(html,nodeTpl);
			})
			console.log(html);
			// 返回期望视图模板
			return html;
		}
	}();
	// 管理层
	MVP.presenter = function(){
		var V = MVP.view;
		var M = MVP.model;
		var C ={
			/***
			*导航管理器
			*@param M 数据层对象
			*@param V 视图层对象
			*/
			nav: function(M,V){
				// 获取导航渲染数据
				var data = M.getData("nav");
				// 处理导航渲染数据
				// data[0].choose = "choose";
				// data[data.length-1].last = "last";
				// 获取导航渲染模板
				var tpl = V('li.@mode @choose @last[data-mode=@mode]>a#nav_@mode.nav-@mode[href=@url title=@text]>i.nav-icon-@mode+span{@text}');
				console.log(tpl);
				console.log(A.formateString(tpl,data));
				$
				// 创建导航容器
				.create('ul',{
					'class': 'navigation',
					'id': 'nav'
				})
				// 插入导航视图
				.html(
					// 渲染导航视图
					A.formateString(tpl,data)
					)
				// 导航木块添加到页面中
				.appendTo('#container');
				// 其他交互逻辑与动画逻辑
				// ...

			}
		}
		return {
			// 执行方法
			init:function(){
				// 遍历内部管理器
				for(var i in C){
					//执行素有管理器内部逻辑
					C[i] && C[i](M,V,i);
				}
			}
		};
	}();
	// MVP入口,为暴露的MVP对象提供一个入口,入口自动调用presenter的init方法
	MVP.init = function(){
		this.presenter.init();
	}
	// 暴露MVP对象，这样即可在外部访问MVP
	window.MVP =MVP;
})(window);
