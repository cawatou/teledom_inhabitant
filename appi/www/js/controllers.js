angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.user = AuthService.user();

  $scope.setCurrentUser = function(user) {
    $scope.user = user;
  };
})
.controller('PhoneCallCtrl', function($scope, $scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.photo = 'assets/images/chuck.jpg';
})
.controller('LoginPhoneCtrl', function($scope, $rootScope, $state, $ionicPopup, AuthService, $timeout, PudnubProvider) {
  var phone = '';
  $scope.getCode = function(){
    $scope.loading = true;
    phone = this.phone
    PudnubProvider.publish({
        	'phone': '7' + phone,
          'event': 'mobile_getcode'
    });
  }
  $rootScope.$on("pubnub_err", function(event, src) {
    $scope.loading = false;
  })
  $rootScope.$on("mobile_getcode", function(event, src) {
    $scope.loading = false;
    var status = src.status,
      msg = src.data;
    if ( status == 'success' ) {
        $state.go('login.code', {
          'login':true,
          'phone':phone
        });
    } else {
      $ionicPopup.alert({
        title: 'Ошибка авторизации',
        template: 'Проверьте правильность введенного телефона или зарегистрируйтесь в системе TELEDOM'
      });
    }
  });
})
.controller('LoginCodeCtrl', function($scope, $rootScope, $state, $timeout, $ionicHistory, $ionicPopup, AuthService, PudnubProvider) {
  $scope.login = true;
  var code = '';
  $scope.testCode = function(code){
    $scope.loading = true;
    code = this.code;
    PudnubProvider.publish({
          'phone': '7' + $state.params.phone,
          'code': code,
          'event': 'mobile_checkcode'
    });
  }

  $rootScope.$on("pubnub_err", function(event, src) {
    $scope.loading = false;
  })
  $rootScope.$on("mobile_checkcode", function(event, src) {
    $scope.loading = false;
    var status = src.status,
      msg = src.data;
    if ( status == 'success' ) {
      PudnubProvider.updateClient({pubChannel:msg.token});
      AuthService.authorize()
    } else {
      $ionicPopup.alert({
        title: 'Ошибка авторизации',
        template: 'Проверьте правильность введенного телефона или зарегистрируйтесь в системе TELEDOM'
      });
    }
  });
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('CountersDashCtrl', function($scope, $state, $ionicHistory, CountersService, AuthService) {
  $scope.user = AuthService.user();
  function getCurrentMonth (){
    var date = new Date();
    return date.getMonth();
  }
  $scope.bill = null;
  $scope.startMonth = $scope.currentMonth = getCurrentMonth ();
  $scope.getPrice = function(counter){
    return counter.delta * counter.price;
  };
  $scope.setMonth = function(month){
    CountersService.getCounters(month).then(function(data){
      $scope.counters = data;
      $scope.currentMonth = month;
      if($scope.currentMonth !==getCurrentMonth ()){
        $scope.bill = 0;
        for(var counter in data){
          var price = data[counter].delta ? data[counter].delta * data[counter].price : data[counter].price;
          $scope.bill+=price;
        }
        $scope.canPay = true;
      } else {
        $scope.canPay = false;
      }
    });
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('CountersEditCtrl', function($scope, $state, $timeout, $cordovaActionSheet, CountersService, $ionicHistory, AuthService) {
  $scope.user = AuthService.user();
  var actionSheetOptions = {
    title: 'Выберете изображение',
    buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
    addCancelButtonWithLabel: 'Отмена',
    androidEnableCancelButton : true,
  };
  $scope.counter = $state.params.counter;
  $scope.prepareCounterValue = function(value){
    var prepvalue = value*100,
    prepvalue = prepvalue.toString();
    if(prepvalue.length<8){
      while (prepvalue.length!=8) {
        prepvalue = '0' + prepvalue;
      }
    }
    return prepvalue.split('');
  }
  $scope.editRoomName = function(room){
    room.edit = true;
    $timeout(function(){
      document.getElementById('room-'+room.id).focus();
    })
  }
  $scope.confirmRoomName = function(room){
    delete room.edit;
  }
  $scope.editCounterName = function(room,counter){
    counter.edit = true;
    $timeout(function(){
      document.getElementById('counter-' + room.id + '-' + counter.id).focus();
    })
  }
  $scope.confirmCounterName = function(counter){
    delete counter.edit;
  }
  $scope.addPhoto = function(){
    $cordovaActionSheet.show(options).then(function(btnIndex) {
    });
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('CountersRoomEditCtrl', function($scope, $state, $timeout, $ionicHistory, $cordovaActionSheet, CountersService, AuthService) {
  $scope.user = AuthService.user();
  var actionSheetOptions = {
    title: 'Выберете изображение',
    buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
    addCancelButtonWithLabel: 'Отмена',
    androidEnableCancelButton : true,
  };
  $scope.room = $state.params.room;
  $scope.prepareCounterValue = function(value){
    var prepvalue = value*100,
    prepvalue = prepvalue.toString();
    if(prepvalue.length<8){
      while (prepvalue.length!=8) {
        prepvalue = '0' + prepvalue;
      }
    }
    return prepvalue.split('');
  }
  $scope.editRoomName = function(room){
    room.edit = true;
    $timeout(function(){
      document.getElementById('room-'+room.id).focus();
    })
  }
  $scope.confirmRoomName = function(room){
    delete room.edit;
  }
  $scope.editCounterName = function(room,counter){
    counter.edit = true;
    $timeout(function(){
      document.getElementById('counter-' + room.id + '-' + counter.id).focus();
    })
  }
  $scope.confirmCounterName = function(counter){
    delete counter.edit;
  }
  $scope.addPhoto = function(){
    $cordovaActionSheet.show(options).then(function(btnIndex) {
    });
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.addCounter = function(){
    if($state.params.counter.types){
      for(var i = 0 ; i <  $state.params.counter.types.length ; i++){
        var newCounter = {
          value:null,
          edit:true,
          type:$state.params.counter.types[i].type,
          name:$state.params.counter.types[i].name
        };
        newCounter.id =  $scope.room.counters ? $scope.room.counters.length + 1 : 1;
        $scope.room.counters.push(newCounter);
      }
    } else {
      var newCounter = {
        name:'Название счетчика',
        value:null,
        edit:true
      };
      newCounter.id =  $scope.room.counters ? $scope.room.counters.length + 1 : 1;
      $scope.room.counters.push(newCounter);
    }
  }
})
.controller('CountersRoomAddCtrl', function($scope, $state, $ionicHistory, $timeout, $cordovaActionSheet, CountersService, AuthService) {
  $scope.user = AuthService.user();
  var actionSheetOptions = {
    title: 'Выберете изображение',
    buttonLabels: ['Загрузить из библиотеки', 'Использовать камеру'],
    addCancelButtonWithLabel: 'Отмена',
    androidEnableCancelButton : true,
  };
  $scope.room = {
    name:'Название помещения',
    edit:true,
    counters:[]
  };
  $scope.prepareCounterValue = function(value){
    if(typeof value === 'number' && !isNaN(value)){
      var prepvalue = value*100,
      prepvalue = prepvalue.toString();
      if(prepvalue.length<8){
        while (prepvalue.length!=8) {
          prepvalue = '0' + prepvalue;
        }
      }
      return prepvalue.split('');
    } else if (value === null) {
      return '        '.split('');
    }
  }
  $scope.addCounter = function(){
    if($state.params.counter.types){
      for(var i = 0 ; i <  $state.params.counter.types.length ; i++){
        var newCounter = {
          value:null,
          edit:true,
          type:$state.params.counter.types[i].type,
          name:$state.params.counter.types[i].name
        };
        newCounter.id =  $scope.room.counters ? $scope.room.counters.length + 1 : 1;
        $scope.room.counters.push(newCounter);
      }
    } else {
      var newCounter = {
        name:'Название счетчика',
        value:null,
        edit:true
      };
      newCounter.id =  $scope.room.counters ? $scope.room.counters.length + 1 : 1;
      $scope.room.counters.push(newCounter);
    }
  }
  $scope.addCounter();
  $scope.editRoomName = function(room){
    room.edit = true;
    $timeout(function(){
      document.getElementById('room').focus();
    })
  }
  $scope.confirmRoomName = function(room){
    delete room.edit;
  }
  $scope.editCounterName = function(room,counter){
    counter.edit = true;
    $timeout(function(){
      document.getElementById('counter-' + counter.id).focus();
    })
  }
  $scope.confirmCounterName = function(counter){
    delete counter.edit;
  }
  $scope.addPhoto = function(){
    $cordovaActionSheet.show(options).then(function(btnIndex) {
    });
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('VideoCtrl', function($scope, $timeout, $ionicHistory, CamerasService) {
  CamerasService.getCameras().then(function(data){
    $scope.videos = data;
  });
  $scope.playVideo = function(index){
    for(var i = 0; i < $scope.videos.length; i++){
      if( i!= index){
        document.getElementById('video-'+i).pause();
        $scope.videos[i].playing = false;
      } else {
        if($scope.videos[i].playing){
          document.getElementById('video-'+i).pause();
          $scope.videos[i].playing = false;
        } else {
          document.getElementById('video-'+i).play();
          $scope.videos[i].playing = true;
        }
      }
    }
  };
  $scope.stopVideo = function(index){
    if($scope.videos[index].playing){
      document.getElementById('video-'+index).pause();
      $scope.videos[index].playing = false;
    } else {
      $scope.playVideo(index)
    }
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('VisitorsCtrl', function($scope, $ionicHistory, AuthService) {
  $scope.newsList = [];
  $scope.visitors = AuthService.user().photo;
  $scope.createDate = function(time){
    var timeBuffer = time.split(' ');
    return timeBuffer[0].replace('-','.') + ' в ' + timeBuffer[1];
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('VisitorsSingleCtrl', function($scope, $state, $ionicHistory) {
  $scope.visitors = $state.params.visitors;
  $scope.activeIndex = $state.params.active;
  $scope.createDate = function(time){
    var timeBuffer = time.split(' ');
    return timeBuffer[0].replace('-','.') + ' в ' + timeBuffer[1];
  }
  $scope.options = {
    initialSlide:$scope.activeIndex,
    loop: false,
    'showPager':false,
    speed: 500,
  }
  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    $scope.slider = data.slider;
  });
  $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
    // $scope.$aplly(function(){
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
    // })
  });
  $scope.slideLeft = function(){
    $scope.slider.slidePrev()
  }
  $scope.slideRight = function(){
    $scope.slider.slideNext()
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ProfileDashCtrl', function($scope,AuthService, NewsService, $ionicHistory) {
  $scope.user = AuthService.user();
  $scope.toggleVisibility = function (contact){
    contact.visible = !contact.visible;
  }
})
.controller('ProfilePacgajesCtrl', function($scope,AuthService, PacgajesService, $ionicHistory) {
  $scope.user = AuthService.user();
  PacgajesService.getPacgajes().then(function(data){
    $scope.pacgajes = data;
  });
  $scope.setActive = function(active){
    for(var i = 0; i < $scope.pacgajes.length; i++){
      if(i !== active){
        $scope.pacgajes[i].active = false;
      }
    }
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ProfileEditInfoCtrl', function($scope, $state, $ionicHistory, AuthService) {
  $scope.user = AuthService.user();
  $scope.newItem = {};
  $scope.info = $state.params.info;
  $scope.infoname = $state.params.infoname;
  $scope.addNewItem = function(){
      $scope.info.unshift($scope.newItem.value)
  };
  $scope.removeItem = function(index){
    $scope.info.splice(index,1)
  };
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ServicesDashCtrl', function($scope, $state, ServicesService, AuthService, $ionicHistory) {
  $scope.servicesList = [];
  $scope.user = AuthService.user();
  ServicesService.getServices().then(function(data){
    $scope.servicesList = data;
  })
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.goTo = function(service){
    var state = '';
    switch(service.type){
      case 'autocheck':
        state = 'main.services.autocheck';
        break;
      case 'application-done':
        state = 'main.services.application.done'
        break;
      case 'application-current':
        state = 'main.services.application.current'
        break;
      default:
        state = 'main.dash';
    }
    $state.go(state,{
      'service':service
    })
  };
})
.controller('ServicesAddCtrl', function($scope, $state,$ionicActionSheet , $ionicPopup, ImageService, $ionicHistory, AuthService) {
  $scope.activeService = null;
  $scope.user = AuthService.user();
  $scope.service = {

  };
  $scope.addBackground = function() {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Использовать камеру' },
        { text: 'Загрузить из библиотеки' }
      ],
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  }

  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function(image) {
    });
  }
  $scope.breakOptions = [{
    name:'Взрыв'
  }];
  $scope.descriptionOptions = [{
    name:'Газа'
  }];
  $scope.services = [{
    name:'Дворник',
    id:'dvor',
    active:false
  },{
    name:'Домофон',
    id:'domo',
    active:false
  },{
    name:'Электрик',
    id:'elec',
    active:false
  },{
    name:'Сантехник',
    id:'pipe',
    active:false
  },{
    name:'Кому-нибудь',
    id:'any',
    active:false
  }];
  $scope.toggleService = function(id){
    if($scope.activeService === id)
      $scope.activeService = null;
    else
      $scope.activeService = id;
    for(var i = 0; i < $scope.services.length; i++){
      if($scope.services[i].id!==id){
        $scope.services[i].active = false;
      }
    }
  };

  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.pickedServices = [];
  var myPopup = $ionicPopup.show({
    templateUrl: 'templates/service-add-popup-type.html',
    title: 'Выберите кому отправить заявку',
    scope: $scope,
    buttons: [
      { text: 'отмена',
        onTap: function(e) {
          $ionicHistory.goBack();
          return;
        }
     },
      {
        text: 'отправить',
        type: 'button-positive',
        onTap: function(e) {
          $scope.service.type = $scope.activeService;
          if($scope.activeService)
            return;
        }
      }
    ]
  });
})
.controller('ServicesAutocheckCtrl', function($scope, $state, $ionicHistory, AuthService, AutocheckService) {
  $scope.service = {};
  $scope.user = AuthService.user();
  $scope.service = $state.params.service;
  AutocheckService.getResults($scope.service.number).then(function(data){
    $scope.results = data;
  });
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ServicesApplicationDoneCtrl' ,function($scope, $state, $ionicHistory, AuthService){
  $scope.user = AuthService.user();
  $scope.service = $state.params.service;
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ServicesApplicationCurrentCtrl' ,function($scope, $timeout, $state, $ionicPopup, $ionicHistory, AuthService){
  $scope.user = AuthService.user();
  $scope.service = $state.params.service;
  $scope.boost;
  $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
  $scope.togglePayment = function(){
    $scope.freeboost = false;
  }
  $scope.toggleFree = function(){
    $scope.paymentboost = false;
  }
  $scope.speedUp = function(){
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/service-application-popup-boost.html',
      title: 'Придать ускорение Мастеру',
      scope: $scope,
      buttons: [
        { text: 'отмена',
          onTap: function(e) {
            return;
          }
       },
        {
          text: 'отправить',
          type: 'button-positive',
          onTap: function(e) {
            $scope.boosted = true;
              return;
          }
        }
      ]
    });
  }
  var directionsService = new google.maps.DirectionsService();

  $scope.$on('$ionicView.afterEnter', function(){
    var map = document.getElementById('map'),
    directionsDisplay = new google.maps.DirectionsRenderer(),
    remaindHeight = window.innerHeight - map.getBoundingClientRect().top;
    map.style.height = remaindHeight > 300 ? remaindHeight + 'px' : 300 + 'px';
    var myLatlng = new google.maps.LatLng(40.734359, -73.850303),
    mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    },
    map = new google.maps.Map(document.getElementById("map"), mapOptions),
    request = {
      origin: {lat: 40.734359, lng: -73.850303},
      destination: {lat: 40.732253, lng: -73.849284},
      travelMode: 'WALKING'
    };

    masterMarker = new google.maps.Marker({
      position: {lat: 40.733326, lng: -73.849799},
      map: map,
      icon: 'assets/icon/map-master.png'
    });
    directionsDisplay.setMap(map);
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  });
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('DashCtrl', function($scope, $state, NewsService, AuthService) {
  $scope.user = AuthService.user();
  $scope.newsList = [];
  $scope.newsMode = false;
  $scope.checkPrivelegeAndRedirect = function(privelege,redirect,direct){
    if(!~$scope.user.services.indexOf(privelege)){
      $state.go('main.profile.pacgajes',{})
    } else {
      $state.go(direct,{})
    }
  }
  $scope.toggleNews = function(news){
    news.full = ! news.full;
    if(news.full){
      for(var i = 0; i<$scope.newsList.length;i++){
        if(news != $scope.newsList[i] )
        $scope.newsList[i].full = false;
      }
      $scope.newsMode = true;
    } else {
      news.full = false;
      $scope.newsMode = false;
    }
  };
  $scope.resetMode = function(){
    for(var i = 0; i<$scope.newsList.length;i++){
      $scope.newsList[i].full = false;
    }
    $scope.newsMode = false;
  }
  NewsService.getNews().then(function(data){
    $scope.newsList = data;

  })
})
.controller('NewsAddCtrl', function($scope, $ionicActionSheet, NewsService, ImageService, $ionicHistory, $filter) {
  $scope.article = {
    types:['photo','share'],
  };
  var date = new Date();
  $scope.article.date = $filter('date')(date,'dd.MM.yy');
  $scope.article.time = $filter('date')(date,'hh:mm');
  $scope.article.color = '#fff';
  $scope.article.bg = null;

  $scope.addBackground = function() {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Использовать камеру' },
        { text: 'Загрузить из библиотеки' }
      ],
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  }

  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function(image) {
      var elem = document.getElementById('articlebg')
      elem.style.backgroundImage = 'url(' + image + ')';
      $scope.$apply();
      $scope.article.bg = image;
    });
  }
  $scope.colors = ['#fff', '#000', '#E41139', '#F6A623', '#F8E81C', '#BD0FE1', '#09A9EC'];
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AirkeyCtrl', function($scope, $ionicHistory) {
  $scope.airkey = {
    door:true,
    car:false
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('BalanceDashCtrl', function($scope, $ionicHistory) {
  $scope.cards = [{
    start:4313,
    end:3242,
    type:'VISA',
    id:1
  },{
    start:4313,
    end:3242,
    type:'MASTER CARD',
    id:2
  },{
    start:4313,
    end:3242,
    type:'MIR',
    id:3
  },{
    start:4313,
    end:3242,
    type:'VISA',
    id:4
  }]
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('BalanceCardCtrl', function($scope, $state, $ionicHistory) {
  $scope.card = $state.params.card;
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('BalancePayCtrl', function($scope, $ionicHistory, MethodsMethod) {
  MethodsMethod.getMethods().then(function(data){
    $scope.methods = data;
  });
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('BalanceAddCtrl', function($scope,$state, $ionicHistory) {
  $scope.id = $state.params.id;
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AdvHelloCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AdvAddCardCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AdvAddCamerasCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AdvAddVisitorsCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('AdvAddAirKeyCtrl', function($scope, $ionicHistory) {
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
;
