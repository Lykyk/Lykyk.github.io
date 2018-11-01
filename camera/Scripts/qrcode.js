$(function(){  
	document.title="作答环境检测";
	var type = Number(getRequest().type);
	window.BSGlobal = window.BSGlobal || {};
	if (window.location.hostname == 'assistant.ceping.com') {
	    BSGlobal.env = "Production"
	}
	BSGlobal.testUrls = BSGlobal.env == "Production" ? [
				'//stnewcp03.beisen.com/ux/tools-assessment/release/app/images/checkIcon.png',
				'//transfer.ceping.com/checkIcon.png',
				'//assistant.ceping.com/checkIcon.png',
				'//cache.beisen.com/checkIcon.png',
				'//catchoice.ceping.com/checkIcon.png'
	] : [
				'//catchoice.ceping.com.cn/checkIcon.png',
				'//assessmonitor.ceping.com.cn/checkIcon.png',
				'//stnewcp03.beisen.com/ux/tools-assessment/release/app/images/checkIcon.png'
	]
	var imgGuid="";
	testType(type);
	$(".test-list li").click(function(){
		var type=Number($(this).attr("data-type"));
		testType(type);
		$(this).addClass('active')
				.siblings().removeClass('active');
	})
	$(".back").click(function(){
		window.location.href='/home';
	})
	$(".lan_head ul li").click(function(){
		$(this).addClass('active_lan').siblings().removeClass("active_lan");
		var index=$(this).index();
		$(".active_item .common_lan_box").eq(index).addClass("active_box")
											.siblings().removeClass("active_box");
		$(".right_wrap").height($(".common_lan_box").height())
	})
	$(".re_test_btn a").click(function(){
		window.netStatus={
			ping:{
				isEnd:false,
				result:false
			},
			speed:{
				isEnd:false,
				result:0
			}
		};
		doPing(BSGlobal.testUrls);
		testWebSpeed();
	})
	$(".preview_button").click(function(){
		//添加遮罩效果
		$('body').append("<div class='img_bg_wrap'></div>");
		$('body').css('overflow','hidden');
			var str='<div class="img_wrap">'+
	                	'<span class="close_pop"></span>'+
	                	'<div class="upload_wrap"></div>'+
	                	'<div style="text-align:center"><span class="submit">确定</span></div>'+
            		'</div>';
            	$(".img_bg_wrap").html(str);
		$.ajax({
            type: "post",
            url: "/ImgDetection/GetImgUrl",
            data: {userGuid:imgGuid},
            success: function(data) {
            	if(data.Result){
            		$(".upload_wrap").html("<img class='upload_img' src=''/>");
	            	$(".upload_img").attr("src",data.Data);
            	}else{
            		$(".upload_wrap").html('<div class="upload_err">请先按前面步骤上传照片后再预览。</div>');
            	}
            }
            ,error: function(msg) {
               $(".upload_wrap").html("<p class='upload_err'>上传失败，请重新上传或更换手机重试！</p>");
            }
   		});
	})
	//点击提交或者叉号，遮罩效果关闭
	$(document).on('click','.submit,.net_sure',function(){$(".img_bg_wrap").remove();$('body').css('overflow','auto');})
	           .on('click','.close_pop',function(){$(".img_bg_wrap").remove();$('body').css('overflow','auto');})
	function getRequest() { 
			var url = location.href; //获取url中"?"符后的字串 
			var theRequest = new Object(); 
			if (url.indexOf("?") != -1) { 
			var str = url.substr(1); 
			var strs = str.split("?"); 
			for(var i = 0; i < strs.length; i ++) { 
				theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]); 
			} 
		} 
		return theRequest; 
	} 
	function testType(type){
		$(".test-box").eq(type-1).addClass("active_item").siblings().removeClass("active_item");
		$(".test-list li").eq(type-1).addClass("active").siblings().removeClass("active");
		switch (type){
			case 1:	
				testDeviceCamera();		
			break;
			case 2:
				testUpdatePictrue();
			break;
			case 4:
				window.netStatus={
					ping:{
						isEnd:false,
						result:false
					},
					speed:{
						isEnd:false,
						result:0
					}
				};
				doPing(BSGlobal.testUrls);
				testWebSpeed();
			break;
		}
	}
	function DgetPopNoMediDes(){
		var hostname = location.hostname;
			var str = "<div class='tip nomedia-error-pop'>"+
						"请点击地址栏右侧的"+"<span class='media-icon'></span>"+"图标，在弹出的对话框中选择"+
						'"始终允许'+hostname+'使用您的摄像头"，'+
			 				"然后刷新页面。</br>"+
			 			"如果没有任何提示，"+
			 				"请确认您的电脑有可用的摄像头。"+
					"</div>";
			return str;
	}
	function getDownLoad(){
		var downLoadUrl="";
		downLoadUrl="<a target='_black'  href='https://www.baidu.com/s?wd=chrome'>点此下载</a>";
		return downLoadUrl;
	}
	 // 兼容调取摄像头api 并兼容
	 function promisifiedOldGUM(constraints){ 
		var getUserMedia = (navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia);
	  
		if(!getUserMedia) {
		  return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
		}
	  
		return new Promise(function(resolve, reject) {
		  getUserMedia.call(navigator, constraints, resolve, reject);
		});
			  
	}
	function testDeviceCamera(){ 
		var broswer=$.browser;
			var uA =  navigator.userAgent.toLowerCase();
			var version,text;
			var downLoadUrlStr=getDownLoad();
			var chromeTest =  /(chrome)(?:.*version)?[ \/]([\w.]+)/;
			var match = chromeTest.exec(uA) || [];
			
			if(navigator.mediaDevices === undefined) {
				navigator.mediaDevices = {};
			}
			if(navigator.mediaDevices.getUserMedia == undefined) {
				navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
			}
				
            window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
				if(match[1] == 'chrome' && match[2]){
					version = match[2];
			}
			$('.active_item').addClass('media-container');
			if(navigator.vendor != 'Google Inc.' || (version && parseInt(version) <42)){
				text = "<div class='wrap'><p>请下载安装最新版本的Chrome浏览器</p>"+
				       "<div class='mes_tip' style='color:#999'>您正在使用的浏览器不支持视频监控，将无法作答</div>"+
				       "<div class='mes_tip' style='margin-top:10px;color:#999'>如果你使用的是双核浏览器，请切换到极速核心后再试</div>"+
				       "<div class='border_wrap'><span class='chrome_ico'></span><span style='margin-right:38px'>Chrome</span><span class='downLoad_button'>"+downLoadUrlStr+"</span></div></div>"
				$(".active_item").empty().html(text).show();
			}else if(navigator.mediaDevices.getUserMedia){
				navigator.mediaDevices.getUserMedia({
            	   video:true
            	}).then(function(stream){
            		successCallback(stream);
            	}).catch(function(err){
            		videoFailedCallback();
				});
			}else{
				noSupportCallback();
			}
	}

	function isPhotoPass(a, b, c) {
        var e = _getColorData(a, b, c);
        var f = e.total
        var g = e.data;
        if (0 === f || g.length < 30)
            return !1;
        g.sort(function(a, b) {
            return b - a
        });
        g.length = 10;
        var h = 0;
        g.forEach(function(a) {
            h += a || 0
        });
        return 0.75 > h / f
    }

	function _getColorData(a, b, c, d, e) {
        function f(a) {
            return (10 > a ? "__" : 100 > a ? "_" : "") + a
        }
        for (var h = _getCanvas(a, b, c), i = h.getContext("2d"), j = i.getImageData(0, 0, b, c, d, e), k = j.data || [], l = 124, m = Math.ceil(k.length / l), n = {}, o = [], p = 0, q = k.length; q > p; p += l) {
            var r = f(k[p]) + f(k[p + 1]) + f(k[p + 2]);
            !n[r] && (n[r] = {
                index: o.length,
                value: 0
            });
            var s = n[r];
            s.value++;
            o[s.index] = s.value
        }
        return {
            total: m,
            data: o
        }
    }

	function _getCanvas(a, b, c) {
			//if (a = B(a).get(0)) {
				var d = document.createElement("canvas");
				d.width = b;
				d.height = c;
				var e = d.getContext("2d");
				e.drawImage(a[0], 0, 0, b, c );
				return d
		// }
	}
	function successCallback(stream){
			window._assessmentStreamRef = stream;
			window.openGamera  = true;
			// $(".microphone_ico").removeClass("microphone_err_ico").show();
			$('.mess').hide();
			var video = $('video')[0];
			video.height=300;
			video.width = 400;
			if(typeof video.srcObject !== 'undefined'){
				video.srcObject = stream;
			}else if(video.mozSrcObject!==undefined){
				video.mozSrcObject = stream;
			}else{
				video.src = (window.URL&&window.URL.createObjectURL(stream))||stream; 
				localMediaStream=stream;
			}
			$('.active_item .status_result').text('已检测到摄像头').css({
				color:'#333333'
			}).show();
			$(".active_item .status_ico").addClass("status_ico_succes");
			video.play();
			setInterval(function(){
				var isPhotoPass_ = isPhotoPass($(video),$(video).width(),$(video).height());
				if(!isPhotoPass_ && !$('.status_ico_err')[0]){
					$('.media-container').find('.common_status')
					.append(generatePicErrorTip())
				}
				if(isPhotoPass_){
					$('.errorTip_container').remove()
				}
			},1000)

	}

	function generatePicErrorTip(){
		var str = '<div class="errorTip_container">'
				+'<span class="status_ico status_ico_err"></span>'
				+'<span class="status_result" style="color: #333333;">检测到图像异常</span>'
				+'<div class="suggestionContainer">'
				+'<div><span>建&emsp;&emsp;议：</span><span class="first">重启电脑/更换设备或咨询北森客服</span></div>'
				+'<div><span>可能原因：</span><span class="first">摄像头被占用/摄像头驱动异常</span></div></div>'
				+'</div>';
		return str;
	}

	function videoFailedCallback(){
		var mediaMess=DgetPopNoMediDes();
		$('.mess').html(mediaMess).show();
			var video = $('video')[0];
			video.height=300;
			video.width = 400;
			video.style.backgroundColor="#000";
			$('.active_item .status_result').text('检测到摄像头无法正常工作').css("color","#333333").show();
			$(".active_item .status_ico").removeClass("status_ico_succes").addClass("status_ico_err");
			// $(".microphone_ico").addClass("microphone_err_ico");

	}
	function noSupportCallback(){
			window.isRejectGamera=true;
		}
	function testUpdatePictrue(){
		imgGuid=guid();
     	$(".qrcode-wrap img").attr("src","/ImgDetection/GetBarcode?userGuid="+imgGuid);
	}
	function guid(){
		return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
	}
	function S4(){
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
	function testWebSpeed(){
		 EnvDetect().getNetworkSpeed().done(function(resp){
			 $('.dete').text('kb/s').css('color','#000');
			  $(".true_speed").text(resp);
			var ping=window.netStatus.ping;
			window.netStatus.speed.isEnd=true;
			if(Number(resp)>100){
				window.netStatus.speed.result=true;
			}else{
				window.netStatus.speed.result=false;
			}
			if(ping.isEnd){
				responseForNetstatus(window.netStatus);
			}
		 })
	}

	function request_image(url,dtd) {
			var img = new Image();
            img.onload = function() { dtd.resolve(img); };
            img.onerror = function() { dtd.reject(url); };
			img.src = url + '?random-no-cache=' + Math.floor((1 + Math.random()) * 0x10000).toString(16);
			return dtd;
	}

	function pingWebServer(url){
		var start = (new Date()).getTime();
		var ping_dtd=$.Deferred();
		var img_dtd=$.Deferred();
		$.when(request_image(url,img_dtd)).done(function(){
			ping_dtd.resolve()
		}).fail(function(){
			ping_dtd.reject()
		});
		setTimeout(function() { ping_dtd.reject('超时'); }, 1000);
		return ping_dtd;
	}

	function doPing(urls){
		var flag=true;
		var pingNcount = 0;
		for(var i=0;i<urls.length;i++){
			if(flag){
				$.when(pingWebServer(urls[i])).done(function(){
					console.log('ok network');
					pingNcount++;
					window.netStatus.ping.result=flag;
					if(pingNcount===urls.length){
						window.netStatus.ping.isEnd=true;
						if(window.netStatus.speed.isEnd==true){
							responseForNetstatus(window.netStatus)
						}
					}
				}).fail(function(error){
					flag=false;
					window.netStatus.ping.result=flag;
					window.netStatus.ping.isEnd=true;
					if(window.netStatus.speed.isEnd==true){
						responseForNetstatus(window.netStatus)
					}
				})
			}else{
				break;
			}
		}
		return flag;
	}

	function responseForNetstatus(status){
		//如果两个条件都满足
		if(status.ping.result && status.speed.result){
			$('.active_item .status_result').text('正常').css("color","#5bbcee").show();
			$(".active_item .status_ico").addClass("status_ico_succes");
			$(".active_item .true_speed").css('color','#5bbcee');
			$('.net_status').text('正常').css('color','#484848');
			$('.changeNetwork').text('无').css('color','#484848');
			$('.test_speed').text("为了保证答题顺利,建议活动开始前30min再次检测网速.");
		}
		//如果ping不通
		if(!status.ping.result){
			$('.active_item .status_result').text('异常').css("color","red").show();
			$(".active_item .status_ico").removeClass("status_ico_succes").addClass("status_ico_err");
			$(".active_item .true_speed").css('color','#5bbcee');
			$('.test_speed').text("请更换网络较好的场所重新检测.");
			$('.changeNetwork').text('更换网络').css({
				color:'#0084ff'
			})
			$('.net_status').text('不稳定').css('color','#fc5454');
			   
		}
		//如果速度不合格
		if(!status.speed.result){
			$('.active_item .status_result').text('异常').css("color","red").show();
			$(".active_item .status_ico").removeClass("status_ico_succes").addClass("status_ico_err");
		   	$(".active_item .true_speed").css('color','#fc5454');
			$('.test_speed').text("请更换网络较好的场所重新检测.");
			$('.net_status').text('正常').css('color','#484848');
			$('.changeNetwork').text('无').css('color','#484848');
		}

		if(!status.speed.result && !status.ping.result){
			$('.active_item .status_result').text('异常').css("color","red").show();
			$(".active_item .status_ico").removeClass("status_ico_succes").addClass("status_ico_err");
		   	$(".active_item .true_speed").css('color','#fc5454');
			$('.test_speed').text("请更换网络较好的场所重新检测.");
			$('.changeNetwork').text('更换网络').css({
				color:'#0084ff'
			});
			$('.net_status').text('不稳定').css('color','#fc5454');
		}
	}
	//网络提醒弹框
	$('.changeNetwork').on('click',function(){
		//添加遮罩效果
		$('body').append("<div class='img_bg_wrap'></div>");
		$('body').css('overflow','hidden');
		var str='<div class="net_wrap">'+
	                '<span class="close_pop"></span>'+
					'<div class="content_wrap">'+
					'<div class="tip_image"></div>'+
					'<div class="tip_content">检测到您当前网络存在波动，会有可能影响您的作答</div>' +
					'<div class="tip_more-image"></div>'+
					'<div class="tip_advice">建议您开启移动热点，使用您手机作移动热点并与电脑分享您的网络连接，或者更换其他网络</div>'+
	                '</div><div style="text-align:center"><span class="net_sure">确定</span></div>'+
            		'</div>';
        $(".img_bg_wrap").html(str);
	})

})