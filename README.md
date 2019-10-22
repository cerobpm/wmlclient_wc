# wmlclient_wc
### Cuahsi waterML client for nodejs
## Resumen

Librería para nodejs, interfaz de línea de comando, REST API e interfaz gráfica para acceso al web service CUAHSI/waterML de datos hidrológicos. 
Inicialmente apuntado al servidor HIS-Plata de la OMM
Permite acceder al listado de estaciones, de series y de datos disponibles en el web service y descargarlos en formato JSON,
geoJSON o CSV

## Instalación

**instalar nodejs y npm:**

en Linux:  `sudo apt install nodejs npm`
    
crear una carpeta y descargar wmlclient_wc allí

**instalar las dependencias:**

en Linux: `npm install`   // (instala todos los paquetes listados en package.json)

## Configuración

edite el archivo *config/default.json* para especificar URL de acceso al web service, el puerto  y configuración del proxy, si es necesario:
```
{
 "wml_endpoint":"http://gs-service-production.geodab.eu/gs-service/services/essi/view/plata/cuahsi_1_1.asmx?WSDL",
 "request_defaults":
  {"proxy":"http://user:pass@ip:port",
   "timeout": 20000,
   "connection": "keep-alive"
  },
  "port": 3003
}
```

## Uso

### Interfaz de línea de comando
##### Ver la ayuda
```
~/wmlclient_wc$ nodejs index.js --help
Usage: index [options] [command]

wmclient accessor

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  getSites|s [options]     Get sites from CUAHSI-WML server
  getSiteInfo|i [options]  Get siteinfo from CUAHSI-WML server
  getValues|v [options]    Get values from CUAHSI-WML server
```
##### getSites
Devuelve listado de sitios contenidos en la caja de coordenadas provista, u opcionalmente el listado de series correspondiente a
dichos sitios
```
~/wmlclient_wc$ nodejs index.js getSites --help
Usage: index getSites|s [options]

Get sites from CUAHSI-WML server

Options:
  -b, --bounds <value>  north,south,east,west
  -c, --csv             output as CSV
  -f, --file <value>    output to file
  -s, --includeSeries   includeSeries
  -h, --help            output usage information
```
##### getSiteInfo
devuelve listado de series correspondientes al siteCode provisto
```
~/wmlclient_wc$ nodejs index.js getSiteInfo --help
Usage: index getSiteInfo|i [options]

Get siteinfo from CUAHSI-WML server

Options:
  -s, --site <value>  SiteCode
  -c, --csv           output as CSV
  -f, --file <value>  output to file
  -h, --help          output usage information
```
##### getValues
Devuelve listado de datos (pares fecha-valor) correspondientes al siteCode y variableCode provistos, entre las fechas provistas
```
~/wmlclient_wc$ nodejs index.js getValues --help
Usage: index getValues|v [options]

Get values from CUAHSI-WML server

Options:
  -s, --site <value>       SiteCode
  -v, --variable <value>   VariableCode
  -d, --startdate <value>  StartDate
  -e, --enddate <value>    EndDate
  -c, --csv                output as CSV
  -f, --file <value>       output to file
  -h, --help               output usage information
```

### REST API
Arrancar el servidor:
```
~/wmlclient_wc$ nodejs rest.js 
server listening on port 3003
```
URI de las peticiones disponibles mediante POST:
##### https://localhost:3003/wml/getSites
Cuerpo de la petición: 
```
{
    "bounds":"north,south,east,west",          // obligatorio
    "includeSeries":boolean,                   // default false
    "format":"csv|geojson|geojson_pretty|json"  // default json
}
```
##### https://localhost:3003/wml/getSiteInfo
Cuerpo de la petición: 
```
{
    "site":"siteCode",                           //  obligatorio
    "format":"csv|geojson|geojson_pretty|json"   //  default json
}
```
##### https://localhost:3003/wml/getValues
Cuerpo de la petición: 
```
{
    "site":"siteCode",                           //  obligatorio
    "variable":"variableCode",                   // obligatorio
    "startdate":"YYYY-MM-DDTHH:MM:SS",                   // obligatorio
    "enddate":"YYYY-MM-DDTHH:MM:SS",                   // obligatorio
}
```
Ejemplo usando cURL:
```
curl -d '{"bounds":"-26,-28,-55,-58","includeSeries":false,"format":"geojson_pretty"}' -H 'content-type: application/json' "https://localhost:3003/wml/GetSites" > siteswithoutseries.geojson
```
### Interfaz gráfica de usuario (GUI)
Funciona sobre el mismo servidor, en la ubicación:
##### https://localhost:3003/wml/
Allí en primer lugar se visualiza un formulario para ingresar la caja de coordenadas para getSites. Opcionalmente se puede utilizar la herramienta de dibujo en el mapa para trazar un polígono, el cual una vez cerrado cargará sus coordenadas envolventes a los campos del formulario.
Una vez obtenido el listado de sitios, el usuario puede navegar el mapa y seleccionar la estación deseada, o realizarlo sobre el listado, para acceder a getSiteInfo y obtener el listado de series disponibles (variables observadas en dicho sitio).
Luego el usuario debe seleccionar la serie deseada para desplegar el formulario de getValues, donde deberá completar las fechas inicial y final deseadas.
Finalmente, se desplegará un gráfico de la variable obtenida en función del tiempo, y el listado de los datos.

### librería nodejs
Para incorporar la librería a su código puede hacer:
```
const wmlclient = require('./wmlclient')
const wml = new wmlclient.client(config.wml_endpoint, config.soap_client_options)
```
donde *wml_endpoint* y *soap_client_options* pueden especificarse en *config/default.json*
Luego, para ejecutar las solicitudes al web service, puede hacer:
##### getSites
```
wml.getSites(north,south,east,west,includeSeries)
```
donde *north,south,east,west* son las coordenadas geográficas decimales y *includeSeries* es booleano.
Devuelve un arreglo de objetos de la clase *Site*, la cual tiene las siguientes propiedades:
```
{
			siteName: string,
			network: string,
			siteCode: string,
			longitude: numeric,
			latitude: numeric,
      series: [Serie, ...]
}
```
##### getSiteInfo
```
wml.getSiteInfo(site)
```
donde *site* es el código de sitio alfanumérico.
Devuelve un arreglo de objetos de la clase *Serie*, la cual tiene las siguientes propiedades:
```
{
   site: Site,
	 variable: Variable,
	 valueCount: integer,
   beginDateTimeUTC: ISO date string,
	 endDateTimeUTC: ISO date string,
   method: Method,
	 source: Source,
   qualityControlLevel: QualityControlLevel
}
```
donde *Variable, Method, Source y QualityControlLevel* son clases auxiliares que se definen en la librería
##### getValues
```
wml.getValues(site,variable,startdate,enddate)
```
donde *site* es el código de sitio alfanumérico, *variable* es el código de variable alfanumérico y *startdate* y *enddate* son las fechas inicial y final en formato ISO: YYYY-MM-DDTHH:MM:SS.
Devuelve un arreglo de objetos de la clase *Value*, la cual tiene las siguientes propiedades:
```
{
	  censorCode: string,
		dateTime: ISO date string,
		qualityControlLevel: integer,
		methodID: integer,
		sourceID: integer,
		sampleID: integer,
		value: numeric
}
```
Además de las propiedades enumeradas, todas las clases tienen los métodos *toString()* y *toCSV()*. Adicionalmente, las clases *Site* y *Serie* tienen el método *toGeoJSON()* que produce un objeto GeoJSON válido según la definición de OGC
