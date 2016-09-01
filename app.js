var app = angular.module('noe-dev', ['ngRoute', 'ngSanitize']);

app.config(function ($routeProvider) {

    $routeProvider
        .when('/', {
            template: '<game-screen></game-screen>'
        })
        .otherwise('/');
});


app.controller('AppCtrl', AppCtrl);

function AppCtrl($scope, $location) {

}
