# SchülerKompass für iOS und Android
Die Geräte-Apps bündeln die Dateien aus ../schuelerkompass. Die Tageserinnerung läuft über lokale Mitteilungen. Der Webtest liegt unter https://rauchclemens.github.io/schuelerkompass/ und die öffentliche Datenschutzerklärung unter https://rauchclemens.github.io/schuelerkompass/datenschutz.html.

## Lokal bauen
Im Verzeichnis _schuelerkompass-mobil mit Node 24 und pnpm 11.25.0 ausführen:

    pnpm install --frozen-lockfile --ignore-scripts
    node native.mjs android
    node native.mjs ios

Die Befehle erzeugen oder aktualisieren die lokalen Ordner android und ios. Dauerhafte Änderungen an Icons, Manifest und Erzeugung gehören in native.mjs und capacitor.config.json. Die App-ID ist de.clemensrauch.schuelerkompass.

Für Android das Projekt android in Android Studio mit JDK 21 und Android SDK 36 öffnen. Über Generate Signed Bundle / APK ein Android App Bundle mit dem eigenen Upload-Schlüssel signieren. In Google Play Console zuerst intern testen.

Für iOS auf einem Mac mit Xcode 26 oder neuer das Projekt ios/App/App.xcodeproj öffnen, das eigene Apple-Developer-Team wählen und eine eindeutige Bundle-ID registrieren. Über Product → Archive das Archiv erzeugen und im Organizer über Distribute App an App Store Connect übertragen. Anschließend mit TestFlight auf einem iPhone testen.

## Automatische Test-Builds
Der GitHub-Actions-Workflow „SchülerKompass Mobilbuilds“ erstellt eine installierbare Debug-APK, ein unsigniertes Release-AAB und ein unsigniertes iOS-Gerätearchiv. Die Downloads stehen bei den Artefakten eines erfolgreichen Laufs. Für den Store benötigen beide Release-Pakete die Signatur des jeweiligen Entwicklerkontos. Die Apple- und Google-Konten, die Signierschlüssel und spätere Freigaben verwaltet der Betreiber.

## Prüfung vor der Einreichung
Auf echten Geräten jeweils Rückblick speichern, erneut öffnen, lokalen Alarm setzen und ausschalten sowie alle App-Daten löschen. Für die Prüfung können fiktive Texte verwendet werden. Für die Store-Einträge die zur Version passenden Screenshots sowie die Datenschutzerklärung angeben. Die App selbst hat keine Registrierung, Bezahlung oder serverseitige Kontoverwaltung.
