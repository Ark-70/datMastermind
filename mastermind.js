$(document).ready(function() {

  // Ici, déclaration des objets de la page HTML (mise en cache)
  let $commencer = $('#commencer'), $hist = $('#hist'), $entrer = $('#entrer'), $prop = $('#prop'), $nettoyer = $('#clear');

  // Création des constantes du jeu
  const LONGUEURSECRET = 4;    // taille du tableau à l'avance
  const NOMBRECOULEURS = 6;    // nombre de couleurs possibles
  const MAXPROPOSITIONS = 10;
  const DEBUGACTIVE = true;

  let tabSecret = []; // Cette variable est globale
  let nProposition = 0;
  initSetup();

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

  function creerTableauPrerempli(longueur,chiffreMaxPossible) {
    // Au tableau
    newTab = Array.apply(null, {length: longueur}).map(
      function(value, index){
        return index + 1;
      }
    );
    return newTab;
  }

  function shuffle(tab){
    newTab = tab;
    longueur = newTab.length;
    for (let i = 0; i < longueur; i++) {
      // On veut un élément aléatoire avec lequel échanger
      indexRandom = Math.floor( Math.random()*(longueur-1) )
      //là, l'élément aléatoire est tab[indexRandom]
      tmp = newTab[i];
      newTab[i] = newTab[indexRandom];
      newTab[indexRandom] = tmp;
    }
    return newTab;
  }

  function testerTableauValide(tab){
    let tableauValide = true, testInter = true, testChiffre = true;
    for (let i = 0; i < LONGUEURSECRET; i++){
      if(tab[i]<1 || tab[i]>6)testInter=false;
      if(tab[i]!=parseInt(tab[i]+1-1))testChiffre=false;
    }
    if(!testInter)$hist.append('<span class="erreur">Attention, les chiffres doivent être compris entre 1 et 6 inclus !<br/></span>');
    if(!testChiffre)$hist.append('<span class="erreur">Attention, le tableau doit contenir 4 chiffres !<br/></span>');
    if(!testInter || !testChiffre)tableauValide = false;
    return tableauValide;
  }

  function resetJeu(){
    nProposition = 0;
    $prop.val('');
    $hist.html('');
    verouillerTout(false);
    /* Chargement du tableau en mémoire */
    tabSecret = shuffle(creerTableauPrerempli(LONGUEURSECRET,NOMBRECOULEURS));
    if (DEBUGACTIVE) console.log('Les chiffres à trouver : ' + tabSecret.join(' ')); // Affichage du tableau
  }

  function nettoyerErreurs(){
    $('.erreur').remove();
    verouiller(true,$nettoyer);
  }


  function comparerTableaux(tab){
    let bonnePlace = 0;
    let mauvaisePlace = 0;

    for (let i = 0; i < LONGUEURSECRET; i++) {
      for (let j = 0; j < LONGUEURSECRET; j++) {
        if(tabSecret[i]===tab[j]){ // Si un nombre à trouver correspond à un nombre de la proposition
          if(i===j){ // Si ces nombres sont à la meme position
            bonnePlace++;
            if (DEBUGACTIVE) console.log("Bonne place : tabSecret["+i+"] avec prop["+j+"]");
          }
          else{
            mauvaisePlace++;
            if (DEBUGACTIVE) console.log("Mauvaise place : tabSecret["+i+"] avec prop["+j+"]");
          }
        }
      }
    }
    return [bonnePlace,mauvaisePlace];
  }

  function traiterProposition(){
    let prop = recupTableauChamp($prop);
    if(testerTableauValide(prop)){
      $prop.val('');
      nProposition ++;

      let tabPlacesTrouvees = comparerTableaux(prop);
      let bonnePlace = tabPlacesTrouvees[0];
      let mauvaisePlace = tabPlacesTrouvees[1];

      if (DEBUGACTIVE) console.log(bonnePlace+" ; "+mauvaisePlace);
      let strColors="";
      for (let i = 0; i < LONGUEURSECRET; i++) {
        strColors+="<i class='chiffre n"+prop[i]+"'>"+prop[i]+"</i> ";
      }
      $hist.append("<span id='histcolor'>"+strColors+"</span>: Bonnes places : "+bonnePlace+" ; Mauvaises places : "+mauvaisePlace+"<br/>");

      if(bonnePlace===4){
        $hist.append("BRAVO ! Au bout de "+nProposition+" essai(s)<br/>");
        verouillerTout(true);
      }
      if(nProposition>=MAXPROPOSITIONS){
        $hist.append("Hors jeu, le code est "+tabSecret.join(', ')+"<br/>");
        verouillerTout(true);
      }
    }else verouiller(false,$nettoyer);
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
    console.log(input);
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
