angular.module('starter.services', [])

    .constant('PubnubConfig', {
        publish_key: PUBLISH_KEY,
        subscribe_key: SUBSCRIBE_KEY,
        ssl: true
    })
.factory('socketIO', function (socketFactory) {
  var myIoSocket = io.connect('https://skipodev.ru:9443');

  socketIO = socketFactory({
    ioSocket: myIoSocket
  });

  return socketIO;
})
    .service('AuthService', function ($q, $state, $timeout, $rootScope, PudnubProvider) {
        var LOCAL_TOKEN_KEY = 'tele';
        var user = null;
        var isAuthenticated = false;

        function authorize() {
            PudnubProvider.publish({event: "mobile_auth"});
            $rootScope.$on("mobile_auth", function (event, src) {

                storeUserCredentials(src.data.fields);
                $state.go('main.dash')
            })
        }

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

        var logout = function () {
            destroyUserCredentials();
        };

        var isAuthorized = function (authorizedRoles) {
            return isAuthenticated;
        };

        loadUserCredentials();

        return {
            logout: logout,
            authorize: authorize,
            isAuthorized: isAuthorized,
            isAuthenticated: function () {
                return isAuthenticated;
            },
            user: function () {
                return user;
            }
        };
    })
    .factory('PudnubProvider', function ($rootScope, $ionicPopup, $ionicPlatform, $timeout, $ionicLoading, Pubnub, PubnubConfig) {
        var client = {},
            timeout = null,
            listener = null;
        return {
            init: function () {
                if (listener != null) return;
                Pubnub.init(PubnubConfig);
                client.subChannel = Pubnub.getUUID();
                if (typeof localStorage['pub-channel'] !== 'undefined' && localStorage['pub-channel'] !== null) {
                    client.pubChannel = localStorage['pub-channel'];
                } else {
                    client.pubChannel = SKIPO_GROUP;
                }
                listener = {
                    status: function (statusEvent) {
                        console.log(JSON.stringify(statusEvent));
                    },
                    message: function (envelope) {
                        var status,
                            msg = envelope.message;
                        //console.log('pubnub message: \n' + JSON.stringify(envelope));
                        // loadingStop();
                        if (msg.response == 'done') {
                            console.log('PudnubProvider:message:success: ' + JSON.stringify(msg));
                            status = 'success';
                        } else {
                            console.log('PudnubProvider:message:error: \n' + JSON.stringify(msg));
                            status = 'error';
                        }
                        $rootScope.$emit(msg.event, {status: status, data: msg});
                    }
                };
                Pubnub.addListener(listener);
                Pubnub.subscribe({channels: [client.subChannel]});
            },
            publish: function (query) {
                Pubnub.publish({
                        channel: client.pubChannel,
                        message: query
                    },
                    function (status, response) {
                        if (status.error) {
                            $ionicPopup.alert({
                                title: 'Невозможно соедениться \n с сервером',
                                template: 'Проверьте подключение к сети интернет и повторите попытку.'
                            });
                            $rootScope.$emit('pubnub_err', {});
                        } else {
                            console.log('PudnubProvider:publish:success: ' + 'send to: ' + client.pubChannel + '\n' + JSON.stringify(query));
                        }
                    });
            },
            stop: function () {
                loadingStart(5000);
                Pubnub.unsubscribeAll();
            },
            updateClient: function (config) {
                localStorage['pub-channel'] = config.pubChannel;
                angular.extend(client, config);
            }
        };

    })
    .factory('FileService', function () {
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
    .service('NewsService', function ($q, $timeout, $rootScope, PudnubProvider) {
        var defNews = [
            {
                date: null,
                header: "No Data",
                types: [],
                message: null,
            }
        ];

        return {
            getNews: function () {
                PudnubProvider.publish({event: "mobile_news"});
                return $q(function (resolve, reject) {
                    $rootScope.$on("mobile_news", function (event, src) {
                        var arr = [], data = [], item;
                        data = src.data.fields;
                        console.log("mobile_news fields :" + JSON.stringify(data));
                        for (let i = 0; i < data.length; i++) {
                            item = data[i];
                            arr.push({
                                date: item.date,
                                header: item.title,
                                types: item.img ? ['photo', 'share', 'time'] : ['time'],
                                message: item.description
                            });
                        }
                        resolve(arr);
                    });
                });
            },
            addNews: function () {

            }
        }
    })
    .service('CallsService', function ($q, $timeout, $rootScope, PudnubProvider) {
        return {
            getCalls: function () {
                PudnubProvider.publish({event: "mobile_calls"});
                return $q(function (resolve, reject) {
                    $rootScope.$on("mobile_calls", function (event, src) {
                        var arr = [], data = [], item;
                        data = src.data.fields;
                        console.log("mobile_calls fields :" + JSON.stringify(data));
                        for (let i = 0; i < data.length; i++) {
                            item = data[i];
                            arr.push({
                                time: item.time,
                                avatar: item.avatar
                            });
                        }
                        resolve(arr);
                    });
                });
            }
        }
    })
    .service('KeyopenService', function ($q, $timeout, $rootScope, PudnubProvider) {
        return {
            getItems: function () {
                PudnubProvider.publish({event: "mobile_keyopen"});
                return $q(function (resolve, reject) {
                    $rootScope.$on("mobile_keyopen", function (event, src) {
                        var arr = [], data = [], item;
                        data = src.data.fields;
                        console.log("mobile_keyopen fields :" + JSON.stringify(data));
                        for (let i = 0; i < data.length; i++) {
                            item = data[i];
                            arr.push({
                                time: item.time,
                                avatar: item.avatar,
                                number: item.number
                            });
                        }
                        resolve(arr);
                    });
                });
            }
        }
    })
    .service('OrdersService', function ($q, $timeout, $rootScope, PudnubProvider) {
        return {
            getOrders: function () {
                PudnubProvider.publish({event: "mobile_orders"});
                return $q(function (resolve, reject) {
                    $rootScope.$on("mobile_orders", function (event, src) {
                        var arr = [], data = [], item;
                        data = src.data.fields;
                        console.log("mobile_orders fields :" + JSON.stringify(data));
                        for (let i = 0; i < data.length; i++) {
                            item = data[i];
                            arr.push({
                                title: item.title,
                                date: item.date,
                                comment: item.comment,
                                complete: item.complete
                            });
                        }
                        resolve(arr);
                    });
                });
            }
        }
    })
    .service('AppopenService', function ($q, $timeout, $rootScope, PudnubProvider) {
        return {
            open: function () {
                PudnubProvider.publish({event: "mobile_opendoor"});
                return $q(function (resolve, reject) {
                    $rootScope.$on("mobile_opendoor", function (event, src) {
                        data = src.data.fields;
                        console.log('door is open', data);
                        resolve(data);
                    });
                });
            }
        }
    })
    .factory('ImageService', function ($cordovaCamera, FileService, $q, $cordovaFile) {

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
            return $q(function (resolve, reject) {
                var options = optionsForType(type);

                $cordovaCamera.getPicture(options).then(function (imageUrl) {
                    resolve(imageUrl);
                });
            })
        }

        return {
            handleMediaDialog: saveMedia
        }
    })
    .service('PassResetService', function ($q, $timeout) {
        return {
            sendNumber: function (number) {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve(123123123);
                    }, 0);
                });
            },
            testCode: function (code, key) {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve(123123123);
                    }, 0);
                })
            },
            setPass: function (pass, passconfirm, key) {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve('Пароль обновленю');
                    }, 0);
                })
            }
        }
    })
    .service('CountersService', function ($q, $timeout) {
        return {
            getCounters: function (month) {
                var emptyCounters = [
                        {
                            type: 'water',
                            id: 'water',
                            name: 'Водоснабжение',
                            types: [

                                {
                                    name: 'Холодная вода',
                                    type: 'cold'
                                },
                                {
                                    name: 'Горячая вода',
                                    type: 'hot'
                                }
                            ],
                            unit: 'м3',
                            rooms: [{
                                name: 'Кухня',
                                type: 'water',
                                id: 1,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    type: 'cold',
                                    id: 1,
                                    value: 124324.34
                                }, {
                                    name: 'Счетчик 123123',
                                    type: 'hot',
                                    id: 4,
                                    value: 124324.34
                                }]
                            }, {
                                name: 'Ванная',
                                type: 'water',
                                id: 2,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 3,
                                    type: 'cold',
                                    value: 124324.34
                                }, {
                                    name: 'Счетчик 123123',
                                    id: 2,
                                    type: 'hot',
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'heat',
                            name: 'Отопление',
                            unit: 'Гкал',
                            rooms: [{
                                name: 'Кухня',
                                id: 4,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 6,
                                    value: 124324.34
                                }]
                            }, {
                                name: 'Ванная',
                                id: 89,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 7,
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'electricity',
                            name: 'Электроэнергия',
                            unit: 'кВат',
                            rooms: [{
                                name: 'Кухня',
                                id: 7,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 8,
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'gas',
                            name: 'Газ',
                            unit: 'м3',
                            rooms: [{
                                name: 'Кухня',
                                id: 7,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 9,
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'singlePay',
                            id: 'trash',
                            name: 'Вывоз мусора',
                            price: 100
                        }, {
                            type: 'singlePay',
                            id: 'dompohone',
                            name: 'Домофон',
                            price: 400
                        }, {
                            type: 'singlePay',
                            id: 'pipes',
                            name: 'Канализация',
                            price: 200
                        }, {
                            type: 'singlePay',
                            id: 'odn',
                            name: 'ОДН',
                            price: 200
                        }
                    ],
                    mockCounters = [
                        {
                            type: 'water',
                            id: 'water',
                            name: 'Водоснабжение',
                            types: [
                                {
                                    name: 'Холодная вода',
                                    type: 'cold',
                                    delta: 5,
                                    price: 155
                                }, {
                                    name: 'Горячая вода',
                                    type: 'hot',
                                    delta: 2,
                                    price: 255
                                }
                            ],
                            unit: 'м3',
                            delta: 2,
                            price: 100,
                            rooms: [{
                                name: 'Кухня',
                                id: 1,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 1,
                                    type: 'cold',
                                    value: 124324.34
                                }]
                            }, {
                                name: 'Ванная',
                                id: 2,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 2,
                                    type: 'hot',
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'heat',
                            name: 'Отопление',
                            unit: 'Гкал',
                            delta: 1.5,
                            price: 100,
                            rooms: [{
                                name: 'Кухня',
                                id: 5,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 8,
                                    value: 124324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'electricity',
                            name: 'Электроэнергия',
                            unit: 'кВат',
                            delta: 5,
                            price: 100,
                            rooms: [{
                                name: 'Кухня',
                                id: 6,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 55,
                                    value: 122324.34
                                }]
                            }]
                        }, {
                            type: 'counter',
                            id: 'gas',
                            name: 'Газ',
                            unit: 'м3',
                            delta: 5,
                            price: 100,
                            rooms: [{
                                name: 'Кухня',
                                id: 7,
                                counters: [{
                                    name: 'Счетчик 123123',
                                    id: 13,
                                    value: 122324.34
                                }]
                            }]
                        }, {
                            type: 'singlePay',
                            id: 'trash',
                            name: 'Вывоз мусора',
                            price: 100
                        }, {
                            type: 'singlePay',
                            id: 'dompohone',
                            name: 'Домофон',
                            price: 400
                        }, {
                            type: 'singlePay',
                            id: 'pipes',
                            name: 'Канализация',
                            price: 200
                        }, {
                            type: 'singlePay',
                            id: 'odn',
                            name: 'ОДН',
                            price: 200
                        }
                    ]
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        var resolveData,
                            date = new Date(),
                            date = date.getMonth();

                        if (month === date) {
                            resolveData = emptyCounters;
                        } else {
                            resolveData = mockCounters;
                        }
                        resolve(
                            resolveData
                        );
                    }, 0);
                });
            }
        }
    })
    .service('CamerasService', function ($q, $timeout) {
        return {
            getCameras: function (number) {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve([{
                            name: 'Камера в подъезде',
                            bg: 'assets/images/bg-login.jpg'
                        }, {
                            name: 'Камера на улице 1',
                            bg: 'assets/images/bg-login.jpg'
                        }, {
                            name: 'Камера на улице 2',
                            bg: 'assets/images/bg-login.jpg'
                        }]);
                    }, 0);
                });
            }
        }
    })
    .service('AutocheckService', function ($q, $timeout) {
        return {
            getResults: function () {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve([{
                            name: 'Среднее время закрывание двери',
                            success: true
                        }, {
                            name: 'Главная сеть',
                            success: true
                        }, {
                            name: 'Коммутатор',
                            success: false
                        }]);
                    }, 0);
                });
            }
        }
    })
    .service('MethodsMethod', function ($q, $timeout) {
        return {
            getMethods: function () {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve([{
                            name: 'Связной'
                        }, {
                            name: 'Евросеть'
                        }, {
                            name: 'Qiwi'
                        }]);
                    }, 0);
                });
            }
        }
    })
    .service('PacgajesService', function ($q, $timeout) {
        return {
            getPacgajes: function () {
                return $q(function (resolve, reject) {
                    $timeout(function () {
                        resolve([{
                            active: true,
                            name: 'MAXIMUM',
                            message: 'У Вас самый лучший пакет – Вы лучший!',
                            services: ['video', 'calls', 'app', 'visitors', 'webclient', 'air-key', 'car-key']
                        }, {
                            active: false,
                            name: 'Оптимальный',
                            message: 'У Вас самый лучший пакет – Вы лучший!',
                            services: ['video', 'calls', 'app', 'visitors', 'air-key']
                        }, {
                            active: false,
                            name: 'Стандартный',
                            message: 'У Вас самый лучший пакет – Вы лучший!',
                            services: ['video', 'calls', 'app', 'visitors']
                        }, {
                            active: false,
                            name: 'Простой',
                            message: 'У Вас самый лучший пакет – Вы лучший!',
                            services: ['video', 'calls', 'app']
                        }, {
                            active: false,
                            name: 'Базовый',
                            message: 'У Вас самый лучший пакет – Вы лучший!',
                            services: ['video', 'calls']
                        }]);
                    }, 0);
                });
            }
        }
    })
    .factory('mToast', function ($cordovaToast) {
        return {
            show: function (message, callback) {
                $cordovaToast
                    .show(message, 'long', 'bottom')
                    .then(function (success) {
                        console.log('Toast Susccess: ' + success);
                        if (callback) {
                            callback();
                        }
                    }, function (error) {
                        console.log('Toast Error: ' + error);
                        if (callback) {
                            callback();
                        }
                    });
            }
        };
    });