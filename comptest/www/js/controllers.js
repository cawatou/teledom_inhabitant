angular.module('starter.controllers', [])
	.controller('AppCtrl', function ($scope, $scope, $state, $ionicPopup, AuthService, AppopenService, AUTH_EVENTS) {


		$scope.goHome = function(){
			$state.go("main.dash");
		};

		$scope.user = AuthService.user();

		$scope.setCurrentUser = function (user) {
			$scope.user = user;
		};

		$scope.openDoor = function () {
			AppopenService.open().then(function (data) {

			})
		};

	})
	.controller('PhoneCallCtrl', function($scope, $timeout, socketIO) {

		var body = document.body;
		body.classList.add("enter");

	var l = null,	u = createUUID(),
	v = document.getElementById('localVideo'),
	r = document.getElementById('remoteVideo'),
	constraints = {
		video: {
			 width: 160,
			 height: 120,
			 //frameRate: 1,
			 //aspectRatio: 4/3
		},
		audio: true
	},
	peerConnectionConfig = {
	  'iceServers': [
	    {'urls': 'stun:stun.l.google.com:19302'},
	    {'urls': 'turn:185.22.235.182:3478', 'credential': 'teledom', 'username': 'teledom'}
	  ]
	};


  var swipeThreshold = 100;
	var swipeDuration = 500;
	var btAnswer = new Draggabilly(document.querySelector('.answer'), { axis: "x" });
	var btHangup = new Draggabilly(document.querySelector('.notanswer'), { axis: "x" });
	var btDoor = new Draggabilly(document.querySelector('.door'), { axis: "y" });

	btAnswer.on( 'dragMove', function() {
		var x = Math.floor(this.position.x);
		console.log("Answer dragMove " + x);
		if (x > swipeThreshold) {
			btAnswer.disable();
			btHangup.disable();
			btHangup.on( 'pointerDown', function() {
				stop($scope.isAnswer);
			});
			answer();
		}
	});
	btAnswer.on( 'dragEnd', function() {
		var x = Math.floor(this.position.x);
		console.log("Answer dragEnd " + x);
		if (x < (swipeThreshold + 1)) {
			$('.answer').animate({
				left: 0
			}, swipeDuration);
		}
	});

	btHangup.on( 'dragMove', function() {
		var x = -1 * Math.floor(this.position.x);
		console.log("Hangap dragMove " + x);
		if (x  > swipeThreshold) {
			btHangup.disable();
			stop($scope.isAnswer);
		}
	});
	btHangup.on( 'dragEnd', function() {
		var x = Math.floor(this.position.x);
		console.log("Hangup dragEnd " + x);
		if (x < (swipeThreshold + 1)) {
			$('.notanswer').animate({
				left: 0
			}, swipeDuration);
		}
	});

	btDoor.on( 'dragMove', function() {
		var y = -1 * Math.floor(this.position.y);
		console.log("Door dragMove " + y);
		if (y  > swipeThreshold) {
			btDoor.disable();
			socketIO.emit('door', {uuid: u});
			stop(true);
		}
	});
	btDoor.on( 'dragEnd', function() {
		var y = Math.floor(this.position.y);
		console.log("Door dragEnd " + y);
		if (y < (swipeThreshold + 1)) {
			$('.door').animate({
				top: 0
			}, swipeDuration);
		}
	});

	if ( navigator.mediaDevices.getUserMedia ) {
	  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
			l = stream;
			v.srcObject = stream;
			start(true);
		}).catch(log);
	} else {
	  log('Your browser does not support getUserMedia API');
	}

	var newPeer = function() {
	  var pc = new RTCPeerConnection(peerConnectionConfig);

	  pc.ondatachannel = function(e) {
			e.channel.onclose = function() {
				stop(false);
			}
		};

	  pc.ontrack = function(e) {
			r.srcObject = e.streams[0];
		};

	  pc.oniceconnectionstatechange = function(e) {
			log(pc.iceConnectionState);
		};

	  pc.onicecandidate = function(e) {
			 socketIO.emit("candidate", { ice: e.candidate, uuid: u });
		 };

	  return pc;
	};

	var pc = null;

	$scope.isAnswer = false;

	var start = function(e) {
		console.log("on start");

		window.ringtonePlugin.start();

		muteAu(true);
		muteVi(false);

		pc = newPeer();
		pc.addStream(l);

 		if ( e ) {
			pc.createDataChannel("close").onclose = function() {
				stop(false);
			}
			pc.createOffer().then(function(offer) {
				pc.setLocalDescription(offer).then(function() {
					socketIO.emit("offer", { sdp: pc.localDescription, uuid: u });
				}).catch(log);
			}).catch(log);
		}
	};

	var answer = function() {
		console.log("click answer");
		$scope.$apply(function() {
			$scope.isAnswer = true;
			$scope.muteAu(false);
		});
		window.ringtonePlugin.stop();
	};

	var stop = function(e) {
		console.log("click decline");
		if ( e ) {
			socketIO.emit('hangup', {uuid: u});
		} else {
			window.ringtonePlugin.stop();
		}
		$timeout(function() {
			if ( e ) {
				socketIO.disconnect();
				if ( pc != null) {
					pc.close();
					pc = null;
				}
			}
			navigator.app.exitApp();
		}, 500);
	};

	var sdpHandler = function(msg) {
		pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(function() {
			if (msg.sdp.type == "offer") {
				pc.createAnswer().then(function(answer) {
					pc.setLocalDescription(answer).then(function() {
						socketIO.emit("answer", { sdp: pc.localDescription, uuid: u })
					}).catch(log);
				}).catch(log);
			}
		}).catch(log);
	};

	socketIO.on("offer", function(msg) {
		if (pc == null) {
			$scope.start(false);
		};
		sdpHandler(msg);
	});
	socketIO.on("answer", function(msg) {
		sdpHandler(msg);
	});
	socketIO.on("candidate", function(msg) {
		if ( msg.ice ) {
			pc.addIceCandidate(new RTCIceCandidate(msg.ice)).catch(log);
		}
	});
	socketIO.on("hangup", function(msg) {
		stop(false);
	});

	var muteAu = function(bool) {
		$scope.isMuteAu = bool;
		l.getAudioTracks()[0].enabled = !bool;
	};
	$scope.muteAu = function(bool) {
		muteAu(bool);
		socketIO.emit("microphone", {mute: bool, uuid: u});
	};

	var muteVi = function(bool) {
		$scope.isMuteVi = bool;
		l.getVideoTracks()[0].enabled = !bool;
	};
	$scope.muteVi = function(bool) {
		muteVi(bool);
		socketIO.emit("video", {mute: bool, uuid: u});
	};

	// Strictly speaking, it's not a real UUID, but it gets the job done here
	function createUUID() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	var log = function(msg) {
		console.log(msg);
	}

})
	.controller('LoginPhoneCtrl', function ($scope, $rootScope, $state, $ionicPopup, AuthService, $timeout, PudnubProvider) {
		var phone = '';
		$scope.getCode = function () {
			$scope.loading = true;
			phone = this.phone;
			PudnubProvider.publish({
				'phone': phone,
				'event': 'mobile_getcode'
			});
		}
		$rootScope.$on("pubnub_err", function (event, src) {
			$scope.loading = false;
		})
		$rootScope.$on("mobile_getcode", function (event, src) {
			$scope.loading = false;
			var status = src.status,
				msg = src.data;
			if (status == 'success') {
				$state.go('login.code', {
					'login': true,
					'phone': phone
				});
			} else {
				$ionicPopup.alert({
					title: 'Ошибка авторизации',
					template: 'Проверьте правильность введенного телефона или зарегистрируйтесь в системе TELEDOM'
				});
			}
		});

		var body = document.body;
		body.classList.add("enter");
		

	})
	.controller('LoginCodeCtrl', function ($scope, $rootScope, $state, $timeout, $ionicHistory, $ionicPopup, AuthService, PudnubProvider) {
		$scope.login = true;
		var code = '';
		$scope.testCode = function (code) {
			$scope.loading = true;
			code = this.code;
			PudnubProvider.publish({
				'phone': $state.params.phone,
				'code': code,
				'event': 'mobile_checkcode'
			});
		}

		$rootScope.$on("pubnub_err", function (event, src) {
			$scope.loading = false;
		})
		$rootScope.$on("mobile_checkcode", function (event, src) {
			$scope.loading = false;
			var status = src.status,
				msg = src.data;
			if (status == 'success') {
				PudnubProvider.updateClient({
					pubChannel: msg.token
				});
				AuthService.authorize()
			} else {
				$ionicPopup.alert({
					title: 'Ошибка авторизации',
					template: 'Проверьте правильность введенного телефона или зарегистрируйтесь в системе TELEDOM'
				});
			}
		});
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('CountersDashCtrl', function ($scope, $state, $ionicHistory, CountersService, AuthService) {
		$scope.user = AuthService.user();

		function getCurrentMonth() {
			var date = new Date();
			return date.getMonth();
		}

		$scope.bill = null;
		$scope.startMonth = $scope.currentMonth = getCurrentMonth();
		$scope.getPrice = function (counter) {
			return counter.delta * counter.price;
		};
		$scope.setMonth = function (month) {
			CountersService.getCounters(month).then(function (data) {
				$scope.counters = data;
				$scope.currentMonth = month;
				if ($scope.currentMonth !== getCurrentMonth()) {
					$scope.bill = 0;
					for (var counter in data) {
						var price = data[counter].delta ? data[counter].delta * data[counter].price : data[counter].price;
						$scope.bill += price;
					}
					$scope.canPay = true;
				} else {
					$scope.canPay = false;
				}
			});
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('CountersEditCtrl', function ($scope, $state, $timeout, $cordovaActionSheet, CountersService, $ionicHistory, AuthService) {
		$scope.user = AuthService.user();
		var actionSheetOptions = {
			title: 'Выберете изображение',
			buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
			addCancelButtonWithLabel: 'Отмена',
			androidEnableCancelButton: true,
		};
		$scope.counter = $state.params.counter;
		$scope.prepareCounterValue = function (value) {
			var prepvalue = value * 100,
				prepvalue = prepvalue.toString();
			if (prepvalue.length < 8) {
				while (prepvalue.length != 8) {
					prepvalue = '0' + prepvalue;
				}
			}
			return prepvalue.split('');
		}
		$scope.editRoomName = function (room) {
			room.edit = true;
			$timeout(function () {
				document.getElementById('room-' + room.id).focus();
			})
		}
		$scope.confirmRoomName = function (room) {
			delete room.edit;
		}
		$scope.editCounterName = function (room, counter) {
			counter.edit = true;
			$timeout(function () {
				document.getElementById('counter-' + room.id + '-' + counter.id).focus();
			})
		}
		$scope.confirmCounterName = function (counter) {
			delete counter.edit;
		}
		$scope.addPhoto = function () {
			$cordovaActionSheet.show(options).then(function (btnIndex) {});
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('CountersRoomEditCtrl', function ($scope, $state, $timeout, $ionicHistory, $cordovaActionSheet, CountersService, AuthService) {
		$scope.user = AuthService.user();
		var actionSheetOptions = {
			title: 'Выберете изображение',
			buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
			addCancelButtonWithLabel: 'Отмена',
			androidEnableCancelButton: true,
		};
		$scope.room = $state.params.room;
		$scope.prepareCounterValue = function (value) {
			var prepvalue = value * 100,
				prepvalue = prepvalue.toString();
			if (prepvalue.length < 8) {
				while (prepvalue.length != 8) {
					prepvalue = '0' + prepvalue;
				}
			}
			return prepvalue.split('');
		}
		$scope.editRoomName = function (room) {
			room.edit = true;
			$timeout(function () {
				document.getElementById('room-' + room.id).focus();
			})
		}
		$scope.confirmRoomName = function (room) {
			delete room.edit;
		}
		$scope.editCounterName = function (room, counter) {
			counter.edit = true;
			$timeout(function () {
				document.getElementById('counter-' + room.id + '-' + counter.id).focus();
			})
		}
		$scope.confirmCounterName = function (counter) {
			delete counter.edit;
		}
		$scope.addPhoto = function () {
			$cordovaActionSheet.show(options).then(function (btnIndex) {});
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
		$scope.addCounter = function () {
			if ($state.params.counter.types) {
				for (var i = 0; i < $state.params.counter.types.length; i++) {
					var newCounter = {
						value: null,
						edit: true,
						type: $state.params.counter.types[i].type,
						name: $state.params.counter.types[i].name
					};
					newCounter.id = $scope.room.counters ? $scope.room.counters.length + 1 : 1;
					$scope.room.counters.push(newCounter);
				}
			} else {
				var newCounter = {
					name: 'Название счетчика',
					value: null,
					edit: true
				};
				newCounter.id = $scope.room.counters ? $scope.room.counters.length + 1 : 1;
				$scope.room.counters.push(newCounter);
			}
		}
	})
	.controller('CountersRoomAddCtrl', function ($scope, $state, $ionicHistory, $timeout, $cordovaActionSheet, CountersService, AuthService) {
		$scope.user = AuthService.user();
		var actionSheetOptions = {
			title: 'Выберете изображение',
			buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
			addCancelButtonWithLabel: 'Отмена',
			androidEnableCancelButton: true,
		};
		$scope.room = {
			name: 'Название помещения',
			edit: true,
			counters: []
		};
		$scope.prepareCounterValue = function (value) {
			if (typeof value === 'number' && !isNaN(value)) {
				var prepvalue = value * 100,
					prepvalue = prepvalue.toString();
				if (prepvalue.length < 8) {
					while (prepvalue.length != 8) {
						prepvalue = '0' + prepvalue;
					}
				}
				return prepvalue.split('');
			} else if (value === null) {
				return '        '.split('');
			}
		}
		$scope.addCounter = function () {
			if ($state.params.counter.types) {
				for (var i = 0; i < $state.params.counter.types.length; i++) {
					var newCounter = {
						value: null,
						edit: true,
						type: $state.params.counter.types[i].type,
						name: $state.params.counter.types[i].name
					};
					newCounter.id = $scope.room.counters ? $scope.room.counters.length + 1 : 1;
					$scope.room.counters.push(newCounter);
				}
			} else {
				var newCounter = {
					name: 'Название счетчика',
					value: null,
					edit: true
				};
				newCounter.id = $scope.room.counters ? $scope.room.counters.length + 1 : 1;
				$scope.room.counters.push(newCounter);
			}
		}
		$scope.addCounter();
		$scope.editRoomName = function (room) {
			room.edit = true;
			$timeout(function () {
				document.getElementById('room').focus();
			})
		}
		$scope.confirmRoomName = function (room) {
			delete room.edit;
		}
		$scope.editCounterName = function (room, counter) {
			counter.edit = true;
			$timeout(function () {
				document.getElementById('counter-' + counter.id).focus();
			})
		}
		$scope.confirmCounterName = function (counter) {
			delete counter.edit;
		}
		$scope.addPhoto = function () {
			$cordovaActionSheet.show(options).then(function (btnIndex) {});
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('VideoCtrl', function ($scope, $timeout, $ionicHistory, CamerasService) {
		CamerasService.getCameras().then(function (data) {
			$scope.videos = data;
		});
		$scope.playVideo = function (index) {
			for (var i = 0; i < $scope.videos.length; i++) {
				if (i != index) {
					document.getElementById('video-' + i).pause();
					$scope.videos[i].playing = false;
				} else {
					if ($scope.videos[i].playing) {
						document.getElementById('video-' + i).pause();
						$scope.videos[i].playing = false;
					} else {
						document.getElementById('video-' + i).play();
						$scope.videos[i].playing = true;
					}
				}
			}
		};
		$scope.stopVideo = function (index) {
			if ($scope.videos[index].playing) {
				document.getElementById('video-' + index).pause();
				$scope.videos[index].playing = false;
			} else {
				$scope.playVideo(index)
			}
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('VisitorsCtrl', function ($scope, $ionicHistory, AuthService) {
		$scope.newsList = [];
		$scope.visitors = AuthService.user().photo;
		$scope.createDate = function (time) {
			var timeBuffer = time.split(' ');
			return timeBuffer[0].replace('-', '.') + ' в ' + timeBuffer[1];
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('VisitorsSingleCtrl', function ($scope, $state, $ionicHistory) {
		$scope.visitors = $state.params.visitors;
		$scope.activeIndex = $state.params.active;
		$scope.createDate = function (time) {
			var timeBuffer = time.split(' ');
			return timeBuffer[0].replace('-', '.') + ' в ' + timeBuffer[1];
		}
		$scope.options = {
			initialSlide: $scope.activeIndex,
			loop: false,
			'showPager': false,
			speed: 500,
		}
		$scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
			$scope.slider = data.slider;
		});
		$scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
			// $scope.$aplly(function(){
			$scope.activeIndex = data.slider.activeIndex;
			$scope.previousIndex = data.slider.previousIndex;
			// })
		});
		$scope.slideLeft = function () {
			$scope.slider.slidePrev()
		}
		$scope.slideRight = function () {
			$scope.slider.slideNext()
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('ProfileDashCtrl', function ($scope, AuthService, NewsService, $ionicHistory) {
		$scope.user = AuthService.user();
		$scope.toggleVisibility = function (contact) {
			contact.visible = !contact.visible;
		}
	})
	.controller('ProfilePacgajesCtrl', function ($scope, AuthService, PacgajesService, $ionicHistory) {
		$scope.user = AuthService.user();
		PacgajesService.getPacgajes().then(function (data) {
			$scope.pacgajes = data;
		});
		$scope.setActive = function (active) {
			for (var i = 0; i < $scope.pacgajes.length; i++) {
				if (i !== active) {
					$scope.pacgajes[i].active = false;
				}
			}
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('ProfileEditInfoCtrl', function ($scope, $state, $ionicHistory, AuthService) {
		$scope.user = AuthService.user();
		$scope.newItem = {};
		$scope.info = $state.params.info;
		$scope.infoname = $state.params.infoname;
		$scope.addNewItem = function () {
			$scope.info.unshift($scope.newItem.value)
		};
		$scope.removeItem = function (index) {
			$scope.info.splice(index, 1)
		};
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('ServicesDashCtrl', function ($scope, $state, AuthService, OrdersService, $ionicHistory) {
		$scope.user = AuthService.user();
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
		$scope.goTo = function (order) {
			$state.go('main.services.application.current', {
				'order': order
			})
		};

		OrdersService.getOrders().then(function (data) {
			$scope.ordersList = data;
		})
	})
	.controller('ServicesAddCtrl', function ($scope, $state, $ionicActionSheet, $ionicPopup, ImageService, $ionicHistory, AuthService) {
		$scope.activeService = null;
		$scope.user = AuthService.user();
		$scope.service = {};
		$scope.addBackground = function () {
			$scope.hideSheet = $ionicActionSheet.show({
				buttons: [
					{
						text: 'Использовать камеру'
					},
					{
						text: 'Загрузить из библиотеки'
					}
                ],
				buttonClicked: function (index) {
					$scope.addImage(index);
				}
			});
		}

		$scope.addImage = function (type) {
			$scope.hideSheet();
			ImageService.handleMediaDialog(type).then(function (image) {});
		}
		$scope.breakOptions = [{
			name: 'Взрыв'
        }];
		$scope.descriptionOptions = [{
			name: 'Газа'
        }];
		$scope.services = [{
			name: 'Дворник',
			id: 'dvor',
			active: false
        }, {
			name: 'Домофон',
			id: 'domo',
			active: false
        }, {
			name: 'Электрик',
			id: 'elec',
			active: false
        }, {
			name: 'Сантехник',
			id: 'pipe',
			active: false
        }, {
			name: 'Кому-нибудь',
			id: 'any',
			active: false
        }];
		$scope.toggleService = function (id) {
			if ($scope.activeService === id)
				$scope.activeService = null;
			else
				$scope.activeService = id;
			for (var i = 0; i < $scope.services.length; i++) {
				if ($scope.services[i].id !== id) {
					$scope.services[i].active = false;
				}
			}
		};

		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
		$scope.pickedServices = [];
		var myPopup = $ionicPopup.show({
			templateUrl: 'templates/service-add-popup-type.html',
			title: 'Выберите кому отправить заявку',
			scope: $scope,
			buttons: [
				{
					text: 'отмена',
					onTap: function (e) {
						$ionicHistory.goBack();
						return;
					}
                },
				{
					text: 'отправить',
					type: 'button-positive',
					onTap: function (e) {
						$scope.service.type = $scope.activeService;
						if ($scope.activeService)
							return;
					}
                }
            ]
		});
	})
	.controller('ServicesAutocheckCtrl', function ($scope, $state, $ionicHistory, AuthService, AutocheckService) {
		$scope.service = {};
		$scope.user = AuthService.user();
		$scope.service = $state.params.service;
		AutocheckService.getResults($scope.service.number).then(function (data) {
			$scope.results = data;
		});
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('ServicesApplicationDoneCtrl', function ($scope, $state, $ionicHistory, AuthService) {
		$scope.user = AuthService.user();
		$scope.service = $state.params.service;
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('ServicesApplicationCurrentCtrl', function ($scope, $timeout, $state, $ionicPopup, $ionicHistory, AuthService) {
		$scope.order = $state.params.order;
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('DashCtrl', function ($scope, $state, NewsService, CallsService, KeyopenService, AuthService) {

		$scope.doRefresh = function() {
			console.log('Refreshing!');
			
			CallsService.getCalls().then(function (data) {
				$scope.callsList = data;
				$scope.$broadcast('scroll.refreshComplete');
			});

			NewsService.getNews().then(function (data) {
				$scope.newsList = data;
				$scope.$broadcast('scroll.refreshComplete');
			});

			KeyopenService.getItems().then(function (data) {
				$scope.keyopenList = data;
				$scope.$broadcast('scroll.refreshComplete');
			});
		};
			  
		$scope.doRefresh();

		$scope.user = AuthService.user();
		$scope.newsList = [];
		$scope.newsMode = false;
		$scope.checkPrivelegeAndRedirect = function (privelege, redirect, direct) {
			if (!~$scope.user.services.indexOf(privelege)) {
				$state.go('main.profile.pacgajes', {})
			} else {
				$state.go(direct, {})
			}
		}
		$scope.toggleNews = function (news) {
			news.full = !news.full;
			if (news.full) {
				for (var i = 0; i < $scope.newsList.length; i++) {
					if (news != $scope.newsList[i])
						$scope.newsList[i].full = false;
				}
				$scope.newsMode = true;
			} else {
				news.full = false;
				$scope.newsMode = false;
			}
		};
		$scope.resetMode = function () {
			for (var i = 0; i < $scope.newsList.length; i++) {
				$scope.newsList[i].full = false;
			}
			$scope.newsMode = false;
		}

		CallsService.getCalls().then(function (data) {
			$scope.callsList = data;
		})

		NewsService.getNews().then(function (data) {
			$scope.newsList = data;
		})

		KeyopenService.getItems().then(function (data) {
			$scope.keyopenList = data;
		})

		$scope.goTo = function (news) {
			$state.go('main.news.current', {
				'news': news
			})
		};
		var body = document.body;
		body.classList.remove("enter");
	})
	.controller('NewsCurrentCtrl', function ($scope, $timeout, $state, $ionicPopup, $ionicHistory, AuthService) {
		$scope.news = $state.params.news;
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('NewsAddCtrl', function ($scope, $ionicActionSheet, NewsService, ImageService, $ionicHistory, $filter) {
		$scope.article = {
			types: ['photo', 'share'],
		};
		var date = new Date();
		$scope.article.date = $filter('date')(date, 'dd.MM.yy');
		$scope.article.time = $filter('date')(date, 'hh:mm');
		$scope.article.color = '#fff';
		$scope.article.bg = null;

		$scope.addBackground = function () {
			$scope.hideSheet = $ionicActionSheet.show({
				buttons: [
					{
						text: 'Использовать камеру'
					},
					{
						text: 'Загрузить из библиотеки'
					}
                ],
				buttonClicked: function (index) {
					$scope.addImage(index);
				}
			});
		}

		$scope.addImage = function (type) {
			$scope.hideSheet();
			ImageService.handleMediaDialog(type).then(function (image) {
				var elem = document.getElementById('articlebg')
				elem.style.backgroundImage = 'url(' + image + ')';
				$scope.$apply();
				$scope.article.bg = image;
			});
		}
		$scope.colors = ['#fff', '#000', '#E41139', '#F6A623', '#F8E81C', '#BD0FE1', '#09A9EC'];
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AirkeyCtrl', function ($scope, $ionicHistory) {
		$scope.airkey = {
			door: true,
			car: false
		}
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('BalanceDashCtrl', function ($scope, $ionicHistory) {
		$scope.cards = [{
			start: 4313,
			end: 3242,
			type: 'VISA',
			id: 1
        }, {
			start: 4313,
			end: 3242,
			type: 'MASTER CARD',
			id: 2
        }, {
			start: 4313,
			end: 3242,
			type: 'MIR',
			id: 3
        }, {
			start: 4313,
			end: 3242,
			type: 'VISA',
			id: 4
        }]
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('BalanceCardCtrl', function ($scope, $state, $ionicHistory) {
		$scope.card = $state.params.card;
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('BalancePayCtrl', function ($scope, $ionicHistory, MethodsMethod) {
		MethodsMethod.getMethods().then(function (data) {
			$scope.methods = data;
		});
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('BalanceAddCtrl', function ($scope, $state, $ionicHistory) {
		$scope.id = $state.params.id;
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AdvHelloCtrl', function ($scope, $ionicHistory) {
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AdvAddCardCtrl', function ($scope, $ionicHistory) {
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AdvAddCamerasCtrl', function ($scope, $ionicHistory) {
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AdvAddVisitorsCtrl', function ($scope, $ionicHistory) {
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('AdvAddAirKeyCtrl', function ($scope, $ionicHistory) {
		$scope.goBack = function () {
			$ionicHistory.goBack();
		}
	})
	.controller('FireCtrl', function ($ionicPlatform) {
		window.ringtonePlugin.start();
		var body = document.body;
		body.classList.add("enter");
		$ionicPlatform.registerBackButtonAction(function (event) {
			event.preventDefault();
			window.ringtonePlugin.stop();
			navigator.app.exitApp();	
		}, 100);
	})

	.controller('UfoCtrl', function () {
		window.ringtonePlugin.start();
		var body = document.body;
		body.classList.add("enter");
		$ionicPlatform.registerBackButtonAction(function (event) {
			event.preventDefault();
			window.ringtonePlugin.stop();
			navigator.app.exitApp();	
		}, 100);
	})
	;
	
