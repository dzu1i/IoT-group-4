# Sklenik - technicke poznamky

## HW sestava
- ESP8266 NodeMCU - wifi mikrokontroler, cte senzor a posila data
- DHT22 - senzor teploty a vlhkosti
- Raspberry Pi Zero 2 WH - maly server, bezi na nem MQTT broker a Node-RED
- MicroSD 32GB - system pro Pi
- kabely, krabicky, zdroje

## Jak to funguje
ESP8266 precte teplotu/vlhkost z DHT22 → posle MQTT zpravu pres WiFi → 
Mosquitto broker na Pi ji prijme → Node-RED ji zpracuje a posle HTTP POSTem do Supabase → 
data jsou v PostgreSQL databazi v cloudu → web dashboard je zobrazuje

## Firmware (ESP8266)
- programovano v Arduino IDE, jazyk C/C++
- knihovny: PubSubClient (MQTT klient), DHT (cteni senzoru)
- ESP se pripoji na WiFi, posle JSON na MQTT topic (napr. sklenik/sklenik1)
- format zpravy: {"temperature": 24.5, "humidity": 62.3}
- kazde ESP ma unikatni client ID
- MQTT host = IP adresa Pi v lokalni siti, port 1883, bez hesla

### FW detaily

#### WiFiManager portal 
ESP se nekonfiguruje natvrdo v kodu. Kdyz se nemuze pripojit na WiFi (nebo kdyz zmacknes tlacitko na D5), 
vytvori vlastni hotspot "Sklenik-XXXXXX" s heslem "nastav1234". Pripojis se telefonem, otevres 192.168.4.1
a ve formulari vyplnis WiFi, MQTT host, device ID, lokaci, interval mereni. Vsechno se ulozi do flash pameti 
(LittleFS), takze to prezije restart.

#### Deep sleep
ESP nema byt zapnuty porad. Zmeri, posle, a usne na nastaveny pocet sekund (default 300 = 5 minut). Tim setri 
energii, teoreticky muze bezet na baterii. Kdyz nastavis sleep na 0, prepne se do debug modu - zusane vzhuru 
a meri kazdych 30 sekund, to je uzitecne pri testovani.

#### Retry logika
Cteni DHT22 obcas selze (je to lacinej senzor), tak to zkusi 3x nez to vzda. Stejne tak MQTT 
pripojeni ma timeout 10 sekund s opakovanim.

#### Baterie
Cte napeti na ADC pinu, zprumeruje 8 vzorku a prepocita na procenta. I kdyz jedete z USB, ta 
hodnota tam je. Pripravenej na bateriovy provoz.#### MQTT zprava - Neni to jen teplota a vlhkost. 
Posila taky device ID, lokaci, procento baterie, silu WiFi signalu (RSSI) a uptime. Takze v Node-RED/Supabase
muzes sledovat i kvalitu pripojeni a stav zarizeni.

#### Konfiguracni tlacitko 
Fyzickej button na pinu D5. Kdyz ho podrzis pri startu, ESP vzdy otevre konfiguracni portal,
i kdyz ma ulozenou WiFi. Kdyz zmeni router nebo se prestehuje, nemusis preflashovavat.

#### Topic struktura
sklenik/senzory/{device_id}/telemetry. Ciste, skalovatelny. V Node-RED chytas sklenik/# a mas vsechny senzory.

## Raspberry Pi Zero 2 WH
- system: Raspberry Pi OS Lite 64-bit (bez desktopu, setri RAM)
- 512 MB RAM - staci na 2 docker kontejnery, pridali jsme 1 GB swap
- nastaveni WiFi a SSH pres Raspberry Pi Imager pred prvnim bootem
- bezi Docker s docker-compose, 2 services:

### Mosquitto (MQTT broker)
- image: eclipse-mosquitto:2
- port 1883
- allow_anonymous = true (domaci sit, neni treba heslo)
- prijima zpravy z ESP a predava je Node-RED

### Node-RED
- image: nodered/node-red
- port 1880
- vizualni flow: mqtt in → function node (parsuje JSON, pridava Supabase headers) → http request (POST do Supabase REST API)
- zadny kod, vse naklikane ve webovem editoru

## Cloud (Supabase)
- free tier, PostgreSQL databaze
- tabulka "readings": id, device_id, temperature, humidity, created_at
- pristup pres REST API s anon key v hlavicce
- web dashboard cte data z tyhle tabulky

## Skalovatelnost
- pridani dalsiho senzoru = novy ESP8266 s jinym client ID a topicem
- vic lokaci (dum + chata) = bud druhy Pi na kazde lokaci posilajici do stejnyho Supabase, nebo VPN tunel (Tailscale) mezi lokacemi
- Node-RED flow netreba menit, topic sklenik/# chyta vsechno
