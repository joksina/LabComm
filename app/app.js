'use strict';

angular
  .module('angularfireSlackApp', [
    'firebase',
    'angular-md5',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
        resolve: {
          requireNoAuth: function($state, Auth) {
            return Auth.$requireAuth().then(function(auth) {
              $state.go('channels');
            }, function(error) {
              return;
            });
          }
        }
      })
      .state('login', {
        url: '/login',
        controller: 'AuthController',
        controllerAs: 'authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('home');
            }, function(error) {
              return;
            });
          }
        }
      })
      .state('register', {
        url: '/register',
        controller: 'AuthController',
        controllerAs: 'authCtrl',
        templateUrl: 'auth/register.html',
        resolve: {
          requireNoAuth: function ($state, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('profile', {
        url: '/profile',
        controller: 'ProfileController',
        controllerAs: 'profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
          auth: function($state, Users, Auth) {
            return Auth.$requireAuth().catch(function() {
              $state.go('home');
            });
          },
          profile: function(Users, Auth) {
            return Auth.$requireAuth().then(function(auth) {
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('channels', {
        url: '/channels',
        controller: 'ChannelsController',
        controllerAs: 'channelsCtrl',
        templateUrl: 'channels/index.html',
        resolve: {
          channels: function (Channels) {
            return Channels.$loaded();
          },
          profile: function ($state, Auth, Users) {
            return Auth.$requireAuth().then(function (auth) {
              return Users.getProfile(auth.uid).$loaded().then(function (profile) {
                if (profile.displayName) {
                  return profile;
                } else {
                  $state.go('profile');
                }
              });
            }, function(error) {
              $state.go('home');
            });
          }
        }
      })
      .state('channels.create', {
        url: '/create',
        controller: 'ChannelsController',
        controllerAs: 'channelsCtrl',
        templateUrl: 'channels/create.html'
      })
      .state('channels.messages', {
        url: '/{channelId}/messages',
        controller: 'MessagesController',
        controllerAs: 'messagesCtrl',
        templateUrl: 'channels/messages.html',
        resolve: {
          messages: function($stateParams, Messages) {
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function($stateParams, channels) {
            return '#' + channels.$getRecord($stateParams.channelId).name;
          }
        }
      })
      .state('channels.direct', {
        url: '/{uid}/messages/direct',
        controller: 'MessagesController',
        controllerAs: 'messagesCtrl',
        templateUrl: 'channels/messages.html',
        resolve: {
          messages: function($stateParams, Messages, profile) {
            return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
          },
          channelName: function($stateParams, Users) {
            return Users.all.$loaded().then(function() {
              return '@' + Users.getDisplayName($stateParams.uid);
            });
          }
        }
      });

    $urlRouterProvider.otherwise('/');
  })
  .constant('FirebaseUrl', 'https://labchat.firebaseio.com/');
