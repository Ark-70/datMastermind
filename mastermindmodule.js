$(document).ready(function() {
  //TODO LIST OF UPGRADES :
  // EN FAIT CA BUG TOUJOURS HEIN LES RESULTATS
  // -doublons/not doublons RADIO
  // animations des buttons quand touches R/N appuyées
  // ne pas pouvoir cliquer dans l'input -> en faire une div
    //un peu comme un cadran de vielle calculatrice/machine/etc. en design par ex
  // longueur tabSecret
  // nombre de combien à combien





  // Ici, déclaration des objets de la page HTML (mise en cache)
  let $commencer = $('#commencer'), $hist = $('#hist'), $entrer = $('#entrer'), $prop = $('#prop'), $nettoyer = $('#clear');

  // Création des constantes du jeu
  const LONGUEURSECRET = 4;    // taille du tableau à l'avance
  const NOMBRECOULEURS = 6;    // nombre de couleurs possibles
  const MAXPROPOSITIONS = 10;
  const DEBUGACTIF = true;
  const DEBUGDETAILS = true;
  const DOUBLONS_AUTORISES = false;

  let tabSecret = []; // Cette variable est globale
  let nProposition = 0;
  initSetup();


/********LISTENERS********/
  //Gestion des clics du joueur
  $commencer      .click(resetJeu);
  $nettoyer       .click(nettoyerErreurs);
  $entrer         .click(traiterProposition);

  $('p>.chiffre') .click(function(){
    traiterInputBoutons($(this));
  });
  $('html').keypress(function( event ) {
    traiterInputTouches(event);
  });

/****************/
  function initSetup(){
    verouillerTout(true);
    verouiller(true,$nettoyer);
    resetJeu();
  }

  function verouillerTout(lockBool) {
    $prop.prop('disabled',lockBool);
    $entrer.prop('disabled',lockBool);
  }

  function verouiller(lockBool,objet) {
    objet.prop('disabled',lockBool);
  }

  function recupTableauChamp(champ){
    tab = champ.val().split(' ');
    for (let i = 0; i < LONGUEURSECRET; i++) {
      tab[i] = parseInt(tab[i], 10);
    }
    return tab;
  }

  function resetJeu(){
    nProposition = 0;
    $prop.val('');
    $hist.html('');
    verouillerTout(false);
    /* Chargement du tableau en mémoire */
    tabSecret = (DOUBLONS_AUTORISES)? creerTableauRandomAvecDoublons(LONGUEURSECRET,NOMBRECOULEURS) : creerTableauRandomAvecDoublons(LONGUEURSECRET,NOMBRECOULEURS);
    if (DEBUGACTIF) console.log('Les chiffres à trouver : ' + tabSecret.join(' ')); // Affichage du tableau
  }

  function creerTableauRandomAvecDoublons(longueur,chiffreMaxPossible) {
    let randTab = Array.apply(null, {length: longueur}).map(
      function(value, index){
        return Math.floor(Math.random() * chiffreMaxPossible+1);
      }
    );
    return randTab;
  }

  function creerTableauRandomSansDoublons(longueur,chiffreMaxPossible) {
    let randTab = [];
    let tab = Array.apply(null, {length: chiffreMaxPossible}).map( //tab de 1 à 6 (=chiffremaxpossible)
      function(value, index){
        return index+1;
      }
    );
    for (var i = longueur - 1; i >= 0; i--) {
      let randIndexTab = Math.floor(Math.random() * longueur);
      randTab[i] = tab[randIndexTab];
      tab.splice(randIndexTab,1); //retirer du tableau l'élément déjà pris
      if (DEBUGDETAILS) console.log(i,tab);
    }
    return randTab;
  }

  function testerTableauValide(tab){
    let tableauValide = true, testInter = true, testChiffre = true;
    for (let i = 0; i < LONGUEURSECRET; i++){
      if(tab[i]<1 || tab[i]>6)testInter=false;
      if(tab[i]!=parseInt(tab[i]+1-1))testChiffre=false;
    }
    if(!testInter)$hist.append('<div class="erreur">Attention, les chiffres doivent être compris entre 1 et 6 inclus !<br/></div>');
    if(!testChiffre)$hist.append('<div class="erreur">Attention, le tableau doit contenir 4 chiffres !<br/></div>');
    if(!testInter || !testChiffre)tableauValide = false;
    return tableauValide;
  }


  function nettoyerErreurs(){
    $('.erreur').remove();
    verouiller(true,$nettoyer);
  }


  function donnerBonneMauvaisePlace(tab){
    let tabRef = tabSecret.slice(); //copie
    let bonnesPlaces = 0;
    let mauvaisesPlaces = 0;

    for (let i = 0; i < LONGUEURSECRET; i++) {
      for (let j = 0; j < LONGUEURSECRET; j++) {
        if (DEBUGDETAILS) console.log("tabSecret["+i+"]="+tabRef[i]+" avec proposition["+j+"]="+tab[j]+"");
        if(tabRef[i]===tab[j]){ // Si un nombre à trouver correspond à un nombre de la proposition
          //si on spam un chiffre priorité à la bonne place, puis ne peut plus être compté
          if(i===j){ // Si ces nombres sont à la meme position
            bonnesPlaces++;
            if (DEBUGDETAILS) console.log("↪ +1 Bonne place");
            // tabRef[i]=null;
            break; //fait la même chose que de flag les elements déjà faits : tab = null;
          }else{
            mauvaisesPlaces++;
            if (DEBUGDETAILS) console.log("↪ +1 Mauvaise place");
            tabRef[i]=null;
            break;
          }
        }
      }

    }
    return [bonnesPlaces,mauvaisesPlaces];
  }

  function traiterProposition(){
    let prop = recupTableauChamp($prop); //slice() créé une copie du tableau ici
    if(testerTableauValide(prop)){
      $prop.val('');
      nProposition++;

      let tabPlacesTrouvees = donnerBonneMauvaisePlace(prop);
      let bonnesPlaces = tabPlacesTrouvees[0];
      let mauvaisesPlaces = tabPlacesTrouvees[1];

      if (DEBUGACTIF) console.log("Places : "+bonnesPlaces+" B ; "+mauvaisesPlaces+" M");

      let strColors="";
      for (let i = 0; i < LONGUEURSECRET; i++) {
        strColors+="<i class='chiffre n"+prop[i]+"'>"+prop[i]+"</i> ";
      }
      $hist.append("<div class='histcolor'>"+strColors+": "+afficherPastillesPlaces(bonnesPlaces,mauvaisesPlaces)+"</div>");

      if(bonnesPlaces===4){
        $hist.append("BRAVO ! Au bout de "+nProposition+" essai(s)<br/>");
        verouillerTout(true);
      }else if(nProposition>=MAXPROPOSITIONS){
        $hist.append("Hors jeu, le code est "+tabSecret.join(', ')+"<br/>");
        verouillerTout(true);
      }
    }else verouiller(false,$nettoyer);
  }

  function afficherPastillesPlaces(bonnesPlaces,mauvaisesPlaces){
    strPastilles = "";
    for (let i = 0; i < LONGUEURSECRET; i++) {
      //par default, pastille blanche/rien
      let strParticulier = "";
      if (bonnesPlaces-i>0) {
        strParticulier = " bonne";
      }else if((mauvaisesPlaces+bonnesPlaces-i)>0){
        strParticulier = " mauvaise";
      }
      strPastilles += "<i class='place"+strParticulier+"'></i>";
    }
    return strPastilles;
  }

  function traiterInputBoutons($boutonClicked){
    let inputADonner = $('p>.chiffre').index($boutonClicked)+1;
    if (inputADonner === NOMBRECOULEURS+1) inputADonner = "Backspace";
    if (inputADonner === NOMBRECOULEURS+2) inputADonner = "Escape";
    traiterInputNormalisee(inputADonner);
  }


  function traiterInputTouches(theEvent){
    let keyPressed = theEvent.key;
    let tabTouchesSpeciales = ["Enter","Backspace","Escape","Delete","N","n","R","r"];
    let tabCorrespondanceChiffres = ["&","é",'"',"'","(","-"];

    //si c'est une touche spéciale
    if(tabTouchesSpeciales.indexOf(keyPressed)!==-1){
      theEvent.preventDefault();
      switch (keyPressed) {
        case "Enter":
          $entrer.click();
          break;
        case "N" : case "n" : $nettoyer.click();
          break;
        case "R" : case "r" : $commencer.click();
          break;
        default:
          traiterInputNormalisee(keyPressed);
      }
    }

    //si c'est un chiffre
    if(tabCorrespondanceChiffres.indexOf(keyPressed)!==-1 || $.isNumeric(keyPressed)){
      theEvent.preventDefault();
      let toucheEnChiffre = ($.isNumeric(keyPressed)) ? keyPressed : tabCorrespondanceChiffres.indexOf(keyPressed)+1;
      // console.log(toucheEnChiffre);
      traiterInputNormalisee(toucheEnChiffre);
    }
  }

  function traiterInputNormalisee(input){
    // 7 = retour arrière
    // 8 = supprimer tout
    switch (input) {
      case "Backspace":
        if(!$prop.prop('disabled') && $prop.val().length>0) modifierValeurChamp("supprimerDernier");
        break;
      case "Escape": case "Delete":
        if(!$prop.prop('disabled') && $prop.val().length>0) modifierValeurChamp("supprimerTout");
        break;
      default: //chiffre ici
        if(!$prop.prop('disabled') && $prop.val().length<=6) modifierValeurChamp("ajouter",input);
        break;
    }
  }

  function modifierValeurChamp(typeAction, nouvelleValeur = null){
    let $champ = $prop;
    let contenuPrecedent = $champ.val()
    switch (typeAction) {
      case "ajouter":
        $champ.val(contenuPrecedent+nouvelleValeur+" ");
        break;
      case "supprimerDernier":
        $champ.val(contenuPrecedent.slice(0,-2));
        break;
      case "supprimerTout":
        $champ.val("");
        break;
    }
  }

});
