// index.js
'use strict'

const soap = require('soap')
//~ const express = require('express')
//~ const app = express()
const fs = require('fs')
//~ const exphbs = require('express-handlebars')
//~ const bodyParser = require('body-parser')
//~ const Table = require('table-builder')
const request = require('request')
const xml = require('xml')
//~ const { Pool } = require('pg')
//~ const pool = new Pool({database: 'odm', user: 'wmlclient', password: 'wmlclient'})
//~ const pgp = require('pg-promise')()
//~ const pgpclient = pgp({database: 'odm', user: 'wmlclient', password: 'wmlclient'})
//~ const odmpg = require('./odmpg.js')
//~ var insertSites = odmpg.insertSites
//~ var insertSiteInfo = odmpg.insertSiteInfo
//~ var insertValues = odmpg.insertValues
//~ const config = require('config');

//~ (async () => {
	//~ const client = await pool.connect()
	//~ try {
		//~ const res = await client.query('SELECT NOW() as now')
 	    //~ console.log(res.rows[0])
	//~ } catch(e) {
		//~ console.error('connection error', e.stack)
	//~ }
//~ })().catch(e => console.error(e.stack))

//~ const { body,validationResult } = require('express-validator/check');
//~ const { sanitizeBody } = require('express-validator/filter');
//~ var gicat_url = config.wml_endpoint // 'http://gs-service-production.geodab.eu/gs-service/services/essi/view/plata/cuahsi_1_1.asmx?WSDL'; // 'http://giaxe.inmet.gov.br/services/cuahsi_1_1.asmx?WSDL';
//~ const port = 3000
//~ app.engine('handlebars', exphbs({defaultLayout: 'main'}));
//~ app.set('view engine', 'handlebars');
//~ app.use(bodyParser.urlencoded({ extended: false }));  
//~ app.use(express.static('public'));

//~ app.get('/', (req, res) => {
	//~ res.render('wmlclient', { url: gicat_url})
	//~ console.log('wmlclient form displayed')
	//~ return
//~ })

var internal = {}

internal.Site = class {
	constructor(siteName,network, siteCode, longitude, latitude) {
		this.siteName = siteName
		this.network = network
		this.siteCode = siteCode
		this.longitude = longitude
		this.latitude = latitude
	}
	toString() {
		return "siteName:" + this.siteName + " ,network:" + this.network + ", siteCode:" + this.siteCode + ", longitude:" + this.longitude + ", latitude:" + this.latitude
	}
	toCSV() {
		return this.siteName + "," + this.network + "," + this.siteCode + "," + this.longitude + "," + this.latitude
	}
	toGeoJSON() {
		return {
		  type: "Feature",
		  geometry: {
			type: "Point",
			coordinates: [this.longitude, this.latitude]
		  },
		  "properties": {
			siteName: this.siteName,
			network: this.network,
			siteCode: this.siteCode,
			longitude: this.longitude,
			latitude: this.latitude
		  }
		}
	}
	
}

internal.Unit = class {
	constructor(unitName, unitType, unitAbbreviation, unitCode) {
		this.unitName = unitName
		this.unitType = unitType
		this.unitAbbreviation = unitAbbreviation
		this.unitCode = unitCode
	}
	toString() {
		return "unitName:" + this.unitName + ", unitType: " + this.unitType + ", unitAbbreviation: " + this.unitAbbreviation + ", unitCode: " + this.unitCode
	}
	toCSV() {
		return this.unitName + "," + this.unitType + "," + this.unitAbbreviation + "," + this.unitCode
	}
}

internal.TimeScale = class {
	constructor(IsRegular, unit, TimeSupport) {
		this.IsRegular = IsRegular
		this.unit = (unit) ? unit : new internal.Unit()
		this.TimeSupport = TimeSupport
	}
	toString() {
		return "IsRegular:" + this.IsRegular + ", unit:{" + this.unit.toString() + "}, TimeSupport:" + this.TimeSupport
	}
	toCSV() {
		return this.IsRegular + "," + this.unit.toCSV() + "," + this.TimeSupport
	}
}

