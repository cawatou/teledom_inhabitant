angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.user = AuthService.user();
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Ошибка авторизации',
      template: 'Проверьте логин/пароль или зарегистрируйтесь'
    });
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
  });

  $scope.setCurrentUser = function(user) {
    $scope.user = user;
  };
})
.controller('RegisterCtrl', function($scope, AuthService, $ionicHistory) {
  $scope.data = {
    username:'',
    password:'',
    email:'',
    phone:'',
    street:'',
    house:'',
    corpus:'',
    liter:'',
    stairs:'',
    flat:'',
    name:'',
    surname:'',
    secondname:''
  };
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
  $scope.register = {

  }
})
.controller('LoginPhoneCtrl', function($scope, $state, $ionicPopup, AuthService, $timeout) {
  $scope.getCode = function(phoneNumber){
    $state.go('forgot.code', {
      login:true,
      token:2
    });
  }
})
.controller('LoginCodeCtrl', function($scope, $state, $ionicPopup, AuthService, $timeout) {
  $scope.codeParam = $state.params.code;
  $scope.login = true;
  $scope.login = function(data) {
    if($scope.codeParam === $scope.code){
      $scope.loading = true;
      AuthService.login(data.username, data.password).then(function(authenticated) {
        $scope.loading = false;
        $state.go('main.adv.hello', {}, {reload: true});
        $scope.setCurrentUser(authenticated)
      }, function(err) {
        $scope.loginErr = true;
        $scope.loading = false;
        $timeout(function(){
          $scope.loginErr = false;
        },5000)
      });
    }
  };
})
// .controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, $timeout) {
//   $scope.data = {
//     username:'',
//     password:''
//   };
//   $scope.loading = false;
//   $scope.loginErr = false;
//   $scope.login = function(data) {
//     $scope.loading = true;
//     AuthService.login(data.username, data.password).then(function(authenticated) {
//       $scope.loading = false;
//       $state.go('main.adv.hello', {}, {reload: true});
//       $scope.setCurrentUser(authenticated)
//     }, function(err) {
//       $scope.loginErr = true;
//       $scope.loading = false;
//       $timeout(function(){
//         $scope.loginErr = false;
//       },5000)
//     });
//   };
// })
.controller('ForgotNumberCtrl', function($scope, $state, $ionicHistory, PassResetService) {
  $scope.getCode = function(number) {
    PassResetService.sendNumber(number).then(function(resetToken){
      $state.go('forgot.code', {
        token:resetToken
      }, {reload: true});
    });
  };
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ForgotTestCodeCtrl', function($scope, $state, $ionicHistory, PassResetService) {
  $scope.testCode = function(code) {
    PassResetService.testCode(code,$state.params.token).then(function(resetToken){
      $state.go('forgot.newpass', {
        token:resetToken
      }, {reload: true});
    });
  };
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('ForgotNewpassCtrl', function($scope, $state, $ionicHistory, PassResetService) {
  $scope.setPass = function(pass,passConfirm) {
    PassResetService.setPass(pass,passConfirm,$state.params.token).then(function(resetToken){
      $state.go('login', {
      }, {reload: true});
    });
  };
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
.controller('VideoCtrl', function($scope, $ionicHistory, CamerasService) {
  CamerasService.getCameras().then(function(data){
    $scope.videos = data;
  });
  $scope.playVideo = function(index){
    for(var i = 0; i < $scope.videos.length; i++){
      if( i!= index){
        document.getElementById('video-'+i).pause();
        $scope.videos[i].playing = false;
      } else {
        document.getElementById('video-'+i).play();
        $scope.videos[i].playing = true;
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
.controller('VisitorsCtrl', function($scope, VisitorsService, $ionicHistory) {
  $scope.newsList = [];
  VisitorsService.getVisitors().then(function(data){
    $scope.visitors = data;
  });
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})
.controller('VisitorsSingleCtrl', function($scope, $state, VisitorsService, $ionicHistory) {
  $scope.visitors = $state.params.visitors;
  $scope.activeIndex = $state.params.active;
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
    $scope.activeIndex = data.slider.activeIndex;
    $scope.previousIndex = data.slider.previousIndex;
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
.controller('ServicesAddCtrl', function($scope, $state, $ionicPopup, $ionicHistory, AuthService) {
  $scope.activeService = null;
  $scope.user = AuthService.user();
  $scope.service = {

  };
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
.controller('ServicesApplicationCurrentCtrl' ,function($scope, $state, $ionicPopup, $ionicHistory, AuthService){
  $scope.user = AuthService.user();
  $scope.service = $state.params.service;
  $scope.boost;
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
.controller('NewsAddCtrl', function($scope, $ionicPlatform, $ionicActionSheet, NewsService, ImageService, FileService, $ionicHistory, $filter) {
  $scope.article = {
    types:['photo','share'],
  };
  var date = new Date();
  $scope.article.date = $filter('date')(date,'dd.MM.yy');
  $scope.article.time = $filter('date')(date,'hh:mm');
  $scope.article
  $scope.article.color = '#fff';
  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  }
  $scope.addBackground = function() {
   $scope.hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Использовать камеру' },
       { text: 'Загрузить из библиотеки' }
     ],
     buttonClicked: function(index) {
       $scope.addImage(index);
       var images = FileService.images();
       $scope.article.bg = images[images.length-1];
     }
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
.controller('BalanceAddCtrl', function($scope, $ionicHistory) {
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
