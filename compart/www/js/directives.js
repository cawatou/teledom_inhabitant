angular.module('starter.directives', [])
.directive('datePickerTabs', function($ionicScrollDelegate) {
  return {
    restrict: 'EA',
    scope:{
      startMonth:'@?',
      clickCallback: '&'
    },
    templateUrl: 'templates/date-picker-tabs.html',
    controller: function($scope) {
      $scope.monthLabels = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      $scope.startMonth = $scope.startMonth ? $scope.startMonth : getCurrentMonth();
      $scope.activeMonth = $scope.monthLabels[$scope.startMonth];
      $scope.isActive = function(month){
        return month === $scope.activeMonth;
      }
      $scope.click = function (month) {
        $scope.activeMonth = month;
        var monthIndex = $scope.monthLabels.indexOf(month);
        $scope.clickCallback({month:monthIndex})
      };
      function getCurrentMonth (){
        var date = new Date();
        return date.getMonth();
      }
      $scope.clickCallback({month:$scope.monthLabels.indexOf($scope.activeMonth)})
    },
    link:function(){
      $ionicScrollDelegate.$getByHandle('months').scrollBottom();
    }
  };
})
.filter('startMonthFilter',function(){
  return function(months,startMonth){
    var newMonth = months.slice(startMonth+1,months.length);
    newMonth = newMonth.concat(months.slice(0,startMonth+1));
    return newMonth;
  }
});