internal.Variable = class {
	constructor(variableCode, variableName, valueType, dataType, generalCategory, sampleMedium, unit, noDataValue, timeScale, speciation) {
		this.variableCode = variableCode
		this.variableName = variableName
		this.valueType = valueType
		this.dataType = dataType
		this.generalCategory = generalCategory
		this.sampleMedium = sampleMedium
		this.unit = (unit) ? unit : new internal.Unit()
		this.noDataValue = noDataValue
		this.timeScale = (timeScale) ? timeScale : new internal.TimeScale()
		this.speciation = speciation
	}
	toString() {
		return "variableCode:" + this.variableCode + ", variableName;" + this.variableName + ", valueType:" + this.valueType + ", dataType:" + this.dataType + ", generalCategory:" + this.generalCategory + ", sampleMedium:" + this.sampleMedium + ", unit:{" + this.unit.toString() + "}, noDataValue:" + this.noDataValue + ", timeScale:{" + this.timeScale.toString() + "}, speciation:" + this.speciation
	}
	toCSV() {
		return this.variableCode + "," + this.variableName + "," + this.valueType + "," + this.dataType + "," + this.generalCategory + "," + this.sampleMedium + "," + this.unit.toCSV() + "," + this.noDataValue + "," + this.timeScale.toCSV() + "," + this.speciation
	}
}

internal.Method = class {
	constructor(methodId,methodCode,methodDescription,methodLink) {
		this.methodId = methodId
		this.methodCode = methodCode
		this.methodDescription = methodDescription
		this.methodLink = methodLink
	}
	toString() {
		return "methodId:" + this.methodID + ", methodCode:" + this.methodCode + ", methodDescription:" + this.methodDescription + ", methodLink:" + this.methodLink
	}
	toCSV() {
		return this.methodID + "," + this.methodCode + "," + this.methodDescription + "," + this.methodLink
	}
}

internal.Source = class {
	constructor(sourceID,organization,citation) {
		this.sourceID = sourceID
		this.organization = organization
		this.citation = citation
	}
	toString() {
		return "sourceID:" + this.sourceID + ", organization:" + this.organization + ", citation:" + this.citation
	}
	toCSV() {
		return this.sourceID + "," + this.organization + "," + this.citation
	}
}

internal.QualityControlLevel = class {
	constructor(qualityControlLevelID,qualityControlLevelCode,qualityControlLevelDefinition) {
		this.qualityControlLevelID = qualityControlLevelID
		this.qualityControlLevelCode = qualityControlLevelCode
		this.qualityControlLevelDefinition = qualityControlLevelDefinition
	}
	toString() {
		return "qualityControlLevelID:" + this.qualityControlLevelID + ", qualityControlLevelCode:" + this.qualityControlLevelCode + ", qualityControlLevelDefinition:" + this.qualityControlLevelDefinition
	}
	toCSV() {
		return this.qualityControlLevelID + "," + this.qualityControlLevelCode + "," + this.qualityControlLevelDefinition
	}
}

internal.Series = class {
	constructor(site, variable, valueCount, beginDateTimeUTC, endDateTimeUTC, method, source, qualityControlLevel) {
		this.site = site
		this.variable = variable
		this.valueCount = valueCount
		this.beginDateTimeUTC = beginDateTimeUTC
		this.endDateTimeUTC = endDateTimeUTC
		this.method = method
		this.source = source
		this.qualityControlLevel = qualityControlLevel
	}
	toString() {
		//~ console.log(this.site)
		//~ console.log(this.variable)
		//~ console.log(this.valueCount)
		//~ console.log(this.beginDateTimeUTC)
		//~ console.log(this.endDateTimeUTC)
		//~ console.log(this.method)
		//~ console.log(this.source)
		//~ console.log(this.qualityControlLevel)
		//~ console.log("site:{" + this.site + "}, variable:{" + this.variable + "}, valueCount:" + this.valueCount + ", beginDateTimeUTC:" + this.beginDateTimeUTC + ", endDateTimeUTC:" + this.endDateTimeUTC + ", method:{" + this.method + "}, source:{" + this.source + ", qualityControlLevel:{" + this.qualityControlLevel + "}")
		return "site:{" + this.site.toString() + "}, variable:{" + this.variable.toString() + "}, valueCount:" + this.valueCount + ", beginDateTimeUTC:" + this.beginDateTimeUTC + ", endDateTimeUTC:" + this.endDateTimeUTC + ", method:{" + this.method.toString() + "}, source:{" + this.source.toString() + ", qualityControlLevel:{" + this.qualityControlLevel.toString() + "}"
	}
	toCSV() {
		return  this.site.toString()+ "," + this.variable.toCSV() + "," + this.valueCount + ","  + this.beginDateTimeUTC + "," + this.endDateTimeUTC + "," + this.method.toCSV() + "," + this.source.toCSV() + "," + this.qualityControlLevel.toCSV()
	}
	toGeoJSON() {
		return {
		  type: "Feature",
		  geometry: {
			type: "Point",
			coordinates: [this.site.longitude, this.site.latitude]
		  },
		  "properties": {
			siteName: this.site.siteName,
			network: this.site.network,
			siteCode: this.site.siteCode,
			longitude: this.site.longitude,
			latitude: this.site.latitude,
			variableCode: this.variable.variableCode,
			variableName: this.variable.variableName,
			valueType: this.variable.valueType,
			dataType: this.variable.dataType,
			generalCategory: this.variable.generalCategory,
			sampleMedium: this.variable.sampleMedium,
			unitName: this.variable.unit.unitName,
			unitType: this.variable.unit.unitType,
			unitAbbreviation: this.variable.unit.unitAbbreviation,
			unitCode: this.variable.unit.unitCode,
			noDataValue: this.variable.noDataValue,
			timeScaleIsRegular: this.variable.timeScale.IsRegular,
			timeScaleUnit: this.variable.timeScale.unit,
			timeScaleTimeSupport: this.variable.timeScale.timeSupport,
			speciation: this.variable.speciation,
			valueCount: this.valueCount,
			beginDateTimeUTC: this.beginDateTimeUTC,
			endDateTimeUTC: this.endDateTimeUTC,
			methodId: this.method.methodId,
			methodCode: this.method.methodCode,
			methodDescription: this.method.methodDescription,
			methodLink: this.method.methodLink,
			sourceID: this.source.sourceID,
			organization: this.source.organization,
			citation: this.source.citation,
			qualityControlLevelID: this.qualityControlLevel.qualityControlLevelID,
			qualityControlLevelCode: this.qualityControlLevel.ControlLevelCode,
			qualityControlLevelDefinition: this.qualityControlLevel.qualityControlLevelDefinition
		  }
		}
	}
}

