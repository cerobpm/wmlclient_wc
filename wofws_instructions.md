
# CUAHSI WOF 1.1 Web service (SOAP)

## Basic use instructions

Official documentation: https://his.cuahsi.org/wofws.html
WHOS-Plata URL: http://whos.geodab.eu/gs-service/services/essi/view/plata/cuahsi_1_1.asmx?WSDL

 ### I. Metadata harvest

1. Request **GetSitesByBoxObject** with geograhical bounding box (*west*, *south*, *east* and *north* in decimal degrees) and *IncludeSeries=true*. *authToken* is not required
  Parse XML response and for each *GetSitesByBoxObjectResponse->site* item extract these parameters:
	- STATION_ID = *site->siteInfo->siteCode* (needed for **getValues** request)
	- STATION_NAME = *site->siteInfo->siteName*
	- LATITUDE = *site->siteInfo->geoLocation->geogLocation->latitude*
	- LONGITUDE = *site->siteInfo->geoLocation->geogLocation->longitude*
	- SOURCE = *site->siteInfo->siteCode["network"]* (network attribute from siteCode tag)
 and for each *site->seriesCatalog->series*, extract:
    - *series->variable->variableCode* (needed for **getValues** request)

2. Request **GetVariables** (with no parameters)
  Parse XML response and for each *variables->variable* item extract:
	- *variable->variableCode*
	- *variable->variableName*
	- *variable->unit->unitName*
	- *variable->timeScale->unit->unitName*
	- *variable->timeScale->timeSupport*
  
   From **variableName** you should be able to find the PARAMETERS P, H and Q. For example "nivel agua" means H. Note that the variable names vary between sources; a complete mapping of variables into the hydrology ontology may be found here: http://gs-service-production.geodab.eu/gs-service/services/essi/view/whos-plata/semantic
  From the *timeScale* tag you should be able to get the TEMPORAL RESOLUTION, for example:
		*variable->timeScale->unit->unitName* = "hora"
		*variable->timeScale->timeSupport* = 3.0
  means 3-hours temporal resolution.

Alternatively, you may request **GetSitesByBoxObject** with *IncludeSeries=false* and then use each *GetSitesByBoxObjectResponse->site->siteInfo->siteCode* as parameter *site* in request **GetSiteInfo**. From the **GetSiteInfo** response iterate over *site->seriesCatalog->series* to find the required PARAMETERS

For covering all Del Plata Basin area, I suggest splitting the area into 5° x 5° or smaller boxes and perform **GetSitesByBoxObject** for each box. This is to get faster responses and minimize time-out errors.

### II. Data retrieval
Request **GetValues** with parameters *location = siteCode*, *variable = variableCode*, *startDate* and *endDate* in ISO format, for example "2022-02-01" or "2022-02-01T00:00:00.000Z".
Parse XML response and for each *timeSeries->values->value* get *dateTimeUTC* attribute as the observation timestamp and the content itself as the observation value. For example:

	<value dateTime="2022-01-01T12:00:00Z" dateTimeUTC="2022-01-01T12:00:00Z" sourceID="1">0.01</value>

means a value of 0.01 observed at 2022-01-01 12:00:00 UTC

Please check the related SOAPUI project file: [whos_plata_cuahsi_1_1.xml](whos_plata_cuahsi_1_1.xml)

#### Other useful links
- https://github.com/cerobpm/wmlclient_wc - WOFWS client web application and Nodejs library - code repository   
- https://alerta.ina.gob.ar/wmlclient/wml/ - WOFWS client web application and Nodejs library - INA deployment
- https://community.wmo.int/activity-areas/wmo-hydrological-observing-system-whos  - WHOS community web page
- https://www.soapui.org/ - SoapUI software
#### Contact
jbianchi@ina.gob.ar
