angular.module('angularfireSlackApp')
  .controller('AuthController', function (Auth, $state) {
    var authCtrl = this;

    //creating the user
    authCtrl.user = {
      email: '',
      password: ''
    };

    //creating the login
    authCtrl.login = function () {
      Auth.$authWithPassword(authCtrl.user)
      .then(function (auth) {
        $state.go('home');
      }, function(err){
        authCtrl.error = err;
      })
    };

    //creating the registration page
    authCtrl.register = function () {
      Auth.$createUser(authCtrl.user)
      .then(function (user) {
        authCtrl.login();
      }, function (err) {
        authCtrl.error = err;
      });
    };
  });