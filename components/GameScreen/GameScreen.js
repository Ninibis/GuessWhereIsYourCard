angular.module('noe-dev')
    .directive('gameScreen', function () {
        return {
            restrict: 'E',
            templateUrl: 'components/GameScreen/GameScreen.html',

            controller: function ($scope, $http, $timeout) {

                // Dès l'ouverture de la page, le jeu est initialisé
                initDeck($scope, $http, $timeout);
                var rightImage;
                var score;

                /**
                * Lorsque le joueur demande à changer de paquet de cartes.
                * Réinitialisation du jeu.
                */
                $scope.newGame = function () {
                    initDeck($scope, $http);
                }

                /**
                * Initialisation du jeu :
                * Appel de l'API.
                * Score à 0.
                * Lancement du jeu.
                */
                function initDeck($scope, $http, $timeout) {
                    $http.get('http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
                        .then(function (result) {

                            score = 0;
                            $scope.score = score;

                            $scope.beginning = true;
                            $scope.guess = true;

                            game(result, $scope, $timeout);

                        })
                        .catch(function (error) {
                            console.error(error);
                        });
                }

                /**
                * Fonction de lancement du jeu après le 1er appel à l'API.
                */
                function game(result, $scope) {

                    // on stocke le deckId généré
                    var deckId = result.data.deck_id;

                    // stock du nombre de cartes restantes pour l'afficher
                    $scope.remainingCards = result.data.remaining;

                    /**
                    * Fonction lorsque le joueur pioche 3 cartes dans le paquet.
                    * Appel de l'API.
                    * Affichage des cartes.
                    */
                    $scope.pickCard = function () {
                        $http.get('http://deckofcardsapi.com/api/deck/' + deckId + '/draw/?count=3')
                            .then(function (result) {
                                console.log(result);

                                $scope.remainingCards = result.data.remaining;
                                $scope.cards = result.data.cards;

                                $scope.card1 = result.data.cards[0];
                                $scope.card2 = result.data.cards[1];
                                $scope.card3 = result.data.cards[2];

                                $scope.beginning = true;
                                $scope.guess = false;


                                /**
                                * Lorsque joueur choisi la carte à retrouver,
                                * on stocke l'image de cette carte.
                                * Puis on appel la fonction qui mélange les cartes.
                                */
                                $scope.choose = function (card) {
                                    if(card == 'card1'){
                                        rightImage = result.data.cards[0].image;
                                    } else if(card == 'card2'){
                                        rightImage = result.data.cards[1].image;
                                    } else if(card == 'card3'){
                                        rightImage = result.data.cards[2].image;
                                    }

                                    melanger($scope);
                                }
                            })
                            .catch(function (error) {
                                console.error(error);
                            });
                    }

                }


                /**
                * Fonction lorsque le joueur a choisi la carte à retrouver.
                * On affiche les cartes face cachée.
                * La position de la bonne carte est choisie de manière aléatoire.
                */
                function melanger($scope) {

                    $scope.guess = true;
                    $scope.beginning = false;

                    $scope.place1 = "/resources/images/card.jpg";
                    $scope.place2 = "/resources/images/card.jpg";
                    $scope.place3 = "/resources/images/card.jpg";

                    var rand = Math.random() * 3;
                    var rightCard;

                    switch (Math.floor(rand)) {
                        case 0 :
                            rightCard = 1;
                            break;
                        case 1 :
                            rightCard = 2;
                            break;
                        case 2 :
                            rightCard = 3;
                            break;
                    }

                    /**
                    * Lorsque le joueur clique sur une carte face cachée :
                    * on teste si c'est la bonne carte et
                    * on lance les fonctions gagné/perdu.
                    */
                    $scope.try = function (card) {
                        switch (card) {
                            case 'card1' :
                                if(rightCard == 1) {
                                    $scope.place1 = rightImage;
                                    win();
                                } else {
                                    gameOver();
                                }
                                break;
                            case 'card2' :
                                if(rightCard == 2) {
                                    $scope.place2 = rightImage;
                                    win();
                                } else {
                                    gameOver();
                                }
                                break;
                            case 'card3' :
                                if(rightCard == 3) {
                                    $scope.place3 = rightImage;
                                    win();
                                } else {
                                    gameOver();
                                }
                                break;

                        }
                    }
                }

                /**
                * Affichage d'un message pour la victoire.
                * Augmentation du score.
                * Le joueur ne peut plus cliquer sur les cartes face cachée.
                * On regarde s'il reste assez de cartes dans le jeu.
                */
                function win() {
                    window.alert("BRAVO ! Tu as gagné !");
                    score = score + 1;
                    $scope.score = score;
                    $scope.try = null;
                    newGameForced();
                }

                /**
                * Affichage d'un message pour la défaite.
                * Le joueur ne peut plus cliquer sur les cartes face cachée.
                * On regarde s'il reste assez de cartes dans le jeu.
                */
                function gameOver() {
                    window.alert("Désolé, tu as perdu... Tente encore ta chance !");
                    $scope.try = null;
                    newGameForced();
                }

                /**
                * S'il reste moins de 3 cartes dans le paquet,
                * Le joueur ne peut plus piocher de cartes.
                * Il doit changer de jeu de cartes.
                */
                function newGameForced() {
                    if($scope.remainingCards < 3) {
                        $scope.pickCard = null;
                        window.alert("Il ne reste plus assez de cartes. Veuillez changer de jeu de cartes.");
                    }
                }

            }
        }
    });
