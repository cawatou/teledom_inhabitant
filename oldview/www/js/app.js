// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'pubnub.angular.service', 'starter.controllers', 'starter.services', 'starter.directives', 'credit-cards'])
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.run(function($ionicPlatform, $rootScope, $state, AuthService, AUTH_EVENTS, PudnubProvider) {
  PudnubProvider.init();
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      if(next.data && next.data.requiresAuth){
        event.preventDefault();
        $state.go('login.phone');
      }
    }
  });
})

.config(function($stateProvider, $compileProvider, $urlRouterProvider) {
  $compileProvider.debugInfoEnabled(false);
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:image\//);
  $stateProvider
  .state('login', {
    url: '/login',
    abstract:true,
    template: '<ion-nav-view/>'
    // templateUrl:'templates/login.html',
    // controller: 'LoginCtrl'
  })
  .state('phone-call', {
    url: '/phone-call',
    templateUrl: 'templates/phone-call.html',
    controller: 'PhoneCallCtrl'
  })
  .state('login.phone', {
    url: '/phone',
    templateUrl: 'templates/forgot-number.html',
    controller: 'LoginPhoneCtrl'
  })
  .state('login.code', {
    url: '/code/',
    templateUrl: 'templates/forgot-code.html',
    params:{
      login:true,
      phone:''
    },
    controller: 'LoginCodeCtrl'
  })
  .state('main', {
    url: '/',
    template: '<ion-nav-view/>',
    abstract:true,
    data:{
      requiresAuth:true
    }
  })
  .state('main.balance', {
    url: 'balance/',
    template: '<ion-nav-view/>',
    abstract:true
  })
  .state('main.adv', {
    url: 'adv/',
    template: '<ion-nav-view/>',
    abstract:true
  })
  .state('main.adv.hello', {
    url: 'hello',
    templateUrl: 'templates/adv-hello.html',
    controller:'AdvHelloCtrl'
  })
  .state('main.adv.add-card', {
    url: 'add-card',
    templateUrl: 'templates/adv-add-card.html',
    controller:'AdvAddCardCtrl'
  })
  .state('main.adv.add-visitors', {
    url: 'add-visitors',
    templateUrl: 'templates/adv-add-visitors.html',
    controller:'AdvAddVisitorsCtrl'
  })
  .state('main.adv.add-cameras', {
    url: 'add-cameras',
    templateUrl: 'templates/adv-add-cameras.html',
    controller:'AdvAddCamerasCtrl'
  })
  .state('main.adv.add-air-key', {
    url: 'add-air-key',
    templateUrl: 'templates/adv-add-air-key.html',
    controller:'AdvAddAirKeyCtrl'
  })
  .state('main.balance.dash', {
    url: 'dash',
    templateUrl:'templates/balance-dash.html',
    controller:'BalanceDashCtrl'
  })
  .state('main.balance.pay', {
    url: 'pay',
    templateUrl:'templates/balance-pay.html',
    controller:'BalancePayCtrl'
  })
  .state('main.balance.card', {
    url: 'card',
    params:{
      card:null
    },
    templateUrl:'templates/balance-card.html',
    controller:'BalanceCardCtrl'
  })
  .state('main.balance.add', {
    url: 'add',
    params:{
      id:null
    },
    templateUrl:'templates/balance-add.html',
    controller:'BalanceAddCtrl'
  })
  .state('main.airkey', {
    url: 'airkey',
    templateUrl: 'templates/airkey.html',
    controller: 'AirkeyCtrl'
  })
  .state('main.visitors', {
      url: 'visitors/',
      abstract:true,
      template: '<ion-nav-view/>'
  })
  .state('main.visitors.dash', {
      url: 'dash',
      templateUrl: 'templates/visitors.html',
      controller: 'VisitorsCtrl'
  })
  .state('main.visitors.single', {
      url: 'single',
      params:{
        visitors:null,
        active:null
      },
      templateUrl: 'templates/visitors-single.html',
      controller: 'VisitorsSingleCtrl'
  })
  .state('main.counters', {
    url: 'counters/',
    abstract:true,
    template: '<ion-nav-view/>'
  })
  .state('main.counters.dash', {
    url: 'dash/',
    templateUrl: 'templates/counters-dash.html',
    controller: 'CountersDashCtrl'
  })
  .state('main.counters.edit', {
    url: 'edit/',
    params: {counter: null},
    templateUrl: 'templates/counters-edit.html',
    controller: 'CountersEditCtrl'
  })
  .state('main.counters.room', {
    url: 'room/',
    abstract:true,
    template: '<ion-nav-view/>'
  })
  .state('main.counters.room.add', {
    url: 'add/',
    params:{
      counter:null
    },
    templateUrl: 'templates/counters-room-add.html',
    controller: 'CountersRoomAddCtrl'
  })
  .state('main.counters.room.edit', {
    url: 'add/',
    params:{
      counter:null,
      room:null
    },
    templateUrl: 'templates/counters-room-edit.html',
    controller: 'CountersRoomEditCtrl'
  })
  .state('main.video', {
    url: 'video',
    cache: false,
    templateUrl: 'templates/video.html',
    controller: 'VideoCtrl'
  })
  .state('main.services', {
    url: 'services',
    abstract:true,
    template:'<ion-nav-view/>'
  })
  .state('main.services.dash', {
    url: 'dash',
    templateUrl:'templates/services-dash.html',
    controller: 'ServicesDashCtrl'
  })
  .state('main.services.autocheck', {
    url: 'autocheck',
    params:{
      service:null
    },
    templateUrl:'templates/services-autocheck.html',
    controller: 'ServicesAutocheckCtrl'
  })
  .state('main.services.application', {
    url: 'application',
    abstract:true,
    template:'<ion-nav-view/>'
  })
  .state('main.services.application.done', {
    url: 'done',
    params:{
      service:null
    },
    templateUrl:'templates/services-application-done.html',
    controller: 'ServicesApplicationDoneCtrl'
  })
  .state('main.services.application.current', {
    url: 'current',
    params:{
      service:null
    },
    templateUrl:'templates/services-application-current.html',
    controller: 'ServicesApplicationCurrentCtrl'
  })
  .state('main.services.add', {
    url: 'add',
    cache: false,
    templateUrl:'templates/services-add.html',
    controller: 'ServicesAddCtrl'
  })
  .state('main.dash', {
    url: 'dash',
    templateUrl: 'templates/dash.html',
    controller: 'DashCtrl'
  })
  .state('main.news', {
    url: 'news',
    abstract:true,
    template: '<ion-nav-view/>'
  })
  .state('main.news.add', {
    url: 'add',
    templateUrl: 'templates/news-add.html',
    controller: 'NewsAddCtrl'
  })
  .state('main.profile', {
    url: 'profile',
    abstract:true,
    template: '<ion-nav-view/>'
  })
  .state('main.profile.dash', {
    url: 'dash',
    templateUrl: 'templates/profile-dash.html',
    controller: 'ProfileDashCtrl'
  })
  .state('main.profile.pacgajes', {
    url: 'pacgajes',
    templateUrl: 'templates/profile-pacgajes.html',
    controller: 'ProfilePacgajesCtrl'
  })
  .state('main.profile.editinfo', {
    url: 'info',
    templateUrl: 'templates/profile-edit-info.html',
    params:{
      info:null,
      infoname:null
    },
    controller: 'ProfileEditInfoCtrl'
  });
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("main.dash");
  });

});