internal.Value = class {
	constructor(censorCode,dateTime,qualityControlLevel,methodID,sourceID,sampleID,value) {
		this.censorCode = censorCode
		this.dateTime =dateTime
		this.qualityControlLevel = qualityControlLevel
		this.methodID = methodID
		this.sourceID = sourceID
		this.sampleID = sampleID
		this.value = value
	}
	toString() {
		return "censorCode:" + this.censorCode + ", dateTime:" + this.dateTime + ", qualityControlLevel:" + this.qualityControlLevel + ", methodID:" + this.methodID + ", sourceID:" + this.sourceID + ", sampleID:" + this.sampleID + ", value:" + this.value
	}
	toCSV() {
		return  this.censorCode + "," + this.dateTime + "," + this.qualityControlLevel + ","  + this.qualityControlLevel + "," + this.methodID + "," + this.sourceID + "," + this.sampleID + "," + this.value
	}
}
		

internal.client = class {
	constructor(endpoint, options) {
		this.endpoint = endpoint
		this.soap_client_options = options
	}
	getSites(north,south,east,west) {
		return new Promise ( (resolve, reject) => {
			if(north && south && east && west) {
				soap.createClient(this.endpoint, this.soap_client_options, function(err, client) {
					if(err) {
						reject(err)
						//~ console.error(err)
						return
					}
					client.GetSitesByBoxObject({north: north, south: south, east: east, west: west, IncludeSeries: "True"}, function(err, result, rawResponse) {
					  if(err) {
						  reject({message:"waterML server error",error:err})
						  //~ console.error(err)
						  return 
					  }
					  //~ console.log(client.lastRequest)
					  //~ console.log(rawResponse)
					  var siteslist = []
					  if(result.sitesResponse.hasOwnProperty("site")) {
						  result.sitesResponse.site.forEach(function(site) {
							  siteslist.push(new internal.Site(site.siteInfo.siteName,site.siteInfo.siteCode[0].attributes.network,site.siteInfo.siteCode[0]["$value"],site.siteInfo.geoLocation.geogLocation.longitude,site.siteInfo.geoLocation.geogLocation.latitude))
							  console.log(site)
							  
						  })
						  //~ console.log(siteslist)  
						  resolve(siteslist)
						  console.log('getSites success')
					  } else {
						  resolve([])
						  console.log("Empty response from GetSitesByBoxObject")
					  }
					})
				})
			} else {
				reject("Faltan parámetros")
			}
		})
	}
	
	getSiteInfo(SiteCode) {
		return new Promise( (resolve, reject) => {
			if(!SiteCode) {
				reject("SiteCode missing")
				return
			}
			soap.createClient(this.endpoint, this.soap_client_options, function(err, client) {
				if(err) {
					reject(err)
					return
				}
				client.GetSiteInfoObject({site: SiteCode}, function(err, result, rawResponse) {
					if(err) {
						reject(err)
						return 
					}
					var serieslist = []
					if(result.sitesResponse.hasOwnProperty("site")) {
						result.sitesResponse.site.forEach(function(site) {
							var siteObj = new internal.Site(site.siteInfo.siteName,site.siteInfo.siteCode[0].attributes.network,site.siteInfo.siteCode[0]["$value"],site.siteInfo.geoLocation.geogLocation.longitude,site.siteInfo.geoLocation.geogLocation.latitude)
							if(site.seriesCatalog.length > 0) {
								if(site.seriesCatalog[0].series.length > 0) {
									site.seriesCatalog[0].series.forEach(function(item) {
										var unitObj = new internal.Unit(
											item.variable.unit.unitName,
											item.variable.unit.unitType,
											item.variable.unit.unitAbbreviation,
											item.variable.unit.unitCode
										)
										var timeUnitObj = new internal.Unit(
											(item.variable.timeScale.unit) ? item.variable.timeScale.unit.unitName : null,
											(item.variable.timeScale.unit) ? item.variable.timeScale.unit.unitType : null,
											(item.variable.timeScale.unit) ? item.variable.timeScale.unit.unitAbbreviation : null,
											(item.variable.timeScale.unit) ? item.variable.timeScale.unit.unitCode : null
										)
										var timeScaleObj = new internal.TimeScale(
											item.variable.timeScale.attributes.isRegular,
											timeUnitObj,
											(item.variable.timeScale.timeSupport) ? item.variable.timeScale.timeSupport : null
										)
										
										var variableObj = new internal.Variable(  // variableCode, variableName, valueType, dataType, generalCategory, sampleMedium, unit, noDataValue, timeScale, speciation
											(item.variable.variableCode[0].$value) ? item.variable.variableCode[0].$value : item.variable.variableCode[0].attributes.vocabulary + ":" + item.variable.variableCode[0].attributes.variableID, 
											item.variable.variableName,
											item.variable.valueType,
											item.variable.dataType,
											item.variable.generalCategory,
											item.variable.sampleMedium,
											unitObj,
											item.variable.noDataValue,
											timeScaleObj,
											item.variable.speciation
										)
										var methodObj = new internal.Method(
											(item.method) ? item.method.attributes.methodID : null,
											(item.method) ? item.method.methodCode: null,
											(item.method) ? item.method.methodDescription : null,
											(item.method) ? item.method.methodLink : null
										)
										var sourceObj = new internal.Source(
											item.source.attributes.sourceID,
											item.source.organization,
											item.source.citation
										)
										var qualityControlLevelObj = new internal.QualityControlLevel(
											(item.qualityControlLevel) ? item.qualityControlLevel.attributes.qualityControlLevelID : null,
											(item.qualityControlLevel) ? item.qualityControlLevel.qualityControlLevelCode : null,
											(item.qualityControlLevel) ? item.qualityControlLevel.definition : null
										)
										var seriesObj = new internal.Series(  //  site, variable, valueCount, beginDateTimeUTC, endDateTimeUTC, method, source, qualityControlLevel
											siteObj,
											variableObj,
											item.valueCount,
											item.variableTimeInterval.beginDateTimeUTC,
											item.variableTimeInterval.endDateTimeUTC,
											methodObj,
											sourceObj,
											qualityControlLevelObj
										)   
										serieslist.push(seriesObj)
									})
								} 
							}
						})
						resolve(serieslist)
					} else {
						reject("Nothing found")
					}
				})
			})
		})
	}
	getValues(siteCode,variableCode,startDate,endDate) {
		return new Promise( (resolve, reject) => {
			if(!siteCode || !variableCode || !startDate || !endDate) {
				reject("Faltan parametros")
				return
			}
			soap.createClient(this.endpoint, this.soap_client_options, function(err, client) {
				if(err) {
					reject(err)
					return
				}
				client.GetValuesObject({location: siteCode, variable: variableCode, startDate: startDate, endDate: endDate}, function(err, result, rawResponse) {
					if(err) {
						reject(err)
						return
					}
					var valueslist = []
					var Series
					if(result.timeSeriesResponse.hasOwnProperty("timeSeries")) {
						if(Array.isArray(result.timeSeriesResponse.timeSeries)) {
							console.log("timeSeries es array!")
							result.timeSeriesResponse.timeSeries = result.timeSeriesResponse.timeSeries[0]
						}
					  //~ console.log(result.timeSeriesResponse.timeSeries.variable)
						Series = new internal.Series (  // site, variable, valueCount, beginDateTimeUTC, endDateTimeUTC, method, source, qualityControlLevel
							new internal.Site ( //  siteName,network, siteCode, longitude, latitude
								result.timeSeriesResponse.timeSeries.sourceInfo.siteName,
								(result.timeSeriesResponse.timeSeries.sourceInfo.siteCode[0].attributes) ? result.timeSeriesResponse.timeSeries.sourceInfo.siteCode[0].attributes.network : null,
								result.timeSeriesResponse.timeSeries.sourceInfo.siteCode[0].$value,
								(result.timeSeriesResponse.timeSeries.sourceInfo.geoLocation) ? result.timeSeriesResponse.timeSeries.sourceInfo.geoLocation.geogLocation.longitude : null,
								(result.timeSeriesResponse.timeSeries.sourceInfo.geoLocation) ? result.timeSeriesResponse.timeSeries.sourceInfo.geoLocation.geogLocation.latitude: null
							),
							new internal.Variable ( // variableCode, variableName, valueType, dataType, generalCategory, sampleMedium, unit, noDataValue, timeScale, speciation
								(Array.isArray(result.timeSeriesResponse.timeSeries.variable.variableCode)) ? result.timeSeriesResponse.timeSeries.variable.variableCode[0].$value : result.timeSeriesResponse.timeSeries.variable.variableCode.$value,
								result.timeSeriesResponse.timeSeries.variable.variableName,
								result.timeSeriesResponse.timeSeries.variable.valueType,
								result.timeSeriesResponse.timeSeries.variable.dataType,
								result.timeSeriesResponse.timeSeries.variable.generalCategory,
								result.timeSeriesResponse.timeSeries.variable.sampleMedium,
								new internal.Unit( // unitName, unitType, unitAbbreviation, unitCode
									result.timeSeriesResponse.timeSeries.variable.unit.unitName,
									null,
									result.timeSeriesResponse.timeSeries.variable.unit.unitAbbreviation,
									result.timeSeriesResponse.timeSeries.variable.unit.unitCode
								),
								result.timeSeriesResponse.timeSeries.variable.NoDataValue,
								//~ new internal.timeScale( // IsRegular, unit, TimeSupport
								result.timeSeriesResponse.timeSeries.variable.timeScale,
								result.timeSeriesResponse.timeSeries.variable.speciation
							),
							0,
							null, 
							null, 
							new internal.Method(), 
							new internal.Source(),
							new internal.QualityControlLevel()
						)
						if(result.timeSeriesResponse.timeSeries.values) { 
							if(Array.isArray(result.timeSeriesResponse.timeSeries.values)) {
								console.log("values is array!")
								if(result.timeSeriesResponse.timeSeries.values.length<=0) {
									console.log("No Data Values")
									resolve({seriesInfo: Series, values:[]})
									return
								}
								result.timeSeriesResponse.timeSeries.values = result.timeSeriesResponse.timeSeries.values[0]
							}
							if(!result.timeSeriesResponse.timeSeries.values) {
								console.log("No Data Values")
								resolve({seriesInfo:Series, values:[]})
								return
							}
							if(! result.timeSeriesResponse.timeSeries.values.hasOwnProperty("value")) {
								console.log("no value property found")
								resolve({seriesInfo:Series, values:[]})
								return
							}
							if(! Array.isArray(result.timeSeriesResponse.timeSeries.values.value)) {
								console.log("value property is not an array!")
								resolve({seriesInfo:Series, values:[]})
								return
							}
							if(result.timeSeriesResponse.timeSeries.values.value.length <= 0) {
								console.log("value property is of length 0")
								resolve({seriesInfo:Series, values:[]})
								return
							}
							console.log("Found " + result.timeSeriesResponse.timeSeries.values.value.length + " values")
							result.timeSeriesResponse.timeSeries.values.value.forEach(function(value) {
								valueslist.push(new internal.Value (
									value.attributes.censorCode,
									value.attributes.dateTime,
									value.attributes.qualityControlLevel,
									value.attributes.methodID,
									value.attributes.sourceID,
									value.attributes.sampleID,
									value.$value
								))
							})
					  //~ console.log(renderlist)  
							Series.valueCount = result.timeSeriesResponse.timeSeries.values.value.length
							resolve({seriesInfo:Series, values:valueslist})
							console.log('success')
						} else {
							console.log("No values found")
							resolve({seriesInfo:Series, values:[]})
							return
						}
					
					} else {
						reject("timeSeries not found")
						return
					}
				})
			})
		})
	}
}


module.exports = internal
