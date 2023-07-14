const app = angular.module("myapp", []);
app.controller("mycontro", ($scope, $http) => {
  $scope.queryallhome = () => {
    $http.get("/getallhouse").then(
      (response) => {
        $scope.cards = response.data;
        console.log($scope.cards);
      },
      (error) => {
        alert("Something Went wrong! Please Try After Some Time");
      }
    );
  };

  $scope.addhomes = () => {
    $http({
      url: "createhome",
      method: "POST",
      data: {
        name: $scope.name,
       desc: $scope.desc,
      },
    }).then(
      (response) => {
        $scope.queryallhome();
        console.log(response.data);
        if (response.data.status === "ok") {
          $scope.message = "Home Created SuccessFully!";
        } else {
          $scope.message = "Something Went Wrong!";
        }
        myModal.show();
        $scope.queryallhome();
      },
      (error) => {
        console.log(error);
      }
    );
  };

  $scope.editpolybox = (id, name,desc) => {
    $scope.editname = name;
    $scope.editdesc =desc;
    $scope.editid = id;
  };

  $scope.updatepoly = (id) => {
    console.warn("updating polyhouse", id);
    $http({
      url: `/editpolyhousedetails/${id}`,
      method: "PATCH",
      data: {
        name: $scope.editname,
       desc: $scope.editdesc,
      },
    }).then(
      (response) => {
        console.log(response.data);
        if (response.data.status === "ok") {
          alert("PolyHouse Updated SuccessFully!");
          $scope.queryallhome();
        } else {
          alert("Something Went Wrong!");
          $scope.queryallhome();
        }
        editboxmodal.hide();
      },
      (error) => {
        console.log(error);
        editboxmodal.hide();
      }
    );
  };
});
