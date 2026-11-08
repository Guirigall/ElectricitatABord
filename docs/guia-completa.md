[← README](../README.md)

> Guia tècnica detallada / Detailed technical guide. Les ordres referides al projecte font només són aplicables si aquests fitxers hi són; el README descriu els fitxers i les ordres d’aquest repositori.

# A bord · PWA

[Català](#catala) · [Español](#espanol) · [English](#english)

<a id="catala"></a>
## Català

Aquesta carpeta conté la versió instal·lable del simulador elèctric del veler. Conserva els set idiomes, els controls, la versió adaptable a mòbil i l’HTML autònom descarregable. No requereix compilació, npm, compte d’usuari ni cap servidor d’aplicacions.

### Què hi ha

- `index.html`: simulador amb el manifest i el panell d’instal·lació de la PWA.
- `manifest.webmanifest`: nom, icones, URL inicial i obertura en una finestra pròpia.
- `sw.js`: memòria cau per utilitzar el simulador sense connexió.
- `pwa.js` i `pwa.css`: controls d’instal·lació, connectivitat i actualitzacions, traduïts als set idiomes.
- `icons/`: icones PNG de 192 i 512 px, icona maskable de 512 px, icona d’Apple de 180 px i l’original SVG.
- `simulador-autonom.html`: versió d’un sol fitxer. El botó «Desa aquest HTML» descarrega aquesta còpia sense dependències de la PWA ni claus API.
- `VERSION.txt` i `actualitza-versio.mjs`: identificador de versió de la memòria cau i eina per actualitzar-lo.
- `prova-local.sh`: servidor de proves al mateix ordinador.
- `_headers`: capçaleres opcionals per a allotjaments estàtics compatibles.
- `tests-pwa.mjs`: comprovacions automàtiques de la PWA, sense dependències.

### Publicar-la per accedir-hi des del mòbil

1. Puja **tot el contingut d’aquesta carpeta**, mantenint els noms i la carpeta `icons`, a un allotjament de fitxers estàtics amb **HTTPS i certificat vàlid**.
2. Pot estar a l’arrel del domini o en una subcarpeta, per exemple `https://el-teu-domini.cat/veler/`. Les referències són relatives: no cal modificar-les. Accedeix a la subcarpeta amb la barra final `/`.
3. El servidor ha de servir `index.html` com a índex i els fitxers reals, sense substituir peticions JS o manifest per una pàgina HTML. Tipus recomanats: `.html` → `text/html`, `.js` → `text/javascript`, `.css` → `text/css`, `.webmanifest` → `application/manifest+json`, `.png` → `image/png`, `.svg` → `image/svg+xml`.
4. Fes que `sw.js` es revalidi quan publiquis canvis (`Cache-Control: no-cache`). `_headers` ho prepara als allotjaments que l’accepten; en altres servidors s’ha de configurar segons el servidor.
5. Obre l’URL HTTPS al mòbil amb connexió i espera el missatge que confirma que el simulador està preparat per funcionar sense connexió.

La carpeta està preparada però **disponible a l’enllaç del README**. Un enllaç a un fitxer del teu ordinador no és una adreça web accessible al telèfon.

### Instal·lar a Android

1. Obre l’URL HTTPS amb Chrome.
2. Si apareix «Instal·la l’app» dins la pàgina, prem-lo i segueix les indicacions del navegador.
3. Alternativament, menú de Chrome `⋮` → «Afegeix a la pantalla d’inici» o «Instal·la l’aplicació». Les opcions depenen de la versió i dels criteris del navegador.
4. Obre «A bord» des de la icona del telèfon.

No cal un APK ni habilitar instal·lacions d’orígens desconeguts. Alguns navegadors poden oferir només una drecera; la instal·lació com a aplicació la decideix el navegador.

A iPhone: Safari → Compartir → Afegeix a la pantalla d’inici. La pàgina també té el botó «Instal·lació» amb aquestes indicacions als set idiomes.

### Funcionament sense connexió

Després de la primera càrrega completa i l’activació del service worker, es desen localment la pàgina, les icones, el manifest, els controls PWA i la còpia de l’HTML autònom. La simulació elèctrica, el calendari, el càlcul solar, els idiomes i el vent manual continuen funcionant sense Internet.

Les peticions a Open-Meteo i OpenWeather **no es desen a la memòria cau de la PWA**, ni tampoc les claus API. Sense Internet no hi ha noves consultes meteorològiques. Les dades que ja estiguin en memòria durant la sessió conserven les regles de cobertura del simulador. La clau d’OpenWeather continua sent opcional i només queda en memòria de la sessió.

La preferència d’idioma es conserva al navegador. La PWA no afegeix desament de l’estat de la simulació: tancar o recarregar la pàgina inicia una simulació nova. El navegador pot eliminar la memòria cau si l’usuari esborra les dades del lloc o si necessita espai; caldria tornar a carregar la pàgina amb connexió.

### Actualitzacions

Després d’editar els fitxers de l’aplicació, amb Node.js instal·lat, executa des d’aquesta carpeta:

```bash
node actualitza-versio.mjs
node tests-pwa.mjs
```

Puja el conjunt actualitzat al mateix allotjament, preferentment amb un desplegament atòmic. El navegador detectarà la nova versió del service worker en obrir la web; la pàgina també comprova actualitzacions quan torna la connexió.

Si hi ha una versió nova preparada, apareix «Actualització disponible». L’usuari pot seguir amb la simulació actual. Només en prémer «Actualitza i reinicia» s’activa la versió i es recarrega aquesta finestra. La neteja de memòria cau es limita a aquesta PWA i a la seva ruta; no toca altres aplicacions del mateix domini.

### Provar-la a l’ordinador

Amb Python 3:

```bash
./prova-local.sh
```

Obre `http://localhost:8000/` al navegador del mateix ordinador. També pots triar un altre port: `./prova-local.sh 8080`. Atura el servidor amb Ctrl+C.

`localhost` és una excepció de desenvolupament als requisits d’HTTPS. Obrir `index.html` amb doble clic (`file://`) o servir-lo al mòbil amb `http://192.168.1.x:8000` permet, segons el navegador, veure la web, però **no és suficient per preparar la PWA i el seu mode sense connexió**. Per instal·lar-la al mòbil, fes servir una URL HTTPS de confiança.

### Verificació feta i comprovació al mòbil

Les proves Node verifiquen manifest i dimensions d’icones, URLs relatives en subcarpetes, càrrega inicial, navegació sense xarxa, exclusions d’API, neteja de versions, fallada d’instal·lació, set idiomes, controls d’instal·lació i actualització voluntària. També es conserven les comprovacions funcionals del simulador original.

Aquestes comprovacions utilitzen un entorn simulat i no substitueixen una instal·lació real en Android. Un cop publicada, comprova al mòbil: instal·lació, obertura des de la icona, mode avió amb el simulador ja preparat, canvi d’idioma i actualització sense recàrrega inesperada.

Referències:

- [Manifest web](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Service workers i ús sense connexió](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Instal·lació a Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid)

---

<a id="espanol"></a>
## Español

Esta carpeta contiene la versión instalable del simulador eléctrico del velero. Conserva los siete idiomas, los controles, el diseño adaptable a móviles y el HTML autónomo descargable. No requiere compilación, npm, una cuenta de usuario ni un servidor de aplicaciones.

### Contenido

- `index.html`: simulador con el manifiesto y el panel de instalación de la PWA.
- `manifest.webmanifest`: nombre, iconos, URL inicial y apertura en una ventana propia.
- `sw.js`: caché para utilizar el simulador sin conexión.
- `pwa.js` y `pwa.css`: controles de instalación, conectividad y actualizaciones, traducidos a los siete idiomas.
- `icons/`: iconos PNG de 192 y 512 px, icono adaptable a máscaras de 512 px, icono de Apple de 180 px y el original SVG.
- `simulador-autonom.html`: versión de un solo archivo. El botón «Guarda este HTML» descarga esta copia sin dependencias de la PWA ni claves API.
- `VERSION.txt` y `actualitza-versio.mjs`: identificador de versión de la caché y herramienta para actualizarlo.
- `prova-local.sh`: servidor de pruebas en el mismo ordenador.
- `_headers`: cabeceras opcionales para alojamientos estáticos compatibles.
- `tests-pwa.mjs`: comprobaciones automáticas de la PWA, sin dependencias.

### Publicarla para acceder desde el móvil

1. Sube **todo el contenido de esta carpeta**, manteniendo los nombres y la carpeta `icons`, a un alojamiento de archivos estáticos con **HTTPS y un certificado válido**.
2. Puede estar en la raíz del dominio o en una subcarpeta, por ejemplo `https://tu-dominio.es/velero/`. Las referencias son relativas: no es necesario modificarlas. Accede a la subcarpeta con la barra final `/`.
3. El servidor debe servir `index.html` como índice y los archivos reales, sin sustituir las peticiones de JS o del manifiesto por una página HTML. Tipos recomendados: `.html` → `text/html`, `.js` → `text/javascript`, `.css` → `text/css`, `.webmanifest` → `application/manifest+json`, `.png` → `image/png`, `.svg` → `image/svg+xml`.
4. Configura la revalidación de `sw.js` al publicar cambios (`Cache-Control: no-cache`). `_headers` lo prepara en los alojamientos que lo aceptan; en otros servidores debe configurarse según el servidor.
5. Abre la URL HTTPS en el móvil con conexión y espera el mensaje que confirma que el simulador está preparado para funcionar sin conexión.

La carpeta está preparada, pero **disponible en el enlace del README**. Un enlace a un archivo de tu ordenador no es una dirección web accesible desde el teléfono.

### Instalar en Android

1. Abre la URL HTTPS con Chrome.
2. Si aparece «Instala la app» dentro de la página, púlsalo y sigue las indicaciones del navegador.
3. Alternativamente, menú de Chrome `⋮` → «Añadir a pantalla de inicio» o «Instalar aplicación». Las opciones dependen de la versión y de los criterios del navegador.
4. Abre «A bord» desde el icono del teléfono.

No hace falta un APK ni habilitar instalaciones de orígenes desconocidos. Algunos navegadores pueden ofrecer solo un acceso directo; el navegador decide la instalación como aplicación.

En iPhone: Safari → Compartir → Añadir a pantalla de inicio. La página también tiene el botón «Instalación» con estas indicaciones en los siete idiomas.

### Funcionamiento sin conexión

Después de la primera carga completa y de la activación del service worker, se guardan localmente la página, los iconos, el manifiesto, los controles de la PWA y la copia del HTML autónomo. La simulación eléctrica, el calendario, el cálculo solar, los idiomas y el viento manual siguen funcionando sin Internet.

Las peticiones a Open-Meteo y OpenWeather **no se guardan en la caché de la PWA**, ni tampoco las claves API. Sin Internet no hay nuevas consultas meteorológicas. Los datos que ya estén en memoria durante la sesión conservan las reglas de cobertura del simulador. La clave de OpenWeather sigue siendo opcional y solo permanece en la memoria de la sesión.

La preferencia de idioma se conserva en el navegador. La PWA no añade almacenamiento del estado de la simulación: cerrar o recargar la página inicia una simulación nueva. El navegador puede eliminar la caché si el usuario borra los datos del sitio o si necesita espacio; sería necesario volver a cargar la página con conexión.

### Actualizaciones

Después de editar los archivos de la aplicación, con Node.js instalado, ejecuta desde esta carpeta:

```bash
node actualitza-versio.mjs
node tests-pwa.mjs
```

Sube el conjunto actualizado al mismo alojamiento, preferiblemente con un despliegue atómico. El navegador detectará la nueva versión del service worker al abrir la web; la página también comprueba actualizaciones cuando vuelve la conexión.

Si hay una versión nueva preparada, aparece «Actualización disponible». El usuario puede seguir con la simulación actual. Solo al pulsar «Actualiza y reinicia» se activa la versión y se recarga esta ventana. La limpieza de la caché se limita a esta PWA y a su ruta; no afecta a otras aplicaciones del mismo dominio.

### Probarla en el ordenador

Con Python 3:

```bash
./prova-local.sh
```

Abre `http://localhost:8000/` en el navegador del mismo ordenador. También puedes elegir otro puerto: `./prova-local.sh 8080`. Detén el servidor con Ctrl+C.

`localhost` es una excepción de desarrollo a los requisitos de HTTPS. Abrir `index.html` con doble clic (`file://`) o servirlo al móvil con `http://192.168.1.x:8000` permite, según el navegador, ver la web, pero **no es suficiente para preparar la PWA y su modo sin conexión**. Para instalarla en el móvil, utiliza una URL HTTPS de confianza.

### Verificación realizada y comprobación en el móvil

Las pruebas de Node verifican el manifiesto y las dimensiones de los iconos, las URL relativas en subcarpetas, la carga inicial, la navegación sin red, las exclusiones de API, la limpieza de versiones, los fallos de instalación, los siete idiomas, los controles de instalación y la actualización voluntaria. También se conservan las comprobaciones funcionales del simulador original.

Estas comprobaciones utilizan un entorno simulado y no sustituyen una instalación real en Android. Una vez publicada, comprueba en el móvil: instalación, apertura desde el icono, modo avión con el simulador ya preparado, cambio de idioma y actualización sin una recarga inesperada.

Referencias:

- [Manifiesto web](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Service workers y uso sin conexión](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Instalación en Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid)

---

<a id="english"></a>
## English

This folder contains the installable version of the sailboat electrical simulator. It retains all seven languages, controls, mobile-friendly layout and downloadable standalone HTML. No build step, npm, user account or application server is required.

### Contents

- `index.html`: simulator with the PWA manifest link and installation panel.
- `manifest.webmanifest`: app name, icons, start URL and standalone window settings.
- `sw.js`: cache for using the simulator offline.
- `pwa.js` and `pwa.css`: installation, connectivity and update controls, translated into all seven languages.
- `icons/`: 192 and 512 px PNG icons, a 512 px maskable icon, a 180 px Apple icon and the SVG source.
- `simulador-autonom.html`: single-file version. The “Save this HTML” button downloads this copy without PWA dependencies or API keys.
- `VERSION.txt` and `actualitza-versio.mjs`: cache version identifier and the tool used to update it.
- `prova-local.sh`: test server running on the same computer.
- `_headers`: optional headers for compatible static hosting services.
- `tests-pwa.mjs`: automated PWA checks with no dependencies.

### Publishing for mobile access

1. Upload **the entire contents of this folder**, preserving the filenames and the `icons` folder, to a static hosting service with **HTTPS and a valid certificate**.
2. It can be hosted at the domain root or in a subfolder, such as `https://your-domain.com/sailboat/`. All references are relative, so no changes are needed. Include the trailing `/` when accessing the subfolder.
3. The server must serve `index.html` as the directory index and serve the actual files, without replacing requests for JS or the manifest with an HTML page. Recommended MIME types: `.html` → `text/html`, `.js` → `text/javascript`, `.css` → `text/css`, `.webmanifest` → `application/manifest+json`, `.png` → `image/png`, `.svg` → `image/svg+xml`.
4. Configure `sw.js` to be revalidated when publishing changes (`Cache-Control: no-cache`). `_headers` provides this configuration on hosting services that support it; other servers require their own configuration.
5. Open the HTTPS URL on your phone while connected and wait for the message confirming that the simulator is ready for offline use.

The folder is ready, but **it has not been published**. A link to a file on your computer is not a web address that your phone can access.

### Installing on Android

1. Open the HTTPS URL in Chrome.
2. If the page shows “Install app”, press it and follow the browser’s instructions.
3. Alternatively, open Chrome’s `⋮` menu → “Add to home screen” or “Install app”. Available options depend on the browser version and its installation criteria.
4. Open “A bord” using the icon on your phone.

No APK or permission to install apps from unknown sources is needed. Some browsers may offer only a shortcut; the browser determines whether to install it as an app.

On iPhone: Safari → Share → Add to Home Screen. The page also has an “Installation” button with these instructions in all seven languages.

### Offline use

After the first complete load and service worker activation, the page, icons, manifest, PWA controls and standalone HTML copy are stored locally. The electrical simulation, calendar, solar calculations, languages and manual wind mode continue to work without Internet access.

Requests to Open-Meteo and OpenWeather **are not stored in the PWA cache**, and neither are API keys. New weather requests require Internet access. Data already held in memory during the session remain subject to the simulator’s coverage rules. The OpenWeather key remains optional and is held only in session memory.

The browser remembers your language preference. The PWA does not add simulation state persistence: closing or reloading the page starts a new simulation. The browser may delete the cache if the user clears site data or if it needs storage space; the page would then need to be loaded again while connected.

### Updates

After editing the application files, with Node.js installed, run these commands from this folder:

```bash
node actualitza-versio.mjs
node tests-pwa.mjs
```

Upload the updated files to the same hosting service, preferably using an atomic deployment. The browser will detect the new service worker version when the website opens; the page also checks for updates when connectivity returns.

When a new version is ready, “Update available” appears. You can continue the current simulation. The new version is activated and this window reloads only when you press “Update and restart”. Cache cleanup is limited to this PWA and its path; other applications on the same domain are unaffected.

### Testing on your computer

With Python 3:

```bash
./prova-local.sh
```

Open `http://localhost:8000/` in a browser on the same computer. You can also choose another port: `./prova-local.sh 8080`. Stop the server with Ctrl+C.

`localhost` is a development exception to the HTTPS requirements. Depending on the browser, opening `index.html` by double-clicking it (`file://`) or serving it to your phone at `http://192.168.1.x:8000` may let you view the website, but **it is not sufficient to set up the PWA and its offline mode**. Use a trusted HTTPS URL to install it on your phone.

### Completed checks and mobile testing

The Node tests check the manifest and icon dimensions, relative URLs in subfolders, initial loading, offline navigation, API exclusions, version cleanup, installation failures, all seven languages, installation controls and optional updates. The original simulator’s functional checks are also retained.

These checks use a simulated environment and do not replace a real Android installation test. Once published, check the following on your phone: installation, launching from the icon, airplane mode after the simulator is ready, language switching and updating without an unexpected reload.

References:

- [Web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Service workers and offline use](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Installing on Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid)
