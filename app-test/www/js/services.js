angular.module('starter.services', [])
.service('AuthService', function($q, $http, $timeout, $rootScope) {
  var LOCAL_TOKEN_KEY = 'tele';
  var user = null;
  var isAuthenticated = false;

  function loadUserCredentials() {
    var usersCreds = JSON.parse(window.localStorage.getItem(LOCAL_TOKEN_KEY));
    if (usersCreds) {
      useCredentials(usersCreds);
    }
  }

  function storeUserCredentials(usersCreds) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(usersCreds));
    useCredentials(usersCreds);
  }

  function useCredentials(usersCreds) {
    user = usersCreds;
    isAuthenticated = true;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    user = null;
    isAuthenticated = false;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(name, pw) {
    return $q(function(resolve, reject) {
      if ((name == 'user' && pw == '1')) {
        var credentitals = {
          name : 'Миша',
  				surname : 'Кукуруза',
  				fathersname : 'Сергеевич',
          address:{
            street:'Пушкинская',
            number:16,
            ladder:2,
            litera:'A',
            building:1,
            flat:12
          },
  				id_flat : 1231231312,
  				serial_number : 1231231231,
          balance:1200,
          avatar:'assets/images/chuck.jpg',
          contacts:[{
            type:'call',
            value:'+37529788 66 45',
            visible:false
          },{
            type:'location',
            value:'ул. Пушкина 34, кв. 65',
            visible:false
          },{
            type:'mail',
            value:'email@mail.com',
            visible:true
          }],
          professions:['теннисе', 'сантехнике', 'электрике'],
          intrests:['горные лыжи', 'охота', 'баня'],
          services:['video' ,'calls' ,'app', 'visitors', 'webclient', 'air-key', 'car-key']
        }
        // Make a request and receive your auth token from your server
        storeUserCredentials(credentitals);
        $timeout(function(){
          resolve(credentitals);
        })
      } else {
        reject('Login Failed.');
      }
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    return isAuthenticated;
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    user: function() {return user;},
    role: function() {return role;}
  };
})
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
.factory('FileService', function() {
  var images;
  var IMAGE_STORAGE_KEY = 'images';

  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };

  function addImage(img) {
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };

  return {
    storeImage: addImage,
    images: getImages
  }
})
.service('NewsService',function($q,$timeout){
  return {
    getNews : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
              date:'21.04.17 в 15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              types:['photo','share','time'],
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            },{
              date:'21.04.17 в 15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              types:['share','time'],
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            },{
              date:'21.04.17 в 15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              types:['share','time'],
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            }]);
        },0);

      });
    },
    addNews : function(){

    }
  }
})
.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {

  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }

  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);

      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
})
.service('PassResetService',function($q,$timeout){
  return {
    sendNumber : function(number){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve(123123123);
        },0);
      });
    },
    testCode : function(code,key){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve(123123123);
        },0);
      })
    },
    setPass : function(pass,passconfirm,key){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve('Пароль обновленю');
        },0);
      })
    }
  }
})
.service('CountersService',function($q,$timeout){
  return {
    getCounters : function(month){
      var emptyCounters = [
        {
          type:'water',
          id:'water',
          name:'Водоснабжение',
          types:[

            {
              name:'Холодная вода',
              type:'cold'
            },
            {
              name:'Горячая вода',
              type:'hot'
            }
          ],
          unit:'м3',
          rooms:[{
            name:'Кухня',
            type:'water',
            id:1,
            counters:[{
              name:'Счетчик 123123',
              type:'cold',
              id:1,
              value:124324.34
            },{
              name:'Счетчик 123123',
              type:'hot',
              id:4,
              value:124324.34
            }]
          },{
            name:'Ванная',
            type:'water',
            id:2,
            counters:[{
              name:'Счетчик 123123',
              id:3,
              type:'cold',
              value:124324.34
            },{
              name:'Счетчик 123123',
              id:2,
              type:'hot',
              value:124324.34
            }]
          }]
        },{
          type:'counter',
          id:'heat',
          name:'Отопление',
          unit:'Гкал',
          rooms:[{
            name:'Кухня',
            id:4,
            counters:[{
              name:'Счетчик 123123',
              id:6,
              value:124324.34
            }]
          },{
            name:'Ванная',
            id:89,
            counters:[{
              name:'Счетчик 123123',
              id:7,
              value:124324.34
            }]
          }]
        },{
          type:'counter',
          id:'electricity',
          name:'Электроэнергия',
          unit:'кВат',
          rooms:[{
            name:'Кухня',
            id:7,
            counters:[{
              name:'Счетчик 123123',
              id:8,
              value:124324.34
            }]
          }]
        },{
          type:'counter',
          id:'gas',
          name:'Газ',
          unit:'м3',
          rooms:[{
            name:'Кухня',
            id:7,
            counters:[{
              name:'Счетчик 123123',
              id:9,
              value:124324.34
            }]
          }]
        },{
          type:'singlePay',
          id:'trash',
          name:'Вывоз мусора',
          price:100
        },{
          type:'singlePay',
          id:'dompohone',
          name:'Домофон',
          price:400
        },{
          type:'singlePay',
          id:'pipes',
          name:'Канализация',
          price:200
        },{
          type:'singlePay',
          id:'odn',
          name:'ОДН',
          price:200
        }
      ],
      mockCounters = [
        {
          type:'water',
          id:'water',
          name:'Водоснабжение',
          types:[
            {
              name:'Холодная вода',
              type:'cold',
              delta:5,
              price:155
            },{
              name:'Горячая вода',
              type:'hot',
              delta:2,
              price:255
            }
          ],
          unit:'м3',
          delta:2,
          price:100,
          rooms:[{
            name:'Кухня',
            id:1,
            counters:[{
              name:'Счетчик 123123',
              id:1,
              type:'cold',
              value:124324.34
            }]
          },{
            name:'Ванная',
            id:2,
            counters:[{
              name:'Счетчик 123123',
              id:2,
              type:'hot',
              value:124324.34
            }]
          }]
        },{
          type:'counter',
          id:'heat',
          name:'Отопление',
          unit:'Гкал',
          delta:1.5,
          price:100,
          rooms:[{
            name:'Кухня',
            id:5,
            counters:[{
              name:'Счетчик 123123',
              id:8,
              value:124324.34
            }]
          }]
        },{
          type:'counter',
          id:'electricity',
          name:'Электроэнергия',
          unit:'кВат',
          delta:5,
          price:100,
          rooms:[{
            name:'Кухня',
            id:6,
            counters:[{
              name:'Счетчик 123123',
              id:55,
              value:122324.34
            }]
          }]
        },{
          type:'counter',
          id:'gas',
          name:'Газ',
          unit:'м3',
          delta:5,
          price:100,
          rooms:[{
            name:'Кухня',
            id:7,
            counters:[{
              name:'Счетчик 123123',
              id:13,
              value:122324.34
            }]
          }]
        },{
          type:'singlePay',
          id:'trash',
          name:'Вывоз мусора',
          price:100
        },{
          type:'singlePay',
          id:'dompohone',
          name:'Домофон',
          price:400
        },{
          type:'singlePay',
          id:'pipes',
          name:'Канализация',
          price:200
        },{
          type:'singlePay',
          id:'odn',
          name:'ОДН',
          price:200
        }
      ]
    return $q(function(resolve, reject) {
        $timeout(function(){
          var resolveData,
          date = new Date(),
          date = date.getMonth();

          if(month === date){
            resolveData = emptyCounters;
          } else {
            resolveData = mockCounters;
          }
          resolve(
            resolveData
          );
        },0);
      });
    }
  }
})
.service('CamerasService',function($q,$timeout){
  return {
    getCameras : function(number){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
            name:'Камера в подъезде',
            bg:'assets/images/bg-login.jpg'
          },{
            name:'Камера на улице 1',
            bg:'assets/images/bg-login.jpg'
          },{
            name:'Камера на улице 2',
            bg:'assets/images/bg-login.jpg'
          }]);
        },0);
      });
    }
  }
})
.service('VisitorsService',function($q,$timeout){
  return {
    getVisitors : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
            date:'21.04.17 в 15:9',
            photo:'assets/images/chuck.jpg',
            message:'assets/images/bg-login.jpg'
          },{
            date:'21.04.17 в 15:10',
            photo:'assets/images/chuck.jpg',
            message:'assets/images/bg-login.jpg'
          },{
            date:'21.04.17 в 15:11',
            photo:'assets/images/chuck.jpg',
            message:'assets/images/bg-login.jpg'
          }]);
        },0);
      });
    }
  }
})
.service('ServicesService',function($q,$timeout){
  return {
    getServices : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
              date:'21.04.17',
              time:'15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              type:'application-current',
              types:['photo','share','time'],
              startLocation:{
                lat:'assets/images/bg-login.jpg',
                lng:'',
                name:'Улица Лейтенанта Шмида, 1'
              },
              finishLoaction:{
                lat:'assets/images/bg-login.jpg',
                lng:'',
                name:'Улица Лейтенанта Шмида, 99'
              },
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            },{
              date:'21.04.17',
              time:'15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              type:'application-current',
              types:['photo','share','time'],
              master:{
                photo:'assets/images/chuck.jpg',
                name:'Иван Иванович ',
                time:'12-13:00'
              },
              startLocation:{
                lat:'assets/images/bg-login.jpg',
                lng:'',
                name:'Улица Лейтенанта Шмида, 1'
              },
              finishLoaction:{
                lat:'assets/images/bg-login.jpg',
                lng:'',
                name:'Улица Лейтенанта Шмида, 99'
              },
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            },{
              date:'21.04.17',
              time:'15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              type:'application-done',
              types:['photo','share','time'],
              master:{
                photo:'assets/images/chuck.jpg',
                header:'Мастер Иван Иванович закрыл заявку в течение 6 рабочих часов',
                text:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
              },
              before:{
                photo:'assets/images/bg-login.jpg',
                date:'21.04.17'
              },
              after:{
                photo:'assets/images/bg-login.jpg',
                date:'21.04.17'
              },
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            },{
              date:'21.04.17',
              time:'15:10',
              header:"В вашем доме проводиться капитальный ремонт",
              type:'autocheck',
              number:21321,
              types:['share','time'],
              message:'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit ametlorem ipsum dolor sit ametlorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet'
            }]);
        },0);
      });
    }
  }
})
.service('AutocheckService',function($q,$timeout){
  return {
    getResults : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
                name:'Среднее время закрывание двери',
                success:true
              },{
                name:'Главная сеть',
                success:true
              },{
                name:'Коммутатор',
                success:false
              }]);
        },0);
      });
    }
  }
}).service('MethodsMethod',function($q,$timeout){
  return {
    getMethods : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
                name:'Связной'
              },{
                name:'Евросеть'
              },{
                name:'Qiwi'
              }]);
        },0);
      });
    }
  }
})
.service('PacgajesService',function($q,$timeout){
  return {
    getPacgajes : function(){
      return $q(function(resolve, reject) {
        $timeout(function(){
          resolve([{
            active:true,
            name:'MAXIMUM',
            message:'У Вас самый лучший пакет – Вы лучший!',
            services:['video' ,'calls' ,'app', 'visitors', 'webclient', 'air-key', 'car-key']
          },{
            active:false,
            name:'Оптимальный',
            message:'У Вас самый лучший пакет – Вы лучший!',
            services:['video' ,'calls' ,'app', 'visitors', 'air-key']
          },{
            active:false,
            name:'Стандартный',
            message:'У Вас самый лучший пакет – Вы лучший!',
            services:['video' ,'calls' ,'app', 'visitors']
          },{
            active:false,
            name:'Простой',
            message:'У Вас самый лучший пакет – Вы лучший!',
            services:['video' ,'calls' ,'app']
          },{
            active:false,
            name:'Базовый',
            message:'У Вас самый лучший пакет – Вы лучший!',
            services:['video' ,'calls']
          }]);
        },0);
      });
    }
  }
})
