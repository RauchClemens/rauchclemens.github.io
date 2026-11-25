'use strict';
const haeufig = ['Gar nicht','Selten','Manchmal','Oft','Sehr oft'];
const menge = ['Gar nicht','Wenig','Etwas','Viel','Sehr viel'];
const themen = {
  medien: {
    name:'Mediennutzung', icon:'▣', intro:'Handy, Bildschirm und Pausen', fragen:[
      ['Wie lange hast du heute in deiner Freizeit auf einen Bildschirm geschaut?', ['Bis 15 Min.','Bis 1 Std.','Bis 2 Std.','Bis 3 Std.','Länger'], 'Schau in deiner Bildschirmzeit nach, wenn du es genauer wissen möchtest.'],
      ['Wie oft hast du heute zwischendurch aufs Handy geschaut?', haeufig, 'Beim Lernen kannst du das Handy für ein paar Minuten außer Reichweite legen.'],
      ['Wie oft hast du eine Bildschirmpause gemacht?', haeufig, 'Schau für eine kurze Pause aus dem Fenster. Was siehst du in der Ferne?'],
      ['Wie zufrieden bist du mit deiner Medienzeit?', ['Gar nicht','Kaum','Teils, teils','Ziemlich','Sehr'], 'Überlege dir einen Moment, in dem du morgen bewusst online oder offline sein möchtest.']
    ]},
  essen: {
    name:'Ernährung', icon:'◒', intro:'Essen, Trinken und dein Tag', fragen:[
      ['Wie viel Zeit hattest du heute zum Essen?', menge, 'Wann hättest du morgen Zeit für eine ruhige Pause?'],
      ['Wie oft hast du heute Wasser getrunken?', haeufig, 'Eine Flasche in deiner Tasche kann dich ans Trinken erinnern.'],
      ['Wie abwechslungsreich war dein Essen heute?', ['Kaum','Eher wenig','Teils, teils','Ziemlich','Sehr'], 'Welches Essen würdest du gerne einmal ausprobieren?'],
      ['Wie gut konntest du merken, ob du Hunger hattest?', ['Gar nicht','Kaum','Manchmal','Gut','Sehr gut'], 'Nimm dir kurz Zeit, auf dein eigenes Gefühl zu achten.']
    ]},
  ich: {
    name:'Mein Ich', icon:'✳', intro:'Gefühle, Stärken und kleine Erfolge', fragen:[
      ['Wie hast du dich heute insgesamt gefühlt?', ['Sehr schlecht','Eher schlecht','Gemischt','Gut','Sehr gut'], 'Gibt es einen Moment, der deinen Tag besonders geprägt hat?'],
      ['Wie viel Ruhe hattest du heute?', menge, 'Ein ruhiger Platz kann helfen, die eigenen Gedanken zu sortieren.'],
      ['Wie gut konntest du heute um Hilfe bitten?', ['Gar nicht','Schwer','Teils, teils','Gut','Sehr gut'], 'Überlege, welche Person du beim nächsten Mal ansprechen möchtest.'],
      ['Wie stolz bist du auf etwas, das dir gelungen ist?', ['Gar nicht','Ein wenig','Etwas','Ziemlich','Sehr'], 'Auch ein kleiner Schritt zählt. Was hast du heute zum ersten Mal versucht?']
    ]},
  bewegung: {
    name:'Bewegung', icon:'↗', intro:'Unterwegs und in Bewegung', fragen:[
      ['Wie viel hast du dich heute bewegt?', menge, 'Auch Wege im Schulhaus oder zur Haltestelle zählen.'],
      ['Wie oft bist du heute beim Sitzen aufgestanden?', haeufig, 'Wenn es für dich passt, wechsle in der nächsten Pause die Position.'],
      ['Wie viel Zeit hast du draußen verbracht?', ['Keine','Bis 10 Min.','Bis 30 Min.','Bis 1 Std.','Länger'], 'Wo bist du in deiner Umgebung gerne draußen?'],
      ['Wie viel Freude hattest du heute an Bewegung?', menge, 'Welche Bewegung passt zu dir? Das kann auch eine kleine Bewegung im Sitzen sein.']
    ]}
};
