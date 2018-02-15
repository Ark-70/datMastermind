$(document).ready(function() {

  // Ici, déclaration des objets de la page HTML (mise en cache)
  let $commencer = $('#commencer'), $hist = $('#hist'), $entrer = $('#entrer'), $prop = $('#prop'), $clear = $('#clear');

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
  $clear          .click(nettoyerErreurs);
  $('p>.chiffre') .click(gererBoutonsChiffres);
  $('html').keypress(function( event ) {
    if ( event.key == "Enter" || event.key == "'" ) {
      event.preventDefault();
    }
    switch (event.key) {
      case 1: case '&':

        break;
    switch (event.key) {
      case 2: case 'é':

        break;
    switch (event.key) {
      case 3: case '"':

        break;
    switch (event.key) {
      case 4: case "'":

        break;
    switch (event.key) {
      case 5: case '(':

        break;
    switch (event.key) {
      case 6: case '-':
        break;
      default:
    }

  });
  $entrer         .click(traiterProposition);


  function initSetup(){
    verouillerTout(true);
    verouiller(true,$clear);
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
      if(tab[i]<1 || tab[i]>6)testInter = false;
      if(tab[i]!=parseInt(tab[i]+1-1))testChiffre=false;
    }
    if(!testInter)$hist.append('<span class="erreur">Attention, les chiffres doivent être compris entre 1 et 6 inclus !<br/></span>');
    if(!testChiffre)$hist.append('<span class="erreur">Attention, le tableau doit contenir uniquement des chiffres !<br/></span>');
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
    verouiller(true,$clear);
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
    $prop.val('');
    if(testerTableauValide(prop)){
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
    }else verouiller(false,$clear);
  }

  function gererBoutonsChiffres(){
    let placeDuBouton = $('p>.chiffre').index($(this))+1;
    //place du bouton = sa valeur
    switch (placeDuBouton) {
      case 7:
        if(!$prop.prop('disabled') && $prop.val().length>0)$prop.val( $prop.val().slice(0, -2));
        break;
      case 8:
        if(!$prop.prop('disabled') && $prop.val().length>0)$prop.val("");
        break;
      default:
        if(!$prop.prop('disabled') && $prop.val().length<=6)$prop.val( $prop.val()+placeDuBouton+" ");
        break;
    }
  }

  function ajouterValeurAuChamp(valeur){

  }

});
